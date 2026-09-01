import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EmpresaData, PessoaData } from '../types';

export const exportService = {
  generateCompanyPdf(empresa: EmpresaData, aiSummaryText?: string) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [15, 23, 42]; // Slate 900
    const goldColor = [217, 119, 6]; // Amber 600
    const darkGray = [71, 85, 105]; // Slate 600

    // Header Background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 36, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CONSULTA PREMIUM 360°', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Dossiê Executivo de Inteligência Cadastral e Empresarial', 14, 22);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')} | Protocolo: C360-${Date.now().toString().slice(-8)}`, 14, 28);

    // Status Badge Top Right
    const statusColor = empresa.situacaoCadastral === 'ATIVA' ? [16, 185, 129] : [239, 68, 68];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(145, 10, 50, 14, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`SITUAÇÃO: ${empresa.situacaoCadastral}`, 150, 19);

    let startY = 44;

    // 1. Identificação Principal
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(empresa.razaoSocial, 14, startY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`Nome Fantasia: ${empresa.nomeFantasia || 'Não informado'} | CNPJ: ${empresa.cnpj}`, 14, startY + 6);

    startY += 14;

    // Executive Summary Box (if present)
    if (aiSummaryText || empresa.resumoIa?.texto) {
      const summaryContent = aiSummaryText || empresa.resumoIa?.texto || '';
      
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, startY, 182, 38, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text('RESUMO EXECUTIVO CONSOLIDADO (ANÁLISE ANALÍTICA)', 18, startY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      
      const splitText = doc.splitTextToSize(summaryContent.replace(/[*#]/g, ''), 174);
      doc.text(splitText.slice(0, 5), 18, startY + 12);

      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text('* Análise analítica estritamente baseada nos dados públicos oficiais informados. Não substitui certidão de inteiro teor.', 18, startY + 34);

      startY += 44;
    }

    // 2. Dados Cadastrais Table
    autoTable(doc, {
      startY: startY,
      head: [['DADOS CADASTRAIS & LOCALIZAÇÃO', 'DETALHES']],
      body: [
        ['CNPJ', empresa.cnpj],
        ['Razão Social', empresa.razaoSocial],
        ['Data de Abertura / Tempo de Atividade', `${empresa.dataAbertura} (${empresa.tempoAtividadeAnos || 'N/A'} anos)`],
        ['Natureza Jurídica', empresa.naturezaJuridica],
        ['Porte da Empresa / Capital Social', `${empresa.porte} | R$ ${(empresa.capitalSocial || 0).toLocaleString('pt-BR')}`],
        ['Tipo de Estabelecimento', `${empresa.tipoUnidade} ${empresa.quantidadeFiliais ? `(${empresa.quantidadeFiliais} filiais)` : ''}`],
        ['Endereço Completo', empresa.endereco?.formatado || `${empresa.logradouro}, ${empresa.numero}${empresa.complemento ? ` - ${empresa.complemento}` : ''} - ${empresa.bairro}`],
        ['Município / UF / CEP', `${empresa.municipio}/${empresa.uf} - CEP: ${empresa.cep}`],
        ['Contatos Públicos', `Tel: ${(empresa.phones && empresa.phones.length > 0) ? empresa.phones.join(' / ') : (empresa.telefonePublico || 'Não informado')} | Email: ${(empresa.emails && empresa.emails.length > 0) ? empresa.emails.join(' / ') : (empresa.emailPublico || 'Não informado')}`],
        ['CNAE Principal', `${empresa.cnaePrincipal.codigo} - ${empresa.cnaePrincipal.descricao}`],
        ['Regime Tributário Estimado', `${empresa.regimeTributarioEstimado} (${empresa.simplesNacional.situacao})`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
      columnStyles: { 0: { cellWidth: 65, fontStyle: 'bold' }, 1: { cellWidth: 117 } },
      margin: { left: 14, right: 14 }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 8;

    // 2.1 Inscrições Fiscais (Estadual e Municipal) Table
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    const inscricoesBody: string[][] = [];

    // Inscrições Estaduais
    if (empresa.inscricoesEstaduais && empresa.inscricoesEstaduais.length > 0) {
      empresa.inscricoesEstaduais.forEach(ie => {
        const numText = ie.isento ? 'ISENTO' : (ie.naoLocalizada ? ie.numero : ie.numero);
        const sitText = ie.isento ? 'ISENTO' : ie.situacao;
        const contribText = ie.indicadorContribuinte || (ie.isento ? 'Não Contribuinte' : (ie.naoLocalizada ? '—' : 'Contribuinte ICMS'));
        inscricoesBody.push([
          'Inscrição Estadual (IE)',
          numText,
          ie.uf,
          sitText,
          contribText,
          ie.fonte,
          ie.dataConsulta || empresa.dataUltimaConsulta
        ]);
      });
    } else {
      inscricoesBody.push([
        'Inscrição Estadual (IE)',
        'Inscrição Estadual não localizada na fonte consultada.',
        empresa.uf,
        'Não localizada',
        '—',
        `SEFAZ/${empresa.uf} / SINTEGRA / CCC`,
        empresa.dataUltimaConsulta
      ]);
    }

    // Inscrições Municipais
    if (empresa.inscricoesMunicipais && empresa.inscricoesMunicipais.length > 0) {
      empresa.inscricoesMunicipais.forEach(im => {
        const numText = im.naoLocalizada ? im.numero : im.numero;
        inscricoesBody.push([
          'Inscrição Municipal (IM)',
          numText,
          `${im.municipio}/${im.uf}`,
          im.situacao,
          'Tributos Municipais (ISS)',
          im.fonte,
          im.dataConsulta || empresa.dataUltimaConsulta
        ]);
      });
    } else {
      inscricoesBody.push([
        'Inscrição Municipal (IM)',
        'Inscrição Municipal não localizada na fonte consultada.',
        `${empresa.municipio}/${empresa.uf}`,
        'Não localizada',
        'Tributos Municipais (ISS)',
        `Secretaria Municipal de Fazenda de ${empresa.municipio}/${empresa.uf}`,
        empresa.dataUltimaConsulta
      ]);
    }

    autoTable(doc, {
      startY: currentY,
      head: [['TIPO DE INSCRIÇÃO', 'NÚMERO DA INSCRIÇÃO', 'UF / MUNICÍPIO', 'SITUAÇÃO', 'INDICADOR', 'FONTE OFICIAL', 'DATA/HORA']],
      body: inscricoesBody,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 6.8, textColor: [30, 41, 59] },
      columnStyles: { 
        0: { cellWidth: 32, fontStyle: 'bold' },
        1: { cellWidth: 42, fontStyle: 'bold' },
        2: { cellWidth: 24 },
        3: { cellWidth: 20 },
        4: { cellWidth: 24 },
        5: { cellWidth: 24 },
        6: { cellWidth: 16 }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // 3. Quadro Societário Table
    if (empresa.socios && empresa.socios.length > 0) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      const sociosBody = empresa.socios.map(s => [
        s.nome,
        s.qualificacao,
        s.cpfCnpjMascarado || '***.***.***-**',
        s.participacaoSocietaria !== undefined ? `${s.participacaoSocietaria}%` : 'Não informada',
        s.empresasRelacionadas && s.empresasRelacionadas.length > 0
          ? s.empresasRelacionadas.map(r => r.razaoSocial).join(', ')
          : 'Nenhum outro vínculo público'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['SÓCIO / ADMINISTRADOR', 'QUALIFICAÇÃO', 'DOCUMENTO', 'PARTICIPAÇÃO', 'EMPRESAS RELACIONADAS']],
        body: sociosBody,
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }

    // 4. Certidões Públicas Table
    if (empresa.certidoes && empresa.certidoes.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      const certBody = empresa.certidoes.map(c => [
        c.orgao,
        c.nome,
        c.situacao,
        c.validade,
        c.codigoControle || c.fonte
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['ÓRGÃO EMISSOR', 'CERTIDÃO', 'SITUAÇÃO', 'VALIDADE', 'CÓDIGO / PROTOCOLO']],
        body: certBody,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }

    // 5. Divergências e Reconciliação (se houver)
    if (empresa.divergencias && empresa.divergencias.length > 0) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      const divergenciasBody = empresa.divergencias.map(d => [
        d.campo,
        d.valorOficial,
        d.fonteOficial,
        d.valorDivergente,
        d.fonteDivergente
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['CAMPO DIVERGENTE', 'DADO OFICIAL ADOTADO', 'FONTE OFICIAL', 'DADO DIVERGENTE', 'FONTE DIVERGENTE']],
        body: divergenciasBody,
        theme: 'striped',
        headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold' },
        bodyStyles: { fontSize: 6.5, textColor: [30, 41, 59] },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }

    // 6. Rastreabilidade & Fontes Oficiais
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    const fontesBody = empresa.fontes.map(f => [
      f.campo,
      f.fonte,
      f.provedor,
      f.statusInformacao || f.confiabilidade,
      `${f.scoreCampo || 100} pts`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['CATEGORIA DE DADO', 'FONTE OFICIAL', 'PROVEDOR / API', 'STATUS DA INFORMAÇÃO', 'CONFIABILIDADE']],
      body: fontesBody,
      theme: 'plain',
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 6.5, textColor: [71, 85, 105] },
      margin: { left: 14, right: 14 }
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Consulta Premium 360° - Página ${i} de ${pageCount} | Documento confidencial e informativo conforme LGPD`, 14, 290);
    }

    doc.save(`Relatorio_Premium_${empresa.cnpjRaw || 'empresa'}.pdf`);
  },

  downloadCsv(empresa: EmpresaData) {
    const rows = [
      ['CONSULTA PREMIUM 360 - DADOS EMPRESARIAIS CONSOLIDADOS'],
      ['Data da Consulta', new Date().toLocaleString('pt-BR')],
      [''],
      ['DADOS CADASTRAIS'],
      ['CNPJ', empresa.cnpj],
      ['Razão Social', empresa.razaoSocial],
      ['Nome Fantasia', empresa.nomeFantasia],
      ['Situação Cadastral', empresa.situacaoCadastral],
      ['Data de Abertura', empresa.dataAbertura],
      ['Porte', empresa.porte],
      ['Capital Social', String(empresa.capitalSocial)],
      ['Natureza Jurídica', empresa.naturezaJuridica],
      ['Logradouro', `${empresa.logradouro}, ${empresa.numero} ${empresa.complemento || ''}`],
      ['Bairro', empresa.bairro],
      ['Município', empresa.municipio],
      ['UF', empresa.uf],
      ['CEP', empresa.cep],
      ['Telefone', empresa.telefonePublico || ''],
      ['Email', empresa.emailPublico || ''],
      ['CNAE Principal', `${empresa.cnaePrincipal.codigo} - ${empresa.cnaePrincipal.descricao}`],
      ['Optante Simples Nacional', empresa.simplesNacional.optante ? 'SIM' : 'NÃO'],
      ['Enquadrado MEI', empresa.mei.optante ? 'SIM' : 'NÃO'],
      [''],
      ['INSCRIÇÕES FISCAIS (ESTADUAL & MUNICIPAL)'],
      ['Tipo', 'Número', 'UF / Município', 'Situação', 'Indicador', 'Fonte Oficial', 'Data Consulta'],
      ...(empresa.inscricoesEstaduais && empresa.inscricoesEstaduais.length > 0 
        ? empresa.inscricoesEstaduais.map(ie => ['Inscrição Estadual (IE)', ie.isento ? 'ISENTO' : ie.numero, ie.uf, ie.situacao, ie.indicadorContribuinte || '', ie.fonte, ie.dataConsulta || ''])
        : [['Inscrição Estadual (IE)', 'Inscrição Estadual não localizada na fonte consultada.', empresa.uf, 'Não localizada', '', `SEFAZ/${empresa.uf}`, '']]),
      ...(empresa.inscricoesMunicipais && empresa.inscricoesMunicipais.length > 0
        ? empresa.inscricoesMunicipais.map(im => ['Inscrição Municipal (IM)', im.numero, `${im.municipio}/${im.uf}`, im.situacao, 'Tributos Municipais', im.fonte, im.dataConsulta || ''])
        : [['Inscrição Municipal (IM)', 'Inscrição Municipal não localizada na fonte consultada.', `${empresa.municipio}/${empresa.uf}`, 'Não localizada', 'Tributos Municipais', `Secretaria Municipal de Fazenda de ${empresa.municipio}/${empresa.uf}`, '']]),
      [''],
      ['QUADRO SOCIETÁRIO (QSA)'],
      ['Nome Sócio', 'Qualificação', 'Documento', 'Participação %'],
      ...empresa.socios.map(s => [s.nome, s.qualificacao, s.cpfCnpjMascarado || '', s.participacaoSocietaria ? `${s.participacaoSocietaria}%` : '']),
      [''],
      ['CERTIDÕES PÚBLICAS'],
      ['Órgão', 'Certidão', 'Situação', 'Validade', 'Protocolo'],
      ...empresa.certidoes.map(c => [c.orgao, c.nome, c.situacao, c.validade, c.codigoControle || '']),
      [''],
      ['FONTES CONSULTADAS'],
      ['Campo', 'Fonte', 'Provedor', 'Data e Hora', 'Confiabilidade'],
      ...empresa.fontes.map(f => [f.campo, f.fonte, f.provedor, f.dataHora, f.confiabilidade])
    ];

    const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dados_${empresa.cnpjRaw || 'empresa'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadSummaryText(empresa: EmpresaData, aiText?: string) {
    const content = `=====================================================
CONSULTA PREMIUM 360 - RESUMO EXECUTIVO CONSOLIDADO
=====================================================
EMPRESA: ${empresa.razaoSocial} (${empresa.nomeFantasia || 'N/A'})
CNPJ: ${empresa.cnpj}
SITUAÇÃO: ${empresa.situacaoCadastral} (desde ${empresa.dataSituacaoCadastral})
DATA DE ABERTURA: ${empresa.dataAbertura} (${empresa.tempoAtividadeAnos || 'N/A'} anos)
LOCALIZAÇÃO: ${empresa.municipio}/${empresa.uf} - CEP ${empresa.cep}
CAPITAL SOCIAL: R$ ${(empresa.capitalSocial || 0).toLocaleString('pt-BR')}
CNAE PRINCIPAL: ${empresa.cnaePrincipal.codigo} - ${empresa.cnaePrincipal.descricao}
REGIME TRIBUTÁRIO: ${empresa.regimeTributarioEstimado}

INSCRIÇÕES FISCAIS (ESTADUAL & MUNICIPAL):
${(empresa.inscricoesEstaduais && empresa.inscricoesEstaduais.length > 0)
  ? empresa.inscricoesEstaduais.map(ie => ` - Inscrição Estadual: ${ie.isento ? 'ISENTO' : ie.numero} | UF: ${ie.uf} | Situação: ${ie.situacao} | Fonte: ${ie.fonte}`).join('\n')
  : ` - Inscrição Estadual: Inscrição Estadual não localizada na fonte consultada. (SEFAZ/${empresa.uf})`}
${(empresa.inscricoesMunicipais && empresa.inscricoesMunicipais.length > 0)
  ? empresa.inscricoesMunicipais.map(im => ` - Inscrição Municipal: ${im.numero} | Município: ${im.municipio}/${im.uf} | Situação: ${im.situacao} | Fonte: ${im.fonte}`).join('\n')
  : ` - Inscrição Municipal: Inscrição Municipal não localizada na fonte consultada. (Prefeitura de ${empresa.municipio}/${empresa.uf})`}

QUADRO SOCIETÁRIO (${empresa.socios.length} sócio(s)):
${empresa.socios.map(s => ` - ${s.nome} | ${s.qualificacao}`).join('\n')}

CERTIDÕES PÚBLICAS:
${empresa.certidoes.map(c => ` - [${c.situacao}] ${c.orgao}: ${c.nome} (Validade: ${c.validade})`).join('\n')}

PARECER ANALÍTICO / RESUMO IA:
${aiText || 'Nenhum parecer textual complementar gerado.'}

-----------------------------------------------------
Data da Emissão: ${new Date().toLocaleString('pt-BR')}
Origem das Informações: Bases Oficiais Públicas (Receita Federal / PGFN / Tribunais)
Conformidade LGPD: Informações de caráter público empresarial.
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resumo_Executivo_${empresa.cnpjRaw || 'empresa'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
