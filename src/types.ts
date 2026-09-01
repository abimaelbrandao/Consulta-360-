export type SearchType = 'cnpj' | 'razao_social' | 'cpf' | 'nome';

export type ThemePreference = 'light' | 'dark' | 'system';

export type CompanyStatus = 'ATIVA' | 'BAIXADA' | 'SUSPENSA' | 'INAPTA' | 'NULA';

export type ReliabilityLevel = 
  | 'Confirmado' 
  | 'Confirmado por múltiplas fontes' 
  | 'Fonte secundária' 
  | 'Divergente' 
  | 'Não encontrado' 
  | 'Consulta indisponível'
  | 'Obtido por fonte secundária' 
  | 'Erro na consulta' 
  | 'Provável' 
  | 'Necessita conferência';

export type SourcePriorityCategory = 
  | 'ORGAO_OFICIAL'       // Prioridade 1 (100 pts) - RFB, SEFAZ, TST, Caixa
  | 'API_GOVERNAMENTAL'   // Prioridade 2 (95 pts) - BrasilAPI, REDESIM
  | 'BASE_PUBLICA_OFICIAL'// Prioridade 3 (90 pts) - Minha Receita, Diários
  | 'API_PRIVADA_CONFIAL' // Prioridade 4 (75 pts) - ReceitaWS, Parceiros
  | 'PROVEDOR_SECUNDARIO';// Prioridade 5 (60 pts) - Enriquecedores

export interface DivergenciaInformacao {
  campo: string;
  valorOficial: string;
  fonteOficial: string;
  valorDivergente: string;
  fonteDivergente: string;
  resolucao: string;
  dataIdentificacao: string;
}

export interface TelemetriaApiLog {
  id: string;
  providerId: string;
  providerNome: string;
  urlConsultada: string;
  tipoConsulta: SearchType | 'certidao' | 'qsa' | 'ie' | 'im';
  termo: string;
  horarioInicio: string;
  horarioFim: string;
  duracaoMs: number;
  statusHttp: number;
  sucesso: boolean;
  erro?: string;
  fallbackUtilizado: boolean;
  quantidadeRegistros: number;
  dataHora: string;
}

export interface Socio {
  id: string;
  nome: string;
  qualificacao: string;
  tipo: 'PESSOA_FISICA' | 'PESSOA_JURIDICA';
  cpfCnpjMascarado?: string;
  dataEntrada?: string;
  participacaoSocietaria?: number; // percentage e.g. 50
  faixaEtaria?: string;
  paisOrigem?: string;
  empresasRelacionadas?: {
    cnpj: string;
    razaoSocial: string;
    qualificacao: string;
    situacao: CompanyStatus;
  }[];
}

export interface Cnae {
  codigo: string;
  descricao: string;
  principal?: boolean;
}

export interface Certidao {
  id: string;
  orgao: string;
  nome: string;
  situacao: 'NEGATIVA' | 'POSITIVA' | 'POSITIVA_COM_EFEITO_DE_NEGATIVA' | 'INDISPONIVEL';
  dataConsulta: string;
  validade: string;
  codigoControle?: string;
  fonte: string;
  urlOficial?: string;
}

export interface ProcessoPublico {
  id: string;
  tribunal: string;
  numeroProcesso: string;
  polo: 'Ativo' | 'Passivo' | 'Terceiro Interessado';
  tipo: 'Trabalhista' | 'Cível' | 'Execução Fiscal' | 'Administrativo' | 'Empresarial';
  situacao: 'Em Andamento' | 'Julgado' | 'Arquivado' | 'Suspenso';
  ultimaMovimentacao: string;
  dataUltimaMovimentacao: string;
  linkOficial?: string;
  grau: string;
}

export interface FonteInformacao {
  campo: string;
  fonte: string;
  dataHora: string;
  confiabilidade: ReliabilityLevel;
  provedor: string;
  scoreCampo?: number; // 0 a 100
  prioridade?: number; // 1 a 5
  statusInformacao?: ReliabilityLevel;
  observacao?: string;
  fontesConcordantes?: string[];
  divergenciaDetectada?: boolean;
}

export interface InscricaoEstadualData {
  numero: string; // e.g. "12.345.678-9" ou "ISENTO"
  uf: string;
  situacao: string; // "ATIVA", "BAIXADA", "SUSPENSA", "ISENTO", "NÃO HABILITADO"
  indicadorContribuinte?: string; // "Contribuinte ICMS", "Não Contribuinte", "Isento"
  fonte: string; // e.g. "SEFAZ/MA", "SINTEGRA", "Cadastro Centralizado de Contribuintes (CCC)", "REDESIM"
  dataConsulta: string;
  isento?: boolean;
  naoLocalizada?: boolean;
}

export interface InscricaoMunicipalData {
  numero: string; // e.g. "9827364"
  municipio: string;
  uf: string;
  situacao: string; // "ATIVA", "REGULAR", "BAIXADA"
  fonte: string; // e.g. "SEMFAZ São Luís", "Secretaria Municipal da Fazenda", "Cadastro Mobiliário"
  dataConsulta: string;
  naoLocalizada?: boolean;
}

export interface EmpresaData {
  id?: string;
  cnpj: string; // Formatted 00.000.000/0000-00
  cnpjRaw: string; // Digits only
  razaoSocial: string;
  nomeFantasia: string;
  situacaoCadastral: CompanyStatus;
  dataSituacaoCadastral: string;
  motivoSituacaoCadastral?: string;
  dataAbertura: string;
  naturezaJuridica: string;
  porte: 'ME' | 'EPP' | 'DEMAIS' | 'MICROEMPRESA' | 'EMPRESA DE PEQUENO PORTE' | 'GRANDE PORTE';
  capitalSocial: number;
  tipoUnidade: 'MATRIZ' | 'FILIAL';
  quantidadeFiliais?: number;
  
  // Endereço
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
    formatado?: string;
  };
  
  // Contato público
  telefonePublico?: string;
  emailPublico?: string;
  phones?: string[];
  telefones?: string[];
  emails?: string[];
  
  // Atividades
  cnaePrincipal: Cnae;
  cnaesSecundarios: Cnae[];
  
  // Tributário & Fiscal
  simplesNacional: {
    optante: boolean;
    dataOpcao?: string;
    dataExclusao?: string;
    situacao: string;
  };
  mei: {
    optante: boolean;
    situacao: string;
  };
  regimeTributarioEstimado: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  inscricoesEstaduais?: InscricaoEstadualData[];
  inscricoesMunicipais?: InscricaoMunicipalData[];
  situacaoSintegra?: string;
  pendenciasPublicas?: string[];
  
  // Societário
  socios: Socio[];
  
  // Certidões
  certidoes: Certidao[];
  
  // Processos
  processos: ProcessoPublico[];
  
  // Compras & Contratos Públicos (PNCP, Compras.gov, Transparência)
  contratosPublicos?: ContratoPublico[];
  
  // Sanções & Restrições (CEIS, CNEP, CEPIM)
  sancoesPublicas?: SancaoPublica[];
  
  // Propriedade Intelectual (INPI)
  marcasPatentes?: MarcaPatenteInpi[];
  
  // Presença Digital (Web Pública)
  presencaDigital?: PresencaDigital;
  
  // Dados Geográficos & IBGE
  codigoIbgeMunicipio?: string;
  coordenadasGeograficas?: { latitude: number; longitude: number };
  
  // Rastreabilidade & Proveniência de Dados por Campo
  provenienciaCampos?: Record<string, CampoProveniente>;
  
  // Rastreabilidade & Metadados
  fontes: FonteInformacao[];
  dataUltimaConsulta: string;
  scoreConfiabilidade?: number; // 0 a 100
  tempoAtividadeAnos?: number;
  
  // Data Reconciliation Engine Metadata
  divergencias?: DivergenciaInformacao[];
  divergenciasDetectadasCount?: number;
  scoresPorCampo?: Record<string, number>;
  statusPorCampo?: Record<string, ReliabilityLevel>;
  reconciliacaoEngine?: {
    fontesConsultadas: number;
    fontesComSucesso: number;
    fontesComFalha: number;
    fontesIndisponiveis: string[];
    camposConfirmadosOficiais: number;
    camposConfirmadosMultiplasFontes: number;
    camposFonteSecundaria: number;
    camposDivergentes: number;
    scoreGeralCalculado: number;
    metodo: string;
    executadoEm: string;
  };
  consultadoEmCache?: boolean;
  tempoCacheValidade?: string;
  
  // Resumo IA armazenado (opcional)
  resumoIa?: {
    texto: string;
    geradoEm: string;
    modelo: string;
    pontosChave: string[];
    advertenciaLgpd: string;
  };
}

export interface PessoaData {
  id: string;
  nome: string;
  cpfMascarado?: string;
  temMultiplosHomonimos: boolean;
  quantidadeHomonimosEstimada?: number;
  profissaoConhecida?: string;
  estadoPrincipal?: string;
  empresasVinculadas: {
    cnpj: string;
    razaoSocial: string;
    cargo: string;
    situacao: CompanyStatus;
    dataEntrada?: string;
    participacao?: number;
    capitalSocialEmpresa: number;
    cnaePrincipal: string;
  }[];
  processosPublicos: ProcessoPublico[];
  publicacoesOficiais: {
    id: string;
    veiculo: string;
    data: string;
    titulo: string;
    resumo: string;
  }[];
  fontes: FonteInformacao[];
  dataConsulta: string;
}

export interface ConsultaHistorico {
  id: string;
  termo?: string;
  tipo: SearchType;
  nomeOuRazao: string;
  identificador: string; // CNPJ ou Nome
  dataHora: string;
  usuario?: string;
  usuarioId?: string;
  situacao: CompanyStatus | 'ENCONTRADO' | 'NAO_ENCONTRADO' | 'Vínculos Localizados' | string;
  favorito: boolean;
  provedoresConsultados?: string[];
  creditosConsumidos?: number;
}

export interface ConsultaRapida {
  id: string;
  label: string;
  tipo: SearchType;
  valor: string;
  descricao?: string;
  ativo: boolean;
  ordem: number;
}

export interface AlertaMonitoramento {
  id: string;
  empresaId?: string;
  cnpj?: string;
  razaoSocial?: string;
  data?: string;
  dataHora?: string;
  tipo?: 'SITUACAO_CADASTRAL' | 'QUADRO_SOCIETARIO' | 'CERTIDAO' | 'ENDERECO' | 'NOVO_PROCESSO' | string;
  tipoAlerta?: 'SITUACAO_CADASTRAL' | 'QUADRO_SOCIETARIO' | 'CERTIDAO' | 'ENDERECO' | 'NOVO_PROCESSO' | 'PROCESSO' | string;
  titulo?: string;
  descricao: string;
  lido?: boolean;
}

export interface MonitoramentoEmpresa {
  id: string;
  empresaId?: string;
  cnpj: string;
  razaoSocial: string;
  frequencia: 'Diária' | 'Semanal' | 'Quinzenal' | 'DIARIA' | 'SEMANAL' | 'QUINZENAL';
  dataInicio: string;
  dataUltimaChecagem?: string;
  ultimaVerificacao?: string;
  proximaVerificacao?: string;
  status: 'Ativo' | 'Pausado' | 'ATIVO' | 'PAUSADO';
  situacaoAtual?: CompanyStatus | string;
  alteracoesDetectadas?: number;
  alertas?: AlertaMonitoramento[];
}

export type ProviderCategory = 
  | 'CADASTRO_EMPRESARIAL'
  | 'QUADRO_SOCIETARIO'
  | 'INSCRICAO_ESTADUAL'
  | 'INSCRICAO_MUNICIPAL'
  | 'NFSE_MUNICIPAL'
  | 'PROCESSOS_DATAJUD'
  | 'CERTIDOES_NEGATIVAS'
  | 'DIVIDA_ATIVA'
  | 'COMERCIO_EXTERIOR'
  | 'COMPRAS_CONTRATOS'
  | 'CONVENIOS_REPASSES'
  | 'SANCOES_RESTRICOES'
  | 'PROPRIEDADE_INTELECTUAL'
  | 'DADOS_GEOGRAFICOS'
  | 'PRESENCA_DIGITAL'
  | 'COMERCIAL_AUTORIZADA';

export type IntegrationState = 
  | 'ATIVA'
  | 'DISPONIVEL_CONFIGURACAO'
  | 'FUTURA';

export interface ContratoPublico {
  id: string;
  orgao: string;
  numeroContrato: string;
  objeto: string;
  valorTotal: number;
  dataInicio: string;
  dataFim: string;
  situacao: 'Vigente' | 'Concluído' | 'Rescindido' | 'Suspenso' | 'Ativo';
  fonte: string; // e.g. "PNCP (Portal Nacional de Contratações Públicas)", "Portal da Transparência / Compras.gov.br"
  linkOficial?: string;
}

export interface SancaoPublica {
  id: string;
  cadastro: 'CEIS' | 'CNEP' | 'CEPIM' | 'OUTRO';
  orgaoSancionador: string;
  tipoPenalidade: string;
  dataInicio: string;
  dataFim?: string;
  motivo?: string;
  fonte: string;
}

export interface MarcaPatenteInpi {
  id: string;
  tipo: 'MARCA' | 'PATENTE';
  numeroProcesso: string;
  tituloOuMarca: string;
  classeNice?: string;
  situacao: string; // "Registrada", "Em exame", "Aguardando prazo"
  dataDeposito: string;
  dataConcessao?: string;
  dataVigencia?: string;
  fonte: string; // "INPI - Instituto Nacional da Propriedade Industrial"
}

export interface PresencaDigital {
  websiteOficial?: string;
  emailComercial?: string;
  telefoneComercial?: string;
  perfisRedes?: { rede: string; url: string }[];
  horarioFuncionamento?: string;
  categoriaComercial?: string;
  fonte: string; // "Indexação Web Pública"
  dataVerificacao: string;
}

export interface CampoProveniente<T = any> {
  campo: string;
  valor: T;
  fonte: string;
  provedor: string;
  dataHora: string;
  confiancaScore: number; // 100, 95, 80, 65
  confiancaNivel: 'OFICIAL' | 'GOVERNAMENTAL' | 'COMERCIAL_AUTORIZADO' | 'SECUNDARIO';
  observacao?: string;
}

export interface ProvedorApi {
  id: string;
  nome: string;
  descricao?: string;
  categoria: ProviderCategory;
  tipo: 'PUBLICO' | 'OFICIAL' | 'LICENCIADO' | 'TRIBUNAL';
  categoriaPrioridade?: SourcePriorityCategory;
  cobertura: 'NACIONAL' | 'ESTADUAL' | 'MUNICIPAL';
  uf?: string;
  municipio?: string;
  codigoIbge?: string;
  urlBase: string;
  status: 'ONLINE' | 'INSTAVEL' | 'OFFLINE';
  integrationState: IntegrationState;
  prioridade: number; // 1 (Mais alta) a 5 (Mais baixa)
  prioridadeDinamica?: number;
  confiancaDefault?: number; // 100, 95, 80, 65
  latenciaMediaMs?: number;
  taxaSucesso?: number;
  custoPorChamada?: number;
  limiteConsultasMinuto?: number;
  limiteMensal?: number;
  consultasHoje?: number;
  errosContador?: number;
  timeoutsContador?: number;
  tempoRespostaMs?: number;
  ativo: boolean;
  requerApiKey?: boolean;
  requerChave?: boolean;
  tipoAutenticacao?: 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'OAUTH2' | 'CERTIFICATE';
  chaveMascarada?: string;
  apiKeyValor?: string;
  headersPadrao?: Record<string, string>;
  timeoutMs?: number;
  ultimaConexao?: string;
  ultimaConsulta?: string;
  documentacaoUrl?: string;
  ultimoErro?: string;
}

export type DataProviderConfig = ProvedorApi;

export interface PlanoCreditos {
  tipo: 'BASIC' | 'PRO' | 'PREMIUM' | 'ENTERPRISE' | 'UNLIMITED' | 'ILIMITADO';
  limiteMensal: number;
  creditosUtilizados: number;
  creditosDisponiveis: number;
  dataRenovacao: string;
  valorMensal?: string;
  isUnlimited?: boolean;
  acessoTotal?: boolean;
}

export type PlanoUsuario = PlanoCreditos;

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'ADMINISTRADOR' | 'GESTOR' | 'ANALISTA' | 'USUARIO' | 'Administrador' | 'Gestor' | 'Analista' | 'Usuário';
  empresa: string;
  ativo: boolean;
  ultimoAcesso: string;
  consultasRealizadasMes?: number;
  totalConsultas?: number;
}

export interface LogAuditoria {
  id: string;
  dataHora: string;
  usuarioNome: string;
  usuario?: string;
  acao: string;
  detalhes: string;
  ip: string;
  ipOrigem?: string;
}

export type AuditLog = LogAuditoria;

export interface SearchDiagnosticEntry {
  providerId: string;
  providerNome: string;
  categoria: string;
  urlConsultada?: string;
  status: 'found' | 'not_found' | 'unavailable' | 'unauthorized' | 'rate_limited' | 'not_configured' | 'timeout' | 'error';
  httpStatus: number;
  latenciaMs: number;
  quantidadeRegistros: number;
  mensagem: string;
  dataHora: string;
  rawJson?: any;
  erroDetalhes?: string;
}

export interface SearchDiagnosticReport {
  id: string;
  termo: string;
  tipoBusca: SearchType;
  dataHora: string;
  duracaoTotalMs: number;
  fontesConsultadasTotal: number;
  fontesComSucesso: number;
  fontesComFalha: number;
  fontesComRateLimit?: number;
  resultadoEncontrado: boolean;
  totalResultados: number;
  entradas: SearchDiagnosticEntry[];
}

export interface ProviderTestResult {
  providerId: string;
  providerNome: string;
  termoConsultado: string;
  tipoConsulta: SearchType;
  sucesso: boolean;
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR' | 'ONLINE' | 'OFFLINE' | 'INSTAVEL' | 'AUTH_ERROR' | 'RATE_LIMITED' | 'TIMEOUT';
  httpStatus?: number;
  latenciaMs: number;
  mensagem: string;
  dataHora: string;
  rawResponse?: any;
  normalizedData?: any;
  erroDetalhes?: string;
}
