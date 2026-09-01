/**
 * Adaptadores Dedicados por Provedor de Dados (ProviderAdapters)
 * Transforma respostas heterogêneas no padrão canônico EmpresaData / PessoaData
 * Consulta Premium 360°
 */

import { 
  EmpresaData, 
  Socio, 
  Cnae, 
  Certidao, 
  InscricaoEstadualData, 
  InscricaoMunicipalData,
  CompanyStatus 
} from '../types';
import { extractDigits, normalizeSearchText } from '../utils/textNormalizer';
import { formatCNPJ, isValidCNPJ } from '../utils/companyNormalizer';

export type ProviderExecutionStatus = 
  | 'found' 
  | 'not_found' 
  | 'unavailable' 
  | 'unauthorized' 
  | 'rate_limited' 
  | 'not_configured' 
  | 'timeout'
  | 'parse_error';

export interface ProviderResponseMetadata {
  providerId: string;
  providerName: string;
  urlConsultada: string;
  status: ProviderExecutionStatus;
  httpStatus: number;
  latenciaMs: number;
  timestamp: string;
  mensagem: string;
  recordsCount: number;
  rawJson?: any;
  erroDetalhes?: string;
}

export interface AdapterResult {
  metadata: ProviderResponseMetadata;
  empresa?: Partial<EmpresaData>;
  socios?: Socio[];
  inscricoesEstaduais?: InscricaoEstadualData[];
  inscricoesMunicipais?: InscricaoMunicipalData[];
}

/**
 * Helper para formatar datas brasileiras (DD/MM/AAAA)
 */
function formatDate(val?: string | null): string {
  if (!val) return '';
  const clean = String(val).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) return clean;
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const [y, m, d] = clean.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  return clean;
}

/**
 * Helper para normalizar situação cadastral
 */
function normalizeSituacao(val?: string | null): CompanyStatus {
  if (!val) return 'ATIVA';
  const u = String(val).toUpperCase();
  if (u.includes('BAIXADA') || u.includes('EXTINTA') || u.includes('ENCERRADA')) return 'BAIXADA';
  if (u.includes('INAPTA')) return 'INAPTA';
  if (u.includes('SUSPENSA')) return 'SUSPENSA';
  if (u.includes('NULA')) return 'NULA';
  return 'ATIVA';
}

/**
 * 1. ADAPTADOR: BrasilAPI (https://brasilapi.com.br/api/cnpj/v1/{cnpj})
 */
export const BrasilApiAdapter = {
  adapt(data: any, metadata: ProviderResponseMetadata): AdapterResult {
    if (!data || typeof data !== 'object') {
      return { metadata: { ...metadata, status: 'not_found', recordsCount: 0 } };
    }

    const cleanCnpj = extractDigits(data.cnpj);
    if (!cleanCnpj || cleanCnpj.length !== 14) {
      return { metadata: { ...metadata, status: 'not_found', recordsCount: 0 } };
    }

    const socios: Socio[] = Array.isArray(data.qsa) ? data.qsa.map((s: any, idx: number) => ({
      id: `soc-bapi-${idx}-${cleanCnpj}`,
      nome: s.nome_socio || s.nome || 'Sócio Registrado',
      qualificacao: s.qualificacao_socio || s.qualificacao_representante_legal || 'Sócio / Administrador',
      cpfCnpjMascarado: s.cnpj_cpf_do_socio ? `***.${extractDigits(s.cnpj_cpf_do_socio).slice(3, 6)}.***-**` : undefined,
      tipo: (s.cnpj_cpf_do_socio && extractDigits(s.cnpj_cpf_do_socio).length === 14) ? 'PESSOA_JURIDICA' : 'PESSOA_FISICA',
      dataEntrada: formatDate(s.data_entrada_sociedade)
    })) : [];

    const cnaesSec: Cnae[] = Array.isArray(data.cnaes_secundarios) ? data.cnaes_secundarios.map((c: any) => ({
      codigo: String(c.codigo || '').replace(/(\d{4})(\d{1})(\d{2})/, '$1-$2/$3') || String(c.codigo || ''),
      descricao: c.descricao || 'Atividade econômica secundária',
      principal: false
    })) : [];

    const empresa: Partial<EmpresaData> = {
      cnpj: formatCNPJ(cleanCnpj),
      cnpjRaw: cleanCnpj,
      razaoSocial: (data.razao_social || data.nome || '').trim().toUpperCase(),
      nomeFantasia: (data.nome_fantasia || '').trim().toUpperCase() || undefined,
      situacaoCadastral: normalizeSituacao(data.descricao_situacao_cadastral),
      dataSituacaoCadastral: formatDate(data.data_situacao_cadastral),
      motivoSituacaoCadastral: data.descricao_motivo_situacao_cadastral || undefined,
      dataAbertura: formatDate(data.data_inicio_atividade),
      naturezaJuridica: data.codigo_natureza_juridica ? `${data.codigo_natureza_juridica} - ${data.natureza_juridica || ''}` : (data.natureza_juridica || 'Sociedade Empresária'),
      porte: (data.porte || 'DEMAIS').toUpperCase() as any,
      capitalSocial: Number(data.capital_social) || 0,
      tipoUnidade: (data.identificador_matriz_filial === 1 || data.descricao_tipo_de_logradouro) ? 'MATRIZ' : 'FILIAL',
      logradouro: [data.descricao_tipo_de_logradouro, data.logradouro].filter(Boolean).join(' ') || data.logradouro || '',
      numero: String(data.numero || 'S/N'),
      complemento: data.complemento || undefined,
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: (data.uf || '').toUpperCase(),
      cep: extractDigits(data.cep),
      telefones: data.ddd_telefone_1 ? [`(${data.ddd_telefone_1.slice(0, 2)}) ${data.ddd_telefone_1.slice(2)}`] : [],
      emails: data.email ? [data.email.toLowerCase()] : [],
      cnaePrincipal: {
        codigo: String(data.cnae_fiscal || '').replace(/(\d{4})(\d{1})(\d{2})/, '$1-$2/$3') || String(data.cnae_fiscal || 'Não informado'),
        descricao: data.cnae_fiscal_descricao || 'Atividade principal',
        principal: true
      },
      cnaesSecundarios: cnaesSec,
      simplesNacional: {
        optante: Boolean(data.opcao_pelo_simples),
        dataOpcao: formatDate(data.data_opcao_pelo_simples),
        situacao: data.opcao_pelo_simples ? 'Optante pelo Simples Nacional' : 'Não optante'
      },
      mei: {
        optante: Boolean(data.opcao_pelo_mei),
        situacao: data.opcao_pelo_mei ? 'Enquadrado como MEI' : 'Não enquadrado como MEI'
      },
      socios
    };

    return {
      metadata: { ...metadata, status: 'found', recordsCount: 1 },
      empresa,
      socios
    };
  }
};

/**
 * 2. ADAPTADOR: ReceitaWS (https://receitaws.com.br/v1/cnpj/{cnpj})
 */
export const ReceitaWsAdapter = {
  adapt(data: any, metadata: ProviderResponseMetadata): AdapterResult {
    if (!data || typeof data !== 'object' || data.status === 'ERROR') {
      return { 
        metadata: { 
          ...metadata, 
          status: data?.message?.includes('limite') ? 'rate_limited' : 'not_found', 
          recordsCount: 0,
          erroDetalhes: data?.message 
        } 
      };
    }

    const cleanCnpj = extractDigits(data.cnpj);
    if (!cleanCnpj || cleanCnpj.length !== 14) {
      return { metadata: { ...metadata, status: 'not_found', recordsCount: 0 } };
    }

    const socios: Socio[] = Array.isArray(data.qsa) ? data.qsa.map((s: any, idx: number) => ({
      id: `soc-rws-${idx}-${cleanCnpj}`,
      nome: s.nome || 'Sócio Registrado',
      qualificacao: s.qual || 'Sócio / Administrador',
      tipo: 'PESSOA_FISICA'
    })) : [];

    const cnaesSec: Cnae[] = Array.isArray(data.atividades_secundarias) ? data.atividades_secundarias.map((c: any) => ({
      codigo: c.code || String(c.codigo || ''),
      descricao: c.text || c.descricao || 'Atividade secundária',
      principal: false
    })) : [];

    const cnaePri = Array.isArray(data.atividade_principal) && data.atividade_principal[0] ? {
      codigo: data.atividade_principal[0].code || 'Não informado',
      descricao: data.atividade_principal[0].text || 'Atividade principal',
      principal: true
    } : {
      codigo: 'Não informado',
      descricao: 'Atividade principal',
      principal: true
    };

    const simplesOptante = Boolean(data.simples && data.simples.optante);
    const simplesData = data.simples?.data_opcao ? formatDate(data.simples.data_opcao) : undefined;
    const meiOptante = Boolean(data.simei && data.simei.optante);

    const empresa: Partial<EmpresaData> = {
      cnpj: formatCNPJ(cleanCnpj),
      cnpjRaw: cleanCnpj,
      razaoSocial: (data.nome || '').trim().toUpperCase(),
      nomeFantasia: (data.fantasia || '').trim().toUpperCase() || undefined,
      situacaoCadastral: normalizeSituacao(data.situacao),
      dataSituacaoCadastral: formatDate(data.data_situacao),
      motivoSituacaoCadastral: data.motivo_situacao || undefined,
      dataAbertura: formatDate(data.abertura),
      naturezaJuridica: data.natureza_juridica || 'Sociedade Empresária',
      porte: (data.porte || 'DEMAIS').toUpperCase() as any,
      capitalSocial: Number(data.capital_social) || 0,
      tipoUnidade: data.tipo === 'MATRIZ' ? 'MATRIZ' : 'FILIAL',
      logradouro: data.logradouro || '',
      numero: String(data.numero || 'S/N'),
      complemento: data.complemento || undefined,
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: (data.uf || '').toUpperCase(),
      cep: extractDigits(data.cep),
      telefones: data.telefone ? [data.telefone] : [],
      emails: data.email ? [data.email.toLowerCase()] : [],
      cnaePrincipal: cnaePri,
      cnaesSecundarios: cnaesSec,
      simplesNacional: {
        optante: simplesOptante,
        dataOpcao: simplesData,
        situacao: simplesOptante ? 'Optante pelo Simples Nacional' : 'Não optante'
      },
      mei: {
        optante: meiOptante,
        situacao: meiOptante ? 'Enquadrado como MEI' : 'Não enquadrado como MEI'
      },
      socios
    };

    return {
      metadata: { ...metadata, status: 'found', recordsCount: 1 },
      empresa,
      socios
    };
  }
};

/**
 * 3. ADAPTADOR: Minha Receita (https://minhareceita.org/{cnpj})
 */
export const MinhaReceitaAdapter = {
  adapt(data: any, metadata: ProviderResponseMetadata): AdapterResult {
    if (!data || typeof data !== 'object') {
      return { metadata: { ...metadata, status: 'not_found', recordsCount: 0 } };
    }

    const cleanCnpj = extractDigits(data.cnpj);
    if (!cleanCnpj || cleanCnpj.length !== 14) {
      return { metadata: { ...metadata, status: 'not_found', recordsCount: 0 } };
    }

    const socios: Socio[] = Array.isArray(data.qsa) ? data.qsa.map((s: any, idx: number) => ({
      id: `soc-mr-${idx}-${cleanCnpj}`,
      nome: s.nome_socio || s.nome || 'Sócio Registrado',
      qualificacao: s.qualificacao_socio || 'Sócio / Administrador',
      tipo: 'PESSOA_FISICA'
    })) : [];

    const cnaesSec: Cnae[] = Array.isArray(data.cnaes_secundarios) ? data.cnaes_secundarios.map((c: any) => ({
      codigo: String(c.codigo || ''),
      descricao: c.descricao || 'Atividade secundária',
      principal: false
    })) : [];

    const empresa: Partial<EmpresaData> = {
      cnpj: formatCNPJ(cleanCnpj),
      cnpjRaw: cleanCnpj,
      razaoSocial: (data.razao_social || data.nome || '').trim().toUpperCase(),
      nomeFantasia: (data.nome_fantasia || '').trim().toUpperCase() || undefined,
      situacaoCadastral: normalizeSituacao(data.descricao_situacao_cadastral || data.situacao),
      dataSituacaoCadastral: formatDate(data.data_situacao_cadastral),
      motivoSituacaoCadastral: data.descricao_motivo_situacao_cadastral || undefined,
      dataAbertura: formatDate(data.data_inicio_atividade),
      naturezaJuridica: data.natureza_juridica || 'Sociedade Empresária',
      porte: (data.porte || 'DEMAIS').toUpperCase() as any,
      capitalSocial: Number(data.capital_social) || 0,
      logradouro: [data.descricao_tipo_de_logradouro, data.logradouro].filter(Boolean).join(' ') || data.logradouro || '',
      numero: String(data.numero || 'S/N'),
      complemento: data.complemento || undefined,
      bairro: data.bairro || '',
      municipio: data.municipio || '',
      uf: (data.uf || '').toUpperCase(),
      cep: extractDigits(data.cep),
      cnaePrincipal: {
        codigo: String(data.cnae_fiscal || 'Não informado'),
        descricao: data.cnae_fiscal_descricao || 'Atividade principal',
        principal: true
      },
      cnaesSecundarios: cnaesSec,
      socios
    };

    return {
      metadata: { ...metadata, status: 'found', recordsCount: 1 },
      empresa,
      socios
    };
  }
};

/**
 * 4. ADAPTADOR: CNPJ.ws (https://publica.cnpj.ws/cnpj/{cnpj})
 */
export const CnpjWsAdapter = {
  adapt(data: any, metadata: ProviderResponseMetadata): AdapterResult {
    if (!data || typeof data !== 'object') {
      return { metadata: { ...metadata, status: 'not_found', recordsCount: 0 } };
    }

    const cleanCnpj = extractDigits(data.cnpj || data.estabelecimento?.cnpj);
    if (!cleanCnpj || cleanCnpj.length !== 14) {
      return { metadata: { ...metadata, status: 'not_found', recordsCount: 0 } };
    }

    const est = data.estabelecimento || {};
    const razao = data.razao_social || est.nome_fantasia || '';
    const fantasia = est.nome_fantasia || '';

    const socios: Socio[] = Array.isArray(data.socios) ? data.socios.map((s: any, idx: number) => ({
      id: `soc-cws-${idx}-${cleanCnpj}`,
      nome: s.nome || 'Sócio Registrado',
      qualificacao: s.qualificacao_socio?.descricao || 'Sócio / Administrador',
      tipo: s.tipo === 'PESSOA_JURIDICA' ? 'PESSOA_JURIDICA' : 'PESSOA_FISICA',
      dataEntrada: formatDate(s.data_entrada)
    })) : [];

    const inscricoesEstaduais: InscricaoEstadualData[] = Array.isArray(est.inscricoes_estaduais) ? est.inscricoes_estaduais.map((ie: any) => ({
      numero: ie.inscricao_estadual,
      uf: ie.estado?.sigla || est.estado?.sigla || 'SP',
      situacao: ie.ativo ? 'HABILITADA' : 'INATIVA',
      regimeTributario: ie.regime_tributario?.descricao || 'Conta Corrente Fiscal',
      dataAtualizacao: formatDate(ie.atualizado_em)
    })) : [];

    const empresa: Partial<EmpresaData> = {
      cnpj: formatCNPJ(cleanCnpj),
      cnpjRaw: cleanCnpj,
      razaoSocial: razao.trim().toUpperCase(),
      nomeFantasia: fantasia.trim().toUpperCase() || undefined,
      situacaoCadastral: normalizeSituacao(est.situacao_cadastral),
      dataSituacaoCadastral: formatDate(est.data_situacao_cadastral),
      dataAbertura: formatDate(est.data_inicio_atividade),
      naturezaJuridica: data.natureza_juridica?.descricao || 'Sociedade Empresária',
      porte: (data.porte?.descricao || 'DEMAIS').toUpperCase() as any,
      capitalSocial: Number(data.capital_social) || 0,
      tipoUnidade: est.tipo === 'Matriz' ? 'MATRIZ' : 'FILIAL',
      logradouro: [est.tipo_logradouro, est.logradouro].filter(Boolean).join(' ') || '',
      numero: String(est.numero || 'S/N'),
      complemento: est.complemento || undefined,
      bairro: est.bairro || '',
      municipio: est.cidade?.nome || est.municipio || '',
      uf: (est.estado?.sigla || est.uf || '').toUpperCase(),
      cep: extractDigits(est.cep),
      telefones: est.ddd1 && est.telefone1 ? [`(${est.ddd1}) ${est.telefone1}`] : [],
      emails: est.email ? [est.email.toLowerCase()] : [],
      cnaePrincipal: {
        codigo: est.atividade_principal?.id || 'Não informado',
        descricao: est.atividade_principal?.descricao || 'Atividade principal',
        principal: true
      },
      inscricoesEstaduais,
      inscricaoEstadual: inscricoesEstaduais[0]?.numero,
      socios
    };

    return {
      metadata: { ...metadata, status: 'found', recordsCount: 1 },
      empresa,
      socios,
      inscricoesEstaduais
    };
  }
};

/**
 * 5. ADAPTADOR GENÉRICO (Fallback unificado para qualquer API governamental ou municipal)
 */
export const GenericApiAdapter = {
  adapt(data: any, metadata: ProviderResponseMetadata): AdapterResult {
    if (!data || typeof data !== 'object') {
      return { metadata: { ...metadata, status: 'not_found', recordsCount: 0 } };
    }

    const cleanCnpj = extractDigits(data.cnpj || data.cnpjRaw || data.documento || data.tax_id);
    const razaoSocial = (data.razao_social || data.razaoSocial || data.nome || data.name || data.company_name || '').trim().toUpperCase();

    if (!cleanCnpj && !razaoSocial) {
      return { metadata: { ...metadata, status: 'not_found', recordsCount: 0 } };
    }

    const empresa: Partial<EmpresaData> = {
      cnpj: cleanCnpj ? formatCNPJ(cleanCnpj) : undefined,
      cnpjRaw: cleanCnpj || undefined,
      razaoSocial: razaoSocial || 'EMPRESA CONSULTADA',
      nomeFantasia: (data.nome_fantasia || data.nomeFantasia || data.fantasia || data.trade_name || '').trim().toUpperCase() || undefined,
      situacaoCadastral: normalizeSituacao(data.situacao || data.situacaoCadastral || data.status),
      dataSituacaoCadastral: formatDate(data.data_situacao || data.dataSituacaoCadastral),
      dataAbertura: formatDate(data.abertura || data.dataAbertura || data.created_at),
      naturezaJuridica: data.natureza_juridica || data.naturezaJuridica || 'Sociedade Empresária',
      porte: (data.porte || 'DEMAIS').toUpperCase() as any,
      capitalSocial: Number(data.capital_social || data.capitalSocial) || 0,
      logradouro: data.logradouro || data.street || '',
      numero: String(data.numero || data.number || 'S/N'),
      complemento: data.complemento || undefined,
      bairro: data.bairro || data.district || '',
      municipio: data.municipio || data.cidade || data.city || '',
      uf: (data.uf || data.estado || data.state || '').toUpperCase(),
      cep: extractDigits(data.cep || data.postal_code),
      inscricaoEstadual: data.inscricao_estadual || data.inscricaoEstadual || undefined,
      inscricaoMunicipal: data.inscricao_municipal || data.inscricaoMunicipal || undefined
    };

    return {
      metadata: { ...metadata, status: 'found', recordsCount: 1 },
      empresa
    };
  }
};
