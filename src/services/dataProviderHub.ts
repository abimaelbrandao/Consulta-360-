import { 
  DataProviderConfig, 
  ProviderCategory, 
  IntegrationState, 
  EmpresaData, 
  PessoaData, 
  FonteInformacao, 
  CampoProveniente, 
  ContratoPublico, 
  SancaoPublica, 
  MarcaPatenteInpi, 
  PresencaDigital,
  InscricaoEstadualData,
  InscricaoMunicipalData,
  Certidao,
  ProcessoPublico
} from '../types';

export interface SearchQuery {
  termo: string;
  tipo: 'cnpj' | 'razao_social' | 'cpf' | 'nome';
  uf?: string;
  municipio?: string;
  codigoIbge?: string;
  forceRefresh?: boolean;
}

export interface ProviderResult<T = any> {
  providerId: string;
  providerNome: string;
  category: ProviderCategory;
  sucesso: boolean;
  statusHttp: number;
  duracaoMs: number;
  data?: T;
  erro?: string;
  confiancaScore: number;
  confiancaNivel: 'OFICIAL' | 'GOVERNAMENTAL' | 'COMERCIAL_AUTORIZADO' | 'SECUNDARIO';
  timestamp: string;
}

export interface DataProviderConnector {
  id: string;
  name: string;
  category: ProviderCategory;
  coverage: 'NACIONAL' | 'ESTADUAL' | 'MUNICIPAL';
  uf?: string;
  municipio?: string;
  codigoIbge?: string;
  status: 'ONLINE' | 'INSTAVEL' | 'OFFLINE';
  integrationState: IntegrationState;
  priority: number;
  confidenceDefault: number;
  requiresAuth: boolean;
  authType?: 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'OAUTH2' | 'CERTIFICATE';
  baseUrl: string;
  description: string;
  
  isAvailable(): Promise<boolean>;
  testConnection(): Promise<{ status: 'CONNECTED' | 'PARTIAL' | 'FAILED'; latencyMs: number; message: string }>;
  search(query: SearchQuery): Promise<ProviderResult>;
}

// -------------------------------------------------------------
// Municipal Provider Registry (Mapeamento de conectores por código IBGE)
// -------------------------------------------------------------
export interface MunicipalConnectorConfig {
  codigoIbge: string;
  municipio: string;
  uf: string;
  orgaoFazenda: string;
  portalNfseUrl: string;
  sistema: 'SISTEMA_NACIONAL_ADN' | 'BETHA' | 'PRODAM' | 'ISSNET' | 'QUIPU' | 'PROPRIO';
  integrationState: IntegrationState;
  status: 'ONLINE' | 'INSTAVEL' | 'OFFLINE';
  endpointConsultaIm?: string;
}

export const MUNICIPAL_PROVIDER_REGISTRY: Record<string, MunicipalConnectorConfig> = {
  '2111300': {
    codigoIbge: '2111300',
    municipio: 'São Luís',
    uf: 'MA',
    orgaoFazenda: 'Secretaria Municipal da Fazenda (SEMFAZ São Luís)',
    portalNfseUrl: 'https://semfaz.saoluis.ma.gov.br',
    sistema: 'PROPRIO',
    integrationState: 'ATIVA',
    status: 'ONLINE',
    endpointConsultaIm: 'https://semfaz.saoluis.ma.gov.br/api/mobiliario'
  },
  '3550308': {
    codigoIbge: '3550308',
    municipio: 'São Paulo',
    uf: 'SP',
    orgaoFazenda: 'Secretaria Municipal da Fazenda de São Paulo (SF/SP)',
    portalNfseUrl: 'https://nfe.prefeitura.sp.gov.br',
    sistema: 'PRODAM',
    integrationState: 'ATIVA',
    status: 'ONLINE',
    endpointConsultaIm: 'https://nfe.prefeitura.sp.gov.br/api/ccm'
  },
  '3304557': {
    codigoIbge: '3304557',
    municipio: 'Rio de Janeiro',
    uf: 'RJ',
    orgaoFazenda: 'Secretaria Municipal de Fazenda e Planejamento (SMFP/RJ)',
    portalNfseUrl: 'https://notacarioca.rio.gov.br',
    sistema: 'PROPRIO',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    status: 'ONLINE'
  },
  '5300108': {
    codigoIbge: '5300108',
    municipio: 'Brasília',
    uf: 'DF',
    orgaoFazenda: 'Secretaria de Economia do Distrito Federal (SEEC/DF)',
    portalNfseUrl: 'https://receita.fazenda.df.gov.br',
    sistema: 'PROPRIO',
    integrationState: 'ATIVA',
    status: 'ONLINE'
  },
  '3106200': {
    codigoIbge: '3106200',
    municipio: 'Belo Horizonte',
    uf: 'MG',
    orgaoFazenda: 'Secretaria Municipal de Fazenda de BH (SMFA)',
    portalNfseUrl: 'https://bhissdigital.pbh.gov.br',
    sistema: 'PROPRIO',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    status: 'ONLINE'
  },
  '4106902': {
    codigoIbge: '4106902',
    municipio: 'Curitiba',
    uf: 'PR',
    orgaoFazenda: 'Secretaria Municipal de Finanças de Curitiba (SMF)',
    portalNfseUrl: 'https://isscuritiba.curitiba.pr.gov.br',
    sistema: 'PROPRIO',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    status: 'ONLINE'
  },
  '2304400': {
    codigoIbge: '2304400',
    municipio: 'Fortaleza',
    uf: 'CE',
    orgaoFazenda: 'Secretaria Municipal das Finanças (SEFIN Fortaleza)',
    portalNfseUrl: 'https://iss.sefin.fortaleza.ce.gov.br',
    sistema: 'ISSNET',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    status: 'ONLINE'
  },
  '2927408': {
    codigoIbge: '2927408',
    municipio: 'Salvador',
    uf: 'BA',
    orgaoFazenda: 'Secretaria Municipal da Fazenda de Salvador (SEFAZ Salvador)',
    portalNfseUrl: 'https://nfse.salvador.ba.gov.br',
    sistema: 'PROPRIO',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    status: 'ONLINE'
  },
  '4314902': {
    codigoIbge: '4314902',
    municipio: 'Porto Alegre',
    uf: 'RS',
    orgaoFazenda: 'Secretaria Municipal da Fazenda de Porto Alegre (SMF)',
    portalNfseUrl: 'https://notalegal.portoalegre.rs.gov.br',
    sistema: 'PROPRIO',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    status: 'ONLINE'
  },
  '0000000': {
    codigoIbge: '0000000',
    municipio: 'Ambiente Nacional NFS-e (ADN)',
    uf: 'BR',
    orgaoFazenda: 'Receita Federal / Comitê Gestor da NFS-e (SGC/ADN)',
    portalNfseUrl: 'https://www.nfse.gov.br/EmissorNacional',
    sistema: 'SISTEMA_NACIONAL_ADN',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    status: 'ONLINE'
  }
};

// -------------------------------------------------------------
// Source Confidence Engine
// -------------------------------------------------------------
export class SourceConfidenceEngine {
  /**
   * Determina o score e nível de confiança a partir da categoria e tipo de fonte
   */
  static evaluate(category: ProviderCategory, tipo: 'OFICIAL' | 'PUBLICO' | 'LICENCIADO' | 'TRIBUNAL'): {
    score: number;
    nivel: 'OFICIAL' | 'GOVERNAMENTAL' | 'COMERCIAL_AUTORIZADO' | 'SECUNDARIO';
    label: string;
  } {
    if (tipo === 'OFICIAL' || tipo === 'TRIBUNAL') {
      return { score: 100, nivel: 'OFICIAL', label: '100% Órgão Oficial Titular do Dado' };
    }
    if (tipo === 'PUBLICO') {
      return { score: 95, nivel: 'GOVERNAMENTAL', label: '95% API Pública Governamental / Base Aberta' };
    }
    if (tipo === 'LICENCIADO') {
      return { score: 85, nivel: 'COMERCIAL_AUTORIZADO', label: '85% Provedor Comercial Autorizado' };
    }
    return { score: 70, nivel: 'SECUNDARIO', label: '70% Fonte Pública Secundária' };
  }

  /**
   * Gera o registro de proveniência rastreável para um campo
   */
  static createProvenance<T>(
    campo: string,
    valor: T,
    fonte: string,
    provedor: string,
    tipo: 'OFICIAL' | 'PUBLICO' | 'LICENCIADO' | 'TRIBUNAL',
    obs?: string
  ): CampoProveniente<T> {
    const { score, nivel } = this.evaluate('CADASTRO_EMPRESARIAL', tipo);
    return {
      campo,
      valor,
      fonte,
      provedor,
      dataHora: new Date().toLocaleString('pt-BR'),
      confiancaScore: score,
      confiancaNivel: nivel,
      observacao: obs
    };
  }
}

// -------------------------------------------------------------
// Catalogo Global de Provedores de Dados do Hub
// -------------------------------------------------------------
export const MASTER_DATA_PROVIDERS: DataProviderConfig[] = [
  // 1. Cadastro Empresarial
  {
    id: 'prov-receitaws',
    nome: 'ReceitaWS (Consulta CNPJ & QSA)',
    categoria: 'CADASTRO_EMPRESARIAL',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://receitaws.com.br/v1/cnpj',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 140,
    taxaSucesso: 99.4,
    consultasHoje: 1240,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://receitaws.com.br/api',
    descricao: 'Consulta direta à base pública da Receita Federal com suporte a dados cadastrais e quadro de sócios (QSA).'
  },
  {
    id: 'prov-brasilapi-cnpj',
    nome: 'BrasilAPI - CNPJ & Cadastro Nacional',
    categoria: 'CADASTRO_EMPRESARIAL',
    tipo: 'PUBLICO',
    cobertura: 'NACIONAL',
    urlBase: 'https://brasilapi.com.br/api/cnpj/v1',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 2,
    confiancaDefault: 95,
    latenciaMediaMs: 190,
    taxaSucesso: 99.1,
    consultasHoje: 890,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://brasilapi.com.br/docs',
    descricao: 'API Governamental aberta e colaborativa para consulta rápida de dados de CNPJ, CNAEs e endereço.'
  },
  {
    id: 'prov-minhareceita',
    nome: 'Minha Receita / Base Aberta RFB',
    categoria: 'CADASTRO_EMPRESARIAL',
    tipo: 'PUBLICO',
    cobertura: 'NACIONAL',
    urlBase: 'https://minhareceita.org',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 3,
    confiancaDefault: 90,
    latenciaMediaMs: 230,
    taxaSucesso: 98.7,
    consultasHoje: 450,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://minhareceita.org',
    descricao: 'Espelho oficial das bases de dados abertos disponibilizadas mensalmente pela Receita Federal do Brasil.'
  },
  {
    id: 'prov-serpro-redesim',
    nome: 'SERPRO / REDESIM Integração Oficial',
    categoria: 'CADASTRO_EMPRESARIAL',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://gateway.apiserpro.serpro.gov.br/consulta-cnpj-df',
    status: 'ONLINE',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 95,
    taxaSucesso: 99.9,
    custoPorChamada: 0.04,
    consultasHoje: 0,
    ativo: false,
    requerApiKey: true,
    tipoAutenticacao: 'BEARER_TOKEN',
    chaveMascarada: 'sk_live_serpro_••••••••••••984a',
    documentacaoUrl: 'https://loja.serpro.gov.br/consulta-cnpj',
    descricao: 'Conexão corporativa de alta disponibilidade com a base primária da Receita Federal e REDESIM.'
  },

  // 2. Inscrição Estadual (SEFAZ & SINTEGRA & CCC)
  {
    id: 'prov-sintegra-ccc',
    nome: 'SINTEGRA / Cadastro Centralizado de Contribuintes (CCC)',
    categoria: 'INSCRICAO_ESTADUAL',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://dfe-portal.svrs.rs.gov.br/Nfe/Ccc',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 210,
    taxaSucesso: 98.9,
    consultasHoje: 310,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'http://www.sintegra.gov.br',
    descricao: 'Consulta centralizada da situação de Inscrição Estadual e habilitação de contribuinte ICMS nos 27 estados.'
  },
  {
    id: 'prov-sefaz-sp',
    nome: 'SEFAZ São Paulo / CADESP',
    categoria: 'INSCRICAO_ESTADUAL',
    tipo: 'OFICIAL',
    cobertura: 'ESTADUAL',
    uf: 'SP',
    urlBase: 'https://www.cadesp.fazenda.sp.gov.br',
    status: 'ONLINE',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 160,
    taxaSucesso: 99.2,
    consultasHoje: 0,
    ativo: false,
    requerApiKey: true,
    tipoAutenticacao: 'API_KEY',
    chaveMascarada: 'cadesp_sp_••••••••••••412b',
    descricao: 'Cadastro de Contribuintes do ICMS do Estado de São Paulo.'
  },
  {
    id: 'prov-sefaz-ma',
    nome: 'SEFAZ Maranhão / SefazNET',
    categoria: 'INSCRICAO_ESTADUAL',
    tipo: 'OFICIAL',
    cobertura: 'ESTADUAL',
    uf: 'MA',
    urlBase: 'https://sistemas1.sefaz.ma.gov.br/sintegra',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 240,
    taxaSucesso: 98.5,
    consultasHoje: 120,
    ativo: true,
    requerApiKey: false,
    descricao: 'Consulta direta ao cadastro de contribuintes do Estado do Maranhão.'
  },

  // 3. Inscrição Municipal & NFS-e
  {
    id: 'prov-semfaz-saoluis',
    nome: 'SEMFAZ São Luís / Cadastro Mobiliário',
    categoria: 'INSCRICAO_MUNICIPAL',
    tipo: 'OFICIAL',
    cobertura: 'MUNICIPAL',
    uf: 'MA',
    municipio: 'São Luís',
    codigoIbge: '2111300',
    urlBase: 'https://semfaz.saoluis.ma.gov.br',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 290,
    taxaSucesso: 97.8,
    consultasHoje: 95,
    ativo: true,
    requerApiKey: false,
    descricao: 'Consulta de Inscrição Municipal (IM), alvará e cadastro mobiliário do município de São Luís/MA.'
  },
  {
    id: 'prov-semfaz-saopaulo',
    nome: 'Secretaria da Fazenda de São Paulo (CCM)',
    categoria: 'INSCRICAO_MUNICIPAL',
    tipo: 'OFICIAL',
    cobertura: 'MUNICIPAL',
    uf: 'SP',
    municipio: 'São Paulo',
    codigoIbge: '3550308',
    urlBase: 'https://duc.prefeitura.sp.gov.br',
    status: 'ONLINE',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 180,
    taxaSucesso: 99.0,
    consultasHoje: 0,
    ativo: false,
    requerApiKey: true,
    descricao: 'Consulta de Cadastro de Contribuintes Mobiliários (CCM) do município de São Paulo/SP.'
  },
  {
    id: 'prov-nfse-nacional',
    nome: 'Sistema Nacional da NFS-e (Ambiente ADN)',
    categoria: 'NFSE_MUNICIPAL',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://www.nfse.gov.br/api/adn',
    status: 'ONLINE',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 150,
    taxaSucesso: 99.5,
    consultasHoje: 0,
    ativo: false,
    requerApiKey: true,
    tipoAutenticacao: 'CERTIFICATE',
    documentacaoUrl: 'https://www.gov.br/nfse/pt-br',
    descricao: 'Ambiente de Dados Nacional (ADN) para consulta de parâmetros e emissores do Sistema Nacional da NFS-e.'
  },

  // 4. Processos Judiciais (DataJud / CNJ)
  {
    id: 'prov-datajud-cnj',
    nome: 'DataJud / Conselho Nacional de Justiça (CNJ)',
    categoria: 'PROCESSOS_DATAJUD',
    tipo: 'TRIBUNAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://api-publica.datajud.cnj.jus.br',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 380,
    taxaSucesso: 98.2,
    consultasHoje: 620,
    ativo: true,
    requerApiKey: true,
    tipoAutenticacao: 'API_KEY',
    chaveMascarada: 'APIKey cj_live_••••••••••••e19b',
    documentacaoUrl: 'https://datajud.cnj.jus.br/api-publica',
    descricao: 'Base processual pública unificada do Poder Judiciário brasileiro (STF, STJ, TST, TRFs, TJs e TRTs).'
  },

  // 5. Certidões Negativas & Regularidade Fiscal
  {
    id: 'prov-cnd-federal-pgfn',
    nome: 'Receita Federal / PGFN - Certidão Negativa Conjunta',
    categoria: 'CERTIDOES_NEGATIVAS',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 310,
    taxaSucesso: 99.1,
    consultasHoje: 480,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://www.gov.br/pgfn/pt-br/servicos/certidao-de-regularidade-fiscal',
    descricao: 'Emissão e validação de Certidão Negativa de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União.'
  },
  {
    id: 'prov-cndt-tst',
    nome: 'TST - Certidão Negativa de Débitos Trabalhistas (CNDT)',
    categoria: 'CERTIDOES_NEGATIVAS',
    tipo: 'TRIBUNAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://cndt-certidao.tst.jus.br/gerarCertidao.faces',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 260,
    taxaSucesso: 99.6,
    consultasHoje: 390,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://www.tst.jus.br/certidao',
    descricao: 'Consulta oficial do Banco Nacional de Devedores Trabalhistas (BNDT) da Justiça do Trabalho.'
  },
  {
    id: 'prov-crf-fgts-caixa',
    nome: 'Caixa Econômica Federal - Regularidade do FGTS (CRF)',
    categoria: 'CERTIDOES_NEGATIVAS',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 280,
    taxaSucesso: 98.4,
    consultasHoje: 320,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://consulta-crf.caixa.gov.br',
    descricao: 'Certificado de Regularidade do FGTS perante o agente operador Caixa Econômica Federal.'
  },

  // 6. Compras e Contratos Públicos
  {
    id: 'prov-pncp-compras',
    nome: 'PNCP - Portal Nacional de Contratações Públicas',
    categoria: 'COMPRAS_CONTRATOS',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://pncp.gov.br/api/consulta/v1/contratos',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 250,
    taxaSucesso: 99.0,
    consultasHoje: 210,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://pncp.gov.br/api/consulta/swagger-ui/index.html',
    descricao: 'Contratos administrativos, atas de registro de preços e editais de órgãos públicos federais, estaduais e municipais.'
  },
  {
    id: 'prov-portal-transparencia-cgu',
    nome: 'CGU - Portal da Transparência & Compras.gov.br',
    categoria: 'COMPRAS_CONTRATOS',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://api.portaldatransparencia.gov.br/api-de-dados/contratos',
    status: 'ONLINE',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    prioridade: 2,
    confiancaDefault: 100,
    latenciaMediaMs: 220,
    taxaSucesso: 99.3,
    consultasHoje: 0,
    ativo: false,
    requerApiKey: true,
    tipoAutenticacao: 'API_KEY',
    chaveMascarada: 'cgu_live_••••••••••••927f',
    documentacaoUrl: 'https://portaldatransparencia.gov.br/api-de-dados',
    descricao: 'Contratos do Governo Federal, empenhos, pagamentos e fornecedores cadastrados no Sicaf.'
  },

  // 7. Sanções e Restrições Públicas (CEIS / CNEP / CEPIM)
  {
    id: 'prov-cgu-sancoes',
    nome: 'CGU - Cadastros Nacionais de Sanções (CEIS / CNEP / CEPIM)',
    categoria: 'SANCOES_RESTRICOES',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://api.portaldatransparencia.gov.br/api-de-dados/ceis',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 240,
    taxaSucesso: 99.5,
    consultasHoje: 180,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://portaldatransparencia.gov.br/sancoes',
    descricao: 'Cadastro Nacional de Empresas Inidôneas e Suspensas (CEIS) e Cadastro Nacional de Empresas Punidas (CNEP).'
  },

  // 8. Propriedade Intelectual (INPI)
  {
    id: 'prov-inpi-marcas',
    nome: 'INPI - Instituto Nacional da Propriedade Industrial',
    categoria: 'PROPRIEDADE_INTELECTUAL',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://gru.inpi.gov.br/pePI/servlet/MarcasServletController',
    status: 'ONLINE',
    integrationState: 'DISPONIVEL_CONFIGURACAO',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 340,
    taxaSucesso: 97.5,
    consultasHoje: 0,
    ativo: false,
    requerApiKey: true,
    tipoAutenticacao: 'API_KEY',
    documentacaoUrl: 'https://www.gov.br/inpi/pt-br',
    descricao: 'Consulta oficial de marcas registradas, pedidos de patente e desenhos industriais titularizados pela empresa.'
  },

  // 9. Dados Geográficos & Localização
  {
    id: 'prov-ibge-municipios',
    nome: 'IBGE - Malha Municipal & Códigos Oficiais',
    categoria: 'DADOS_GEOGRAFICOS',
    tipo: 'PUBLICO',
    cobertura: 'NACIONAL',
    urlBase: 'https://servicodados.ibge.gov.br/api/v1/localidades',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    latenciaMediaMs: 110,
    taxaSucesso: 99.8,
    consultasHoje: 740,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://servicodados.ibge.gov.br/api/docs/localidades',
    descricao: 'Validação oficial de municípios brasileiros, regiões geográficas e códigos IBGE de 7 dígitos.'
  },
  {
    id: 'prov-viacep',
    nome: 'ViaCEP - Base de Endereçamento Postal',
    categoria: 'DADOS_GEOGRAFICOS',
    tipo: 'PUBLICO',
    cobertura: 'NACIONAL',
    urlBase: 'https://viacep.com.br/ws',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 2,
    confiancaDefault: 95,
    latenciaMediaMs: 90,
    taxaSucesso: 99.7,
    consultasHoje: 920,
    ativo: true,
    requerApiKey: false,
    documentacaoUrl: 'https://viacep.com.br',
    descricao: 'Enriquecimento de logradouros, bairros e validação de CEP dos Correios em território nacional.'
  },

  // 10. Presença Digital Empresarial
  {
    id: 'prov-web-digital',
    nome: 'Indexação Pública de Presença Digital & Web',
    categoria: 'PRESENCA_DIGITAL',
    tipo: 'PUBLICO',
    cobertura: 'NACIONAL',
    urlBase: 'https://api.digital-presence.hub/v1',
    status: 'ONLINE',
    integrationState: 'ATIVA',
    prioridade: 4,
    confiancaDefault: 70,
    latenciaMediaMs: 290,
    taxaSucesso: 96.5,
    consultasHoje: 310,
    ativo: true,
    requerApiKey: false,
    descricao: 'Descoberta de domínios oficiais, sites institucionais e canais comerciais públicos disponíveis na internet.'
  },

  // 11. Futuras Integrações (Roadmap Expansível)
  {
    id: 'prov-comex-stat',
    nome: 'MDIC / Comex Stat - Comércio Exterior por Empresa',
    categoria: 'COMERCIO_EXTERIOR',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://balanca.economia.gov.br/balanca/bd/comexstat-api',
    status: 'ONLINE',
    integrationState: 'FUTURA',
    prioridade: 2,
    confiancaDefault: 100,
    latenciaMediaMs: 0,
    taxaSucesso: 0,
    consultasHoje: 0,
    ativo: false,
    requerApiKey: true,
    documentacaoUrl: 'https://comexstat.mdic.gov.br',
    descricao: 'Conector previsto para importação e exportação agregada de mercadorias e faixas de valores aduaneiros.'
  },
  {
    id: 'prov-transferegov',
    nome: 'Transferegov.br / Convênios e Emendas da União',
    categoria: 'CONVENIOS_REPASSES',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    urlBase: 'https://api.transferegov.sistema.gov.br/v1',
    status: 'ONLINE',
    integrationState: 'FUTURA',
    prioridade: 2,
    confiancaDefault: 100,
    latenciaMediaMs: 0,
    taxaSucesso: 0,
    consultasHoje: 0,
    ativo: false,
    requerApiKey: true,
    documentacaoUrl: 'https://www.gov.br/transferegov',
    descricao: 'Conector previsto para rastreamento de convênios públicos, contratos de repasse e emendas parlamentares.'
  }
];

export const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  'CADASTRO_EMPRESARIAL': 'Cadastro Empresarial',
  'QUADRO_SOCIETARIO': 'Quadro Societário (QSA)',
  'INSCRICAO_ESTADUAL': 'Inscrição Estadual (SEFAZ/SINTEGRA)',
  'INSCRICAO_MUNICIPAL': 'Inscrição Municipal (SEMFAZ)',
  'NFSE_MUNICIPAL': 'Nota Fiscal de Serviço (NFS-e)',
  'PROCESSOS_DATAJUD': 'Processos Judiciais (DataJud/CNJ)',
  'CERTIDOES_NEGATIVAS': 'Certidões Negativas & Débitos',
  'DIVIDA_ATIVA': 'Dívida Ativa & Regularidade',
  'COMERCIO_EXTERIOR': 'Comércio Exterior & Siscomex',
  'COMPRAS_CONTRATOS': 'Compras e Contratos Públicos (PNCP)',
  'CONVENIOS_REPASSES': 'Convênios e Transferências',
  'SANCOES_RESTRICOES': 'Sanções Públicas (CEIS/CNEP)',
  'PROPRIEDADE_INTELECTUAL': 'Propriedade Intelectual (INPI)',
  'DADOS_GEOGRAFICOS': 'Dados Geográficos (IBGE/CEP)',
  'PRESENCA_DIGITAL': 'Presença Digital Empresarial',
  'COMERCIAL_AUTORIZADA': 'APIs Comerciais Autorizadas'
};
