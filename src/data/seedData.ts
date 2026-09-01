import { EmpresaData, PessoaData, ConsultaHistorico, MonitoramentoEmpresa, DataProviderConfig, Usuario, AuditLog } from '../types';
import { MASTER_DATA_PROVIDERS } from '../services/dataProviderHub';

export const SEED_EMPRESAS: EmpresaData[] = [
  {
    cnpj: '00.000.000/0001-91',
    cnpjRaw: '00000000000191',
    razaoSocial: 'BANCO DO BRASIL SA',
    nomeFantasia: 'BANCO DO BRASIL',
    situacaoCadastral: 'ATIVA',
    dataSituacaoCadastral: '03/11/2005',
    dataAbertura: '12/10/1808',
    naturezaJuridica: '203-8 - Sociedade de Economia Mista',
    porte: 'DEMAIS',
    capitalSocial: 90000000000,
    tipoUnidade: 'MATRIZ',
    quantidadeFiliais: 4500,
    logradouro: 'SBS QUADRA 1 BLOCO C LOTE 32',
    numero: 'S/N',
    complemento: 'ED SEDE III',
    bairro: 'ASA SUL',
    municipio: 'BRASILIA',
    uf: 'DF',
    cep: '70073-901',
    telefonePublico: '(61) 3493-9000',
    emailPublico: 'gecom@bb.com.br',
    cnaePrincipal: {
      codigo: '64.22-1-00',
      descricao: 'Bancos múltiplos, com carteira comercial',
      principal: true,
    },
    cnaesSecundarios: [
      { codigo: '66.19-3-99', descricao: 'Outras atividades auxiliares dos serviços financeiros' },
      { codigo: '66.12-6-01', descricao: 'Corretoras de títulos e valores mobiliários' },
      { codigo: '64.99-9-99', descricao: 'Outras atividades de serviços financeiros não especificadas anteriormente' },
    ],
    simplesNacional: {
      optante: false,
      situacao: 'Não optante pelo Simples Nacional',
    },
    mei: {
      optante: false,
      situacao: 'Não enquadrado como MEI',
    },
    regimeTributarioEstimado: 'Lucro Real',
    inscricaoEstadual: '07.300.001/001-09',
    inscricaoMunicipal: '01239847',
    inscricoesEstaduais: [
      {
        numero: '07.300.001/001-09',
        uf: 'DF',
        situacao: 'ATIVA',
        indicadorContribuinte: 'Contribuinte ICMS',
        fonte: 'SEEC/DF (SINTEGRA / Cadastro Centralizado de Contribuintes - CCC)',
        dataConsulta: '25/08/2026 09:15'
      }
    ],
    inscricoesMunicipais: [
      {
        numero: '01239847',
        municipio: 'BRASILIA',
        uf: 'DF',
        situacao: 'ATIVA',
        fonte: 'Secretaria de Fazenda do Distrito Federal (SEEC/DF)',
        dataConsulta: '25/08/2026 09:15'
      }
    ],
    situacaoSintegra: 'Habilitado - Ativo',
    socios: [
      {
        id: 'soc-bb-1',
        nome: 'TARCISIANA MEDEIROS',
        qualificacao: '10 - Diretor Presidente',
        tipo: 'PESSOA_FISICA',
        cpfCnpjMascarado: '***.482.911-**',
        dataEntrada: '26/01/2023',
        participacaoSocietaria: 0,
        faixaEtaria: '41 a 50 anos',
        empresasRelacionadas: [
          { cnpj: '00.000.000/0001-91', razaoSocial: 'BANCO DO BRASIL SA', qualificacao: 'Diretor Presidente', situacao: 'ATIVA' },
          { cnpj: '47.866.934/0001-74', razaoSocial: 'BB SEGURIDADE PARTICIPACOES S.A.', qualificacao: 'Conselheiro de Administração', situacao: 'ATIVA' }
        ]
      },
      {
        id: 'soc-bb-2',
        nome: 'TESOURO NACIONAL (UNIAO FEDERAL)',
        qualificacao: '05 - Administrador / Acionista Controlador',
        tipo: 'PESSOA_JURIDICA',
        cpfCnpjMascarado: '00.394.460/0001-41',
        participacaoSocietaria: 50.0,
        empresasRelacionadas: [
          { cnpj: '33.000.167/0001-01', razaoSocial: 'PETROLEO BRASILEIRO S.A. - PETROBRAS', qualificacao: 'Acionista Controlador', situacao: 'ATIVA' },
          { cnpj: '00.360.305/0001-04', razaoSocial: 'CAIXA ECONOMICA FEDERAL', qualificacao: 'Sócio Único', situacao: 'ATIVA' }
        ]
      }
    ],
    certidoes: [
      {
        id: 'cert-1',
        orgao: 'Receita Federal / PGFN',
        nome: 'Certidão Negativa de Débitos Relativos a Créditos Tributários Federais',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:15',
        validade: '25/02/2027',
        codigoControle: 'CND-RFB-98421094-BB',
        fonte: 'Secretaria Especial da Receita Federal do Brasil',
        urlOficial: 'https://servicos.receita.fazenda.gov.br'
      },
      {
        id: 'cert-2',
        orgao: 'Tribunal Superior do Trabalho (TST)',
        nome: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:15',
        validade: '21/02/2027',
        codigoControle: 'CNDT-TST-77821-2026',
        fonte: 'Banco Nacional de Devedores Trabalhistas (BNDT)',
        urlOficial: 'https://www.tst.jus.br/certidao'
      },
      {
        id: 'cert-3',
        orgao: 'Caixa Econômica Federal',
        nome: 'Certificado de Regularidade do FGTS (CRF)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:15',
        validade: '15/09/2026',
        codigoControle: 'CRF-CAIXA-20260825-991',
        fonte: 'SITAC - Regularidade Empregador Caixa',
        urlOficial: 'https://consulta-crf.caixa.gov.br'
      },
      {
        id: 'cert-4',
        orgao: 'Tribunal de Justiça do Distrito Federal e Territórios',
        nome: 'Certidão de Falência, Concordata e Recuperação Judicial',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:15',
        validade: '25/11/2026',
        codigoControle: 'TJDFT-FAL-2026-081',
        fonte: 'TJDFT Distribuição Processual',
        urlOficial: 'https://www.tjdft.jus.br'
      }
    ],
    processos: [
      {
        id: 'proc-1',
        tribunal: 'TRF-1',
        numeroProcesso: '1004291-88.2024.4.01.3400',
        polo: 'Passivo',
        tipo: 'Cível',
        situacao: 'Em Andamento',
        ultimaMovimentacao: 'Juntada de Petição de Manifestação da Procuradoria',
        dataUltimaMovimentacao: '18/08/2026',
        linkOficial: 'https://pje1g.trf1.jus.br/consultapublica',
        grau: '1º Grau'
      },
      {
        id: 'proc-2',
        tribunal: 'TST / TRT-10',
        numeroProcesso: '0000842-19.2023.5.10.0014',
        polo: 'Ativo',
        tipo: 'Trabalhista',
        situacao: 'Julgado',
        ultimaMovimentacao: 'Acórdão Publicado no DEJT - Recurso Provido em Parte',
        dataUltimaMovimentacao: '04/07/2026',
        linkOficial: 'https://pje.trt10.jus.br/consultapublica',
        grau: '2º Grau'
      }
    ],
    codigoIbgeMunicipio: '5300108',
    contratosPublicos: [
      {
        id: 'cont-bb-1',
        orgao: 'Ministério da Fazenda / Tesouro Nacional',
        numeroContrato: 'CT-MF-2024/0981',
        objeto: 'Prestação de serviços bancários de custódia e liquidação financeira de títulos da dívida pública federal',
        valorTotal: 48200000.00,
        dataInicio: '01/01/2024',
        dataFim: '31/12/2028',
        situacao: 'Vigente',
        fonte: 'PNCP (Portal Nacional de Contratações Públicas)',
        linkOficial: 'https://pncp.gov.br'
      },
      {
        id: 'cont-bb-2',
        orgao: 'Tribunal Superior Eleitoral (TSE)',
        numeroContrato: 'CT-TSE-2025/012',
        objeto: 'Processamento de folha de pagamento de servidores e magistrados da Justiça Eleitoral',
        valorTotal: 12400000.00,
        dataInicio: '15/03/2025',
        dataFim: '14/03/2030',
        situacao: 'Vigente',
        fonte: 'Portal da Transparência / Compras.gov.br'
      }
    ],
    sancoesPublicas: [],
    marcasPatentes: [
      {
        id: 'inpi-bb-1',
        tipo: 'MARCA',
        numeroProcesso: '829301984',
        tituloOuMarca: 'BANCO DO BRASIL',
        classeNice: 'NCL(11) 36 - Serviços Financeiros e Bancários',
        situacao: 'Registrada',
        dataDeposito: '14/05/1979',
        dataConcessao: '20/10/1982',
        dataVigencia: '20/10/2032',
        fonte: 'INPI - Instituto Nacional da Propriedade Industrial'
      },
      {
        id: 'inpi-bb-2',
        tipo: 'MARCA',
        numeroProcesso: '918401920',
        tituloOuMarca: 'OUROCARD',
        classeNice: 'NCL(11) 36 - Cartões de Crédito e Meios de Pagamento',
        situacao: 'Registrada',
        dataDeposito: '10/02/1995',
        dataConcessao: '15/08/1998',
        dataVigencia: '15/08/2028',
        fonte: 'INPI - Instituto Nacional da Propriedade Industrial'
      }
    ],
    presencaDigital: {
      websiteOficial: 'https://www.bb.com.br',
      emailComercial: 'atendimento@bb.com.br',
      telefoneComercial: '4004-0001 / 0800-729-0001',
      perfisRedes: [
        { rede: 'LinkedIn', url: 'https://linkedin.com/company/bancodobrasil' },
        { rede: 'X / Twitter', url: 'https://x.com/BancodoBrasil' }
      ],
      horarioFuncionamento: 'Segunda a Sexta das 10h às 16h',
      categoriaComercial: 'Instituição Financeira Bancária',
      fonte: 'Indexação Pública Web & Domínio Registrado',
      dataVerificacao: '25/08/2026'
    },
    provenienciaCampos: {
      razaoSocial: { campo: 'razaoSocial', valor: 'BANCO DO BRASIL SA', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS', dataHora: '25/08/2026 09:15', confiancaScore: 100, confiancaNivel: 'OFICIAL' },
      cnpj: { campo: 'cnpj', valor: '00.000.000/0001-91', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS', dataHora: '25/08/2026 09:15', confiancaScore: 100, confiancaNivel: 'OFICIAL' },
      inscricaoEstadual: { campo: 'inscricaoEstadual', valor: '07.300.001/001-09', fonte: 'SEEC/DF (SINTEGRA / CCC)', provedor: 'SINTEGRA', dataHora: '25/08/2026 09:15', confiancaScore: 100, confiancaNivel: 'OFICIAL' },
      inscricaoMunicipal: { campo: 'inscricaoMunicipal', valor: '01239847', fonte: 'Secretaria de Fazenda do DF', provedor: 'SEEC/DF', dataHora: '25/08/2026 09:15', confiancaScore: 100, confiancaNivel: 'OFICIAL' },
      cnaePrincipal: { campo: 'cnaePrincipal', valor: '64.22-1-00', fonte: 'Receita Federal do Brasil', provedor: 'BrasilAPI', dataHora: '25/08/2026 09:15', confiancaScore: 95, confiancaNivel: 'GOVERNAMENTAL' },
      contratosPublicos: { campo: 'contratosPublicos', valor: '2 Contratos Ativos', fonte: 'PNCP / Compras.gov.br', provedor: 'PNCP', dataHora: '25/08/2026 09:15', confiancaScore: 100, confiancaNivel: 'OFICIAL' },
      marcasPatentes: { campo: 'marcasPatentes', valor: '2 Marcas Registradas', fonte: 'INPI', provedor: 'INPI', dataHora: '25/08/2026 09:15', confiancaScore: 100, confiancaNivel: 'OFICIAL' }
    },
    fontes: [
      { campo: 'Dados Cadastrais', fonte: 'Receita Federal do Brasil (RFB)', dataHora: '25/08/2026 09:15', confiabilidade: 'Confirmado', provedor: 'BrasilAPI / RFB' },
      { campo: 'Quadro Societário', fonte: 'Base Pública CNPJ / QSA Receita', dataHora: '25/08/2026 09:15', confiabilidade: 'Confirmado', provedor: 'REDESIM' },
      { campo: 'Certidões', fonte: 'PGFN / TST / Caixa Econômica Federal', dataHora: '25/08/2026 09:15', confiabilidade: 'Confirmado', provedor: 'Integração Oficial CND' },
      { campo: 'Processos Públicos', fonte: 'Diários de Justiça e Portais PJe Públicos', dataHora: '25/08/2026 09:15', confiabilidade: 'Provável', provedor: 'DataJud CNJ' }
    ],
    dataUltimaConsulta: '25/08/2026 09:15',
    scoreConfiabilidade: 99,
    tempoAtividadeAnos: 218
  },
  {
    cnpj: '47.960.950/0001-21',
    cnpjRaw: '47960950000121',
    razaoSocial: 'MAGAZINE LUIZA S.A.',
    nomeFantasia: 'MAGALU',
    situacaoCadastral: 'ATIVA',
    dataSituacaoCadastral: '03/11/2005',
    dataAbertura: '18/11/1957',
    naturezaJuridica: '204-6 - Sociedade Anônima Aberta',
    porte: 'DEMAIS',
    capitalSocial: 12551000000,
    tipoUnidade: 'MATRIZ',
    quantidadeFiliais: 1400,
    logradouro: 'RUA ARNULFO DE LIMA',
    numero: '2385',
    bairro: 'VILA SANTA MARIA',
    municipio: 'FRANCA',
    uf: 'SP',
    cep: '14405-185',
    telefonePublico: '(16) 3711-2000',
    emailPublico: 'ri@magazineluiza.com.br',
    cnaePrincipal: {
      codigo: '47.53-9-00',
      descricao: 'Comércio varejista especializado de eletrodomésticos e equipamentos de áudio e vídeo',
      principal: true,
    },
    cnaesSecundarios: [
      { codigo: '47.51-2-01', descricao: 'Comércio varejista especializado de equipamentos e suprimentos de informática' },
      { codigo: '47.54-7-01', descricao: 'Comércio varejista de móveis' },
      { codigo: '52.11-7-99', descricao: 'Depósitos de mercadorias para terceiros' },
      { codigo: '74.90-1-04', descricao: 'Atividades de intermediação e agenciamento de serviços e negócios em geral' }
    ],
    simplesNacional: {
      optante: false,
      situacao: 'Não optante pelo Simples Nacional',
    },
    mei: {
      optante: false,
      situacao: 'Não enquadrado como MEI',
    },
    regimeTributarioEstimado: 'Lucro Real',
    inscricaoEstadual: '310.045.241.112',
    inscricaoMunicipal: '0098412',
    inscricoesEstaduais: [
      {
        numero: '310.045.241.112',
        uf: 'SP',
        situacao: 'ATIVA',
        indicadorContribuinte: 'Contribuinte ICMS',
        fonte: 'SEFAZ/SP (SINTEGRA / Cadastro Centralizado de Contribuintes - CCC)',
        dataConsulta: '25/08/2026 09:10'
      },
      {
        numero: '12.890.345-0',
        uf: 'MG',
        situacao: 'ATIVA',
        indicadorContribuinte: 'Contribuinte ICMS (Substituto Tributário)',
        fonte: 'SEF/MG (SINTEGRA / CCC)',
        dataConsulta: '25/08/2026 09:10'
      }
    ],
    inscricoesMunicipais: [
      {
        numero: '0098412',
        municipio: 'FRANCA',
        uf: 'SP',
        situacao: 'ATIVA',
        fonte: 'Secretaria de Finanças de Franca/SP (Cadastro Mobiliário)',
        dataConsulta: '25/08/2026 09:10'
      }
    ],
    situacaoSintegra: 'Habilitado - Ativo',
    socios: [
      {
        id: 'soc-mag-1',
        nome: 'FREDERICO TRAJANO INACIO RODRIGUES',
        qualificacao: '16 - Presidente Executivo / Diretor',
        tipo: 'PESSOA_FISICA',
        cpfCnpjMascarado: '***.194.888-**',
        dataEntrada: '15/01/2016',
        participacaoSocietaria: 4.8,
        faixaEtaria: '41 a 50 anos',
        empresasRelacionadas: [
          { cnpj: '47.960.950/0001-21', razaoSocial: 'MAGAZINE LUIZA S.A.', qualificacao: 'Diretor Presidente', situacao: 'ATIVA' },
          { cnpj: '08.647.746/0001-14', razaoSocial: 'LUIZALABS TECNOLOGIA LTDA', qualificacao: 'Administrador', situacao: 'ATIVA' },
          { cnpj: '02.808.708/0001-07', razaoSocial: 'LUIZACRED S.A. SOCIEDADE DE CREDITO, FINANCIAMENTO E INVESTIMENTO', qualificacao: 'Conselheiro', situacao: 'ATIVA' }
        ]
      },
      {
        id: 'soc-mag-2',
        nome: 'LUIZA HELENA TRAJANO INACIO RODRIGUES',
        qualificacao: '10 - Presidente do Conselho de Administração',
        tipo: 'PESSOA_FISICA',
        cpfCnpjMascarado: '***.723.108-**',
        dataEntrada: '01/01/1991',
        participacaoSocietaria: 14.5,
        faixaEtaria: '71 a 80 anos',
        empresasRelacionadas: [
          { cnpj: '47.960.950/0001-21', razaoSocial: 'MAGAZINE LUIZA S.A.', qualificacao: 'Conselheiro de Administração', situacao: 'ATIVA' },
          { cnpj: '21.092.348/0001-02', razaoSocial: 'GRUPO MULHERES DO BRASIL', qualificacao: 'Presidente', situacao: 'ATIVA' }
        ]
      }
    ],
    certidoes: [
      {
        id: 'cert-m1',
        orgao: 'Receita Federal / PGFN',
        nome: 'Certidão Negativa de Débitos Tributários Federais e Dívida Ativa',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:12',
        validade: '18/02/2027',
        codigoControle: 'CND-RFB-MAGALU-47960',
        fonte: 'Receita Federal do Brasil',
        urlOficial: 'https://servicos.receita.fazenda.gov.br'
      },
      {
        id: 'cert-m2',
        orgao: 'Tribunal Superior do Trabalho',
        nome: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:12',
        validade: '12/02/2027',
        codigoControle: 'CNDT-TST-90214-2026',
        fonte: 'Banco Nacional de Devedores Trabalhistas',
        urlOficial: 'https://www.tst.jus.br/certidao'
      },
      {
        id: 'cert-m3',
        orgao: 'Caixa Econômica Federal',
        nome: 'Certificado de Regularidade do FGTS (CRF)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:12',
        validade: '02/09/2026',
        codigoControle: 'CRF-CAIXA-47960950-88',
        fonte: 'Caixa Econômica Federal FGTS',
        urlOficial: 'https://consulta-crf.caixa.gov.br'
      },
      {
        id: 'cert-m4',
        orgao: 'Secretaria da Fazenda de São Paulo (SEFAZ-SP)',
        nome: 'Certidão de Débitos Tributários Não Inscritos na Dívida Ativa Estadual',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:12',
        validade: '20/11/2026',
        codigoControle: 'SEFAZ-SP-2026-44910',
        fonte: 'Posto Fiscal Eletrônico SP',
        urlOficial: 'https://www.fazenda.sp.gov.br'
      }
    ],
    processos: [
      {
        id: 'proc-m1',
        tribunal: 'TJ-SP',
        numeroProcesso: '1012948-22.2025.8.26.0100',
        polo: 'Passivo',
        tipo: 'Cível',
        situacao: 'Em Andamento',
        ultimaMovimentacao: 'Audiência de Conciliação Designada',
        dataUltimaMovimentacao: '14/08/2026',
        linkOficial: 'https://esaj.tjsp.jus.br/cpopg',
        grau: '1º Grau'
      },
      {
        id: 'proc-m2',
        tribunal: 'TRT-15 (Campinas)',
        numeroProcesso: '0010940-54.2024.5.15.0076',
        polo: 'Passivo',
        tipo: 'Trabalhista',
        situacao: 'Julgado',
        ultimaMovimentacao: 'Acordo Homologado e Cumprido',
        dataUltimaMovimentacao: '20/06/2026',
        linkOficial: 'https://pje.trt15.jus.br/consultapublica',
        grau: '1º Grau'
      }
    ],
    fontes: [
      { campo: 'Dados Cadastrais', fonte: 'Receita Federal do Brasil (RFB)', dataHora: '25/08/2026 09:12', confiabilidade: 'Confirmado', provedor: 'BrasilAPI / RFB' },
      { campo: 'Quadro Societário', fonte: 'CVM / Dados Públicos CNPJ', dataHora: '25/08/2026 09:12', confiabilidade: 'Confirmado', provedor: 'CVM e REDESIM' },
      { campo: 'Certidões', fonte: 'Órgãos Federais e Estaduais (SEFAZ-SP)', dataHora: '25/08/2026 09:12', confiabilidade: 'Confirmado', provedor: 'CND Multi-Órgão' },
      { campo: 'Processos', fonte: 'Diários Oficiais da Justiça SP / TST', dataHora: '25/08/2026 09:12', confiabilidade: 'Provável', provedor: 'DataJud CNJ' }
    ],
    dataUltimaConsulta: '25/08/2026 09:12',
    scoreConfiabilidade: 98,
    tempoAtividadeAnos: 69
  },
  {
    cnpj: '30.680.829/0001-43',
    cnpjRaw: '30680829000143',
    razaoSocial: 'NU PAGAMENTOS S.A. - INSTITUICAO DE PAGAMENTO',
    nomeFantasia: 'NUBANK',
    situacaoCadastral: 'ATIVA',
    dataSituacaoCadastral: '08/06/2018',
    dataAbertura: '06/05/2013',
    naturezaJuridica: '205-4 - Sociedade Anônima Fechada',
    porte: 'DEMAIS',
    capitalSocial: 4500000000,
    tipoUnidade: 'MATRIZ',
    logradouro: 'RUA CAPOTE VALENTE',
    numero: '39',
    bairro: 'PINHEIROS',
    municipio: 'SAO PAULO',
    uf: 'SP',
    cep: '05409-000',
    telefonePublico: '(11) 3003-3030',
    emailPublico: 'juridico@nubank.com.br',
    cnaePrincipal: {
      codigo: '66.19-3-99',
      descricao: 'Outras atividades auxiliares dos serviços financeiros não especificadas anteriormente',
      principal: true,
    },
    cnaesSecundarios: [
      { codigo: '64.99-9-99', descricao: 'Outras atividades de serviços financeiros não especificadas anteriormente' },
      { codigo: '66.13-4-00', descricao: 'Administração de cartões de crédito' },
      { codigo: '62.01-5-01', descricao: 'Desenvolvimento de programas de computador sob encomenda' }
    ],
    simplesNacional: {
      optante: false,
      situacao: 'Não optante pelo Simples Nacional',
    },
    mei: {
      optante: false,
      situacao: 'Não enquadrado como MEI',
    },
    regimeTributarioEstimado: 'Lucro Real',
    inscricaoEstadual: 'ISENTO',
    inscricaoMunicipal: '5.109.843-0',
    inscricoesEstaduais: [
      {
        numero: 'ISENTO',
        uf: 'SP',
        situacao: 'ISENTO',
        indicadorContribuinte: 'Não Contribuinte ICMS',
        fonte: 'SEFAZ/SP (SINTEGRA / Cadastro Centralizado de Contribuintes - CCC)',
        dataConsulta: '25/08/2026 09:05',
        isento: true
      }
    ],
    inscricoesMunicipais: [
      {
        numero: '5.109.843-0',
        municipio: 'SAO PAULO',
        uf: 'SP',
        situacao: 'ATIVA',
        fonte: 'Secretaria Municipal da Fazenda de São Paulo (SF/SP)',
        dataConsulta: '25/08/2026 09:05'
      }
    ],
    socios: [
      {
        id: 'soc-nu-1',
        nome: 'DAVID VELEZ OSORNO',
        qualificacao: '10 - Diretor Presidente',
        tipo: 'PESSOA_FISICA',
        cpfCnpjMascarado: '***.331.428-**',
        dataEntrada: '06/05/2013',
        participacaoSocietaria: 21.0,
        paisOrigem: 'COLOMBIA',
        empresasRelacionadas: [
          { cnpj: '30.680.829/0001-43', razaoSocial: 'NU PAGAMENTOS S.A.', qualificacao: 'Diretor Presidente', situacao: 'ATIVA' },
          { cnpj: '31.872.495/0001-72', razaoSocial: 'NU FINANCEIRA S.A. SOCIEDADE DE CREDITO', qualificacao: 'Conselheiro', situacao: 'ATIVA' }
        ]
      },
      {
        id: 'soc-nu-2',
        nome: 'CRISTINA HELENA ZINGARETTI JUNQUEIRA',
        qualificacao: '16 - Presidente Executivo / Co-fundadora',
        tipo: 'PESSOA_FISICA',
        cpfCnpjMascarado: '***.892.408-**',
        dataEntrada: '06/05/2013',
        participacaoSocietaria: 9.5,
        empresasRelacionadas: [
          { cnpj: '30.680.829/0001-43', razaoSocial: 'NU PAGAMENTOS S.A.', qualificacao: 'Diretora', situacao: 'ATIVA' },
          { cnpj: '38.409.821/0001-90', razaoSocial: 'NU DTVM LTDA', qualificacao: 'Administradora', situacao: 'ATIVA' }
        ]
      }
    ],
    certidoes: [
      {
        id: 'cert-n1',
        orgao: 'Receita Federal / PGFN',
        nome: 'Certidão Negativa de Débitos Federais',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:00',
        validade: '14/02/2027',
        codigoControle: 'CND-RFB-NUBANK-3068',
        fonte: 'Receita Federal do Brasil',
        urlOficial: 'https://servicos.receita.fazenda.gov.br'
      },
      {
        id: 'cert-n2',
        orgao: 'Caixa Econômica Federal',
        nome: 'Certificado de Regularidade FGTS',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:00',
        validade: '10/09/2026',
        codigoControle: 'CRF-NUBANK-2026',
        fonte: 'Caixa Econômica Federal',
        urlOficial: 'https://consulta-crf.caixa.gov.br'
      },
      {
        id: 'cert-n3',
        orgao: 'TST',
        nome: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:00',
        validade: '05/02/2027',
        codigoControle: 'CNDT-TST-30680-2026',
        fonte: 'BNDT TST',
        urlOficial: 'https://www.tst.jus.br/certidao'
      }
    ],
    processos: [
      {
        id: 'proc-n1',
        tribunal: 'TJ-SP',
        numeroProcesso: '1029481-99.2025.8.26.0100',
        polo: 'Passivo',
        tipo: 'Cível',
        situacao: 'Em Andamento',
        ultimaMovimentacao: 'Petição de Contestação Apresentada',
        dataUltimaMovimentacao: '19/08/2026',
        linkOficial: 'https://esaj.tjsp.jus.br/cpopg',
        grau: '1º Grau'
      }
    ],
    fontes: [
      { campo: 'Dados Cadastrais', fonte: 'Receita Federal do Brasil (RFB)', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado', provedor: 'BrasilAPI / RFB' },
      { campo: 'Quadro Societário', fonte: 'Banco Central do Brasil / JUCESP', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado', provedor: 'JUCESP' },
      { campo: 'Certidões', fonte: 'PGFN / TST / Caixa', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado', provedor: 'CND Multi-Órgão' }
    ],
    dataUltimaConsulta: '25/08/2026 09:00',
    scoreConfiabilidade: 97,
    tempoAtividadeAnos: 13
  },
  {
    cnpj: '45.123.890/0001-55',
    cnpjRaw: '45123890000155',
    razaoSocial: 'AURORA ENERGIAS RENOVAVEIS E TECNOLOGIA LTDA',
    nomeFantasia: 'AURORA SOLAR TECH',
    situacaoCadastral: 'ATIVA',
    dataSituacaoCadastral: '10/01/2022',
    dataAbertura: '10/01/2022',
    naturezaJuridica: '206-2 - Sociedade Empresária Limitada',
    porte: 'EPP',
    capitalSocial: 750000,
    tipoUnidade: 'MATRIZ',
    logradouro: 'AVENIDA DOS HOLANDESES',
    numero: '1000',
    complemento: 'SALA 402 ED METROPOLITAN',
    bairro: 'CALHAU',
    municipio: 'SAO LUIS',
    uf: 'MA',
    cep: '65071-380',
    telefonePublico: '(98) 3235-8890',
    emailPublico: 'contato@aurorasolartech.com.br',
    cnaePrincipal: {
      codigo: '43.21-5-00',
      descricao: 'Instalação e manutenção elétrica e sistemas fotovoltaicos',
      principal: true,
    },
    cnaesSecundarios: [
      { codigo: '47.42-3-00', descricao: 'Comércio varejista de material elétrico' },
      { codigo: '71.12-0-00', descricao: 'Serviços de engenharia' }
    ],
    simplesNacional: {
      optante: true,
      dataOpcao: '10/01/2022',
      situacao: 'Optante pelo Simples Nacional desde 10/01/2022',
    },
    mei: {
      optante: false,
      situacao: 'Não enquadrado como MEI',
    },
    regimeTributarioEstimado: 'Simples Nacional',
    inscricaoEstadual: '12.890.345-1',
    inscricaoMunicipal: '784102',
    inscricoesEstaduais: [
      {
        numero: '12.890.345-1',
        uf: 'MA',
        situacao: 'ATIVA',
        indicadorContribuinte: 'Contribuinte ICMS',
        fonte: 'SEFAZ/MA (SINTEGRA / Cadastro Centralizado de Contribuintes - CCC)',
        dataConsulta: '25/08/2026 08:30'
      }
    ],
    inscricoesMunicipais: [
      {
        numero: '784102',
        municipio: 'SAO LUIS',
        uf: 'MA',
        situacao: 'ATIVA',
        fonte: 'SEMFAZ São Luís (Secretaria Municipal da Fazenda)',
        dataConsulta: '25/08/2026 08:30'
      }
    ],
    situacaoSintegra: 'Habilitado - Regular',
    socios: [
      {
        id: 'soc-aur-1',
        nome: 'MARCOS VINICIUS ALMEIDA SILVA',
        qualificacao: '49 - Sócio-Administrador',
        tipo: 'PESSOA_FISICA',
        cpfCnpjMascarado: '***.612.303-**',
        dataEntrada: '10/01/2022',
        participacaoSocietaria: 60.0,
        faixaEtaria: '31 a 40 anos',
        empresasRelacionadas: [
          { cnpj: '45.123.890/0001-55', razaoSocial: 'AURORA ENERGIAS RENOVAVEIS E TECNOLOGIA LTDA', qualificacao: 'Sócio-Administrador', situacao: 'ATIVA' },
          { cnpj: '38.991.014/0001-88', razaoSocial: 'MVA ENGENHARIA E CONSULTORIA LTDA', qualificacao: 'Sócio', situacao: 'ATIVA' }
        ]
      },
      {
        id: 'soc-aur-2',
        nome: 'CAMILA BEATRIZ CARVALHO ROCHA',
        qualificacao: '22 - Sócio',
        tipo: 'PESSOA_FISICA',
        cpfCnpjMascarado: '***.904.113-**',
        dataEntrada: '10/01/2022',
        participacaoSocietaria: 40.0,
        faixaEtaria: '31 a 40 anos',
        empresasRelacionadas: [
          { cnpj: '45.123.890/0001-55', razaoSocial: 'AURORA ENERGIAS RENOVAVEIS E TECNOLOGIA LTDA', qualificacao: 'Sócio', situacao: 'ATIVA' }
        ]
      }
    ],
    certidoes: [
      {
        id: 'cert-a1',
        orgao: 'Receita Federal / PGFN',
        nome: 'Certidão Negativa de Débitos Federais',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 08:30',
        validade: '12/01/2027',
        codigoControle: 'CND-RFB-45123-MA',
        fonte: 'Receita Federal do Brasil',
        urlOficial: 'https://servicos.receita.fazenda.gov.br'
      },
      {
        id: 'cert-a2',
        orgao: 'SEFAZ - Maranhão',
        nome: 'Certidão Negativa de Débitos Estaduais',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 08:30',
        validade: '20/11/2026',
        codigoControle: 'SEFAZ-MA-2026-8819',
        fonte: 'Secretaria de Fazenda do Estado do Maranhão',
        urlOficial: 'https://sistemas1.sefaz.ma.gov.br/certidoes'
      },
      {
        id: 'cert-a3',
        orgao: 'Prefeitura de São Luís / SEMFAZ',
        nome: 'Certidão Negativa de Tributos Municipais (ISS/Taxas)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 08:30',
        validade: '25/10/2026',
        codigoControle: 'SEMFAZ-SLZ-2026-10492',
        fonte: 'Secretaria Municipal de Fazenda de São Luís',
        urlOficial: 'https://semfaz.saoluis.ma.gov.br'
      },
      {
        id: 'cert-a4',
        orgao: 'Caixa Econômica Federal',
        nome: 'Certificado de Regularidade FGTS (CRF)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 08:30',
        validade: '18/09/2026',
        codigoControle: 'CRF-45123890-2026',
        fonte: 'Caixa Econômica Federal',
        urlOficial: 'https://consulta-crf.caixa.gov.br'
      }
    ],
    processos: [],
    fontes: [
      { campo: 'Dados Cadastrais', fonte: 'Receita Federal do Brasil', dataHora: '25/08/2026 08:30', confiabilidade: 'Confirmado', provedor: 'BrasilAPI / RFB' },
      { campo: 'Simples Nacional', fonte: 'Portal do Simples Nacional / SERPRO', dataHora: '25/08/2026 08:30', confiabilidade: 'Confirmado', provedor: 'Simples Nacional' },
      { campo: 'Certidões', fonte: 'RFB / SEFAZ-MA / SEMFAZ São Luís', dataHora: '25/08/2026 08:30', confiabilidade: 'Confirmado', provedor: 'Portal CND' },
      { campo: 'Processos', fonte: 'TJMA / TRT-16 / TRF-1', dataHora: '25/08/2026 08:30', confiabilidade: 'Confirmado', provedor: 'DataJud CNJ' }
    ],
    dataUltimaConsulta: '25/08/2026 08:30',
    scoreConfiabilidade: 96,
    tempoAtividadeAnos: 4
  },
  {
    cnpj: '45.734.622/0001-81',
    cnpjRaw: '45734622000181',
    razaoSocial: 'J DOS S LOPES',
    nomeFantasia: 'JARDEL LOPES CONTABILIDADE',
    situacaoCadastral: 'ATIVA',
    dataSituacaoCadastral: '22/03/2022',
    dataAbertura: '22/03/2022',
    naturezaJuridica: '213-5 - Empresário (Individual)',
    porte: 'ME',
    capitalSocial: 500000,
    tipoUnidade: 'MATRIZ',
    logradouro: 'R DO ALECRIM',
    numero: '415',
    complemento: 'SALA 404',
    bairro: 'CENTRO',
    municipio: 'SAO LUIS',
    uf: 'MA',
    cep: '65010-040',
    telefonePublico: '(98) 8259-1493',
    emailPublico: 'JARDELLOPESCONTABILIDADE@GMAIL.COM',
    phones: ['(98) 8259-1493'],
    emails: ['JARDELLOPESCONTABILIDADE@GMAIL.COM'],
    endereco: {
      logradouro: 'R DO ALECRIM',
      numero: '415',
      complemento: 'SALA 404',
      bairro: 'CENTRO',
      municipio: 'SAO LUIS',
      uf: 'MA',
      cep: '65010-040',
      formatado: 'R DO ALECRIM, SALA 404, 415 - CENTRO, SAO LUIS/MA - CEP 65010-040'
    },
    cnaePrincipal: {
      codigo: '69.20-6-01',
      descricao: 'Atividades de contabilidade',
      principal: true
    },
    cnaesSecundarios: [],
    simplesNacional: {
      optante: true,
      dataOpcao: '22/03/2022',
      situacao: 'Optante pelo Simples Nacional desde 22/03/2022'
    },
    mei: {
      optante: false,
      situacao: 'Não enquadrado como MEI'
    },
    regimeTributarioEstimado: 'Simples Nacional',
    inscricaoEstadual: 'Inscrição Estadual não localizada na fonte consultada.',
    inscricaoMunicipal: 'Inscrição Municipal não localizada na fonte consultada.',
    inscricoesEstaduais: [
      {
        numero: 'Inscrição Estadual não localizada na fonte consultada.',
        uf: 'MA',
        situacao: 'Não localizada',
        indicadorContribuinte: 'Informação não constante nos cadastros públicos integrados',
        fonte: 'SEFAZ/MA (SINTEGRA / Cadastro Centralizado de Contribuintes - CCC)',
        dataConsulta: '25/08/2026 09:00',
        naoLocalizada: true
      }
    ],
    inscricoesMunicipais: [
      {
        numero: 'Inscrição Municipal não localizada na fonte consultada.',
        municipio: 'SAO LUIS',
        uf: 'MA',
        situacao: 'Não localizada',
        fonte: 'SEMFAZ São Luís (Secretaria Municipal da Fazenda)',
        dataConsulta: '25/08/2026 09:00',
        naoLocalizada: true
      }
    ],
    situacaoSintegra: 'Não localizada',
    socios: [
      {
        id: 'soc-jl-1',
        nome: 'JARDEL DOS SANTOS LOPES',
        qualificacao: '50 - Empresário (Individual)',
        tipo: 'PESSOA_FISICA',
        cpfCnpjMascarado: '***.***.***-**',
        dataEntrada: '22/03/2022',
        participacaoSocietaria: 100,
        faixaEtaria: 'Não informada',
        empresasRelacionadas: []
      }
    ],
    certidoes: [
      {
        id: 'cert-jl-1',
        orgao: 'Secretaria Especial da Receita Federal do Brasil / PGFN',
        nome: 'Certidão Negativa de Débitos Relativos a Tributos Federais e à Dívida Ativa da União',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:00',
        validade: 'Consulta oficial em tempo real',
        fonte: 'Portal Oficial e-CAC / PGFN',
        urlOficial: 'https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/pj/consultar'
      },
      {
        id: 'cert-jl-2',
        orgao: 'Tribunal Superior do Trabalho (TST)',
        nome: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:00',
        validade: 'Consulta direta no Banco Nacional de Devedores Trabalhistas (BNDT)',
        fonte: 'Banco Nacional de Devedores Trabalhistas (BNDT / TST)',
        urlOficial: 'https://cndt-certidao.tst.jus.br/inicio.faces'
      },
      {
        id: 'cert-jl-3',
        orgao: 'Caixa Econômica Federal',
        nome: 'Certificado de Regularidade do FGTS (CRF)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:00',
        validade: 'Consulta oficial no Sistema Caixa',
        fonte: 'SITAC - Caixa Econômica Federal',
        urlOficial: 'https://consulta-crf.caixa.gov.br'
      }
    ],
    processos: [],
    fontes: [
      { campo: 'Razão Social', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado' },
      { campo: 'Nome Fantasia', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado' },
      { campo: 'Situação Cadastral', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado' },
      { campo: 'Endereço Oficial', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado' },
      { campo: 'Telefone de Contato', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado' },
      { campo: 'E-mail Corporativo', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado' },
      { campo: 'CNAE Principal', fonte: 'Receita Federal do Brasil / CONCLA', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado' },
      { campo: 'Simples Nacional', fonte: 'Portal Simples Nacional / RFB', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado' }
    ],
    dataUltimaConsulta: '25/08/2026 09:00',
    scoreConfiabilidade: 98,
    tempoAtividadeAnos: 4
  },
  {
    id: 'emp-lunna-doces',
    cnpj: '40.106.414/0001-14',
    cnpjRaw: '40106414000114',
    razaoSocial: 'MEIRY ELLEN SOUSA DE JESUS',
    nomeFantasia: 'LUNNA DOCES',
    tipoUnidade: 'MATRIZ',
    dataAbertura: '16/12/2020',
    situacaoCadastral: 'ATIVA',
    dataSituacaoCadastral: '16/12/2020',
    motivoSituacaoCadastral: 'SEM MOTIVO',
    naturezaJuridica: '213-5 - Empresário (Individual)',
    capitalSocial: 5000,
    porte: 'MICROEMPRESA',
    logradouro: 'RUA DO COQUEIRO',
    numero: '12',
    complemento: 'SALA 01',
    bairro: 'CENTRO',
    municipio: 'SAO LUIS',
    uf: 'MA',
    cep: '65010-180',
    phones: ['(98) 98845-2190'],
    emails: ['lunnadocesslz@gmail.com'],
    telefonePublico: '(98) 98845-2190',
    emailPublico: 'lunnadocesslz@gmail.com',
    cnaePrincipal: {
      codigo: '47.21-1-04',
      descricao: 'Comércio varejista de doces, balas, bombons e semelhantes'
    },
    cnaesSecundarios: [
      {
        codigo: '10.91-1-02',
        descricao: 'Fabricação de produtos de padaria e confeitaria com predominância de produção própria'
      },
      {
        codigo: '56.20-1-04',
        descricao: 'Fornecimento de alimentos preparados preponderantemente para consumo domiciliar'
      }
    ],
    simplesNacional: {
      optante: true,
      dataOpcao: '16/12/2020',
      situacao: 'Optante pelo Simples Nacional'
    },
    mei: {
      optante: true,
      situacao: 'Enquadrado como MEI'
    },
    regimeTributarioEstimado: 'Simples Nacional (MEI)',
    inscricaoEstadual: '12.980.450-8',
    inscricaoMunicipal: '840192',
    inscricoesEstaduais: [
      {
        numero: '12.980.450-8',
        uf: 'MA',
        situacao: 'ATIVA',
        indicadorContribuinte: 'Contribuinte ICMS',
        fonte: 'SEFAZ/MA (SINTEGRA / Cadastro Centralizado de Contribuintes - CCC)',
        dataConsulta: '25/08/2026 09:30'
      }
    ],
    inscricoesMunicipais: [
      {
        numero: '840192',
        municipio: 'SAO LUIS',
        uf: 'MA',
        situacao: 'ATIVA',
        fonte: 'SEMFAZ São Luís (Secretaria Municipal da Fazenda)',
        dataConsulta: '25/08/2026 09:30'
      }
    ],
    situacaoSintegra: 'Habilitado - Ativo',
    socios: [
      {
        id: 'soc-meiry-1',
        nome: 'MEIRY ELLEN SOUSA DE JESUS',
        qualificacao: '50 - Empresário (Individual)',
        tipo: 'PESSOA_FISICA',
        cpfCnpjMascarado: '***.482.913-**',
        dataEntrada: '16/12/2020',
        participacaoSocietaria: 100,
        faixaEtaria: '21 a 30 anos',
        empresasRelacionadas: []
      }
    ],
    certidoes: [
      {
        id: 'cert-meiry-1',
        orgao: 'Secretaria Especial da Receita Federal do Brasil / PGFN',
        nome: 'Certidão Negativa de Débitos Relativos a Tributos Federais e à Dívida Ativa da União',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:30',
        validade: 'Consulta oficial em tempo real',
        fonte: 'Portal Oficial e-CAC / PGFN',
        urlOficial: 'https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/pj/consultar'
      },
      {
        id: 'cert-meiry-2',
        orgao: 'Tribunal Superior do Trabalho (TST)',
        nome: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:30',
        validade: 'Consulta direta no Banco Nacional de Devedores Trabalhistas (BNDT)',
        fonte: 'Banco Nacional de Devedores Trabalhistas (BNDT / TST)',
        urlOficial: 'https://cndt-certidao.tst.jus.br/inicio.faces'
      },
      {
        id: 'cert-meiry-3',
        orgao: 'Caixa Econômica Federal',
        nome: 'Certificado de Regularidade do FGTS (CRF)',
        situacao: 'NEGATIVA',
        dataConsulta: '25/08/2026 09:30',
        validade: 'Consulta oficial no Sistema Caixa',
        fonte: 'SITAC - Caixa Econômica Federal',
        urlOficial: 'https://consulta-crf.caixa.gov.br'
      }
    ],
    processos: [],
    fontes: [
      { campo: 'Razão Social', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado' },
      { campo: 'Nome Fantasia', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado' },
      { campo: 'Situação Cadastral', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado' },
      { campo: 'Endereço Oficial', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado' },
      { campo: 'Telefone de Contato', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado' },
      { campo: 'E-mail Corporativo', fonte: 'Receita Federal do Brasil', provedor: 'ReceitaWS', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado' },
      { campo: 'CNAE Principal', fonte: 'Receita Federal do Brasil / CONCLA', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado' },
      { campo: 'Simples Nacional & MEI', fonte: 'Portal Simples Nacional / RFB', provedor: 'ReceitaWS / BrasilAPI', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado' }
    ],
    dataUltimaConsulta: '25/08/2026 09:30',
    scoreConfiabilidade: 99,
    tempoAtividadeAnos: 6
  }
];

export const SEED_PESSOAS: PessoaData[] = [
  {
    id: 'pes-meiry',
    nome: 'MEIRY ELLEN SOUSA DE JESUS',
    cpfMascarado: '***.482.913-**',
    temMultiplosHomonimos: false,
    profissaoConhecida: 'Empresária e Confeiteira',
    estadoPrincipal: 'MA',
    empresasVinculadas: [
      {
        cnpj: '40.106.414/0001-14',
        razaoSocial: 'MEIRY ELLEN SOUSA DE JESUS (LUNNA DOCES)',
        cargo: 'Empresário (Individual) / Titular',
        situacao: 'ATIVA',
        dataEntrada: '16/12/2020',
        participacao: 100,
        capitalSocialEmpresa: 5000,
        cnaePrincipal: 'Comércio varejista de doces, balas, bombons e semelhantes'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [
      {
        id: 'pub-meiry-1',
        veiculo: 'Junta Comercial do Estado do Maranhão - JUCEMA',
        data: '16/12/2020',
        titulo: 'Registro e Enquadramento de Microempreendedor Individual (MEI)',
        resumo: 'Inscrição empresarial deferida sob Certificado de Condição de Microempreendedor Individual - CCMEI.'
      }
    ],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCEMA / Receita Federal do Brasil', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado', provedor: 'JUCEMA' },
      { campo: 'Situação Cadastral', fonte: 'Portal do Empreendedor / RFB', dataHora: '25/08/2026 09:30', confiabilidade: 'Confirmado', provedor: 'RFB' }
    ],
    dataConsulta: '25/08/2026 09:30'
  },
  {
    id: 'pes-1',
    nome: 'LUIZA HELENA TRAJANO INACIO RODRIGUES',
    cpfMascarado: '***.723.108-**',
    temMultiplosHomonimos: false,
    profissaoConhecida: 'Empresária e Administradora',
    estadoPrincipal: 'SP',
    empresasVinculadas: [
      {
        cnpj: '47.960.950/0001-21',
        razaoSocial: 'MAGAZINE LUIZA S.A.',
        cargo: 'Conselheiro de Administração',
        situacao: 'ATIVA',
        dataEntrada: '01/01/1991',
        participacao: 14.5,
        capitalSocialEmpresa: 12551000000,
        cnaePrincipal: 'Comércio varejista de eletrodomésticos e eletrônicos'
      },
      {
        cnpj: '21.092.348/0001-02',
        razaoSocial: 'GRUPO MULHERES DO BRASIL',
        cargo: 'Presidente',
        situacao: 'ATIVA',
        dataEntrada: '10/06/2013',
        participacao: 0,
        capitalSocialEmpresa: 0,
        cnaePrincipal: 'Atividades de organizações associativas'
      }
    ],
    processosPublicos: [
      {
        id: 'proc-p1',
        tribunal: 'TJ-SP',
        numeroProcesso: '1004128-40.2024.8.26.0100',
        polo: 'Terceiro Interessado',
        tipo: 'Cível',
        situacao: 'Julgado',
        ultimaMovimentacao: 'Homologação e Arquivamento Definitivo',
        dataUltimaMovimentacao: '12/05/2026',
        linkOficial: 'https://esaj.tjsp.jus.br',
        grau: '1º Grau'
      }
    ],
    publicacoesOficiais: [
      {
        id: 'pub-1',
        veiculo: 'Diário Oficial do Estado de São Paulo - JUCESP',
        data: '15/04/2026',
        titulo: 'Ata de Assembleia Geral Ordinária de Acionistas - Magazine Luiza S.A.',
        resumo: 'Reeleição dos membros do Conselho de Administração para o biênio 2026/2028.'
      },
      {
        id: 'pub-2',
        veiculo: 'CVM - Comissão de Valores Mobiliários',
        data: '28/03/2026',
        titulo: 'Formulário de Referência Anual',
        resumo: 'Declaração de composição societária e governança corporativa.'
      }
    ],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'Junta Comercial do Estado de São Paulo (JUCESP) / RFB', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado', provedor: 'JUCESP' },
      { campo: 'Publicações Oficiais', fonte: 'Diário Oficial do Estado de SP / Imprensa Nacional', dataHora: '25/08/2026 09:00', confiabilidade: 'Confirmado', provedor: 'DOESP' }
    ],
    dataConsulta: '25/08/2026 09:00'
  },
  {
    id: 'pes-2',
    nome: 'MARCOS VINICIUS ALMEIDA SILVA',
    cpfMascarado: '***.612.303-**',
    temMultiplosHomonimos: true,
    quantidadeHomonimosEstimada: 14,
    profissaoConhecida: 'Engenheiro Eletricista e Empresário',
    estadoPrincipal: 'MA',
    empresasVinculadas: [
      {
        cnpj: '45.123.890/0001-55',
        razaoSocial: 'AURORA ENERGIAS RENOVAVEIS E TECNOLOGIA LTDA',
        cargo: 'Sócio-Administrador',
        situacao: 'ATIVA',
        dataEntrada: '10/01/2022',
        participacao: 60.0,
        capitalSocialEmpresa: 750000,
        cnaePrincipal: 'Instalação e manutenção elétrica e sistemas fotovoltaicos'
      },
      {
        cnpj: '38.991.014/0001-88',
        razaoSocial: 'MVA ENGENHARIA E CONSULTORIA LTDA',
        cargo: 'Sócio-Administrador',
        situacao: 'ATIVA',
        dataEntrada: '14/08/2020',
        participacao: 100.0,
        capitalSocialEmpresa: 100000,
        cnaePrincipal: 'Serviços de engenharia consultiva'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [
      {
        id: 'pub-mva-1',
        veiculo: 'Diário Oficial do Estado do Maranhão - JUCEMA',
        data: '15/01/2022',
        titulo: 'Constituição de Sociedade Empresária Limitada',
        resumo: 'Registro de contrato social sob NIRE 2120098412-1.'
      }
    ],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCEMA / Receita Federal do Brasil', dataHora: '25/08/2026 08:35', confiabilidade: 'Confirmado', provedor: 'JUCEMA' }
    ],
    dataConsulta: '25/08/2026 08:35'
  },
  {
    id: 'pes-joao-pedro-silva',
    nome: 'JOÃO PEDRO DA SILVA',
    cpfMascarado: '***.319.824-**',
    temMultiplosHomonimos: false,
    profissaoConhecida: 'Administrador de Empresas e Investidor',
    estadoPrincipal: 'SP',
    empresasVinculadas: [
      {
        cnpj: '28.451.980/0001-12',
        razaoSocial: 'SILVA & PEDRO PARTICIPACOES E INVESTIMENTOS S.A.',
        cargo: 'Diretor Presidente',
        situacao: 'ATIVA',
        dataEntrada: '15/03/2018',
        participacao: 50.0,
        capitalSocialEmpresa: 2500000,
        cnaePrincipal: 'Holdings de instituições não-financeiras'
      },
      {
        cnpj: '35.109.840/0001-99',
        razaoSocial: 'JPS LOGISTICA E TRANSPORTES LTDA',
        cargo: 'Sócio-Administrador',
        situacao: 'ATIVA',
        dataEntrada: '20/07/2021',
        participacao: 70.0,
        capitalSocialEmpresa: 800000,
        cnaePrincipal: 'Transporte rodoviário de carga'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [
      {
        id: 'pub-jps-1',
        veiculo: 'JUCESP - Diário Oficial',
        data: '15/03/2018',
        titulo: 'Ato Constitutivo de Sociedade Anônima Fechada',
        resumo: 'Ata de fundação e eleição da primeira diretoria executiva.'
      }
    ],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCESP / Receita Federal do Brasil', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'JUCESP' }
    ],
    dataConsulta: '25/08/2026 10:00'
  },
  {
    id: 'pes-joao-silva-santos',
    nome: 'JOÃO SILVA SANTOS',
    cpfMascarado: '***.812.449-**',
    temMultiplosHomonimos: true,
    quantidadeHomonimosEstimada: 8,
    profissaoConhecida: 'Comerciante Varejista',
    estadoPrincipal: 'BA',
    empresasVinculadas: [
      {
        cnpj: '19.821.340/0001-50',
        razaoSocial: 'SANTOS & SILVA COMERCIO DE ALIMENTOS LTDA',
        cargo: 'Sócio-Administrador',
        situacao: 'ATIVA',
        dataEntrada: '10/05/2015',
        participacao: 50.0,
        capitalSocialEmpresa: 150000,
        cnaePrincipal: 'Comércio varejista de mercadorias em geral'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCEB / Receita Federal do Brasil', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'JUCEB' }
    ],
    dataConsulta: '25/08/2026 10:00'
  },
  {
    id: 'pes-pedro-silva-costa',
    nome: 'PEDRO DA SILVA COSTA',
    cpfMascarado: '***.554.190-**',
    temMultiplosHomonimos: true,
    quantidadeHomonimosEstimada: 5,
    profissaoConhecida: 'Engenheiro Civil',
    estadoPrincipal: 'RJ',
    empresasVinculadas: [
      {
        cnpj: '24.712.980/0001-33',
        razaoSocial: 'COSTA CONSTRUCOES E REFORMAS LTDA',
        cargo: 'Sócio-Administrador',
        situacao: 'ATIVA',
        dataEntrada: '01/02/2019',
        participacao: 100.0,
        capitalSocialEmpresa: 300000,
        cnaePrincipal: 'Construção de edifícios'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCERJA / Receita Federal do Brasil', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'JUCERJA' }
    ],
    dataConsulta: '25/08/2026 10:00'
  },
  {
    id: 'pes-jose-antonio-sousa',
    nome: 'JOSÉ ANTÔNIO DE SOUSA',
    cpfMascarado: '***.901.233-**',
    temMultiplosHomonimos: false,
    profissaoConhecida: 'Advogado e Consultor Tributário',
    estadoPrincipal: 'DF',
    empresasVinculadas: [
      {
        cnpj: '31.450.980/0001-04',
        razaoSocial: 'JOSÉ ANTÔNIO DE SOUSA SOCIEDADE INDIVIDUAL DE ADVOCACIA',
        cargo: 'Titular / Administrador',
        situacao: 'ATIVA',
        dataEntrada: '18/09/2017',
        participacao: 100.0,
        capitalSocialEmpresa: 500000,
        cnaePrincipal: 'Serviços advocatícios'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [
      {
        id: 'pub-jas-1',
        veiculo: 'OAB / Diário da Justiça DF',
        data: '18/09/2017',
        titulo: 'Registro de Sociedade de Advogados',
        resumo: 'Registro deferido pela Comissão de Sociedades de Advogados da OAB/DF.'
      }
    ],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'OAB/DF / Receita Federal do Brasil', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'OAB / RFB' }
    ],
    dataConsulta: '25/08/2026 10:00'
  },
  {
    id: 'pes-jardel-lopes-silva',
    nome: 'JARDEL LOPES DA SILVA',
    cpfMascarado: '***.445.678-**',
    temMultiplosHomonimos: false,
    profissaoConhecida: 'Desenvolvedor de Software e Empresário',
    estadoPrincipal: 'MA',
    empresasVinculadas: [
      {
        cnpj: '37.890.123/0001-77',
        razaoSocial: 'JARDEL LOPES TECNOLOGIA E SISTEMAS LTDA',
        cargo: 'Sócio-Administrador',
        situacao: 'ATIVA',
        dataEntrada: '14/06/2021',
        participacao: 80.0,
        capitalSocialEmpresa: 200000,
        cnaePrincipal: 'Desenvolvimento de programas de computador sob encomenda'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCEMA / Receita Federal do Brasil', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'JUCEMA' }
    ],
    dataConsulta: '25/08/2026 10:00'
  },
  {
    id: 'pes-jardel-sousa-lopes',
    nome: 'JARDEL SOUSA LOPES',
    cpfMascarado: '***.198.712-**',
    temMultiplosHomonimos: false,
    profissaoConhecida: 'Agrônomo e Produtor Rural',
    estadoPrincipal: 'GO',
    empresasVinculadas: [
      {
        cnpj: '22.341.908/0001-44',
        razaoSocial: 'AGRO LOPES CEREAIS E GRAOS LTDA',
        cargo: 'Sócio-Administrador',
        situacao: 'ATIVA',
        dataEntrada: '05/04/2016',
        participacao: 50.0,
        capitalSocialEmpresa: 1200000,
        cnaePrincipal: 'Comércio atacadista de matérias-primas agrícolas'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCEG / Receita Federal do Brasil', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'JUCEG' }
    ],
    dataConsulta: '25/08/2026 10:00'
  },
  {
    id: 'pes-maria-sousa-silva-sp',
    nome: 'MARIA DE SOUSA SILVA',
    cpfMascarado: '***.123.456-**',
    temMultiplosHomonimos: true,
    quantidadeHomonimosEstimada: 3,
    profissaoConhecida: 'Diretora Financeira e Contadora',
    estadoPrincipal: 'SP',
    empresasVinculadas: [
      {
        cnpj: '33.910.450/0001-88',
        razaoSocial: 'PAULISTA AUDITORIA E CONSULTORIA CONTABIL LTDA',
        cargo: 'Sócia-Administradora',
        situacao: 'ATIVA',
        dataEntrada: '12/03/2012',
        participacao: 50.0,
        capitalSocialEmpresa: 600000,
        cnaePrincipal: 'Atividades de contabilidade e consultoria'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCESP / Receita Federal do Brasil', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'JUCESP' }
    ],
    dataConsulta: '25/08/2026 10:00'
  },
  {
    id: 'pes-maria-sousa-silva-ma',
    nome: 'MARIA DE SOUSA SILVA',
    cpfMascarado: '***.789.012-**',
    temMultiplosHomonimos: true,
    quantidadeHomonimosEstimada: 3,
    profissaoConhecida: 'Microempreendedora e Varejista',
    estadoPrincipal: 'MA',
    empresasVinculadas: [
      {
        cnpj: '41.220.330/0001-99',
        razaoSocial: 'MARIA DE SOUSA SILVA (DOCES & SABORES DO MARANHAO)',
        cargo: 'Empresário Individual / MEI',
        situacao: 'ATIVA',
        dataEntrada: '10/08/2019',
        participacao: 100.0,
        capitalSocialEmpresa: 10000,
        cnaePrincipal: 'Comércio varejista de produtos alimentícios'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCEMA / Receita Federal do Brasil', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'JUCEMA' }
    ],
    dataConsulta: '25/08/2026 10:00'
  },
  {
    id: 'pes-david-velez',
    nome: 'DAVID VELEZ OSORNO',
    cpfMascarado: '***.331.428-**',
    temMultiplosHomonimos: false,
    profissaoConhecida: 'Fundador e Diretor Presidente',
    estadoPrincipal: 'SP',
    empresasVinculadas: [
      {
        cnpj: '30.680.829/0001-43',
        razaoSocial: 'NU PAGAMENTOS S.A.',
        cargo: 'Diretor Presidente',
        situacao: 'ATIVA',
        dataEntrada: '06/05/2013',
        participacao: 21.0,
        capitalSocialEmpresa: 4500000000,
        cnaePrincipal: 'Administração de cartões de crédito'
      },
      {
        cnpj: '31.872.495/0001-72',
        razaoSocial: 'NU FINANCEIRA S.A. SOCIEDADE DE CREDITO',
        cargo: 'Conselheiro',
        situacao: 'ATIVA',
        dataEntrada: '06/05/2013',
        participacao: 0,
        capitalSocialEmpresa: 500000000,
        cnaePrincipal: 'Sociedades de crédito, financiamento e investimento'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'JUCESP / BACEN', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'JUCESP' }
    ],
    dataConsulta: '25/08/2026 10:00'
  },
  {
    id: 'pes-tarcisiana-medeiros',
    nome: 'TARCISIANA MEDEIROS',
    cpfMascarado: '***.482.911-**',
    temMultiplosHomonimos: false,
    profissaoConhecida: 'Executiva Bancária e Diretora Presidente',
    estadoPrincipal: 'DF',
    empresasVinculadas: [
      {
        cnpj: '00.000.000/0001-91',
        razaoSocial: 'BANCO DO BRASIL SA',
        cargo: 'Diretor Presidente',
        situacao: 'ATIVA',
        dataEntrada: '26/01/2023',
        participacao: 0,
        capitalSocialEmpresa: 90000000000,
        cnaePrincipal: 'Bancos múltiplos, com carteira comercial'
      },
      {
        cnpj: '47.866.934/0001-74',
        razaoSocial: 'BB SEGURIDADE PARTICIPACOES S.A.',
        cargo: 'Conselheiro de Administração',
        situacao: 'ATIVA',
        dataEntrada: '26/01/2023',
        participacao: 0,
        capitalSocialEmpresa: 5000000000,
        cnaePrincipal: 'Holdings de instituições não-financeiras'
      }
    ],
    processosPublicos: [],
    publicacoesOficiais: [],
    fontes: [
      { campo: 'Vínculos Societários', fonte: 'CVM / Banco Central do Brasil / RFB', dataHora: '25/08/2026 10:00', confiabilidade: 'Confirmado', provedor: 'CVM / RFB' }
    ],
    dataConsulta: '25/08/2026 10:00'
  }
];

export const INITIAL_DATA_PROVIDERS: DataProviderConfig[] = [...MASTER_DATA_PROVIDERS];

export const INITIAL_HISTORICO: ConsultaHistorico[] = [
  {
    id: 'hist-1',
    termo: '00.000.000/0001-91',
    tipo: 'cnpj',
    nomeOuRazao: 'BANCO DO BRASIL SA',
    identificador: '00.000.000/0001-91',
    dataHora: '25/08/2026 09:15',
    usuario: 'Carlos Silva (Analista)',
    situacao: 'ATIVA',
    favorito: true,
    provedoresConsultados: ['BrasilAPI', 'Receita Federal', 'PGFN/CND'],
    creditosConsumidos: 3
  },
  {
    id: 'hist-2',
    termo: '47.960.950/0001-21',
    tipo: 'cnpj',
    nomeOuRazao: 'MAGAZINE LUIZA S.A.',
    identificador: '47.960.950/0001-21',
    dataHora: '25/08/2026 09:12',
    usuario: 'Carlos Silva (Analista)',
    situacao: 'ATIVA',
    favorito: true,
    provedoresConsultados: ['BrasilAPI', 'SEFAZ-SP', 'DataJud CNJ'],
    creditosConsumidos: 4
  },
  {
    id: 'hist-3',
    termo: '45.123.890/0001-55',
    tipo: 'cnpj',
    nomeOuRazao: 'AURORA ENERGIAS RENOVAVEIS E TECNOLOGIA LTDA',
    identificador: '45.123.890/0001-55',
    dataHora: '25/08/2026 08:30',
    usuario: 'Dra. Vanessa Mendes',
    situacao: 'ATIVA',
    favorito: false,
    provedoresConsultados: ['BrasilAPI', 'Simples Nacional', 'SEMFAZ'],
    creditosConsumidos: 3
  },
  {
    id: 'hist-4',
    termo: 'Luiza Helena Trajano',
    tipo: 'nome',
    nomeOuRazao: 'LUIZA HELENA TRAJANO INACIO RODRIGUES',
    identificador: 'Luiza Helena Trajano',
    dataHora: '25/08/2026 09:00',
    usuario: 'Carlos Silva (Analista)',
    situacao: 'ENCONTRADO',
    favorito: false,
    provedoresConsultados: ['JUCESP', 'CVM', 'DOESP'],
    creditosConsumidos: 2
  }
];

export const INITIAL_MONITORAMENTO: MonitoramentoEmpresa[] = [
  {
    id: 'mon-1',
    cnpj: '47.960.950/0001-21',
    razaoSocial: 'MAGAZINE LUIZA S.A.',
    frequencia: 'Diária',
    dataInicio: '10/01/2026',
    ultimaVerificacao: '25/08/2026 06:00',
    proximaVerificacao: '26/08/2026 06:00',
    status: 'Ativo',
    alteracoesDetectadas: 3,
    alertas: [
      {
        id: 'alt-1',
        data: '15/08/2026',
        tipo: 'CERTIDAO',
        descricao: 'Renovação da Certidão Negativa de Débitos Federais (RFB/PGFN) confirmada.',
        lido: true
      },
      {
        id: 'alt-2',
        data: '02/08/2026',
        tipo: 'QUADRO_SOCIETARIO',
        descricao: 'Ata de reeleição de conselheiros arquivada na JUCESP.',
        lido: false
      }
    ]
  },
  {
    id: 'mon-2',
    cnpj: '45.123.890/0001-55',
    razaoSocial: 'AURORA ENERGIAS RENOVAVEIS E TECNOLOGIA LTDA',
    frequencia: 'Semanal',
    dataInicio: '01/03/2026',
    ultimaVerificacao: '24/08/2026 06:00',
    proximaVerificacao: '31/08/2026 06:00',
    status: 'Ativo',
    alteracoesDetectadas: 1,
    alertas: [
      {
        id: 'alt-3',
        data: '10/07/2026',
        tipo: 'SITUACAO_CADASTRAL',
        descricao: 'Situação cadastral confirmada como ATIVA perante a Receita Federal.',
        lido: true
      }
    ]
  }
];

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 'usr-1',
    nome: 'Abimael Brandão',
    email: 'abimaelbrandao26@gmail.com',
    perfil: 'Administrador',
    empresa: 'Compliance & Legal Intelligence 360',
    ativo: true,
    ultimoAcesso: 'Hoje às 09:16',
    totalConsultas: 142
  },
  {
    id: 'usr-2',
    nome: 'Carlos Silva',
    email: 'carlos.silva@empresa.com.br',
    perfil: 'Analista',
    empresa: 'Compliance & Legal Intelligence 360',
    ativo: true,
    ultimoAcesso: 'Hoje às 09:12',
    totalConsultas: 87
  },
  {
    id: 'usr-3',
    nome: 'Dra. Vanessa Mendes',
    email: 'vanessa.mendes@empresa.com.br',
    perfil: 'Gestor',
    empresa: 'Compliance & Legal Intelligence 360',
    ativo: true,
    ultimoAcesso: 'Hoje às 08:45',
    totalConsultas: 215
  },
  {
    id: 'usr-4',
    nome: 'Roberto Almeida',
    email: 'roberto.almeida@empresa.com.br',
    perfil: 'Usuário',
    empresa: 'Compliance & Legal Intelligence 360',
    ativo: true,
    ultimoAcesso: 'Ontem às 17:30',
    totalConsultas: 34
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    dataHora: '25/08/2026 09:15:22',
    usuarioNome: 'Abimael Brandão',
    usuario: 'Abimael Brandão (Administrador)',
    acao: 'CONSULTA_CNPJ',
    detalhes: 'Consulta 360° do CNPJ 00.000.000/0001-91 (Banco do Brasil SA)',
    ip: '189.102.44.12',
    ipOrigem: '189.102.44.12'
  },
  {
    id: 'log-2',
    dataHora: '25/08/2026 09:12:05',
    usuarioNome: 'Carlos Silva',
    usuario: 'Carlos Silva (Analista)',
    acao: 'EXPORTACAO_PDF',
    detalhes: 'Download de Relatório Premium da empresa MAGAZINE LUIZA S.A.',
    ip: '177.89.201.55',
    ipOrigem: '177.89.201.55'
  },
  {
    id: 'log-3',
    dataHora: '25/08/2026 09:00:18',
    usuarioNome: 'Carlos Silva',
    usuario: 'Carlos Silva (Analista)',
    acao: 'CONSULTA_PESSOA',
    detalhes: 'Busca por vínculos públicos da pessoa: Luiza Helena Trajano',
    ip: '177.89.201.55',
    ipOrigem: '177.89.201.55'
  },
  {
    id: 'log-4',
    dataHora: '25/08/2026 08:30:11',
    usuarioNome: 'Dra. Vanessa Mendes',
    usuario: 'Dra. Vanessa Mendes (Gestor)',
    acao: 'CONFIG_INTEGRACAO',
    detalhes: 'Verificação de conectividade com Provedor BrasilAPI e DataJud',
    ip: '200.147.35.9',
    ipOrigem: '200.147.35.9'
  }
];

// Aliases for clean frontend usage
export const seedCompanies = SEED_EMPRESAS;
export const seedPeople = SEED_PESSOAS;
export const initialSearchHistory = INITIAL_HISTORICO;
export const initialMonitoring = INITIAL_MONITORAMENTO;
export const initialUsers = INITIAL_USUARIOS;
export const initialAuditLogs = INITIAL_AUDIT_LOGS;
export const initialApiProviders = INITIAL_DATA_PROVIDERS;

export const initialAlerts: any[] = [
  {
    id: 'alt-1',
    cnpj: '47.960.950/0001-21',
    razaoSocial: 'MAGAZINE LUIZA S.A.',
    dataHora: '25/08/2026 07:30',
    tipoAlerta: 'CERTIDAO',
    titulo: 'Certidão Negativa de Débitos Federais (PGFN) Renovada',
    descricao: 'Emitida nova CND Federal com validade regular até 22/02/2027.',
    lido: false
  },
  {
    id: 'alt-2',
    cnpj: '47.960.950/0001-21',
    razaoSocial: 'MAGAZINE LUIZA S.A.',
    dataHora: '20/08/2026 14:15',
    tipoAlerta: 'QUADRO_SOCIETARIO',
    titulo: 'Alteração no Conselho de Administração Registrada',
    descricao: 'Ata de reeleição de conselheiros arquivada na JUCESP.',
    lido: false
  },
  {
    id: 'alt-3',
    cnpj: '45.123.890/0001-55',
    razaoSocial: 'AURORA ENERGIAS RENOVAVEIS E TECNOLOGIA LTDA',
    dataHora: '10/08/2026 11:00',
    tipoAlerta: 'SITUACAO_CADASTRAL',
    titulo: 'Situação Cadastral Regularizada',
    descricao: 'Situação cadastral confirmada como ATIVA perante a Receita Federal.',
    lido: true
  }
];

export const initialPlan = {
  tipo: 'PRO' as const,
  limiteMensal: 500,
  creditosUtilizados: 42,
  creditosDisponiveis: 458,
  dataRenovacao: '15/09/2026',
  valorMensal: 'R$ 399/mês'
};

export const INITIAL_QUICK_DEMOS = [
  { id: 'qd-1', label: 'Banco do Brasil', tipo: 'cnpj' as const, valor: '00.000.000/0001-91', descricao: 'Sociedade de Economia Mista', ativo: true, ordem: 1 },
  { id: 'qd-2', label: 'Magazine Luiza', tipo: 'cnpj' as const, valor: '47.960.950/0001-21', descricao: 'Varejo & E-commerce S.A.', ativo: true, ordem: 2 },
  { id: 'qd-3', label: 'Lunna Doces (MEI)', tipo: 'cnpj' as const, valor: '40.106.414/0001-14', descricao: 'MEI / São Luís MA', ativo: true, ordem: 3 },
  { id: 'qd-4', label: 'Meiry Ellen Sousa de Jesus', tipo: 'nome' as const, valor: 'Meiry Ellen Sousa de Jesus', descricao: 'Pessoa Física / Titular MEI', ativo: true, ordem: 4 },
  { id: 'qd-5', label: 'Luiza Helena Trajano', tipo: 'nome' as const, valor: 'Luiza Helena Trajano', descricao: 'Pessoa Física / Administradora', ativo: true, ordem: 5 }
];

export const initialQuickDemos = INITIAL_QUICK_DEMOS;

