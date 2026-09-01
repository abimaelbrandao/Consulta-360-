import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileText, 
  Download, 
  RefreshCw, 
  Radio, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink,
  Info,
  Layers,
  FileSearch,
  Building,
  Gavel,
  Shield,
  Activity,
  FileCheck2,
  Globe,
  Award,
  Sparkles,
  BadgeAlert
} from 'lucide-react';
import { EmpresaData } from '../types';
import { NetworkGraph } from './NetworkGraph';
import { AiSummaryCard } from './AiSummaryCard';
import { exportService } from '../services/exportService';

interface CompanyDetailViewProps {
  empresa: EmpresaData;
  onRefreshCompany: (cnpj: string) => Promise<void>;
  onSelectPerson: (name: string) => void;
  onSelectCompany: (cnpj: string) => void;
  onToggleMonitoring: (empresa: EmpresaData) => void;
  isMonitored: boolean;
  onAddToComparison: (empresa: EmpresaData) => void;
  isCompared: boolean;
}

export const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({
  empresa,
  onRefreshCompany,
  onSelectPerson,
  onSelectCompany,
  onToggleMonitoring,
  isMonitored,
  onAddToComparison,
  isCompared,
}) => {
  const [activeTab, setActiveTab] = useState<'visao360' | 'cadastral' | 'qsa' | 'fiscal' | 'certidoes' | 'processos' | 'contratos_sancoes' | 'propriedade_digital' | 'resumo_ia' | 'fontes'>('visao360');
  const [copiedCnpj, setCopiedCnpj] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState<string | undefined>(undefined);

  const handleCopyCnpj = () => {
    navigator.clipboard.writeText(empresa.cnpj);
    setCopiedCnpj(true);
    setTimeout(() => setCopiedCnpj(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshCompany(empresa.cnpj);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGeneratePdf = () => {
    exportService.generateCompanyPdf(empresa, aiSummaryText);
  };

  const handleDownloadCsv = () => {
    exportService.downloadCsv(empresa);
  };

  // Status color mapper style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ATIVA':
        return {
          backgroundColor: 'var(--success-subtle)',
          borderColor: 'var(--success)',
          color: 'var(--success)'
        };
      case 'BAIXADA':
        return {
          backgroundColor: 'var(--danger-subtle)',
          borderColor: 'var(--danger)',
          color: 'var(--danger)'
        };
      case 'SUSPENSA':
      case 'INAPTA':
        return {
          backgroundColor: 'var(--warning-subtle)',
          borderColor: 'var(--warning)',
          color: 'var(--warning)'
        };
      default:
        return {
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)'
        };
    }
  };

  const getCertidaoStyle = (situacao: string) => {
    switch (situacao) {
      case 'NEGATIVA':
        return {
          backgroundColor: 'var(--success-subtle)',
          borderColor: 'var(--success)',
          color: 'var(--success)'
        };
      case 'POSITIVA_COM_EFEITO_DE_NEGATIVA':
        return {
          backgroundColor: 'var(--info-subtle)',
          borderColor: 'var(--info)',
          color: 'var(--info)'
        };
      case 'POSITIVA':
        return {
          backgroundColor: 'var(--danger-subtle)',
          borderColor: 'var(--danger)',
          color: 'var(--danger)'
        };
      default:
        return {
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)'
        };
    }
  };

  const getReliabilityStyle = (level: string) => {
    switch (level) {
      case 'Confirmado por múltiplas fontes':
      case 'Confirmado':
        return {
          backgroundColor: 'var(--success-subtle)',
          borderColor: 'var(--success)',
          color: 'var(--success)'
        };
      case 'Fonte secundária':
      case 'Obtido por fonte secundária':
        return {
          backgroundColor: 'var(--info-subtle)',
          borderColor: 'var(--info)',
          color: 'var(--info)'
        };
      case 'Divergente':
      case 'Necessita conferência':
        return {
          backgroundColor: 'var(--warning-subtle)',
          borderColor: 'var(--warning)',
          color: 'var(--warning)'
        };
      case 'Consulta indisponível':
      case 'Erro na consulta':
        return {
          backgroundColor: 'var(--danger-subtle)',
          borderColor: 'var(--danger)',
          color: 'var(--danger)'
        };
      default:
        return {
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)'
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Company Header Card */}
      <div 
        className="rounded-3xl p-5 md:p-6 border shadow-xs transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span 
                className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border"
                style={getStatusStyle(empresa.situacaoCadastral)}
              >
                {empresa.situacaoCadastral}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Desde {empresa.dataSituacaoCadastral}
              </span>
              <span 
                className="text-xs font-medium px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                {empresa.tipoUnidade}
              </span>
              <span 
                className="text-xs font-semibold px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)'
                }}
              >
                Porte: {empresa.porte}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {empresa.razaoSocial}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {empresa.nomeFantasia && (
                <div className="flex items-center gap-1 font-medium" style={{ color: 'var(--accent)' }}>
                  <Building className="w-3.5 h-3.5" />
                  <span>Fantasia: {empresa.nomeFantasia}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 font-mono">
                <span style={{ color: 'var(--text-tertiary)' }}>CNPJ:</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{empresa.cnpj}</span>
                <button
                  onClick={handleCopyCnpj}
                  className="p-1 rounded transition-colors hover:opacity-80 cursor-pointer"
                  style={{ color: 'var(--text-tertiary)' }}
                  title="Copiar CNPJ"
                >
                  {copiedCnpj ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                <span>{empresa.municipio} - {empresa.uf}</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              id="btn-generate-pdf"
              onClick={handleGeneratePdf}
              className="px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000000'
              }}
            >
              <FileText className="w-4 h-4" />
              <span>Gerar Relatório Premium (PDF)</span>
            </button>

            <button
              id="btn-export-excel"
              onClick={handleDownloadCsv}
              className="px-3.5 py-2 font-semibold text-xs rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
              title="Exportar dados para planilha Excel/CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
              <span>Excel/CSV</span>
            </button>

            <button
              id="btn-toggle-monitoring"
              onClick={() => onToggleMonitoring(empresa)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: isMonitored ? 'var(--accent-subtle)' : 'var(--surface-secondary)',
                borderColor: isMonitored ? 'var(--accent)' : 'var(--border)',
                color: isMonitored ? 'var(--accent)' : 'var(--text-primary)'
              }}
            >
              <Radio className={`w-3.5 h-3.5 ${isMonitored ? 'animate-pulse' : ''}`} style={{ color: isMonitored ? 'var(--accent)' : 'var(--text-tertiary)' }} />
              <span>{isMonitored ? 'Monitorando' : 'Monitorar'}</span>
            </button>

            <button
              id="btn-add-comparator"
              onClick={() => onAddToComparison(empresa)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: isCompared ? 'var(--info-subtle)' : 'var(--surface-secondary)',
                borderColor: isCompared ? 'var(--info)' : 'var(--border)',
                color: isCompared ? 'var(--info)' : 'var(--text-primary)'
              }}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'No Comparador' : 'Comparar'}</span>
            </button>

            <button
              id="btn-refresh-company"
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl border transition-colors disabled:opacity-50 cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
              title="Atualizar informações nas APIs oficiais"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: refreshing ? 'var(--accent)' : 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t mt-6 pt-3 text-xs" style={{ borderColor: 'var(--border)' }}>
          {[
            { id: 'visao360', label: 'Visão 360°', icon: Activity },
            { id: 'cadastral', label: 'Dados Cadastrais', icon: FileSearch },
            { id: 'qsa', label: 'Quadro Societário & Rede', icon: Users, count: empresa.socios?.length },
            { id: 'fiscal', label: 'Informações Fiscais', icon: Layers },
            { id: 'certidoes', label: 'Certidões', icon: ShieldCheck, count: empresa.certidoes?.length },
            { id: 'processos', label: 'Processos Públicos', icon: Gavel, count: empresa.processos?.length },
            { id: 'contratos_sancoes', label: 'Contratos & Sanções', icon: FileCheck2, count: (empresa.contratosPublicos?.length || 0) + (empresa.sancoesPublicas?.length || 0) },
            { id: 'propriedade_digital', label: 'Marcas & Presença Digital', icon: Globe, count: (empresa.marcasPatentes?.length || 0) },
            { id: 'resumo_ia', label: 'Resumo Inteligente IA', icon: FileText },
            { id: 'fontes', label: 'Fontes & Rastreabilidade', icon: Shield, count: empresa.fontes?.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className="px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer"
                style={{
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#000000' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid transparent'
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span 
                    className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                    style={{
                      backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'var(--surface-secondary)',
                      color: isActive ? '#000000' : 'var(--text-secondary)'
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: Visão 360° */}
      {activeTab === 'visao360' && (
        <div className="space-y-6">
          {/* Key Metrics Indicators Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Situação RFB
              </span>
              <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--success)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {empresa.situacaoCadastral}
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Ativa desde {empresa.dataAbertura.split('/')[2] || empresa.dataAbertura}
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Tempo de Atividade
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {empresa.tempoAtividadeAnos || 1} anos
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Abertura: {empresa.dataAbertura}
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Capital Social
              </span>
              <span className="text-sm font-bold truncate block" style={{ color: 'var(--text-primary)' }}>
                R$ {(empresa.capitalSocial || 0).toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Porte: {empresa.porte}
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Quadro de Sócios
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--info)' }}>
                {empresa.socios?.length || 0} administradores
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Mapeamento QSA
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Certidões (CNDs)
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>
                {empresa.certidoes?.filter(c => c.situacao === 'NEGATIVA').length}/{empresa.certidoes?.length || 0} Negativas
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Fontes Públicas
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Confiabilidade
              </span>
              <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {empresa.scoreConfiabilidade || 98}%
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {empresa.fontes?.length || 4} fontes auditadas
              </span>
            </div>
          </div>

          {/* AI Executive Summary Widget */}
          <AiSummaryCard 
            empresa={empresa} 
            onSummaryGenerated={(text) => setAiSummaryText(text)} 
          />

          {/* Network Graph Teaser / Direct Interactive */}
          <NetworkGraph 
            empresa={empresa} 
            onSelectCompany={onSelectCompany} 
            onSelectPerson={onSelectPerson} 
          />

          {/* Activity and Location Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CNAE Card */}
            <div 
              className="p-5 rounded-3xl border shadow-xs space-y-3"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                <FileSearch className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                Atividade Econômica Principal (CNAE)
              </h3>
              <div 
                className="p-3.5 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <span className="text-xs font-mono font-bold block mb-1" style={{ color: 'var(--accent)' }}>
                  {empresa.cnaePrincipal.codigo}
                </span>
                <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {empresa.cnaePrincipal.descricao}
                </p>
              </div>

              {empresa.cnaesSecundarios && empresa.cnaesSecundarios.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {empresa.cnaesSecundarios.length} atividades secundárias cadastradas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {empresa.cnaesSecundarios.slice(0, 3).map((c, i) => (
                      <span 
                        key={i} 
                        className="text-[10px] px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {c.codigo}
                      </span>
                    ))}
                    {empresa.cnaesSecundarios.length > 3 && (
                      <button
                        onClick={() => setActiveTab('cadastral')}
                        className="text-[10px] hover:underline font-semibold cursor-pointer"
                        style={{ color: 'var(--accent)' }}
                      >
                        +{empresa.cnaesSecundarios.length - 3} mais
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Address & Public Contacts Card */}
            <div 
              className="p-5 rounded-3xl border shadow-xs space-y-3"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                <MapPin className="w-4 h-4" style={{ color: 'var(--info)' }} />
                Endereço & Contatos Públicos Oficiais
              </h3>
              <div className="space-y-2 text-xs">
                <p className="font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {empresa.endereco?.formatado || `${empresa.logradouro}, ${empresa.numero}${empresa.complemento ? ` - ${empresa.complemento}` : ''}`}
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {empresa.bairro} — {empresa.municipio}/{empresa.uf}
                </p>
                <p className="font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  CEP: {empresa.cep}
                </p>

                <div className="pt-2 border-t flex flex-wrap items-center gap-4" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {empresa.phones && empresa.phones.length > 0 ? (
                    empresa.phones.map((phone, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                        <span>{phone}</span>
                      </div>
                    ))
                  ) : empresa.telefonePublico ? (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                      <span>{empresa.telefonePublico}</span>
                    </div>
                  ) : (
                    <span className="italic" style={{ color: 'var(--text-tertiary)' }}>Telefone: Não informado</span>
                  )}

                  {empresa.emails && empresa.emails.length > 0 ? (
                    empresa.emails.map((email, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                        <span className="lowercase">{email}</span>
                      </div>
                    ))
                  ) : empresa.emailPublico ? (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                      <span className="lowercase">{empresa.emailPublico}</span>
                    </div>
                  ) : (
                    <span className="italic" style={{ color: 'var(--text-tertiary)' }}>E-mail: Não informado</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INSCRIÇÕES FISCAIS (ESTADUAL E MUNICIPAL) - SEÇÃO DESTACADA */}
          <div 
            className="p-5 rounded-3xl border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Layers className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  Inscrições Fiscais Oficiais (Estadual & Municipal)
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Dados de Inscrição Estadual (SEFAZ / SINTEGRA / CCC) e Inscrição Municipal (Secretaria Municipal de Fazenda)
                </p>
              </div>
              <span 
                className="text-[11px] font-mono px-2.5 py-1 rounded-md self-start sm:self-auto border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                Consulta: {empresa.dataUltimaConsulta}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* INSCRIÇÃO ESTADUAL */}
              <div 
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                    <Building2 className="w-3.5 h-3.5" />
                    Inscrição Estadual (IE)
                  </span>
                  <span 
                    className="text-[10px] font-mono px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    UF: {empresa.uf}
                  </span>
                </div>

                {(!empresa.inscricoesEstaduais || empresa.inscricoesEstaduais.length === 0 || empresa.inscricoesEstaduais.every(e => e.naoLocalizada)) ? (
                  <div 
                    className="p-3.5 rounded-2xl border"
                    style={{
                      backgroundColor: 'var(--warning-subtle)',
                      borderColor: 'var(--warning)'
                    }}
                  >
                    <div className="flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                      <div>
                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          Inscrição Estadual não localizada na fonte consultada.
                        </p>
                        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          Não foram localizados registros estaduais ativos ou isenção expressa na base da SEFAZ/{empresa.uf} (SINTEGRA / Cadastro Centralizado de Contribuintes).
                        </p>
                        <span className="text-[10px] block mt-1.5 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                          Consulta realizada em: {empresa.dataUltimaConsulta}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {empresa.inscricoesEstaduais.map((ie, idx) => (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-2xl border space-y-2.5 shadow-xs"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <span className="text-[10px] font-semibold uppercase block" style={{ color: 'var(--text-tertiary)' }}>Número da Inscrição</span>
                            <div className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {ie.isento ? (
                                <span 
                                  className="px-2 py-0.5 rounded text-xs border"
                                  style={{
                                    backgroundColor: 'var(--info-subtle)',
                                    borderColor: 'var(--info)',
                                    color: 'var(--info)'
                                  }}
                                >
                                  ISENTO
                                </span>
                              ) : ie.naoLocalizada ? (
                                <span className="text-xs font-sans" style={{ color: 'var(--warning)' }}>
                                  Inscrição Estadual não localizada na fonte consultada.
                                </span>
                              ) : (
                                ie.numero
                              )}
                            </div>
                          </div>
                          
                          <span 
                            className="px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border"
                            style={
                              ie.situacao === 'ATIVA' || ie.situacao === 'HABILITADO' || ie.situacao === 'REGULAR'
                                ? { backgroundColor: 'var(--success-subtle)', borderColor: 'var(--success)', color: 'var(--success)' }
                                : ie.isento
                                ? { backgroundColor: 'var(--info-subtle)', borderColor: 'var(--info)', color: 'var(--info)' }
                                : { backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                            }
                          >
                            {ie.situacao}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div>
                            <span className="text-[10px] block font-medium" style={{ color: 'var(--text-tertiary)' }}>UF da Inscrição:</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ie.uf}</span>
                          </div>
                          <div>
                            <span className="text-[10px] block font-medium" style={{ color: 'var(--text-tertiary)' }}>Indicador de Contribuinte:</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {ie.indicadorContribuinte || (ie.isento ? 'Não Contribuinte' : 'Contribuinte ICMS')}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-1 text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                          <span className="truncate max-w-[280px]">Fonte: {ie.fonte}</span>
                          <span className="font-mono">Data: {ie.dataConsulta || empresa.dataUltimaConsulta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* INSCRIÇÃO MUNICIPAL */}
              <div 
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--info)' }}>
                    <Building className="w-3.5 h-3.5" />
                    Inscrição Municipal (IM)
                  </span>
                  <span 
                    className="text-[10px] font-mono px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {empresa.municipio}/{empresa.uf}
                  </span>
                </div>

                {(!empresa.inscricoesMunicipais || empresa.inscricoesMunicipais.length === 0 || empresa.inscricoesMunicipais.every(m => m.naoLocalizada)) ? (
                  <div 
                    className="p-3.5 rounded-2xl border"
                    style={{
                      backgroundColor: 'var(--warning-subtle)',
                      borderColor: 'var(--warning)'
                    }}
                  >
                    <div className="flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                      <div>
                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          Inscrição Municipal não localizada na fonte consultada.
                        </p>
                        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          Não foram localizados registros municipais no Cadastro Mobiliário da Secretaria Municipal de Fazenda de {empresa.municipio}/{empresa.uf}.
                        </p>
                        <span className="text-[10px] block mt-1.5 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                          Consulta realizada em: {empresa.dataUltimaConsulta}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {empresa.inscricoesMunicipais.map((im, idx) => (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-2xl border space-y-2.5 shadow-xs"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <span className="text-[10px] font-semibold uppercase block" style={{ color: 'var(--text-tertiary)' }}>Número da Inscrição</span>
                            <div className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {im.naoLocalizada ? (
                                <span className="text-xs font-sans" style={{ color: 'var(--warning)' }}>
                                  Inscrição Municipal não localizada na fonte consultada.
                                </span>
                              ) : (
                                im.numero
                              )}
                            </div>
                          </div>
                          
                          <span 
                            className="px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border"
                            style={
                              im.situacao === 'ATIVA' || im.situacao === 'REGULAR'
                                ? { backgroundColor: 'var(--success-subtle)', borderColor: 'var(--success)', color: 'var(--success)' }
                                : { backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                            }
                          >
                            {im.situacao}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div>
                            <span className="text-[10px] block font-medium" style={{ color: 'var(--text-tertiary)' }}>Município:</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{im.municipio}</span>
                          </div>
                          <div>
                            <span className="text-[10px] block font-medium" style={{ color: 'var(--text-tertiary)' }}>UF:</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{im.uf}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-1 text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                          <span className="truncate max-w-[280px]">Fonte: {im.fonte}</span>
                          <span className="font-mono">Data: {im.dataConsulta || empresa.dataUltimaConsulta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Dados Cadastrais */}
      {activeTab === 'cadastral' && (
        <div 
          className="rounded-3xl p-6 border shadow-xs space-y-6 transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Ficha Cadastral Completa da Empresa
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Informações extraídas diretamente da base pública da Receita Federal do Brasil (RFB)
              </p>
            </div>
            <span 
              className="text-[11px] px-2.5 py-1 rounded-md font-mono border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              Última consulta: {empresa.dataUltimaConsulta}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Razão Social</span>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{empresa.razaoSocial}</p>
            </div>

            <div>
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Nome Fantasia</span>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{empresa.nomeFantasia || 'NÃO INFORMADO'}</p>
            </div>

            <div>
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>CNPJ</span>
              <p className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{empresa.cnpj}</p>
            </div>

            <div>
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Situação Cadastral</span>
              <span 
                className="inline-block px-2.5 py-0.5 rounded font-bold border"
                style={getStatusStyle(empresa.situacaoCadastral)}
              >
                {empresa.situacaoCadastral}
              </span>
              <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Desde {empresa.dataSituacaoCadastral}</span>
            </div>

            <div>
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Data de Abertura</span>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{empresa.dataAbertura}</p>
            </div>

            <div>
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Natureza Jurídica</span>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{empresa.naturezaJuridica}</p>
            </div>

            <div>
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Porte da Empresa</span>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{empresa.porte}</p>
            </div>

            <div>
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Capital Social</span>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                R$ {(empresa.capitalSocial || 0).toLocaleString('pt-BR')}
              </p>
            </div>

            <div>
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Tipo de Unidade</span>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {empresa.tipoUnidade} {empresa.quantidadeFiliais ? `(${empresa.quantidadeFiliais} filiais)` : ''}
              </p>
            </div>
          </div>

          {/* CNAEs Section */}
          <div className="pt-6 border-t space-y-4" style={{ borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <FileSearch className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Atividades Econômicas (CNAEs)
            </h4>

            <div 
              className="p-4 rounded-2xl border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--accent)' }}>
                CNAE Principal
              </span>
              <div className="flex items-start gap-2">
                <span 
                  className="font-mono font-bold text-xs px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)'
                  }}
                >
                  {empresa.cnaePrincipal.codigo}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {empresa.cnaePrincipal.descricao}
                </span>
              </div>
            </div>

            {empresa.cnaesSecundarios && empresa.cnaesSecundarios.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
                  CNAEs Secundários ({empresa.cnaesSecundarios.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {empresa.cnaesSecundarios.map((cnae, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-xl border flex items-start gap-2 text-xs"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      <span className="font-mono text-[11px] font-semibold shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                        {cnae.codigo}
                      </span>
                      <span className="leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {cnae.descricao}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Endereço e Contatos Oficiais Section */}
          <div className="pt-6 border-t space-y-4" style={{ borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <MapPin className="w-4 h-4" style={{ color: 'var(--info)' }} />
              Endereço Oficial Registrado na RFB
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div 
                className="p-3.5 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Logradouro / Número</span>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {empresa.logradouro}, {empresa.numero} {empresa.complemento ? ` (${empresa.complemento})` : ''}
                </p>
              </div>

              <div 
                className="p-3.5 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Bairro / Município / UF</span>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {empresa.bairro} — {empresa.municipio}/{empresa.uf}
                </p>
              </div>

              <div 
                className="p-3.5 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <span className="font-semibold block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>CEP</span>
                <p className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                  {empresa.cep}
                </p>
              </div>
            </div>

            <div 
              className="p-4 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                Contatos Cadastrados no Registro Público
              </span>
              <div className="flex flex-wrap gap-6 text-xs">
                <div>
                  <span className="font-medium block text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Telefones Oficiais:</span>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {empresa.phones && empresa.phones.length > 0 ? (
                      empresa.phones.join(' / ')
                    ) : (
                      empresa.telefonePublico || 'Não informado na base pública'
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-medium block text-[11px]" style={{ color: 'var(--text-tertiary)' }}>E-mails Oficiais:</span>
                  <div className="font-semibold lowercase" style={{ color: 'var(--text-primary)' }}>
                    {empresa.emails && empresa.emails.length > 0 ? (
                      empresa.emails.join(' / ')
                    ) : (
                      empresa.emailPublico || 'Não informado na base pública'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Quadro Societário & Rede */}
      {activeTab === 'qsa' && (
        <div className="space-y-6">
          <NetworkGraph 
            empresa={empresa} 
            onSelectCompany={onSelectCompany} 
            onSelectPerson={onSelectPerson} 
          />

          <div 
            className="rounded-3xl p-6 border shadow-xs transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Users className="w-4 h-4" style={{ color: 'var(--info)' }} />
              Detalhamento do Quadro de Sócios e Administradores (QSA)
            </h3>

            {empresa.socios.length === 0 ? (
              <div className="p-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Nenhum sócio ou administrador listado publicamente para este CNPJ.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b font-semibold uppercase text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                      <th className="py-3 px-3">Nome / Razão</th>
                      <th className="py-3 px-3">Qualificação</th>
                      <th className="py-3 px-3">Documento</th>
                      <th className="py-3 px-3">Data Entrada</th>
                      <th className="py-3 px-3">Participação</th>
                      <th className="py-3 px-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {empresa.socios.map((s) => (
                      <tr key={s.id} className="hover:opacity-90 transition-opacity">
                        <td className="py-3 px-3 font-bold" style={{ color: 'var(--text-primary)' }}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border"
                              style={{
                                backgroundColor: 'var(--info-subtle)',
                                borderColor: 'var(--info)',
                                color: 'var(--info)'
                              }}
                            >
                              {s.nome.charAt(0)}
                            </div>
                            <span>{s.nome}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>
                          {s.qualificacao}
                        </td>
                        <td className="py-3 px-3 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                          {s.cpfCnpjMascarado || '***.***.***-**'}
                        </td>
                        <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>
                          {s.dataEntrada || 'Não informada'}
                        </td>
                        <td className="py-3 px-3 font-bold" style={{ color: 'var(--success)' }}>
                          {s.participacaoSocietaria !== undefined ? `${s.participacaoSocietaria}%` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onSelectPerson(s.nome)}
                            className="px-3 py-1 text-[11px] font-semibold rounded-lg border transition-colors inline-flex items-center gap-1 cursor-pointer hover:opacity-80"
                            style={{
                              backgroundColor: 'var(--surface-secondary)',
                              borderColor: 'var(--border)',
                              color: 'var(--accent)'
                            }}
                          >
                            <span>Perfil</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Informações Fiscais */}
      {activeTab === 'fiscal' && (
        <div 
          className="rounded-3xl p-6 border shadow-xs space-y-6 transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Layers className="w-4 h-4" style={{ color: 'var(--success)' }} />
              Situação Fiscal, Tributária e Cadastros Estaduais/Municipais
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Registros integrados de enquadramento tributário perante o Simples Nacional, MEI, SEFAZ, SINTEGRA e Secretarias Municipais de Fazenda
            </p>
          </div>

          {/* Enquadramento e Regime */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Simples Nacional */}
            <div 
              className="p-4 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                Simples Nacional
              </span>
              <div className="flex items-center gap-2">
                <span 
                  className="px-2 py-0.5 text-xs font-bold rounded border"
                  style={
                    empresa.simplesNacional.optante
                      ? { backgroundColor: 'var(--success-subtle)', borderColor: 'var(--success)', color: 'var(--success)' }
                      : { backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                  }
                >
                  {empresa.simplesNacional.optante ? 'OPTANTE' : 'NÃO OPTANTE'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {empresa.simplesNacional.situacao}
                </span>
              </div>
              {empresa.simplesNacional.dataOpcao && (
                <span className="text-[11px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  Opção realizada em: {empresa.simplesNacional.dataOpcao}
                </span>
              )}
            </div>

            {/* MEI */}
            <div 
              className="p-4 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                Microempreendedor Individual (MEI)
              </span>
              <div className="flex items-center gap-2">
                <span 
                  className="px-2 py-0.5 text-xs font-bold rounded border"
                  style={
                    empresa.mei.optante
                      ? { backgroundColor: 'var(--success-subtle)', borderColor: 'var(--success)', color: 'var(--success)' }
                      : { backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                  }
                >
                  {empresa.mei.optante ? 'SIM' : 'NÃO ENQUADRADO'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {empresa.mei.situacao}
                </span>
              </div>
            </div>

            {/* Regime Tributário */}
            <div 
              className="p-4 rounded-2xl border space-y-1"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                Regime Tributário Conhecido
              </span>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {empresa.regimeTributarioEstimado}
              </p>
              <span className="text-[11px] block" style={{ color: 'var(--text-tertiary)' }}>
                Conforme enquadramento oficial RFB
              </span>
            </div>
          </div>

          {/* Seção Completa de Inscrições Fiscais */}
          <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Building2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
              Detalhamento de Inscrições Estaduais e Municipais
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Inscrições Estaduais Detalhadas */}
              <div 
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }}></span>
                    Inscrições Estaduais (SEFAZ / SINTEGRA / CCC)
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    UF: {empresa.uf}
                  </span>
                </div>

                {(!empresa.inscricoesEstaduais || empresa.inscricoesEstaduais.length === 0 || empresa.inscricoesEstaduais.every(e => e.naoLocalizada)) ? (
                  <div 
                    className="p-4 rounded-2xl border space-y-1"
                    style={{
                      backgroundColor: 'var(--warning-subtle)',
                      borderColor: 'var(--warning)'
                    }}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                      <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                      <span>Inscrição Estadual não localizada na fonte consultada.</span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      Fonte consultada: SEFAZ/{empresa.uf} (SINTEGRA / Cadastro Centralizado de Contribuintes)
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      Data da consulta: {empresa.dataUltimaConsulta}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {empresa.inscricoesEstaduais.map((ie, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-2xl border space-y-2"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {ie.isento ? (
                              <span 
                                className="px-2 py-0.5 rounded text-xs border"
                                style={{
                                  backgroundColor: 'var(--info-subtle)',
                                  borderColor: 'var(--info)',
                                  color: 'var(--info)'
                                }}
                              >
                                ISENTO
                              </span>
                            ) : ie.naoLocalizada ? (
                              <span className="text-xs font-sans" style={{ color: 'var(--warning)' }}>
                                Inscrição Estadual não localizada na fonte consultada.
                              </span>
                            ) : (
                              ie.numero
                            )}
                          </span>
                          <span 
                            className="px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase border"
                            style={
                              ie.situacao === 'ATIVA' || ie.situacao === 'HABILITADO' || ie.situacao === 'REGULAR'
                                ? { backgroundColor: 'var(--success-subtle)', borderColor: 'var(--success)', color: 'var(--success)' }
                                : ie.isento
                                ? { backgroundColor: 'var(--info-subtle)', borderColor: 'var(--info)', color: 'var(--info)' }
                                : { backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                            }
                          >
                            {ie.situacao}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                          <div>
                            <span className="text-[10px] block" style={{ color: 'var(--text-tertiary)' }}>UF:</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ie.uf}</span>
                          </div>
                          <div>
                            <span className="text-[10px] block" style={{ color: 'var(--text-tertiary)' }}>Indicador Contribuinte:</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ie.indicadorContribuinte || (ie.isento ? 'Não Contribuinte' : 'Contribuinte ICMS')}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t text-[10px] flex flex-wrap justify-between gap-1" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                          <span>Fonte: {ie.fonte}</span>
                          <span>Data: {ie.dataConsulta || empresa.dataUltimaConsulta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inscrições Municipais Detalhadas */}
              <div 
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--info)' }}></span>
                    Inscrições Municipais (Prefeitura / Fazenda)
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    {empresa.municipio}/{empresa.uf}
                  </span>
                </div>

                {(!empresa.inscricoesMunicipais || empresa.inscricoesMunicipais.length === 0 || empresa.inscricoesMunicipais.every(m => m.naoLocalizada)) ? (
                  <div 
                    className="p-4 rounded-2xl border space-y-1"
                    style={{
                      backgroundColor: 'var(--warning-subtle)',
                      borderColor: 'var(--warning)'
                    }}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                      <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                      <span>Inscrição Municipal não localizada na fonte consultada.</span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      Fonte consultada: Secretaria Municipal da Fazenda de {empresa.municipio}/{empresa.uf}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      Data da consulta: {empresa.dataUltimaConsulta}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {empresa.inscricoesMunicipais.map((im, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-2xl border space-y-2"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {im.naoLocalizada ? (
                              <span className="text-xs font-sans" style={{ color: 'var(--warning)' }}>
                                Inscrição Municipal não localizada na fonte consultada.
                              </span>
                            ) : (
                              im.numero
                            )}
                          </span>
                          <span 
                            className="px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase border"
                            style={
                              im.situacao === 'ATIVA' || im.situacao === 'REGULAR'
                                ? { backgroundColor: 'var(--success-subtle)', borderColor: 'var(--success)', color: 'var(--success)' }
                                : { backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                            }
                          >
                            {im.situacao}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                          <div>
                            <span className="text-[10px] block" style={{ color: 'var(--text-tertiary)' }}>Município:</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{im.municipio}</span>
                          </div>
                          <div>
                            <span className="text-[10px] block" style={{ color: 'var(--text-tertiary)' }}>UF:</span>
                            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{im.uf}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t text-[10px] flex flex-wrap justify-between gap-1" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                          <span>Fonte: {im.fonte}</span>
                          <span>Data: {im.dataConsulta || empresa.dataUltimaConsulta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Certidões */}
      {activeTab === 'certidoes' && (
        <div 
          className="rounded-3xl p-6 border shadow-xs space-y-6 transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <ShieldCheck className="w-4 h-4" style={{ color: 'var(--success)' }} />
                Certidões de Regularidade e Quitação Pública (CNDs)
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Consulta em tempo real de certidões perante a Receita Federal, PGFN, Justiça do Trabalho e FGTS
              </p>
            </div>
            <button
              onClick={handleGeneratePdf}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto border transition-colors hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Todas</span>
            </button>
          </div>

          <div className="space-y-3">
            {empresa.certidoes.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span 
                      className="px-2.5 py-0.5 text-[11px] font-bold rounded-md border"
                      style={getCertidaoStyle(cert.situacao)}
                    >
                      {cert.situacao.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {cert.orgao}
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {cert.nome}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1" style={{ color: 'var(--text-tertiary)' }}>
                    <span>Validade: <strong style={{ color: 'var(--text-primary)' }}>{cert.validade}</strong></span>
                    <span>Consultada em: {cert.dataConsulta}</span>
                    {cert.codigoControle && (
                      <span className="font-mono">Controle: {cert.codigoControle}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {cert.urlOficial && (
                    <a
                      href={cert.urlOficial}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1 hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <span>Acessar</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => alert(`Comprovante oficial: ${cert.codigoControle || cert.nome}\nFonte: ${cert.fonte}\nValidade: ${cert.validade}`)}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all hover:opacity-90 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#000000'
                    }}
                  >
                    Baixar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Processos Públicos */}
      {activeTab === 'processos' && (
        <div 
          className="rounded-3xl p-6 border shadow-xs space-y-6 transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Gavel className="w-4 h-4" style={{ color: 'var(--info)' }} />
              Processos Judiciais em Fontes Públicas
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Registros localizados em diários de justiça e sistemas públicos de consulta processual
            </p>
          </div>

          {/* Legal Neutrality Disclaimer */}
          <div 
            className="p-3.5 rounded-2xl border text-xs flex items-start gap-2.5"
            style={{
              backgroundColor: 'var(--info-subtle)',
              borderColor: 'var(--info)',
              color: 'var(--text-primary)'
            }}
          >
            <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--info)' }} />
            <div className="text-[11px] leading-relaxed">
              <strong>Nota de Transparência e Isenção:</strong> A mera existência de processos públicos não implica em culpa, irregularidade ou passivo definitivo. O contraditório e ampla defesa são preceitos constitucionais. As informações são provenientes de consultas públicas nos tribunais.
            </div>
          </div>

          {empresa.processos.length === 0 ? (
            <div className="p-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Nenhum processo público ativo localizado nas buscas parametrizadas.
            </div>
          ) : (
            <div className="space-y-3">
              {empresa.processos.map((proc) => (
                <div
                  key={proc.id}
                  className="p-4 rounded-2xl border space-y-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                        {proc.numeroProcesso}
                      </span>
                      <span 
                        className="text-[10px] font-semibold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {proc.tribunal} ({proc.grau})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded font-bold border"
                        style={
                          proc.polo === 'Ativo'
                            ? { backgroundColor: 'var(--info-subtle)', borderColor: 'var(--info)', color: 'var(--info)' }
                            : { backgroundColor: 'var(--warning-subtle)', borderColor: 'var(--warning)', color: 'var(--warning)' }
                        }
                      >
                        Polo {proc.polo}
                      </span>
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded font-medium border"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {proc.tipo}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    Última movimentação: {proc.ultimaMovimentacao}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                    <span>Data: {proc.dataUltimaMovimentacao}</span>
                    {proc.linkOficial && (
                      <a
                        href={proc.linkOficial}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline font-semibold flex items-center gap-1"
                        style={{ color: 'var(--accent)' }}
                      >
                        <span>Portal Oficial PJe</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Contratos Públicos & Sanções */}
      {activeTab === 'contratos_sancoes' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div 
            className="p-5 rounded-3xl border shadow-xs space-y-2"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Contratações Públicas & Conformidade Administrativa
              </h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Cruzamento oficial com o Portal Nacional de Contratações Públicas (PNCP), Compras.gov e bases de idoneidade da Controladoria-Geral da União (CEIS, CNEP, CEPIM).
            </p>
          </div>

          {/* Section 1: Contratos Públicos (PNCP) */}
          <div 
            className="rounded-3xl p-6 border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Building className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                Contratos com a Administração Pública (PNCP / Compras.gov)
              </h4>
              <span 
                className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                {empresa.contratosPublicos?.length || 0} Registro(s)
              </span>
            </div>

            {(!empresa.contratosPublicos || empresa.contratosPublicos.length === 0) ? (
              <div 
                className="p-6 text-center rounded-2xl border text-xs"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--success)' }} />
                Nenhum contrato público formal ativo ou histórico localizado nas bases do PNCP para este CNPJ.
              </div>
            ) : (
              <div className="space-y-3">
                {empresa.contratosPublicos.map((ct) => (
                  <div 
                    key={ct.id}
                    className="p-4 rounded-2xl border space-y-2 transition-colors"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs block" style={{ color: 'var(--text-primary)' }}>
                          {ct.orgao}
                        </span>
                        <span className="font-mono text-[11px]" style={{ color: 'var(--accent)' }}>
                          {ct.numeroContrato}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold border"
                          style={{
                            backgroundColor: 'var(--success-subtle)',
                            borderColor: 'var(--success)',
                            color: 'var(--success)'
                          }}
                        >
                          {ct.situacao}
                        </span>
                        <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                          R$ {ct.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Objeto:</strong> {ct.objeto}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                      <span>Vigência: {ct.dataInicio} até {ct.dataFim}</span>
                      <span>Fonte: {ct.fonte}</span>
                      {ct.linkOficial && (
                        <a 
                          href={ct.linkOficial} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-semibold flex items-center gap-1 underline"
                          style={{ color: 'var(--accent)' }}
                        >
                          Portal PNCP <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Sanções Administrativas e Restrições (CEIS / CNEP) */}
          <div 
            className="rounded-3xl p-6 border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BadgeAlert className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                Sanções Administrativas & Cadastro de Inidôneos (CEIS / CNEP / TCU)
              </h4>
              <span 
                className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: (empresa.sancoesPublicas?.length || 0) > 0 ? 'var(--danger-subtle)' : 'var(--success-subtle)',
                  borderColor: (empresa.sancoesPublicas?.length || 0) > 0 ? 'var(--danger)' : 'var(--success)',
                  color: (empresa.sancoesPublicas?.length || 0) > 0 ? 'var(--danger)' : 'var(--success)'
                }}
              >
                {(empresa.sancoesPublicas?.length || 0) > 0 ? `${empresa.sancoesPublicas?.length} Registro(s)` : 'Nada Consta'}
              </span>
            </div>

            {(!empresa.sancoesPublicas || empresa.sancoesPublicas.length === 0) ? (
              <div 
                className="p-6 text-center rounded-2xl border text-xs"
                style={{
                  backgroundColor: 'var(--success-subtle)',
                  borderColor: 'var(--success)',
                  color: 'var(--success)'
                }}
              >
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                <strong>Certidão Negativa de Sanções:</strong> Nenhuma sanção, inidoneidade ou suspensão temporária ativa no CEIS, CNEP ou CEPIM.
              </div>
            ) : (
              <div className="space-y-3">
                {empresa.sancoesPublicas.map((sanc) => (
                  <div 
                    key={sanc.id}
                    className="p-4 rounded-2xl border space-y-2"
                    style={{
                      backgroundColor: 'var(--danger-subtle)',
                      borderColor: 'var(--danger)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs" style={{ color: 'var(--danger)' }}>
                        {sanc.tipo} - {sanc.orgaoSancionador}
                      </span>
                      <span className="font-mono text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Processo: {sanc.numeroProcesso}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                      <strong>Motivo:</strong> {sanc.motivo}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t" style={{ borderColor: 'var(--danger)', color: 'var(--text-secondary)' }}>
                      <span>Período: {sanc.dataPublicacao} até {sanc.dataFimSancao || 'Indeterminado'}</span>
                      <span>Fonte: {sanc.fonte}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Marcas & Presença Digital */}
      {activeTab === 'propriedade_digital' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div 
            className="p-5 rounded-3xl border shadow-xs space-y-2"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Propriedade Intelectual (INPI) & Presença Digital Cadastrada
              </h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Monitoramento de marcas registradas no Instituto Nacional da Propriedade Industrial (INPI), domínios corporativos e contatos comerciais indexados.
            </p>
          </div>

          {/* Section 1: Marcas e Patentes (INPI) */}
          <div 
            className="rounded-3xl p-6 border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Award className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                Marcas Registradas no INPI
              </h4>
              <span 
                className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                {empresa.marcasPatentes?.length || 0} Marca(s) Localizada(s)
              </span>
            </div>

            {(!empresa.marcasPatentes || empresa.marcasPatentes.length === 0) ? (
              <div 
                className="p-6 text-center rounded-2xl border text-xs"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                Nenhum registro de marca ou patente indexado na base do INPI para este titular.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {empresa.marcasPatentes.map((mp) => (
                  <div 
                    key={mp.id}
                    className="p-4 rounded-2xl border space-y-2 transition-colors"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {mp.tituloOuMarca}
                      </span>
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold border"
                        style={{
                          backgroundColor: 'var(--success-subtle)',
                          borderColor: 'var(--success)',
                          color: 'var(--success)'
                        }}
                      >
                        {mp.situacao}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <div><strong>Processo INPI:</strong> <span className="font-mono text-accent font-semibold">{mp.numeroProcesso}</span></div>
                      <div><strong>Classe Nice:</strong> {mp.classeNice}</div>
                      <div><strong>Vigência do Registro:</strong> Até {mp.dataVigencia || 'N/D'}</div>
                    </div>

                    <div className="text-[11px] pt-1 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                      Fonte: {mp.fonte}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Presença Digital */}
          {empresa.presencaDigital && (
            <div 
              className="rounded-3xl p-6 border shadow-xs space-y-4"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Globe className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                Presença Digital & Identidade Web Verificada
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {empresa.presencaDigital.websiteOficial && (
                  <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                      Website Oficial
                    </span>
                    <a 
                      href={empresa.presencaDigital.websiteOficial} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs font-bold flex items-center gap-1 underline break-all"
                      style={{ color: 'var(--accent)' }}
                    >
                      {empresa.presencaDigital.websiteOficial} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}

                {empresa.presencaDigital.emailComercial && (
                  <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                      E-mail Corporativo
                    </span>
                    <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {empresa.presencaDigital.emailComercial}
                    </span>
                  </div>
                )}

                {empresa.presencaDigital.telefoneComercial && (
                  <div className="p-4 rounded-2xl border space-y-1" style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-tertiary)' }}>
                      Telefone de Atendimento
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {empresa.presencaDigital.telefoneComercial}
                    </span>
                  </div>
                )}
              </div>

              {empresa.presencaDigital.perfisRedes && empresa.presencaDigital.perfisRedes.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold block mb-2" style={{ color: 'var(--text-primary)' }}>
                    Canais e Perfis Institucionais Indexados:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {empresa.presencaDigital.perfisRedes.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <span>{p.rede}</span>
                        <ExternalLink className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Resumo Inteligente */}
      {activeTab === 'resumo_ia' && (
        <div className="space-y-6">
          <AiSummaryCard 
            empresa={empresa} 
            onSummaryGenerated={(text) => setAiSummaryText(text)} 
          />
        </div>
      )}

      {/* TAB CONTENT: Fontes & Rastreabilidade */}
      {activeTab === 'fontes' && (
        <div className="space-y-6">
          {/* Data Reconciliation Engine Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Motor de Conciliação
              </span>
              <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
                {empresa.reconciliacaoEngine?.fontesConsultadas || empresa.fontes?.length || 3} Provedores
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Hierarquia Oficial RFB / SEFAZ
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Score Geral Confiabilidade
              </span>
              <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                {empresa.scoreConfiabilidade || 98} / 100
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Ponderação por nível de fonte
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Campos Oficiais Confirmados
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>
                {empresa.fontes.filter(f => f.statusInformacao === 'Confirmado' || f.statusInformacao === 'Confirmado por múltiplas fontes' || f.confiabilidade === 'Confirmado').length} de {empresa.fontes.length} campos
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Prioridade 1 & 2 Governamental
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Divergências Identificadas
              </span>
              <span 
                className="text-sm font-bold flex items-center gap-1.5"
                style={{
                  color: (empresa.divergencias?.length || 0) > 0 ? 'var(--warning)' : 'var(--success)'
                }}
              >
                {(empresa.divergencias?.length || 0) > 0 ? (
                  <>
                    <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                    {empresa.divergencias?.length} divergência(s)
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    0 divergências
                  </>
                )}
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {(empresa.divergencias?.length || 0) > 0 ? 'Conciliado por órgão oficial' : 'Total concordância'}
              </span>
            </div>
          </div>

          {/* Divergence Log Table if any divergence was detected */}
          {empresa.divergencias && empresa.divergencias.length > 0 && (
            <div 
              className="border rounded-3xl p-5 shadow-xs space-y-3"
              style={{
                backgroundColor: 'var(--warning-subtle)',
                borderColor: 'var(--warning)'
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Divergências Identificadas Entre Fontes (Auditoria de Conciliação)
                </h4>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                O Data Reconciliation Engine localizou divergências entre fontes públicas. Em conformidade com as regras do sistema, o dado oficial confirmado mais recente da Receita Federal / SEFAZ foi priorizado e o histórico mantido abaixo para auditoria.
              </p>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b font-bold uppercase text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                      <th className="py-2 px-2">Campo</th>
                      <th className="py-2 px-2">Dado Oficial Utilizado</th>
                      <th className="py-2 px-2">Fonte Oficial</th>
                      <th className="py-2 px-2">Dado Divergente</th>
                      <th className="py-2 px-2">Fonte Divergente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {empresa.divergencias.map((div, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-2 font-bold" style={{ color: 'var(--text-primary)' }}>{div.campo}</td>
                        <td className="py-2.5 px-2 font-semibold" style={{ color: 'var(--success)' }}>{div.valorOficial}</td>
                        <td className="py-2.5 px-2" style={{ color: 'var(--text-secondary)' }}>{div.fonteOficial}</td>
                        <td className="py-2.5 px-2 font-mono line-through" style={{ color: 'var(--warning)' }}>{div.valorDivergente}</td>
                        <td className="py-2.5 px-2" style={{ color: 'var(--text-tertiary)' }}>{div.fonteDivergente}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Traceability Table */}
          <div 
            className="rounded-3xl p-6 border shadow-xs space-y-6 transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Shield className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                Matriz de Rastreabilidade e Origem das Informações
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Auditoria de procedência e pontuação de confiabilidade campo a campo conforme diretrizes do Consulta Premium 360 e LGPD
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-semibold uppercase text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                    <th className="py-3 px-3">Categoria de Dado</th>
                    <th className="py-3 px-3">Fonte Pública Oficial</th>
                    <th className="py-3 px-3">Provedor / Camada API</th>
                    <th className="py-3 px-3">Status da Informação</th>
                    <th className="py-3 px-3">Confiabilidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {empresa.fontes.map((f, idx) => (
                    <tr key={idx} className="hover:opacity-90 transition-opacity">
                      <td className="py-3 px-3 font-bold" style={{ color: 'var(--text-primary)' }}>
                        {f.campo}
                      </td>
                      <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>
                        {f.fonte}
                      </td>
                      <td className="py-3 px-3 font-mono" style={{ color: 'var(--text-tertiary)' }}>
                        {f.provedor}
                      </td>
                      <td className="py-3 px-3">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                          style={getReliabilityStyle(f.statusInformacao || f.confiabilidade)}
                        >
                          {f.statusInformacao || f.confiabilidade}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
                          {f.scoreCampo || (f.confiabilidade === 'Confirmado' ? 100 : 85)} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
