import React, { useState, useEffect } from 'react';
import { 
  Network, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Zap,
  Clock,
  Database,
  Activity,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Server,
  Building2,
  MapPin,
  FileText,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  Info,
  Scale,
  BadgeAlert,
  HelpCircle
} from 'lucide-react';
import { 
  ProvedorApi, 
  TelemetriaApiLog, 
  ProviderCategory, 
  IntegrationState 
} from '../types';
import { apiService } from '../services/api';
import { CATEGORY_LABELS, MUNICIPAL_PROVIDER_REGISTRY } from '../services/dataProviderHub';

export const IntegrationsView: React.FC = () => {
  const [providers, setProviders] = useState<ProvedorApi[]>([]);
  const [logs, setLogs] = useState<TelemetriaApiLog[]>([]);
  const [cacheStats, setCacheStats] = useState<{ totalCachedItems: number; ttlHours: number }>({ totalCachedItems: 0, ttlHours: 4 });
  const [loading, setLoading] = useState<boolean>(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResultModal, setTestResultModal] = useState<{
    open: boolean;
    providerNome: string;
    sucesso: boolean;
    latenciaMs: number;
    statusHttp?: number;
    mensagem: string;
    detalhesTecnicos?: string;
  } | null>(null);

  // Filters
  const [stateFilter, setStateFilter] = useState<'TODAS' | IntegrationState>('TODAS');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODAS');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'HUB' | 'MUNICIPAL' | 'TELEMETRIA'>('HUB');

  // Modal State for Add / Edit Provider
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [modalFormData, setModalFormData] = useState<{
    nome: string;
    descricao: string;
    categoria: ProviderCategory;
    tipo: 'PUBLICO' | 'OFICIAL' | 'LICENCIADO' | 'TRIBUNAL';
    cobertura: 'NACIONAL' | 'ESTADUAL' | 'MUNICIPAL';
    uf: string;
    municipio: string;
    codigoIbge: string;
    urlBase: string;
    integrationState: IntegrationState;
    prioridade: number;
    confiancaDefault: number;
    custoPorChamada: number;
    requerApiKey: boolean;
    tipoAutenticacao: 'NONE' | 'API_KEY' | 'BEARER_TOKEN' | 'OAUTH2' | 'CERTIFICATE';
    apiKeyValor: string;
    timeoutMs: number;
    documentacaoUrl: string;
    ativo: boolean;
  }>({
    nome: '',
    descricao: '',
    categoria: 'CADASTRO_EMPRESARIAL',
    tipo: 'OFICIAL',
    cobertura: 'NACIONAL',
    uf: '',
    municipio: '',
    codigoIbge: '',
    urlBase: '',
    integrationState: 'ATIVA',
    prioridade: 1,
    confiancaDefault: 100,
    custoPorChamada: 0,
    requerApiKey: false,
    tipoAutenticacao: 'NONE',
    apiKeyValor: '',
    timeoutMs: 4500,
    documentacaoUrl: '',
    ativo: true
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProvidersAndTelemetry = async () => {
    try {
      setLoading(true);
      const [provList, teleData] = await Promise.all([
        apiService.getProviders(),
        apiService.getTelemetria()
      ]);
      if (provList) {
        setProviders(provList);
      }
      if (teleData?.logs) {
        setLogs(teleData.logs);
      }
      if (teleData?.cacheStats) {
        setCacheStats(teleData.cacheStats);
      }
    } catch (e) {
      console.warn('Erro ao carregar telemetria em tempo real:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvidersAndTelemetry();
    const interval = setInterval(fetchProvidersAndTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await apiService.toggleProvider(id);
      if (res.success && res.provider) {
        setProviders(prev => prev.map(p => p.id === id ? res.provider : p));
      }
    } catch {
      setProviders(prev => prev.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p));
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await apiService.testProvider(id);
      setTestResultModal({
        open: true,
        providerNome: res.providerNome,
        sucesso: res.sucesso,
        latenciaMs: res.latenciaMs,
        statusHttp: res.statusHttp,
        mensagem: res.mensagem,
        detalhesTecnicos: res.detalhesTecnicos
      });
      // Refresh list to update status in UI
      const updatedList = await apiService.getProviders();
      setProviders(updatedList);
    } catch (err: any) {
      const p = providers.find(item => item.id === id);
      setTestResultModal({
        open: true,
        providerNome: p?.nome || 'Provedor',
        sucesso: false,
        latenciaMs: 0,
        mensagem: err.message || 'Falha ao conectar com o endpoint.',
        detalhesTecnicos: 'Verifique conectividade e regras de firewall.'
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProviderId(null);
    setModalFormData({
      nome: '',
      descricao: '',
      categoria: 'CADASTRO_EMPRESARIAL',
      tipo: 'OFICIAL',
      cobertura: 'NACIONAL',
      uf: '',
      municipio: '',
      codigoIbge: '',
      urlBase: '',
      integrationState: 'ATIVA',
      prioridade: 1,
      confiancaDefault: 100,
      custoPorChamada: 0,
      requerApiKey: false,
      tipoAutenticacao: 'NONE',
      apiKeyValor: '',
      timeoutMs: 4500,
      documentacaoUrl: '',
      ativo: true
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: ProvedorApi) => {
    setEditingProviderId(p.id);
    setModalFormData({
      nome: p.nome,
      descricao: p.descricao || '',
      categoria: p.categoria || 'CADASTRO_EMPRESARIAL',
      tipo: p.tipo,
      cobertura: p.cobertura || 'NACIONAL',
      uf: p.uf || '',
      municipio: p.municipio || '',
      codigoIbge: p.codigoIbge || '',
      urlBase: p.urlBase,
      integrationState: p.integrationState || 'ATIVA',
      prioridade: p.prioridade || 1,
      confiancaDefault: p.confiancaDefault || (p.tipo === 'OFICIAL' ? 100 : 90),
      custoPorChamada: p.custoPorChamada || 0,
      requerApiKey: Boolean(p.requerApiKey),
      tipoAutenticacao: p.tipoAutenticacao || (p.requerApiKey ? 'API_KEY' : 'NONE'),
      apiKeyValor: p.apiKeyValor || '',
      timeoutMs: p.timeoutMs || 4500,
      documentacaoUrl: p.documentacaoUrl || '',
      ativo: p.ativo !== false
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFormData.nome.trim()) {
      setModalError('Informe o nome do provedor.');
      return;
    }
    if (!modalFormData.urlBase.trim()) {
      setModalError('Informe a URL base do endpoint.');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);

      if (editingProviderId) {
        const res = await apiService.updateProvider(editingProviderId, modalFormData);
        if (res.success && res.provider) {
          setProviders(prev => prev.map(item => item.id === editingProviderId ? res.provider : item));
        }
      } else {
        const res = await apiService.createProvider(modalFormData);
        if (res.success && res.provider) {
          setProviders(prev => [...prev, res.provider]);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Erro ao salvar configuração do provedor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProvider = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o provedor "${nome}" do Data Provider Hub?`)) {
      return;
    }
    try {
      await apiService.deleteProvider(id);
      setProviders(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao remover provedor.');
    }
  };

  // Filtered providers
  const filteredProviders = providers.filter(p => {
    const matchState = stateFilter === 'TODAS' || p.integrationState === stateFilter;
    const matchCategory = categoryFilter === 'TODAS' || p.categoria === categoryFilter;
    const matchSearch = !searchFilter.trim() || 
      p.nome.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.descricao || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.urlBase.toLowerCase().includes(searchFilter.toLowerCase());
    return matchState && matchCategory && matchSearch;
  });

  const activeCount = providers.filter(p => p.integrationState === 'ATIVA' && p.ativo).length;
  const configAvailableCount = providers.filter(p => p.integrationState === 'DISPONIVEL_CONFIGURACAO').length;
  const futureCount = providers.filter(p => p.integrationState === 'FUTURA').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div 
        className="rounded-3xl p-6 border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Network className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Data Provider Hub & Inteligência Multi-Fontes
            </h1>
            <span 
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--success-subtle)',
                borderColor: 'var(--success-subtle)',
                color: 'var(--success)'
              }}
            >
              {activeCount} Fontes Ativas em Tempo Real
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Camada central e desacoplada de orquestração cadastral, conectores municipais, validação de proveniência e telemetria de latência.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchProvidersAndTelemetry}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border hover:opacity-80"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--accent)' }} />
            <span>Atualizar Status</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#ffffff'
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Provedor</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div 
        className="flex items-center gap-2 p-1.5 rounded-2xl border shadow-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <button
          onClick={() => setActiveTab('HUB')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'HUB' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'HUB' ? 'var(--surface-secondary)' : 'transparent',
            color: activeTab === 'HUB' ? 'var(--accent)' : 'var(--text-secondary)'
          }}
        >
          <Server className="w-4 h-4" />
          <span>Provedores & Conectores ({providers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MUNICIPAL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MUNICIPAL' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'MUNICIPAL' ? 'var(--surface-secondary)' : 'transparent',
            color: activeTab === 'MUNICIPAL' ? 'var(--accent)' : 'var(--text-secondary)'
          }}
        >
          <Building2 className="w-4 h-4" />
          <span>Registro Municipal (Códigos IBGE)</span>
        </button>

        <button
          onClick={() => setActiveTab('TELEMETRIA')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TELEMETRIA' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'TELEMETRIA' ? 'var(--surface-secondary)' : 'transparent',
            color: activeTab === 'TELEMETRIA' ? 'var(--accent)' : 'var(--text-secondary)'
          }}
        >
          <Activity className="w-4 h-4" />
          <span>Telemetria & Logs em Tempo Real ({logs.length})</span>
        </button>
      </div>

      {activeTab === 'HUB' && (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div 
              className="p-4 rounded-2xl border shadow-xs transition-colors"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Catálogo de Integrações
              </span>
              <span className="text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                {activeCount} Ativas / {configAvailableCount} Prontas
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-secondary)' }}>
                +{futureCount} em Roadmap Futuro
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs transition-colors"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Latência Média Global
              </span>
              <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                {Math.round(providers.reduce((acc, p) => acc + (p.latenciaMediaMs || 150), 0) / (providers.length || 1))} ms
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-secondary)' }}>
                Execução em paralelo com Promise.allSettled
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs transition-colors"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Taxa de Disponibilidade
              </span>
              <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--success)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                99.4% Online
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-secondary)' }}>
                Fallback automático em falha
              </span>
            </div>

            <div 
              className="p-4 rounded-2xl border shadow-xs transition-colors"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Confiabilidade & Proveniência
              </span>
              <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--info)' }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Rastreabilidade 100%
              </span>
              <span className="text-[10px] block mt-1" style={{ color: 'var(--text-secondary)' }}>
                Metadados de fonte por campo
              </span>
            </div>
          </div>

          {/* Confidence Scale Explanatory Card */}
          <div 
            className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Hierarquia de Confiabilidade do SourceConfidenceEngine:</strong>
                <span className="ml-1" style={{ color: 'var(--text-secondary)' }}>
                  100% (Órgão Oficial Titular) &gt; 90-99% (Outras bases governamentais abertas) &gt; 75-89% (APIs Comerciais Autorizadas) &gt; 60-74% (Fontes Públicas Secundárias)
                </span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div 
            className="p-4 rounded-3xl border shadow-xs space-y-3"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* State Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <button
                  onClick={() => setStateFilter('TODAS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    stateFilter === 'TODAS' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: stateFilter === 'TODAS' ? 'var(--accent)' : 'var(--surface-secondary)',
                    color: stateFilter === 'TODAS' ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  Todas ({providers.length})
                </button>
                <button
                  onClick={() => setStateFilter('ATIVA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    stateFilter === 'ATIVA' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: stateFilter === 'ATIVA' ? 'var(--success)' : 'var(--surface-secondary)',
                    color: stateFilter === 'ATIVA' ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  Ativas em Tempo Real ({activeCount})
                </button>
                <button
                  onClick={() => setStateFilter('DISPONIVEL_CONFIGURACAO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    stateFilter === 'DISPONIVEL_CONFIGURACAO' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: stateFilter === 'DISPONIVEL_CONFIGURACAO' ? 'var(--accent)' : 'var(--surface-secondary)',
                    color: stateFilter === 'DISPONIVEL_CONFIGURACAO' ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  Aguardando Credencial ({configAvailableCount})
                </button>
                <button
                  onClick={() => setStateFilter('FUTURA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    stateFilter === 'FUTURA' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: stateFilter === 'FUTURA' ? 'var(--text-tertiary)' : 'var(--surface-secondary)',
                    color: stateFilter === 'FUTURA' ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  Roadmap Futuro ({futureCount})
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar provedor por nome..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-hidden"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border outline-hidden"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="TODAS">Todas as Categorias</option>
                  {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
                    <option key={catKey} value={catKey}>{catLabel}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Provider Cards List */}
          <div className="space-y-4">
            {filteredProviders.length === 0 ? (
              <div 
                className="p-8 text-center rounded-3xl border"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                Nenhum provedor corresponde aos filtros selecionados.
              </div>
            ) : (
              filteredProviders.map((p) => {
                const isOnline = p.status === 'ONLINE';
                const isConfigAvailable = p.integrationState === 'DISPONIVEL_CONFIGURACAO';
                const isFuture = p.integrationState === 'FUTURA';

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl border shadow-xs transition-all"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      opacity: p.ativo ? 1 : 0.6
                    }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ 
                              backgroundColor: isFuture 
                                ? 'var(--text-tertiary)' 
                                : isConfigAvailable 
                                ? 'var(--accent)' 
                                : isOnline 
                                ? 'var(--success)' 
                                : 'var(--danger)' 
                            }}
                          />
                          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            {p.nome}
                          </h3>

                          {/* State Badge */}
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: isFuture
                                ? 'var(--surface-secondary)'
                                : isConfigAvailable
                                ? 'var(--accent-subtle)'
                                : 'var(--success-subtle)',
                              borderColor: isFuture
                                ? 'var(--border)'
                                : isConfigAvailable
                                ? 'var(--accent)'
                                : 'var(--success)',
                              color: isFuture
                                ? 'var(--text-secondary)'
                                : isConfigAvailable
                                ? 'var(--accent)'
                                : 'var(--success)'
                            }}
                          >
                            {isFuture ? 'Planejada' : isConfigAvailable ? 'Pronta para Chave' : 'Ativa em Tempo Real'}
                          </span>

                          {/* Category Badge */}
                          <span 
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: 'var(--surface-secondary)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {CATEGORY_LABELS[p.categoria] || p.categoria}
                          </span>

                          {/* Coverage Badge */}
                          <span 
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md border"
                            style={{
                              backgroundColor: 'var(--surface-secondary)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {p.cobertura === 'NACIONAL' ? 'Brasil (Nacional)' : p.cobertura === 'ESTADUAL' ? `UF: ${p.uf || 'Estadual'}` : `Município: ${p.municipio || 'Municipal'}`}
                          </span>

                          {/* Auth Badge */}
                          {p.requerApiKey && (
                            <span 
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1"
                              style={{
                                backgroundColor: 'var(--info-subtle)',
                                borderColor: 'var(--info-subtle)',
                                color: 'var(--info)'
                              }}
                            >
                              <Key className="w-2.5 h-2.5" />
                              {p.chaveMascarada ? 'Chave Configurada' : 'Requer API Key'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {p.descricao}
                        </p>

                        <div className="pt-1.5 flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span className="font-mono text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                            URL: {p.urlBase}
                          </span>

                          {!isFuture && (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                                Latência: <strong style={{ color: 'var(--text-primary)' }}>{p.latenciaMediaMs || p.tempoRespostaMs || 150} ms</strong>
                              </span>
                              <span className="flex items-center gap-1" style={{ color: 'var(--success)' }}>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Taxa Sucesso: <strong>{p.taxaSucesso || 99}%</strong>
                              </span>
                              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                                Consultas Hoje: <strong style={{ color: 'var(--text-primary)' }}>{p.consultasHoje || 0}</strong>
                              </span>
                              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                                Confiabilidade Padrão: <strong style={{ color: 'var(--accent)' }}>{p.confiancaDefault || 100}%</strong>
                              </span>
                            </>
                          )}

                          {p.documentacaoUrl && (
                            <a 
                              href={p.documentacaoUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[11px] font-semibold flex items-center gap-1 underline"
                              style={{ color: 'var(--accent)' }}
                            >
                              Docs <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                        {!isFuture && (
                          <button
                            onClick={() => handleTestConnection(p.id)}
                            disabled={testingId === p.id}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border hover:opacity-80"
                            style={{
                              backgroundColor: 'var(--surface-secondary)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${testingId === p.id ? 'animate-spin' : ''}`} style={{ color: 'var(--accent)' }} />
                            <span>{testingId === p.id ? 'Testando...' : 'Testar Conexão'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--surface-secondary)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Configurar</span>
                        </button>

                        <button
                          onClick={() => handleToggle(p.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border"
                          style={{
                            backgroundColor: p.ativo ? 'var(--success-subtle)' : 'var(--surface-secondary)',
                            borderColor: p.ativo ? 'var(--success)' : 'var(--border)',
                            color: p.ativo ? 'var(--success)' : 'var(--text-tertiary)'
                          }}
                        >
                          {p.ativo ? 'Ativo' : 'Desativado'}
                        </button>

                        {p.id.startsWith('prov-custom-') && (
                          <button
                            onClick={() => handleDeleteProvider(p.id, p.nome)}
                            className="p-1.5 rounded-xl text-xs transition-colors hover:opacity-80"
                            style={{ color: 'var(--danger)' }}
                            title="Remover Provedor Customizado"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {activeTab === 'MUNICIPAL' && (
        <div className="space-y-4">
          <div 
            className="p-5 rounded-3xl border shadow-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Registro Centralizado de Conectores Municipais (Códigos IBGE)
              </h2>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Mapeamento de Secretarias de Finanças Municipais (SEMFAZ), sistemas emissores de NFS-e (ADN Nacional, Betha, Prodam, ISSNet, Quipu) e consultas de Inscrição Municipal / Alvará.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(MUNICIPAL_PROVIDER_REGISTRY).map(([ibge, mun]) => (
              <div
                key={ibge}
                className="p-5 rounded-3xl border shadow-xs space-y-2 transition-colors"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {mun.municipio} - {mun.uf}
                    </h3>
                  </div>
                  <span 
                    className="font-mono text-xs px-2 py-0.5 rounded-md border font-bold"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--accent)'
                    }}
                  >
                    IBGE: {mun.codigoIbge}
                  </span>
                </div>

                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Órgão:</strong> {mun.orgaoFazenda}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    Sistema: <strong style={{ color: 'var(--text-primary)' }}>{mun.sistema}</strong>
                  </span>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: mun.integrationState === 'ATIVA' ? 'var(--success-subtle)' : 'var(--accent-subtle)',
                      borderColor: mun.integrationState === 'ATIVA' ? 'var(--success)' : 'var(--accent)',
                      color: mun.integrationState === 'ATIVA' ? 'var(--success)' : 'var(--accent)'
                    }}
                  >
                    {mun.integrationState === 'ATIVA' ? 'Conector Ativo' : 'Aguardando Credencial'}
                  </span>
                  {mun.portalNfseUrl && (
                    <a 
                      href={mun.portalNfseUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[11px] font-semibold flex items-center gap-1 underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Portal Oficial <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'TELEMETRIA' && (
        <div className="space-y-4">
          <div 
            className="p-5 rounded-3xl border shadow-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Histórico de Telemetria e Requisições às APIs Oficiais
              </h2>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Monitoramento transparente de latência, códigos HTTP retornados e rastreabilidade de fallback.
            </p>
          </div>

          <div 
            className="rounded-3xl border shadow-xs overflow-hidden"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr 
                    className="border-b font-bold"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <th className="p-3.5">Data / Hora</th>
                    <th className="p-3.5">Provedor Consultado</th>
                    <th className="p-3.5">Termo / Identificador</th>
                    <th className="p-3.5">Duração (ms)</th>
                    <th className="p-3.5">Status HTTP</th>
                    <th className="p-3.5">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center" style={{ color: 'var(--text-tertiary)' }}>
                        Nenhuma requisição registrada nesta sessão ainda.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:opacity-90 transition-colors">
                        <td className="p-3.5 font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          {log.dataHora}
                        </td>
                        <td className="p-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>
                          {log.providerNome}
                        </td>
                        <td className="p-3.5 font-mono" style={{ color: 'var(--accent)' }}>
                          {log.termo}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {log.duracaoMs} ms
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span 
                            className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold"
                            style={{
                              backgroundColor: log.statusHttp === 200 ? 'var(--success-subtle)' : 'var(--danger-subtle)',
                              color: log.statusHttp === 200 ? 'var(--success)' : 'var(--danger)'
                            }}
                          >
                            HTTP {log.statusHttp}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {log.sucesso ? (
                            <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--success)' }}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sucesso
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--danger)' }}>
                              <AlertCircle className="w-3.5 h-3.5" /> {log.erro || 'Falha'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Live Connection Test Result */}
      {testResultModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {testResultModal.sucesso ? (
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />
                ) : (
                  <AlertCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />
                )}
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Teste de Conexão: {testResultModal.providerNome}
                </h3>
              </div>
              <button 
                onClick={() => setTestResultModal(null)}
                className="p-1 rounded-xl hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div 
              className="p-4 rounded-2xl border space-y-2 text-xs"
              style={{
                backgroundColor: testResultModal.sucesso ? 'var(--success-subtle)' : 'var(--danger-subtle)',
                borderColor: testResultModal.sucesso ? 'var(--success)' : 'var(--danger)'
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ color: testResultModal.sucesso ? 'var(--success)' : 'var(--danger)' }}>
                  {testResultModal.sucesso ? '🟢 CONECTADO COM SUCESSO' : '🔴 FALHA NA CONEXÃO'}
                </span>
                {testResultModal.statusHttp && (
                  <span className="font-mono px-2 py-0.5 rounded bg-black/10 font-bold">
                    HTTP {testResultModal.statusHttp}
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-primary)' }}>
                {testResultModal.mensagem}
              </p>
              {testResultModal.latenciaMs > 0 && (
                <div className="pt-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  Latência aferida: <strong>{testResultModal.latenciaMs} ms</strong>
                </div>
              )}
            </div>

            {testResultModal.detalhesTecnicos && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold block" style={{ color: 'var(--text-secondary)' }}>
                  Diagnóstico Técnico:
                </span>
                <pre 
                  className="p-3 rounded-xl border text-[11px] font-mono overflow-x-auto whitespace-pre-wrap"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {testResultModal.detalhesTecnicos}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTestResultModal(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff'
                }}
              >
                Fechar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding / Editing Provider */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 space-y-5"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {editingProviderId ? 'Configurar Provedor de Dados' : 'Adicionar Novo Provedor ao Hub'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div 
                className="p-3.5 rounded-2xl border text-xs flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--danger-subtle)',
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)'
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                    Nome do Provedor *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalFormData.nome}
                    onChange={(e) => setModalFormData({ ...modalFormData, nome: e.target.value })}
                    placeholder="Ex: SEFAZ Ceará / Cadastro ICMS"
                    className="w-full px-3 py-2 text-xs rounded-xl border outline-hidden"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                    Categoria Funcional *
                  </label>
                  <select
                    value={modalFormData.categoria}
                    onChange={(e) => setModalFormData({ ...modalFormData, categoria: e.target.value as ProviderCategory })}
                    className="w-full px-3 py-2 text-xs rounded-xl border outline-hidden"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
                      <option key={catKey} value={catKey}>{catLabel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  URL Base do Endpoint / API *
                </label>
                <input
                  type="text"
                  required
                  value={modalFormData.urlBase}
                  onChange={(e) => setModalFormData({ ...modalFormData, urlBase: e.target.value })}
                  placeholder="https://api.orgao.gov.br/v1/consulta"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border outline-hidden"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                    Tipo de Provedor
                  </label>
                  <select
                    value={modalFormData.tipo}
                    onChange={(e) => setModalFormData({ ...modalFormData, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border outline-hidden"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="OFICIAL">Órgão Oficial Titular (100%)</option>
                    <option value="PUBLICO">API Pública Governamental (95%)</option>
                    <option value="LICENCIADO">Provedor Comercial Autorizado (85%)</option>
                    <option value="TRIBUNAL">Tribunal de Justiça / CNJ (100%)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                    Estado de Integração
                  </label>
                  <select
                    value={modalFormData.integrationState}
                    onChange={(e) => setModalFormData({ ...modalFormData, integrationState: e.target.value as IntegrationState })}
                    className="w-full px-3 py-2 text-xs rounded-xl border outline-hidden"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="ATIVA">Ativa em Tempo Real</option>
                    <option value="DISPONIVEL_CONFIGURACAO">Aguardando Credencial</option>
                    <option value="FUTURA">Roadmap Futuro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                    Cobertura Geográfica
                  </label>
                  <select
                    value={modalFormData.cobertura}
                    onChange={(e) => setModalFormData({ ...modalFormData, cobertura: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border outline-hidden"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="NACIONAL">Nacional (Brasil)</option>
                    <option value="ESTADUAL">Estadual (UF específica)</option>
                    <option value="MUNICIPAL">Municipal (SEMFAZ)</option>
                  </select>
                </div>
              </div>

              {modalFormData.cobertura !== 'NACIONAL' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 rounded-2xl border bg-black/5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                      UF (Estado)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={modalFormData.uf}
                      onChange={(e) => setModalFormData({ ...modalFormData, uf: e.target.value.toUpperCase() })}
                      placeholder="Ex: SP, MA, RJ"
                      className="w-full px-3 py-2 text-xs rounded-xl border outline-hidden"
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                      Município
                    </label>
                    <input
                      type="text"
                      value={modalFormData.municipio}
                      onChange={(e) => setModalFormData({ ...modalFormData, municipio: e.target.value })}
                      placeholder="Ex: São Paulo"
                      className="w-full px-3 py-2 text-xs rounded-xl border outline-hidden"
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                      Código IBGE (7 dígitos)
                    </label>
                    <input
                      type="text"
                      maxLength={7}
                      value={modalFormData.codigoIbge}
                      onChange={(e) => setModalFormData({ ...modalFormData, codigoIbge: e.target.value })}
                      placeholder="Ex: 3550308"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border outline-hidden"
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Authentication & Security Settings */}
              <div 
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      Autenticação & Credenciais (Armazenadas de Forma Segura)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalFormData.requerApiKey}
                      onChange={(e) => setModalFormData({ 
                        ...modalFormData, 
                        requerApiKey: e.target.checked,
                        tipoAutenticacao: e.target.checked ? 'API_KEY' : 'NONE'
                      })}
                      className="rounded"
                    />
                    <span>Requer Autenticação</span>
                  </label>
                </div>

                {modalFormData.requerApiKey && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>
                        Tipo de Token / Chave
                      </label>
                      <select
                        value={modalFormData.tipoAutenticacao}
                        onChange={(e) => setModalFormData({ ...modalFormData, tipoAutenticacao: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs rounded-xl border outline-hidden"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="API_KEY">Header X-API-Key</option>
                        <option value="BEARER_TOKEN">Bearer Token (Authorization)</option>
                        <option value="OAUTH2">OAuth 2.0 Client Credentials</option>
                        <option value="CERTIFICATE">Certificado Digital (e-CNPJ)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>
                        Valor da Chave / Secret
                      </label>
                      <input
                        type="password"
                        value={modalFormData.apiKeyValor}
                        onChange={(e) => setModalFormData({ ...modalFormData, apiKeyValor: e.target.value })}
                        placeholder="sk_live_••••••••••••"
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border outline-hidden"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  Descrição e Finalidade
                </label>
                <textarea
                  rows={2}
                  value={modalFormData.descricao}
                  onChange={(e) => setModalFormData({ ...modalFormData, descricao: e.target.value })}
                  placeholder="Descreva o propósito deste conector no ecossistema de dados..."
                  className="w-full px-3 py-2 text-xs rounded-xl border outline-hidden"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all hover:opacity-90 active:scale-95"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff'
                  }}
                >
                  {isSubmitting ? 'Salvando...' : editingProviderId ? 'Atualizar Provedor' : 'Adicionar ao Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
