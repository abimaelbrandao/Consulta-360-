/**
 * Motor de Busca, Normalização e Ranqueamento de Pessoas Físicas
 * Sistema Consulta Premium 360°
 */

export interface NameSimilarityResult {
  score: number; // 0 a 100
  matchType: 'EXACT' | 'VERY_CLOSE' | 'PARTIAL' | 'LOW';
  matchLabel: string;
  exactNormalized: boolean;
  tokensMatchRatio: number;
}

// Conectivos e preposições ignorados na comparação estrita de tokens principais
const NOISE_WORDS = new Set(['DE', 'DA', 'DO', 'DAS', 'DOS', 'E', 'DEL', 'DI', 'DU', 'VON', 'VAN', 'DA', 'LA', 'LE']);

/**
 * Normaliza o nome da pessoa para fins de comparação e busca:
 * - Remove espaços duplicados e nas extremidades
 * - Converte para caixa padronizada (maiúsculas)
 * - Remove acentos apenas para comparação (NFD)
 * - Remove pontuação desnecessária (mantendo apenas letras e números)
 * - Preserva o nome original para exibição
 */
export function normalizePersonName(name?: string | null): string {
  if (!name) return '';
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos/acentos
    .replace(/[^a-zA-Z0-9\s]/g, ' ')  // substitui pontuação por espaço
    .replace(/\s+/g, ' ')            // consolida espaços múltiplos
    .trim()
    .toUpperCase();
}

/**
 * Quebra um nome normalizado em tokens significativos (palavras com >= 2 caracteres)
 */
export function extractSignificantTokens(normalizedName: string): string[] {
  return normalizedName
    .split(' ')
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !NOISE_WORDS.has(t));
}

/**
 * Quebra em todos os tokens (incluindo conectivos)
 */
export function extractAllTokens(normalizedName: string): string[] {
  return normalizedName
    .split(' ')
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

/**
 * Calcula a Distância de Levenshtein entre duas strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // deleção
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calcula a similaridade entre o termo pesquisado e o nome do candidato
 * 
 * Regras de ranqueamento:
 * 1. correspondência exata do nome completo -> 100%
 * 2. correspondência exata ignorando acentos -> 100%
 * 3. correspondência exata ignorando maiúsculas e minúsculas -> 100%
 * 4. diferença mínima (1-2 chars ou tokens exatos) -> 90% a 99%
 * 5. correspondência parcial relevante (prefixo/subconjunto de termos) -> 75% a 89%
 * 6. abaixo de 75% -> não mostrar como resultado principal nem correspondência válida
 */
export function calculatePersonNameSimilarity(
  query: string, 
  candidateName: string
): NameSimilarityResult {
  const rawQ = (query || '').trim();
  const rawC = (candidateName || '').trim();

  if (!rawQ || !rawC) {
    return {
      score: 0,
      matchType: 'LOW',
      matchLabel: 'Sem correspondência',
      exactNormalized: false,
      tokensMatchRatio: 0
    };
  }

  // 1, 2, 3: Normalização (remove acentos, pontuação, caixa)
  const normQ = normalizePersonName(rawQ);
  const normC = normalizePersonName(rawC);

  // Correspondência exata após normalização
  if (normQ === normC) {
    return {
      score: 100,
      matchType: 'EXACT',
      matchLabel: 'Correspondência Exata (100%)',
      exactNormalized: true,
      tokensMatchRatio: 1.0
    };
  }

  const allTokensQ = extractAllTokens(normQ);
  const allTokensC = extractAllTokens(normC);

  const sigTokensQ = extractSignificantTokens(normQ);
  const sigTokensC = extractSignificantTokens(normC);

  // Se ignorando conectivos for idêntico (ex: "Jose Antonio de Sousa" vs "Jose Antonio Sousa")
  if (sigTokensQ.length > 0 && sigTokensQ.join(' ') === sigTokensC.join(' ')) {
    return {
      score: 100,
      matchType: 'EXACT',
      matchLabel: 'Correspondência Exata (100%)',
      exactNormalized: true,
      tokensMatchRatio: 1.0
    };
  }

  // Verificar distância de edição para erros tipográficos mínimos
  const maxLen = Math.max(normQ.length, normC.length);
  const lev = levenshteinDistance(normQ, normC);
  const levRatio = Math.max(0, 1 - (lev / maxLen));

  if (lev <= 1 && maxLen >= 6) {
    return {
      score: 97,
      matchType: 'VERY_CLOSE',
      matchLabel: 'Correspondência Muito Próxima (97%)',
      exactNormalized: false,
      tokensMatchRatio: 0.95
    };
  }

  if (lev <= 2 && maxLen >= 10) {
    return {
      score: 92,
      matchType: 'VERY_CLOSE',
      matchLabel: 'Correspondência Muito Próxima (92%)',
      exactNormalized: false,
      tokensMatchRatio: 0.9
    };
  }

  // Análise de Tokens Significativos
  const setSigC = new Set(sigTokensC);
  const setSigQ = new Set(sigTokensQ);

  // Contagem de tokens da busca presentes no candidato
  let matchingSigTokens = 0;
  sigTokensQ.forEach(t => {
    if (setSigC.has(t)) {
      matchingSigTokens++;
    } else {
      // Pequena variação em um token (ex: Sousa vs Souza)
      const hasClose = sigTokensC.some(ct => levenshteinDistance(t, ct) === 1 && Math.max(t.length, ct.length) >= 4);
      if (hasClose) {
        matchingSigTokens += 0.9;
      }
    }
  });

  const queryCoverageRatio = sigTokensQ.length > 0 ? matchingSigTokens / sigTokensQ.length : 0;
  const candidateCoverageRatio = sigTokensC.length > 0 ? matchingSigTokens / sigTokensC.length : 0;

  // CASO: O usuário pesquisou um termo parcial completo, ex: "Jardel Lopes" e o candidato é "Jardel Lopes da Silva"
  // Todos os tokens significativos da busca estão no candidato (queryCoverageRatio >= 0.99)
  if (queryCoverageRatio >= 0.99 && sigTokensQ.length >= 2) {
    // Se o candidato começa exatamente com a sequência da busca:
    const startsWithQuery = normC.startsWith(normQ);
    let calculatedScore = 0;

    if (startsWithQuery) {
      // Ex: "JARDEL LOPES" no início de "JARDEL LOPES DA SILVA"
      // Score proporcional à extensão do nome, sempre entre 80% e 88%
      calculatedScore = Math.round(78 + (10 * candidateCoverageRatio));
    } else {
      // Ex: "JARDEL LOPES" dentro de "JARDEL SOUSA LOPES"
      calculatedScore = Math.round(75 + (8 * candidateCoverageRatio));
    }

    return {
      score: Math.min(88, Math.max(75, calculatedScore)),
      matchType: 'PARTIAL',
      matchLabel: `Possível correspondência (${calculatedScore}%)`,
      exactNormalized: false,
      tokensMatchRatio: queryCoverageRatio
    };
  }

  // CASO: Pesquisa de 1 único token (ex: "Jardel" ou "Trajano")
  if (sigTokensQ.length === 1 && sigTokensC.length >= 1) {
    const singleToken = sigTokensQ[0];
    if (setSigC.has(singleToken)) {
      // Se o candidato tiver apenas 1 ou 2 tokens totais e coincidir o primeiro nome
      if (sigTokensC.length <= 2 && sigTokensC[0] === singleToken) {
        return {
          score: 75,
          matchType: 'PARTIAL',
          matchLabel: 'Possível correspondência (75%)',
          exactNormalized: false,
          tokensMatchRatio: 0.5
        };
      }
      // Se for apenas uma palavra comum num nome longo (ex: "Silva" ou "João"), score é baixo (< 60%)
      return {
        score: Math.min(60, Math.round(40 + (20 * candidateCoverageRatio))),
        matchType: 'LOW',
        matchLabel: 'Correspondência Baixa (< 75%)',
        exactNormalized: false,
        tokensMatchRatio: queryCoverageRatio
      };
    }
  }

  // CASO: Vários tokens na busca, mas apenas alguns coincidem
  // Exemplo: Pesquisa "JOAO PEDRO DA SILVA", Candidato "JOAO SILVA SANTOS"
  // sigTokensQ = ["JOAO", "PEDRO", "SILVA"] (3)
  // sigTokensC = ["JOAO", "SILVA", "SANTOS"] (3)
  // matching = 2 ("JOAO", "SILVA"). Falta "PEDRO" (33% ausente), sobra "SANTOS" (33% estranho).
  // Jaccard similarity = 2 / (3 + 3 - 2) = 2 / 4 = 50%
  const unionTokens = new Set([...sigTokensQ, ...sigTokensC]).size;
  const jaccardScore = unionTokens > 0 ? (matchingSigTokens / unionTokens) * 100 : 0;

  // Se o query tinha 3 tokens e só 2 deram match, score fica em ~55-65% (< 75%)
  if (queryCoverageRatio < 0.8 || jaccardScore < 70) {
    return {
      score: Math.round(Math.min(68, jaccardScore)),
      matchType: 'LOW',
      matchLabel: 'Correspondência Insuficiente',
      exactNormalized: false,
      tokensMatchRatio: queryCoverageRatio
    };
  }

  // Score intermediário
  const finalScore = Math.round(jaccardScore * 0.7 + levRatio * 30);
  const matchType = finalScore >= 90 ? 'VERY_CLOSE' : finalScore >= 75 ? 'PARTIAL' : 'LOW';

  return {
    score: finalScore,
    matchType,
    matchLabel: finalScore >= 75 ? `Possível correspondência (${finalScore}%)` : 'Correspondência Baixa',
    exactNormalized: false,
    tokensMatchRatio: queryCoverageRatio
  };
}
