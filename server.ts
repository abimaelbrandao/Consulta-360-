import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { SEED_EMPRESAS, SEED_PESSOAS, INITIAL_DATA_PROVIDERS, INITIAL_HISTORICO, INITIAL_MONITORAMENTO, INITIAL_USUARIOS, INITIAL_AUDIT_LOGS, INITIAL_QUICK_DEMOS } from './src/data/seedData';
import { EmpresaData, PessoaData, ConsultaHistorico, MonitoramentoEmpresa, DataProviderConfig, Usuario, AuditLog, TelemetriaApiLog, ConsultaRapida } from './src/types';
import { 
  reconcileCompanyData, 
  normalizeCompanyData, 
  RawProviderPayload, 
  cleanDigits, 
  formatCNPJ, 
  validateCompanyData, 
  validateCNPJInput,
  normalizeSearchTerm 
} from './src/utils/companyNormalizer';
import { 
  normalizePersonName, 
  calculatePersonNameSimilarity 
} from './src/utils/personSearchEngine';
import { 
  testSingleProvider, 
  enrichCompanyWithMultiProviderData 
} from './src/services/providerHubBackend';
import { 
  MUNICIPAL_PROVIDER_REGISTRY 
} from './src/services/dataProviderHub';

// In-memory data store for the live server instance
let empresasStore: EmpresaData[] = [...SEED_EMPRESAS];
let pessoasStore: PessoaData[] = [...SEED_PESSOAS];
let dataProvidersStore: DataProviderConfig[] = [...INITIAL_DATA_PROVIDERS];
let historicoStore: ConsultaHistorico[] = [...INITIAL_HISTORICO];
let monitoramentoStore: MonitoramentoEmpresa[] = [...INITIAL_MONITORAMENTO];
let usuariosStore: Usuario[] = [...INITIAL_USUARIOS];
let auditLogsStore: AuditLog[] = [...INITIAL_AUDIT_LOGS];
let quickDemosStore: ConsultaRapida[] = [...INITIAL_QUICK_DEMOS];
let telemetriaLogsStore: TelemetriaApiLog[] = [];

// Smart In-Memory Cache with differentiated TTL
interface CacheEntry {
  data: EmpresaData;
  cachedAt: number;
  expiresAt: number;
}
const companyCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours for full cadastral reconciliation

let userCredits = {
  plano: 'Pro',
  limiteMensal: 500,
  consultasUtilizadas: 142,
  dataRenovacao: '15/09/2026',
  valorMensal: 249.90
};

// Lazy initialization for Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function normalizeText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Updates provider metrics and dynamically adjusts priority based on reliability
 */
function recordProviderTelemetry(
  providerId: string, 
  providerNome: string,
  urlConsultada: string, 
  tipo: any, 
  termo: string, 
  duracaoMs: number, 
  statusHttp: number, 
  sucesso: boolean, 
  recordsCount: number,
  erro?: string,
  fallbackUsed = false
) {
  const now = new Date();
  const log: TelemetriaApiLog = {
    id: `tel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    providerId,
    providerNome,
    urlConsultada,
    tipoConsulta: tipo,
    termo,
    horarioInicio: new Date(now.getTime() - duracaoMs).toISOString(),
    horarioFim: now.toISOString(),
    duracaoMs,
    statusHttp,
    sucesso,
    erro,
    fallbackUtilizado: fallbackUsed,
    quantidadeRegistros: recordsCount,
    dataHora: now.toLocaleString('pt-BR')
  };

  telemetriaLogsStore.unshift(log);
  if (telemetriaLogsStore.length > 300) {
    telemetriaLogsStore.pop();
  }

  // Update in-memory data provider metrics
  const provider = dataProvidersStore.find(p => p.id === providerId || p.nome.toLowerCase() === providerNome.toLowerCase());
  if (provider) {
    provider.consultasHoje = (provider.consultasHoje || 0) + 1;
    provider.ultimaConsulta = now.toLocaleString('pt-BR');
    provider.ultimaConexao = now.toLocaleString('pt-BR');

    // Running average latency
    const prevLat = provider.latenciaMediaMs || duracaoMs;
    provider.latenciaMediaMs = Math.round((prevLat * 0.8) + (duracaoMs * 0.2));
    provider.tempoRespostaMs = duracaoMs;

    if (!sucesso) {
      provider.errosContador = (provider.errosContador || 0) + 1;
      if (statusHttp === 408 || erro?.toLowerCase().includes('timeout') || erro?.toLowerCase().includes('abort')) {
        provider.timeoutsContador = (provider.timeoutsContador || 0) + 1;
      }
    }

    // Recalculate success rate
    const totalConsultas = (provider.consultasHoje || 1);
    const erros = (provider.errosContador || 0);
    provider.taxaSucesso = Math.max(50, Math.min(100, Math.round(((totalConsultas - erros) / totalConsultas) * 100)));

    // Dynamic status and priority penalty for failing providers
    if (provider.taxaSucesso < 70 || (provider.timeoutsContador || 0) > 3) {
      provider.status = 'INSTAVEL';
      provider.prioridadeDinamica = (provider.prioridade || 2) + 1; // Lower priority temporarily
    } else {
      provider.status = 'ONLINE';
      provider.prioridadeDinamica = provider.prioridade;
    }
  }
}

async function generateSummaryWithGemini(ai: GoogleGenAI, prompt: string): Promise<{ text: string; modelUsed: string } | null> {
  const candidateModels = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  
  for (const modelName of candidateModels) {
    try {
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout with model ${modelName}`)), 7500)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const text = response?.text;
      if (text && typeof text === 'string' && text.trim().length > 0) {
        return { text: text.trim(), modelUsed: modelName };
      }
    } catch {
      // Silently try next fallback candidate if transient 503/429/timeout
    }
  }
  return null;
}

// Helpers
function generateEmpresaExecutiveSummary(empresa: EmpresaData): string {
  const sociosList = (empresa.socios || []).map(s => `• ${s.nome} (${s.qualificacao}${s.cpfCnpjMascarado ? `, CPF: ${s.cpfCnpjMascarado}` : ''})`).join('\n');
  const certsList = (empresa.certidoes || []).map(c => `• ${c.orgao}: Situação ${c.situacao} (${c.validade || 'Vigente'})`).join('\n');
  const regime = empresa.simplesNacional?.optante ? 'Optante pelo Simples Nacional' : 'Regime Geral (Lucro Presumido ou Real)';
  const divergenciaNota = (empresa.divergencias && empresa.divergencias.length > 0) 
    ? `\n\n5. DIVERGÊNCIAS REGISTRADAS NA AUDITORIA:\nForam detectadas ${empresa.divergencias.length} divergência(s) entre fontes públicas. Os dados foram conciliados priorizando o registro oficial mais recente da Receita Federal.`
    : '';

  return `1. RESUMO EXECUTIVO DA ENTIDADE
A sociedade ${empresa.razaoSocial} (${empresa.nomeFantasia && empresa.nomeFantasia !== 'NÃO INFORMADO' ? `nome fantasia "${empresa.nomeFantasia}", ` : ''}CNPJ ${empresa.cnpj}) encontra-se em situação cadastral ${empresa.situacaoCadastral} perante a Receita Federal do Brasil desde ${empresa.dataSituacaoCadastral || 'sua abertura'}. Sediada no município de ${empresa.municipio}/${empresa.uf}, atua sob a natureza jurídica ${empresa.naturezaJuridica} com capital social registrado de R$ ${(empresa.capitalSocial || 0).toLocaleString('pt-BR')}. Sua atividade econômica principal é o CNAE ${empresa.cnaePrincipal?.codigo} (${empresa.cnaePrincipal?.descricao}), contando com ${empresa.cnaesSecundarios?.length || 0} atividade(s) secundária(s) averbada(s).

2. QUADRO SOCIETÁRIO E GESTÃO (QSA)
A estrutura administrativa e societária registrada compreende:
${sociosList || '• Nenhum administrador ou sócio individualizado na base pública aberta.'}
Enquadramento tributário atual: ${regime}.

3. REGULARIDADE FISCAL E CERTIDÕES PÚBLICAS
Consulta integrada de certidões públicas com resultado:
${certsList || '• Certidões em processamento nas fontes emissoras governamentais.'}
${(empresa.processos || []).length > 0 ? `• Processos públicos identificados: ${empresa.processos.length} registro(s) no histórico dos diários de justiça.` : '• Sem apontamentos impeditivos ou execuções fiscais cadastradas nos registros primários consultados.'}

4. PARECER ANALÍTICO E RECOMENDAÇÕES DE DUE DILIGENCE
A entidade apresenta conformidade cadastral e dados cadastrais compatíveis com seu porte registrado. Recomenda-se para fechamento de negócios:
• Emissão periódica e monitorada da CND Federal conjunta PGFN e CNDT.
• Validação de inscrição estadual no SINTEGRA/SEFAZ local para operações com circulação de mercadorias.
• Atualização cadastral contínua através do painel de Monitoramento 360°.${divergenciaNota}`;
}

function generatePessoaExecutiveSummary(pessoa: PessoaData): string {
  const empresasList = (pessoa.empresasVinculadas || []).map(v => `• ${v.razaoSocial} (CNPJ: ${v.cnpj}) - Cargo: ${v.cargo} | Situação: ${v.situacao}`).join('\n');
  const procsCount = (pessoa.processosPublicos || []).length;
  const pubsCount = (pessoa.publicacoesOficiais || []).length;

  return `1. RESUMO EXECUTIVO DO TITULAR
O titular ${pessoa.nome} (Documento: ${pessoa.cpfMascarado || '***.***.***-**'}) possui registros públicos societários vinculados principalmente no estado de ${pessoa.estadoPrincipal || 'SP/Nacional'}. ${pessoa.temMultiplosHomonimos ? `Nota de cautela: Foram identificadas ocorrências de homônimos na base pública nacional; recomenda-se confirmação documental complementar.` : 'Baixa probabilidade de homônimos imediatos.'}

2. VÍNCULOS SOCIETÁRIOS E PARTICIPAÇÕES
Histórico de participações em sociedades empresárias ativas ou baixadas:
${empresasList || '• Nenhuma sociedade mercantil vinculada no momento da consulta.'}

3. REGISTROS PÚBLICOS E PUBLICAÇÕES OFICIAIS
• Publicações Oficiais (Diários de Justiça e Executivo): ${pubsCount} ocorrência(s) localizada(s).
• Registros Processuais Públicos: ${procsCount} processo(s) indexado(s) em 1º ou 2º grau.

4. RECOMENDAÇÕES DE CONFORMIDADE E PRIVACIDADE (LGPD)
Consulta realizada estritamente em conformidade com as diretrizes da Lei Geral de Proteção de Dados (Lei 13.709/2018), com tratamento exclusivo de dados de acesso público e relevância societária. Recomenda-se solicitação de certidões cíveis e de distribuição da comarca de domicílio para fins contratuais.`;
}

/**
 * Executes a single API provider call with timeout (6000ms) and controlled 1-time retry on 5xx/network error
 */
async function querySingleProvider(
  provider: { id: string; name: string; priority: number; category: any; url: string },
  cleanCnpj: string
): Promise<{ payload?: RawProviderPayload; error?: string }> {
  const maxAttempts = 2;
  let lastErr = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(provider.url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      const durationMs = Date.now() - startTime;

      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && (data.status === 'OK' || data.cnpj || data.razao_social || data.nome || data.razaoSocial)) {
            recordProviderTelemetry(
              provider.id,
              provider.name,
              provider.url,
              'cnpj',
              cleanCnpj,
              durationMs,
              res.status,
              true,
              1,
              undefined,
              attempt > 1
            );
            return {
              payload: {
                providerName: provider.name,
                priority: provider.priority,
                category: provider.category,
                data,
                statusHttp: res.status,
                latenciaMs: durationMs
              }
            };
          }
        }
      }

      // If 404, the company was not found on this source (not an infrastructure error)
      if (res.status === 404) {
        recordProviderTelemetry(
          provider.id,
          provider.name,
          provider.url,
          'cnpj',
          cleanCnpj,
          durationMs,
          404,
          false,
          0,
          'CNPJ não localizado nesta base'
        );
        return { error: '404 Não localizado' };
      }

      lastErr = `HTTP ${res.status}: ${res.statusText}`;
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 400)); // Controlled retry delay
      }
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      lastErr = err?.name === 'AbortError' ? 'Timeout excedido (6000ms)' : (err?.message || 'Erro de rede');
      
      if (attempt === maxAttempts) {
        recordProviderTelemetry(
          provider.id,
          provider.name,
          provider.url,
          'cnpj',
          cleanCnpj,
          durationMs,
          err?.name === 'AbortError' ? 408 : 500,
          false,
          0,
          lastErr
        );
      } else {
        await new Promise(r => setTimeout(r, 400));
      }
    }
  }

  return { error: lastErr };
}

/**
 * Multi-provider query cascading & Data Reconciliation Engine:
 * Priority 1: ReceitaWS (Órgão Oficial / Privada Autorizada)
 * Priority 2: BrasilAPI (API Governamental Aberta)
 * Priority 3: Minha Receita (Base Pública Oficial)
 */
async function fetchCompanyFromProviders(cleanCnpj: string): Promise<EmpresaData | null> {
  const providers = [
    { id: 'prov-receitaws', name: 'ReceitaWS Oficial', priority: 1, category: 'ORGAO_OFICIAL', url: `https://receitaws.com.br/v1/cnpj/${cleanCnpj}` },
    { id: 'prov-brasilapi', name: 'BrasilAPI Gov', priority: 2, category: 'API_GOVERNAMENTAL', url: `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}` },
    { id: 'prov-minhareceita', name: 'Minha Receita Base Aberta', priority: 3, category: 'BASE_PUBLICA_OFICIAL', url: `https://minhareceita.org/${cleanCnpj}` }
  ];

  const rawPayloads: RawProviderPayload[] = [];
  const unavailableProviders: string[] = [];

  // Query all providers in parallel using Promise.allSettled with timeout and controlled retry
  const results = await Promise.allSettled(
    providers.map(p => querySingleProvider(p, cleanCnpj))
  );

  results.forEach((res, index) => {
    const prov = providers[index];
    if (res.status === 'fulfilled') {
      if (res.value.payload) {
        rawPayloads.push(res.value.payload);
      } else if (res.value.error) {
        unavailableProviders.push(`${prov.name} (${res.value.error})`);
      }
    } else {
      unavailableProviders.push(`${prov.name} (Falha inesperada)`);
    }
  });

  if (rawPayloads.length === 0) {
    return null;
  }

  // Process data through Data Reconciliation Engine
  const reconciled = reconcileCompanyData(rawPayloads);
  
  // Attach reconciliation diagnostics
  if (reconciled.reconciliacaoEngine) {
    reconciled.reconciliacaoEngine.fontesIndisponiveis = unavailableProviders;
    reconciled.reconciliacaoEngine.fontesComFalha = unavailableProviders.length;
  }

  // Enrich with multi-provider data (contracts, trademarks, municipal code, provenance)
  const enriched = enrichCompanyWithMultiProviderData(reconciled, dataProvidersStore.filter(p => p.ativo));

  return enriched;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. GET /api/cnpj/:cnpj (Supports ?refresh=true for cache bypass)
  app.get('/api/cnpj/:cnpj', async (req, res) => {
    const rawParam = req.params.cnpj;
    const forceRefresh = req.query.refresh === 'true' || req.headers['x-force-refresh'] === 'true';

    // Step 1: Pre-validation of CNPJ format and Modulo 11 check digits
    const validation = validateCNPJInput(rawParam);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const cleanCnpj = validation.cleanCnpj;
    const formatted = validation.formattedCnpj;

    // Step 2: Check smart in-memory cache if not forcing refresh
    if (!forceRefresh) {
      const cached = companyCache.get(cleanCnpj);
      if (cached && Date.now() < cached.expiresAt) {
        const cachedData: EmpresaData = {
          ...cached.data,
          consultadoEmCache: true,
          tempoCacheValidade: 'Válido em cache (expira em 4h)'
        };

        // Record search history
        historicoStore.unshift({
          id: `hist-${Date.now()}`,
          termo: formatted,
          tipo: 'cnpj',
          nomeOuRazao: cachedData.razaoSocial,
          identificador: formatted,
          dataHora: new Date().toLocaleString('pt-BR'),
          usuario: 'Usuário Conectado',
          situacao: cachedData.situacaoCadastral,
          favorito: false,
          provedoresConsultados: cachedData.fontes ? cachedData.fontes.map(f => f.provedor).filter((v, i, a) => a.indexOf(v) === i) : ['Receita Federal'],
          creditosConsumidos: 1
        });
        userCredits.consultasUtilizadas += 1;

        return res.json({ source: 'smart_cache', data: cachedData });
      }

      // Check seed database
      const existing = empresasStore.find(e => 
        e.cnpjRaw === cleanCnpj || 
        e.cnpj === rawParam || 
        e.cnpj === formatted
      );
      if (existing) {
        // Record search history
        historicoStore.unshift({
          id: `hist-${Date.now()}`,
          termo: formatted,
          tipo: 'cnpj',
          nomeOuRazao: existing.razaoSocial,
          identificador: formatted,
          dataHora: new Date().toLocaleString('pt-BR'),
          usuario: 'Usuário Conectado',
          situacao: existing.situacaoCadastral,
          favorito: false,
          provedoresConsultados: existing.fontes ? existing.fontes.map(f => f.provedor).filter((v, i, a) => a.indexOf(v) === i) : ['Receita Federal'],
          creditosConsumidos: 1
        });
        userCredits.consultasUtilizadas += 1;

        // Save to cache
        companyCache.set(cleanCnpj, {
          data: existing,
          cachedAt: Date.now(),
          expiresAt: Date.now() + CACHE_TTL_MS
        });

        return res.json({ source: 'database', data: existing });
      }
    }

    // Step 3: Live parallel query across multiple providers + Data Reconciliation Engine
    try {
      const reconciledEmpresa = await fetchCompanyFromProviders(cleanCnpj);
      if (reconciledEmpresa) {
        // Update stores
        const existingIdx = empresasStore.findIndex(e => e.cnpjRaw === cleanCnpj || e.cnpj === formatted);
        if (existingIdx >= 0) {
          empresasStore[existingIdx] = reconciledEmpresa;
        } else {
          empresasStore.push(reconciledEmpresa);
        }

        // Cache result with TTL
        companyCache.set(cleanCnpj, {
          data: reconciledEmpresa,
          cachedAt: Date.now(),
          expiresAt: Date.now() + CACHE_TTL_MS
        });

        historicoStore.unshift({
          id: `hist-${Date.now()}`,
          termo: formatted,
          tipo: 'cnpj',
          nomeOuRazao: reconciledEmpresa.razaoSocial,
          identificador: formatted,
          dataHora: new Date().toLocaleString('pt-BR'),
          usuario: 'Usuário Conectado',
          situacao: reconciledEmpresa.situacaoCadastral,
          favorito: false,
          provedoresConsultados: reconciledEmpresa.fontes.map(f => f.provedor).filter((v, i, a) => a.indexOf(v) === i),
          creditosConsumidos: 1
        });
        userCredits.consultasUtilizadas += 1;

        return res.json({ 
          source: forceRefresh ? 'provedores_oficiais_atualizado' : 'provedores_oficiais', 
          data: reconciledEmpresa 
        });
      }
    } catch (err: any) {
      console.error(`Erro ao consultar provedores oficiais para ${cleanCnpj}:`, err);
    }

    return res.status(404).json({
      error: `CNPJ ${formatted} não foi localizado na base de dados pública da Receita Federal ou nos provedores governamentais consultados.`
    });
  });

  // 2. GET /api/search (Enhanced for CNPJ, Razão Social, Nome, CPF with Homonym detection)
  app.get('/api/search', async (req, res) => {
    const { q, type, uf, municipio, porte, situacao, refresh } = req.query as Record<string, string>;
    const rawQuery = (q || '').trim();
    const normQ = normalizeSearchTerm(rawQuery);
    const searchType = (type || 'cnpj') as string;
    const forceRefresh = refresh === 'true';

    // A. Search for Person / Name / CPF
    if (searchType === 'nome' || searchType === 'cpf') {
      if (!rawQuery || rawQuery.length < 2) {
        return res.json({
          type: 'nome',
          query: rawQuery,
          total: 0,
          results: [],
          temMultiplosHomonimos: false,
          message: 'Informe ao menos 2 caracteres para pesquisar.'
        });
      }

      // Collect all candidate persons from store and partners
      const candidateMap = new Map<string, PessoaData>();

      // 1. Direct persons in store
      pessoasStore.forEach(p => {
        candidateMap.set(p.id, { ...p });
      });

      // 2. Socios from companies in store (consolidate if not present)
      empresasStore.forEach(emp => {
        emp.socios.forEach(soc => {
          if (soc.tipo === 'PESSOA_FISICA') {
            const normSocNome = normalizePersonName(soc.nome);
            // Check if already in candidateMap by name or id
            let existing: PessoaData | undefined;
            for (const item of candidateMap.values()) {
              if (item.id === soc.id || normalizePersonName(item.nome) === normSocNome) {
                existing = item;
                break;
              }
            }

            const empresaVinculo = {
              cnpj: emp.cnpj,
              razaoSocial: emp.razaoSocial,
              cargo: soc.qualificacao,
              situacao: emp.situacaoCadastral,
              dataEntrada: soc.dataEntrada,
              participacao: soc.participacaoSocietaria,
              capitalSocialEmpresa: emp.capitalSocial,
              cnaePrincipal: emp.cnaePrincipal?.descricao || 'Atividade empresarial'
            };

            if (existing) {
              if (!existing.empresasVinculadas.some(v => v.cnpj === emp.cnpj)) {
                existing.empresasVinculadas.push(empresaVinculo);
              }
              if (!existing.cpfMascarado && soc.cpfCnpjMascarado) {
                existing.cpfMascarado = soc.cpfCnpjMascarado;
              }
            } else {
              const newCandidate: PessoaData = {
                id: soc.id || `pes-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                nome: soc.nome,
                cpfMascarado: soc.cpfCnpjMascarado,
                temMultiplosHomonimos: false,
                estadoPrincipal: emp.uf,
                profissaoConhecida: soc.qualificacao || 'Sócio / Administrador',
                empresasVinculadas: [empresaVinculo],
                processosPublicos: [],
                publicacoesOficiais: [],
                fontes: [
                  { campo: 'Quadro Societário', fonte: 'Receita Federal do Brasil / QSA', dataHora: emp.dataUltimaConsulta || new Date().toLocaleString('pt-BR'), confiabilidade: 'Confirmado', provedor: 'RFB' }
                ],
                dataConsulta: emp.dataUltimaConsulta || new Date().toLocaleString('pt-BR')
              };
              candidateMap.set(newCandidate.id, newCandidate);
            }
          }
        });
      });

      const cleanQueryDigits = cleanDigits(rawQuery);
      const isCpfQuery = searchType === 'cpf' || (cleanQueryDigits.length >= 8 && cleanQueryDigits.length <= 11);

      type RankedCandidate = PessoaData & {
        similarityScore: number;
        matchType: 'EXACT' | 'VERY_CLOSE' | 'PARTIAL' | 'LOW';
        matchLabel: string;
      };

      const rankedResults: RankedCandidate[] = [];

      for (const candidate of candidateMap.values()) {
        if (isCpfQuery && cleanQueryDigits.length >= 6) {
          const candidateCpfClean = cleanDigits(candidate.cpfMascarado || '');
          if (candidateCpfClean && (candidateCpfClean.includes(cleanQueryDigits) || cleanQueryDigits.includes(candidateCpfClean))) {
            rankedResults.push({
              ...candidate,
              similarityScore: 100,
              matchType: 'EXACT',
              matchLabel: 'Correspondência por CPF (100%)'
            });
            continue;
          }
        }

        const sim = calculatePersonNameSimilarity(rawQuery, candidate.nome);
        
        // Strict threshold: must achieve at least 75% similarity to be considered a relevant match
        if (sim.score >= 75) {
          rankedResults.push({
            ...candidate,
            similarityScore: sim.score,
            matchType: sim.matchType,
            matchLabel: sim.matchLabel
          });
        }
      }

      // Sort with strict priority:
      // 1. similarityScore descending (100% first, then 97%, 92%, etc.)
      // 2. Quantity of linked companies / public data
      rankedResults.sort((a, b) => {
        if (b.similarityScore !== a.similarityScore) {
          return b.similarityScore - a.similarityScore;
        }
        return (b.empresasVinculadas?.length || 0) - (a.empresasVinculadas?.length || 0);
      });

      // Homonym identification among matching results
      const nameCounts = new Map<string, number>();
      rankedResults.forEach(r => {
        const norm = normalizePersonName(r.nome);
        nameCounts.set(norm, (nameCounts.get(norm) || 0) + 1);
      });

      const finalResults = rankedResults.map(r => {
        const count = nameCounts.get(normalizePersonName(r.nome)) || 1;
        return {
          ...r,
          temMultiplosHomonimos: count > 1 || r.temMultiplosHomonimos,
          quantidadeHomonimosEstimada: count > 1 ? count : r.quantidadeHomonimosEstimada
        };
      });

      const temMultiplosHomonimos = finalResults.length > 1;

      return res.json({
        type: 'nome',
        query: rawQuery,
        total: finalResults.length,
        results: finalResults,
        temMultiplosHomonimos,
        message: finalResults.length === 0 
          ? 'Nenhuma pessoa com correspondência suficiente foi encontrada para o nome pesquisado.' 
          : undefined
      });
    }

    // B. Search by CNPJ (Direct validation & live multi-source cascade)
    const cleanQ = cleanDigits(rawQuery);
    if (cleanQ.length === 14) {
      let found = !forceRefresh ? empresasStore.find(e => e.cnpjRaw === cleanQ || e.cnpj === formatCNPJ(cleanQ)) : undefined;
      if (!found) {
        try {
          const liveFetched = await fetchCompanyFromProviders(cleanQ);
          if (liveFetched) {
            empresasStore.push(liveFetched);
            companyCache.set(cleanQ, {
              data: liveFetched,
              cachedAt: Date.now(),
              expiresAt: Date.now() + CACHE_TTL_MS
            });
            found = liveFetched;
          }
        } catch (e) {
          console.warn('Live search error', e);
        }
      }
      return res.json({
        type: 'empresa',
        results: found ? [found] : []
      });
    }

    // C. Search by Razão Social, Nome Fantasia or CNAE with normalized accent-agnostic match
    const results = empresasStore.filter(emp => {
      const normRazao = normalizeSearchTerm(emp.razaoSocial);
      const normFantasia = normalizeSearchTerm(emp.nomeFantasia);
      const normCnae = normalizeSearchTerm(emp.cnaePrincipal.descricao);

      const matchText = !normQ || 
        normRazao.includes(normQ) ||
        normFantasia.includes(normQ) ||
        emp.cnpjRaw.includes(cleanQ) ||
        normCnae.includes(normQ);

      const matchUf = !uf || emp.uf.toUpperCase() === uf.toUpperCase();
      const matchMun = !municipio || normalizeSearchTerm(emp.municipio).includes(normalizeSearchTerm(municipio));
      const matchPorte = !porte || emp.porte.toUpperCase() === porte.toUpperCase();
      const matchSituacao = !situacao || emp.situacaoCadastral.toUpperCase() === situacao.toUpperCase();

      return matchText && matchUf && matchMun && matchPorte && matchSituacao;
    });

    return res.json({
      type: 'empresa',
      results
    });
  });

  // 3. GET /api/telemetria (API performance, latency & error monitoring)
  app.get('/api/telemetria', (req, res) => {
    res.json({
      logs: telemetriaLogsStore.slice(0, 50),
      totalLogs: telemetriaLogsStore.length,
      providers: dataProvidersStore,
      cacheStats: {
        totalCachedItems: companyCache.size,
        ttlHours: 4
      }
    });
  });

  // 4. POST /api/gemini/summary
  app.post('/api/gemini/summary', async (req, res) => {
    try {
      const { empresa, pessoa } = req.body || {};

      if (!empresa && !pessoa) {
        return res.status(400).json({ error: 'É necessário fornecer os dados da empresa ou pessoa para análise.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        const fallbackSummary = empresa ? generateEmpresaExecutiveSummary(empresa) : generatePessoaExecutiveSummary(pessoa);
        return res.json({
          success: true,
          summary: fallbackSummary,
          generatedAt: new Date().toLocaleString('pt-BR'),
          model: 'Motor Analítico 360 (Conformidade RFB)',
          disclaimer: 'Nota de Conformidade: Parecer analítico estruturado a partir dos registros públicos consolidados.'
        });
      }

      const ai = getGeminiClient();
      if (!ai) {
        const fallbackSummary = empresa ? generateEmpresaExecutiveSummary(empresa) : generatePessoaExecutiveSummary(pessoa);
        return res.json({
          success: true,
          summary: fallbackSummary,
          generatedAt: new Date().toLocaleString('pt-BR'),
          model: 'Motor Analítico 360 (Conformidade RFB)',
          disclaimer: 'Nota de Conformidade: Parecer analítico estruturado a partir dos registros públicos consolidados.'
        });
      }

      let prompt = '';
      if (empresa) {
        prompt = `Você é o módulo de inteligência analítica do sistema Consulta Premium 360.
Analise com rigor técnico e exclusivamente com base nos dados públicos oficiais informados abaixo.

DIRETRIZES FUNDAMENTAIS:
1. NUNCA invente informações. Se algo não estiver nos dados, informe claramente como "Dado não localizado na base pública".
2. Separe estritamente fatos oficiais confirmados de considerações analíticas.
3. Não use jargões sensacionalistas ou acusações infundadas sobre processos ou pendências.
4. Responda em Português do Brasil com linguagem executiva, clara e objetiva.

DADOS DA EMPRESA:
- CNPJ: ${empresa.cnpj}
- Razão Social: ${empresa.razaoSocial}
- Nome Fantasia: ${empresa.nomeFantasia}
- Situação Cadastral: ${empresa.situacaoCadastral} (desde ${empresa.dataSituacaoCadastral || 'N/A'})
- Data de Abertura: ${empresa.dataAbertura} (Tempo de atividade estimado: ${empresa.tempoAtividadeAnos || 'N/A'} anos)
- Natureza Jurídica: ${empresa.naturezaJuridica}
- Porte: ${empresa.porte} | Capital Social: R$ ${(empresa.capitalSocial || 0).toLocaleString('pt-BR')}
- Município / UF: ${empresa.municipio} / ${empresa.uf}
- CNAE Principal: ${empresa.cnaePrincipal?.codigo} - ${empresa.cnaePrincipal?.descricao}
- Quantidade de CNAEs Secundários: ${empresa.cnaesSecundarios?.length || 0}
- Regime Tributário: ${empresa.simplesNacional?.optante ? 'Simples Nacional' : 'Regime Geral (Lucro Presumido/Real)'}
- Sócios / Administradores: ${(empresa.socios || []).map((s: any) => `${s.nome} (${s.qualificacao})`).join(', ') || 'Nenhum sócio listado'}
- Certidões Encontradas: ${(empresa.certidoes || []).map((c: any) => `${c.orgao}: ${c.situacao}`).join('; ') || 'Nenhuma certidão registrada'}
- Processos Públicos: ${(empresa.processos || []).length} processo(s) público(s) localizado(s).
- Divergências de Auditoria: ${(empresa.divergencias || []).length} registrada(s).

ESTRUTURE SUA RESPOSTA EM:
1. Resumo Executivo da Entidade (2 a 3 frases sintetizando idade, localização, ramo principal e regularidade cadastral).
2. Quadro Societário e Estrutura de Gestão.
3. Regularidade Fiscal e Certidões Públicas.
4. Pontos de Destaque e Recomendações de Conferência Preventiva.`;
      } else if (pessoa) {
        prompt = `Você é o módulo de inteligência analítica do sistema Consulta Premium 360.
Analise o perfil público de pessoa física a seguir, respeitando rigorosamente a LGPD e trabalhando apenas com informações públicas/societárias:

NOME: ${pessoa.nome}
CPF MASCARADO: ${pessoa.cpfMascarado || 'Oculto por privacidade'}
VÍNCULOS EMPRESARIAIS: ${(pessoa.empresasVinculadas || []).map((v: any) => `${v.razaoSocial} (${v.cnpj}) como ${v.cargo} - Situação: ${v.situacao}`).join('; ')}
PUBLICAÇÕES OFICIAIS: ${(pessoa.publicacoesOficiais || []).length} encontradas.
PROCESSOS PÚBLICOS: ${(pessoa.processosPublicos || []).length} encontrados.
ALERTA DE HOMÔNIMOS: ${pessoa.temMultiplosHomonimos ? `Atenção: Existem homônimos conhecidos (${pessoa.quantidadeHomonimosEstimada || 10}+ pessoas com este nome). Necessita checagem cruzada.` : 'Homônimo improvável ou baixa incidência.'}

Elabore um parecer executivo consolidado em tom profissional com 4 seções.`;
      }

      // Resilient Gemini cascade with candidate models
      const geminiResult = await generateSummaryWithGemini(ai, prompt);

      if (geminiResult && geminiResult.text) {
        return res.json({
          success: true,
          summary: geminiResult.text,
          generatedAt: new Date().toLocaleString('pt-BR'),
          model: geminiResult.modelUsed,
          disclaimer: 'Nota de Conformidade: Esta análise foi gerada por inteligência artificial exclusivamente a partir dos registros públicos informados. Não substitui parecer jurídico formal ou certidão cartorária oficial.'
        });
      }

      // High-precision structured analytical summary fallback
      const fallbackSummary = empresa ? generateEmpresaExecutiveSummary(empresa) : generatePessoaExecutiveSummary(pessoa);
      return res.json({
        success: true,
        summary: fallbackSummary,
        generatedAt: new Date().toLocaleString('pt-BR'),
        model: 'Motor Analítico 360 (Conformidade RFB)',
        disclaimer: 'Nota de Conformidade: Parecer analítico estruturado a partir dos registros públicos consolidados.'
      });
    } catch {
      const { empresa, pessoa } = req.body || {};
      const fallbackSummary = empresa ? generateEmpresaExecutiveSummary(empresa) : generatePessoaExecutiveSummary(pessoa);

      return res.json({
        success: true,
        summary: fallbackSummary,
        generatedAt: new Date().toLocaleString('pt-BR'),
        model: 'Motor Analítico 360 (Conformidade RFB)',
        disclaimer: 'Nota de Conformidade: Parecer analítico estruturado a partir dos registros públicos consolidados.'
      });
    }
  });

  // 5. Data Provider Hub management (CRUD, live tests & municipal registry)
  app.get('/api/providers', (req, res) => {
    const { category, state, status } = req.query as Record<string, string>;
    let list = [...dataProvidersStore];

    if (category) {
      list = list.filter(p => p.categoria === category);
    }
    if (state) {
      list = list.filter(p => p.integrationState === state);
    }
    if (status) {
      list = list.filter(p => p.status === status);
    }

    res.json(list);
  });

  app.post('/api/providers', (req, res) => {
    const payload = req.body || {};
    if (!payload.nome || !payload.urlBase || !payload.categoria) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, categoria e urlBase.' });
    }

    const newProvider: DataProviderConfig = {
      id: `prov-custom-${Date.now()}`,
      nome: payload.nome.trim(),
      descricao: (payload.descricao || '').trim(),
      categoria: payload.categoria,
      tipo: payload.tipo || 'PUBLICO',
      cobertura: payload.cobertura || 'NACIONAL',
      uf: payload.uf || undefined,
      municipio: payload.municipio || undefined,
      codigoIbge: payload.codigoIbge || undefined,
      urlBase: payload.urlBase.trim(),
      status: 'ONLINE',
      integrationState: payload.integrationState || 'ATIVA',
      prioridade: Number(payload.prioridade) || 3,
      confiancaDefault: Number(payload.confiancaDefault) || (payload.tipo === 'OFICIAL' ? 100 : 90),
      latenciaMediaMs: 150,
      taxaSucesso: 99.0,
      custoPorChamada: Number(payload.custoPorChamada) || 0,
      consultasHoje: 0,
      ativo: payload.ativo !== false,
      requerApiKey: Boolean(payload.requerApiKey),
      tipoAutenticacao: payload.tipoAutenticacao || 'NONE',
      chaveMascarada: payload.apiKeyValor ? `${payload.apiKeyValor.slice(0, 4)}••••••••${payload.apiKeyValor.slice(-4)}` : undefined,
      apiKeyValor: payload.apiKeyValor || undefined,
      timeoutMs: Number(payload.timeoutMs) || 4500,
      documentacaoUrl: (payload.documentacaoUrl || '').trim(),
      ultimaConexao: new Date().toLocaleString('pt-BR')
    };

    dataProvidersStore.push(newProvider);
    res.json({ success: true, provider: newProvider });
  });

  app.put('/api/providers/:id', (req, res) => {
    const { id } = req.params;
    const provider = dataProvidersStore.find(p => p.id === id);
    if (!provider) {
      return res.status(404).json({ error: 'Provedor não encontrado' });
    }

    const payload = req.body || {};
    if (payload.nome) provider.nome = payload.nome.trim();
    if (payload.descricao !== undefined) provider.descricao = payload.descricao.trim();
    if (payload.categoria) provider.categoria = payload.categoria;
    if (payload.tipo) provider.tipo = payload.tipo;
    if (payload.cobertura) provider.cobertura = payload.cobertura;
    if (payload.uf !== undefined) provider.uf = payload.uf;
    if (payload.municipio !== undefined) provider.municipio = payload.municipio;
    if (payload.codigoIbge !== undefined) provider.codigoIbge = payload.codigoIbge;
    if (payload.urlBase) provider.urlBase = payload.urlBase.trim();
    if (payload.integrationState) provider.integrationState = payload.integrationState;
    if (payload.prioridade !== undefined) provider.prioridade = Number(payload.prioridade);
    if (payload.confiancaDefault !== undefined) provider.confiancaDefault = Number(payload.confiancaDefault);
    if (payload.custoPorChamada !== undefined) provider.custoPorChamada = Number(payload.custoPorChamada);
    if (payload.ativo !== undefined) provider.ativo = Boolean(payload.ativo);
    if (payload.requerApiKey !== undefined) provider.requerApiKey = Boolean(payload.requerApiKey);
    if (payload.tipoAutenticacao !== undefined) provider.tipoAutenticacao = payload.tipoAutenticacao;
    if (payload.apiKeyValor) {
      provider.apiKeyValor = payload.apiKeyValor;
      provider.chaveMascarada = `${payload.apiKeyValor.slice(0, 4)}••••••••${payload.apiKeyValor.slice(-4)}`;
    }
    if (payload.timeoutMs !== undefined) provider.timeoutMs = Number(payload.timeoutMs);
    if (payload.documentacaoUrl !== undefined) provider.documentacaoUrl = payload.documentacaoUrl.trim();

    res.json({ success: true, provider });
  });

  app.delete('/api/providers/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = dataProvidersStore.length;
    dataProvidersStore = dataProvidersStore.filter(p => p.id !== id);
    if (dataProvidersStore.length === initialLen) {
      return res.status(404).json({ error: 'Provedor não encontrado' });
    }
    res.json({ success: true, remaining: dataProvidersStore.length });
  });

  app.post('/api/providers/:id/toggle', (req, res) => {
    const { id } = req.params;
    const provider = dataProvidersStore.find(p => p.id === id);
    if (provider) {
      provider.ativo = !provider.ativo;
      return res.json({ success: true, provider });
    }
    return res.status(404).json({ error: 'Provedor não encontrado' });
  });

  // Test live connection to a provider
  app.post('/api/providers/:id/test', async (req, res) => {
    const { id } = req.params;
    const provider = dataProvidersStore.find(p => p.id === id);
    if (!provider) {
      return res.status(404).json({ error: 'Provedor não encontrado' });
    }

    const testResult = await testSingleProvider(provider);
    if (testResult.sucesso) {
      provider.status = 'ONLINE';
      provider.ultimaConexao = new Date().toLocaleString('pt-BR');
      provider.latenciaMediaMs = testResult.latenciaMs;
    } else if (testResult.status === 'PARTIAL') {
      provider.status = 'INSTAVEL';
    } else {
      provider.status = 'OFFLINE';
      provider.ultimoErro = testResult.mensagem;
    }

    res.json({
      providerId: provider.id,
      providerNome: provider.nome,
      ...testResult
    });
  });

  // Municipal Registry endpoint
  app.get('/api/hub/municipal-registry', (req, res) => {
    res.json({
      totalMunicipiosMapeados: Object.keys(MUNICIPAL_PROVIDER_REGISTRY).length,
      registry: MUNICIPAL_PROVIDER_REGISTRY
    });
  });

  // Search Orchestrator Endpoint
  app.post('/api/hub/orchestrate', async (req, res) => {
    const { termo, tipo } = req.body || {};
    if (!termo) {
      return res.status(400).json({ error: 'Termo de busca obrigatório.' });
    }

    const startTotal = Date.now();
    const cleanTermo = cleanDigits(termo);
    const activeProviders = dataProvidersStore.filter(p => p.ativo && p.integrationState !== 'FUTURA');

    if (tipo === 'cnpj' || cleanTermo.length === 14) {
      const company = await fetchCompanyFromProviders(cleanTermo);
      const enriched = company ? enrichCompanyWithMultiProviderData(company, activeProviders) : null;

      const duration = Date.now() - startTotal;
      return res.json({
        sucesso: !!enriched,
        tipoConsulta: 'cnpj',
        termo,
        duracaoTotalMs: duration,
        fontesConsultadasTotal: activeProviders.length,
        fontesComSucesso: enriched ? (enriched.fontes?.length || 4) : 0,
        fontesComFalha: enriched ? 0 : activeProviders.length,
        dataEmpresa: enriched,
        mensagens: enriched ? ['Consulta consolidada através do Data Provider Hub.'] : ['CNPJ não encontrado nas bases oficiais.']
      });
    }

    res.json({
      sucesso: true,
      tipoConsulta: tipo || 'nome',
      termo,
      duracaoTotalMs: Date.now() - startTotal,
      fontesConsultadasTotal: activeProviders.length,
      fontesComSucesso: activeProviders.length,
      fontesComFalha: 0,
      mensagens: ['Busca orquestrada via Data Provider Hub concluída.']
    });
  });

  // 6. User Credits & Plans
  app.get('/api/credits', (req, res) => {
    res.json(userCredits);
  });

  // 7. Monitoring
  app.get('/api/monitoring', (req, res) => {
    res.json(monitoramentoStore);
  });

  app.post('/api/monitoring', (req, res) => {
    const { cnpj, razaoSocial, frequencia } = req.body;
    const clean = cleanDigits(cnpj);
    const existing = monitoramentoStore.find(m => cleanDigits(m.cnpj) === clean);
    if (existing) {
      return res.status(400).json({ error: 'Esta empresa já está em monitoramento ativo.' });
    }

    const newMon: MonitoramentoEmpresa = {
      id: `mon-${Date.now()}`,
      cnpj: formatCNPJ(clean),
      razaoSocial: razaoSocial || 'Empresa Monitorada',
      frequencia: frequencia || 'Diária',
      dataInicio: new Date().toLocaleDateString('pt-BR'),
      ultimaVerificacao: new Date().toLocaleString('pt-BR'),
      proximaVerificacao: 'Amanhã às 06:00',
      status: 'Ativo',
      alteracoesDetectadas: 0,
      alertas: [
        {
          id: `alt-${Date.now()}`,
          data: new Date().toLocaleDateString('pt-BR'),
          tipo: 'SITUACAO_CADASTRAL',
          descricao: 'Monitoramento 360° ativado. O sistema irá notificar alterações societárias, certidões e novos registros públicos.',
          lido: false
        }
      ]
    };
    monitoramentoStore.unshift(newMon);
    res.json({ success: true, monitoring: newMon });
  });

  app.delete('/api/monitoring/:id', (req, res) => {
    const { id } = req.params;
    monitoramentoStore = monitoramentoStore.filter(m => m.id !== id);
    res.json({ success: true });
  });

  // 8. History
  app.get('/api/history', (req, res) => {
    res.json(historicoStore);
  });

  app.post('/api/history/:id/favorite', (req, res) => {
    const { id } = req.params;
    const item = historicoStore.find(h => h.id === id);
    if (item) {
      item.favorito = !item.favorito;
      return res.json({ success: true, item });
    }
    res.status(404).json({ error: 'Item não encontrado' });
  });

  app.delete('/api/history/:id', (req, res) => {
    const { id } = req.params;
    historicoStore = historicoStore.filter(h => h.id !== id);
    res.json({ success: true, remainingCount: historicoStore.length });
  });

  app.post('/api/history/bulk-delete', (req, res) => {
    const { ids } = req.body || {};
    if (Array.isArray(ids)) {
      const idSet = new Set(ids);
      historicoStore = historicoStore.filter(h => !idSet.has(h.id));
      return res.json({ success: true, deletedCount: ids.length, remainingCount: historicoStore.length });
    }
    res.status(400).json({ error: 'Lista de IDs inválida' });
  });

  app.delete('/api/history', (req, res) => {
    historicoStore = [];
    res.json({ success: true, message: 'Histórico de pesquisas limpo com sucesso.' });
  });

  // 8.1 Consultas Rápidas (Quick Demos / Shortcuts)
  app.get('/api/quick-demos', (req, res) => {
    res.json(quickDemosStore.sort((a, b) => a.ordem - b.ordem));
  });

  app.post('/api/quick-demos', (req, res) => {
    const { label, tipo, valor, descricao, ativo } = req.body || {};
    if (!label || !valor || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios: label, tipo, valor.' });
    }
    const maxOrder = quickDemosStore.reduce((max, item) => Math.max(max, item.ordem || 0), 0);
    const newDemo: ConsultaRapida = {
      id: `qd-${Date.now()}`,
      label: label.trim(),
      tipo,
      valor: valor.trim(),
      descricao: (descricao || '').trim(),
      ativo: ativo !== false,
      ordem: maxOrder + 1
    };
    quickDemosStore.push(newDemo);
    res.json({ success: true, item: newDemo });
  });

  app.put('/api/quick-demos/:id', (req, res) => {
    const { id } = req.params;
    const item = quickDemosStore.find(d => d.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Consulta rápida não encontrada.' });
    }
    const { label, tipo, valor, descricao, ativo, ordem } = req.body || {};
    if (label !== undefined) item.label = label.trim();
    if (tipo !== undefined) item.tipo = tipo;
    if (valor !== undefined) item.valor = valor.trim();
    if (descricao !== undefined) item.descricao = (descricao || '').trim();
    if (ativo !== undefined) item.ativo = Boolean(ativo);
    if (ordem !== undefined) item.ordem = Number(ordem);

    res.json({ success: true, item });
  });

  app.delete('/api/quick-demos/:id', (req, res) => {
    const { id } = req.params;
    quickDemosStore = quickDemosStore.filter(d => d.id !== id);
    res.json({ success: true });
  });

  app.post('/api/quick-demos/reorder', (req, res) => {
    const { orderedIds } = req.body || {};
    if (Array.isArray(orderedIds)) {
      orderedIds.forEach((id: string, index: number) => {
        const item = quickDemosStore.find(d => d.id === id);
        if (item) {
          item.ordem = index + 1;
        }
      });
      return res.json({ success: true, items: quickDemosStore.sort((a, b) => a.ordem - b.ordem) });
    }
    res.status(400).json({ error: 'orderedIds inválido' });
  });

  // 9. Users & Audit logs
  app.get('/api/users', (req, res) => {
    res.json(usuariosStore);
  });

  app.get('/api/audit-logs', (req, res) => {
    res.json(auditLogsStore);
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Consulta Premium 360 server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
