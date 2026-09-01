/**
 * Normalização e Algoritmos de Similaridade Textual para Pesquisa Multiprovedor
 * Consulta Premium 360°
 */

/**
 * Normaliza texto para comparação e busca:
 * - Remove acentos / diacríticos (NFD)
 * - Remove pontuação e caracteres especiais desnecessários
 * - Converte múltiplos espaços em espaço único
 * - Converte para minúsculas para comparação (ou preserva maiúsculas se solicitado)
 * - Trima espaços nas bordas
 */
export function normalizeSearchText(text?: string | null, toUpperCase = false): string {
  if (!text) return '';
  const normalized = String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-zA-Z0-9\s]/g, ' ') // replace special chars with space
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();

  return toUpperCase ? normalized.toUpperCase() : normalized.toLowerCase();
}

/**
 * Normaliza apenas espaços e acentos, mantendo a pontuação básica
 */
export function normalizeTextPreservePunctuation(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Extrai apenas dígitos numéricos
 */
export function extractDigits(value?: string | number | null): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\D/g, '');
}

/**
 * Tokeniza texto em palavras relevantes (removendo stop words comuns no português e abreviações societárias)
 */
const STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com', 'por', 'a', 'o', 'as', 'os',
  'ltda', 'me', 'epp', 's/a', 'sa', 'eireli', 'ss', 'cia', 's.a.', 'limitada', 'sociedade'
]);

export function extractSearchTokens(text?: string | null): string[] {
  const norm = normalizeSearchText(text);
  if (!norm) return [];
  return norm
    .split(/\s+/)
    .filter(token => token.length >= 2 && !STOP_WORDS.has(token));
}

/**
 * Calcula a distância de Levenshtein entre duas strings
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
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Coeficiente de Similaridade Dice / Bigramas
 */
export function bigramSimilarity(a: string, b: string): number {
  const s1 = normalizeSearchText(a);
  const s2 = normalizeSearchText(b);

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) {
    return s1 === s2 ? 1.0 : (s1.includes(s2) || s2.includes(s1) ? 0.8 : 0.0);
  }

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bg = str.substring(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }
    return bigrams;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);

  let intersection = 0;
  for (const [bg, count1] of bg1.entries()) {
    if (bg2.has(bg)) {
      intersection += Math.min(count1, bg2.get(bg)!);
    }
  }

  const total = (s1.length - 1) + (s2.length - 1);
  return (2.0 * intersection) / total;
}

/**
 * Classificação de Nível de Correspondência
 */
export type MatchConfidenceLevel = 'EXACT' | 'VERY_HIGH' | 'HIGH' | 'POSSIBLE' | 'WEAK';

export interface MatchScoreResult {
  score: number; // 0 to 100
  level: MatchConfidenceLevel;
  label: string;
  matchedTokens: string[];
  totalTokens: number;
}

/**
 * Avalia a correspondência progressiva entre uma busca (query) e um texto candidato (target)
 * Estágios:
 * 1. Correspondência Exata (100%)
 * 2. Correspondência Normalizada (100%)
 * 3. Começa com / Prefixo (92%–98%)
 * 4. Contém todas as palavras relevantes (85%–95%)
 * 5. Contém parte das palavras relevantes (65%–84%)
 * 6. Similaridade fonética / Levenshtein / Bigramas
 */
export function calculateProgressiveMatchScore(query: string, target: string): MatchScoreResult {
  const qRaw = (query || '').trim();
  const tRaw = (target || '').trim();

  if (!qRaw || !tRaw) {
    return { score: 0, level: 'WEAK', label: 'Sem correspondência', matchedTokens: [], totalTokens: 0 };
  }

  // 1. Literal exact
  if (qRaw === tRaw) {
    return { score: 100, level: 'EXACT', label: 'Correspondência Exata (100%)', matchedTokens: [qRaw], totalTokens: 1 };
  }

  const qNorm = normalizeSearchText(qRaw);
  const tNorm = normalizeSearchText(tRaw);

  // 2. Normalized exact
  if (qNorm === tNorm) {
    return { score: 100, level: 'EXACT', label: 'Correspondência Exata Normalizada (100%)', matchedTokens: [qNorm], totalTokens: 1 };
  }

  // 3. Starts with
  if (tNorm.startsWith(qNorm)) {
    const ratio = Math.min(98, Math.max(90, Math.round((qNorm.length / tNorm.length) * 100)));
    return { 
      score: ratio, 
      level: ratio >= 90 ? 'VERY_HIGH' : 'HIGH', 
      label: `Inicia com "${qRaw}" (${ratio}%)`,
      matchedTokens: [qNorm],
      totalTokens: 1
    };
  }

  // 4. Substring contains
  if (tNorm.includes(qNorm)) {
    const ratio = Math.min(94, Math.max(80, Math.round((qNorm.length / tNorm.length) * 100)));
    return {
      score: ratio,
      level: ratio >= 90 ? 'VERY_HIGH' : 'HIGH',
      label: `Contém "${qRaw}" (${ratio}%)`,
      matchedTokens: [qNorm],
      totalTokens: 1
    };
  }

  // 5. Token Intersection
  const qTokens = extractSearchTokens(qRaw);
  const tTokens = extractSearchTokens(tRaw);

  if (qTokens.length > 0 && tTokens.length > 0) {
    const matchedTokens: string[] = [];
    for (const qTok of qTokens) {
      const match = tTokens.some(tTok => tTok === qTok || tTok.startsWith(qTok) || (tTok.length >= 4 && qTok.length >= 4 && levenshteinDistance(qTok, tTok) <= 1));
      if (match) {
        matchedTokens.push(qTok);
      }
    }

    const tokenRatio = matchedTokens.length / qTokens.length;

    if (tokenRatio === 1.0) {
      // All search words present in target!
      const score = Math.round(85 + (15 * (matchedTokens.length / Math.max(tTokens.length, matchedTokens.length))));
      const level: MatchConfidenceLevel = score >= 90 ? 'VERY_HIGH' : 'HIGH';
      return {
        score,
        level,
        label: `Todas as palavras localizadas (${score}%)`,
        matchedTokens,
        totalTokens: qTokens.length
      };
    } else if (tokenRatio >= 0.5) {
      const score = Math.round(65 + (20 * tokenRatio));
      return {
        score,
        level: 'POSSIBLE',
        label: `Correspondência Parcial (${matchedTokens.length}/${qTokens.length} palavras - ${score}%)`,
        matchedTokens,
        totalTokens: qTokens.length
      };
    }
  }

  // 6. Fuzzy Bigram / Levenshtein
  const dice = bigramSimilarity(qNorm, tNorm);
  const score = Math.round(dice * 100);

  if (score >= 90) {
    return { score, level: 'VERY_HIGH', label: `Similaridade Muito Alta (${score}%)`, matchedTokens: [], totalTokens: qTokens.length };
  } else if (score >= 80) {
    return { score, level: 'HIGH', label: `Similaridade Alta (${score}%)`, matchedTokens: [], totalTokens: qTokens.length };
  } else if (score >= 65) {
    return { score, level: 'POSSIBLE', label: `Possível Correspondência (${score}%)`, matchedTokens: [], totalTokens: qTokens.length };
  }

  return { score, level: 'WEAK', label: `Baixa Similaridade (${score}%)`, matchedTokens: [], totalTokens: qTokens.length };
}
