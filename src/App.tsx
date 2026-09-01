import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  Sidebar, 
  ActiveNavTab 
} from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { CompanyDetailView } from './components/CompanyDetailView';
import { PersonDetailView } from './components/PersonDetailView';
import { PersonSearchResultsView, RankedPessoaResult } from './components/PersonSearchResultsView';
import { CompanyComparator } from './components/CompanyComparator';
import { MonitoringView } from './components/MonitoringView';
import { HistoryView } from './components/HistoryView';
import { AdvancedSearchView } from './components/AdvancedSearchView';
import { CreditsView } from './components/CreditsView';
import { IntegrationsView } from './components/IntegrationsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { NotificationsModal } from './components/NotificationsModal';
import { 
  EmpresaData, 
  PessoaData, 
  SearchType, 
  ConsultaHistorico, 
  MonitoramentoEmpresa, 
  AlertaMonitoramento,
  PlanoCreditos,
  Usuario,
  ConsultaRapida,
  ThemePreference
} from './types';
import { 
  seedCompanies, 
  seedPeople, 
  initialSearchHistory, 
  initialMonitoring, 
  initialAlerts, 
  initialUsers, 
  initialPlan,
  INITIAL_QUICK_DEMOS
} from './data/seedData';
import { apiService } from './services/api';
import { 
  Search, 
  X, 
  AlertCircle, 
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Theme State: 'light' | 'dark' | 'system'
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    return (localStorage.getItem('theme_preference') as ThemePreference) || 'system';
  });

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDark = themePreference === 'dark' || (themePreference === 'system' && systemDark);

  useEffect(() => {
    localStorage.setItem('theme_preference', themePreference);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themePreference, isDark]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');

  // Selected Entities
  const [selectedCompany, setSelectedCompany] = useState<EmpresaData | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PessoaData | null>(null);
  const [personSearchResults, setPersonSearchResults] = useState<{
    query: string;
    results: RankedPessoaResult[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // App Data Repositories
  const [allCompanies, setAllCompanies] = useState<EmpresaData[]>(seedCompanies);
  const [historyList, setHistoryList] = useState<ConsultaHistorico[]>(initialSearchHistory);
  const [quickDemos, setQuickDemos] = useState<ConsultaRapida[]>(INITIAL_QUICK_DEMOS);
  const [monitoredList, setMonitoredList] = useState<MonitoramentoEmpresa[]>(initialMonitoring);
  const [alertsList, setAlertsList] = useState<AlertaMonitoramento[]>(initialAlerts);
  const [comparedCompanies, setComparedCompanies] = useState<EmpresaData[]>([seedCompanies[0], seedCompanies[1]]);

  // User and Credits State
  const [currentUser, setCurrentUser] = useState<Usuario>(initialUsers[0]);
  const [usersList, setUsersList] = useState<Usuario[]>(initialUsers);
  const [currentPlan, setCurrentPlan] = useState<PlanoCreditos>(initialPlan);

  // Sync with server on mount
  useEffect(() => {
    const loadServerData = async () => {
      try {
        const [serverHistory, serverQuickDemos] = await Promise.allSettled([
          apiService.getHistory(),
          apiService.getQuickDemos()
        ]);
        if (serverHistory.status === 'fulfilled' && serverHistory.value.length > 0) {
          setHistoryList(serverHistory.value);
        }
        if (serverQuickDemos.status === 'fulfilled' && serverQuickDemos.value.length > 0) {
          setQuickDemos(serverQuickDemos.value);
        }
      } catch (e) {
        console.warn('Utilizando dados locais de fallback:', e);
      }
    };
    loadServerData();
  }, []);

  // Modals
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showQuickSearchModal, setShowQuickSearchModal] = useState<boolean>(false);
  const [modalSearchTerm, setModalSearchTerm] = useState<string>('');
  const [modalSearchType, setModalSearchType] = useState<SearchType>('cnpj');

  // Keyboard shortcut for quick search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Search Handler
  const handlePerformSearch = async (term: string, type: SearchType) => {
    // 1. Clear previous search results and errors completely
    setIsSearching(true);
    setSearchError(null);
    setSelectedCompany(null);
    setSelectedPerson(null);
    setPersonSearchResults(null);

    // Update credits usage statistics
    setCurrentPlan(prev => ({
      ...prev,
      creditosUtilizados: prev.creditosUtilizados + 1,
      creditosDisponiveis: (prev.isUnlimited || prev.tipo === 'UNLIMITED') ? 999999 : Math.max(0, prev.creditosDisponiveis - 1)
    }));

    try {
      if (type === 'cnpj' || type === 'razao_social') {
        const company = await apiService.searchCompany(term);
        setSelectedCompany(company);
        setSelectedPerson(null);
        setPersonSearchResults(null);

        // Update local list if new
        setAllCompanies(prev => {
          if (!prev.some(c => c.cnpj === company.cnpj)) {
            return [company, ...prev];
          }
          return prev.map(c => c.cnpj === company.cnpj ? company : c);
        });

        // Add to history
        const newHistoryItem: ConsultaHistorico = {
          id: `hist-${Date.now()}`,
          tipo: type,
          identificador: company.cnpj,
          nomeOuRazao: company.razaoSocial,
          dataHora: new Date().toLocaleString('pt-BR'),
          usuarioId: currentUser.id,
          situacao: company.situacaoCadastral,
          favorito: false
        };
        setHistoryList(prev => [newHistoryItem, ...prev]);
        setShowQuickSearchModal(false);
      } else {
        // Person Search with structured results and homonym support
        const searchRes = await apiService.searchPersons(term);
        const results = searchRes.results || [];

        if (results.length === 0) {
          setSearchError(searchRes.message || `Nenhum registro compatível encontrado para "${term}".`);
          setShowQuickSearchModal(false);
          return;
        }

        // If exactly 1 result and it is high-confidence (score >= 90), open dossier directly
        if (results.length === 1 && (results[0].similarityScore || 0) >= 90) {
          const person = results[0];
          setSelectedPerson(person);
          setSelectedCompany(null);
          setPersonSearchResults(null);

          // Add to history
          const newHistoryItem: ConsultaHistorico = {
            id: `hist-${Date.now()}`,
            tipo: 'nome',
            identificador: person.cpfMascarado || 'Pessoa Física',
            nomeOuRazao: person.nome,
            dataHora: new Date().toLocaleString('pt-BR'),
            usuarioId: currentUser.id,
            situacao: 'Vínculos Localizados',
            favorito: false
          };
          setHistoryList(prev => [newHistoryItem, ...prev]);
        } else {
          // Multiple results, homonyms or partial similarity - show selection view
          setPersonSearchResults({
            query: term,
            results: results
          });
          setSelectedPerson(null);
          setSelectedCompany(null);
        }
        setShowQuickSearchModal(false);
      }
    } catch (err: any) {
      console.error('Erro na pesquisa:', err);
      setSearchError(err.message || 'Erro ao realizar consulta nas bases oficiais.');
    } finally {
      setIsSearching(false);
    }
  };

  // Direct selection of company by CNPJ
  const handleSelectCompanyByCnpj = async (cnpj: string) => {
    setIsSearching(true);
    setSearchError(null);
    setSelectedCompany(null);
    setSelectedPerson(null);
    setPersonSearchResults(null);
    try {
      const company = await apiService.searchCompany(cnpj);
      setSelectedCompany(company);
      setSelectedPerson(null);
      setPersonSearchResults(null);
      setShowNotifications(false);
    } catch (err: any) {
      setSearchError(err.message || 'Erro ao carregar dossiê da empresa.');
    } finally {
      setIsSearching(false);
    }
  };

  // Direct selection of person by Name
  const handleSelectPersonByName = async (name: string) => {
    setIsSearching(true);
    setSearchError(null);
    setSelectedCompany(null);
    setSelectedPerson(null);
    setPersonSearchResults(null);
    try {
      const searchRes = await apiService.searchPersons(name);
      const results = searchRes.results || [];
      if (results.length === 0) {
        setSearchError(searchRes.message || `Nenhum registro compatível encontrado para "${name}".`);
        setShowNotifications(false);
        return;
      }

      if (results.length === 1 && (results[0].similarityScore || 0) >= 90) {
        setSelectedPerson(results[0]);
        setSelectedCompany(null);
        setPersonSearchResults(null);
      } else {
        setPersonSearchResults({
          query: name,
          results: results
        });
        setSelectedPerson(null);
        setSelectedCompany(null);
      }
      setShowNotifications(false);
    } catch (err: any) {
      setSearchError(err.message || 'Erro ao carregar dados públicos da pessoa.');
    } finally {
      setIsSearching(false);
    }
  };

  // Monitoring toggle
  const handleToggleMonitoring = (empresa: EmpresaData) => {
    const isAlreadyMonitored = monitoredList.some(m => m.cnpj === empresa.cnpj);
    if (isAlreadyMonitored) {
      setMonitoredList(prev => prev.filter(m => m.cnpj !== empresa.cnpj));
    } else {
      const newMon: MonitoramentoEmpresa = {
        id: `mon-${Date.now()}`,
        empresaId: empresa.id,
        cnpj: empresa.cnpj,
        razaoSocial: empresa.razaoSocial,
        dataInicio: new Date().toLocaleDateString('pt-BR'),
        dataUltimaChecagem: new Date().toLocaleString('pt-BR'),
        status: 'ATIVO',
        frequencia: 'DIARIA',
        situacaoAtual: empresa.situacaoCadastral
      };
      setMonitoredList(prev => [newMon, ...prev]);
    }
  };

  // Comparison toggle
  const handleToggleComparison = (empresa: EmpresaData) => {
    const isAlreadyIn = comparedCompanies.some(c => c.cnpj === empresa.cnpj);
    if (isAlreadyIn) {
      setComparedCompanies(prev => prev.filter(c => c.cnpj !== empresa.cnpj));
    } else {
      if (comparedCompanies.length >= 5) {
        alert('Limite máximo de 5 empresas simultâneas atingido no comparador.');
        return;
      }
      setComparedCompanies(prev => [...prev, empresa]);
    }
  };

  // History favorites toggle
  const handleToggleFavorite = (id: string) => {
    setHistoryList(prev => prev.map(item => item.id === id ? { ...item, favorito: !item.favorito } : item));
    apiService.toggleFavoriteHistory(id).catch(console.warn);
  };

  // History Deletion Handlers
  const handleDeleteHistorySingle = async (id: string) => {
    try {
      await apiService.deleteHistory(id);
    } catch (e) {
      console.warn('Erro ao deletar no servidor:', e);
    }
    setHistoryList(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteHistoryBulk = async (ids: string[]) => {
    try {
      await apiService.bulkDeleteHistory(ids);
    } catch (e) {
      console.warn('Erro ao deletar em lote no servidor:', e);
    }
    const idSet = new Set(ids);
    setHistoryList(prev => prev.filter(item => !idSet.has(item.id)));
  };

  const handleClearAllHistory = async () => {
    try {
      await apiService.clearAllHistory();
    } catch (e) {
      console.warn('Erro ao limpar histórico no servidor:', e);
    }
    setHistoryList([]);
  };

  // Quick Demos Handlers
  const handleAddQuickDemo = async (demo: Omit<ConsultaRapida, 'id' | 'ordem'>) => {
    try {
      const res = await apiService.createQuickDemo(demo);
      if (res?.item) {
        setQuickDemos(prev => [...prev, res.item]);
        return;
      }
    } catch (e) {
      console.warn('Fallback local para criação de consulta rápida:', e);
    }
    const maxOrder = quickDemos.reduce((max, item) => Math.max(max, item.ordem || 0), 0);
    const newDemo: ConsultaRapida = {
      ...demo,
      id: `qd-${Date.now()}`,
      ordem: maxOrder + 1
    };
    setQuickDemos(prev => [...prev, newDemo]);
  };

  const handleUpdateQuickDemo = async (id: string, updates: Partial<ConsultaRapida>) => {
    try {
      await apiService.updateQuickDemo(id, updates);
    } catch (e) {
      console.warn('Fallback local para atualização de consulta rápida:', e);
    }
    setQuickDemos(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleDeleteQuickDemo = async (id: string) => {
    try {
      await apiService.deleteQuickDemo(id);
    } catch (e) {
      console.warn('Fallback local para exclusão de consulta rápida:', e);
    }
    setQuickDemos(prev => prev.filter(d => d.id !== id));
  };

  const handleReorderQuickDemos = async (orderedIds: string[]) => {
    try {
      await apiService.reorderQuickDemos(orderedIds);
    } catch (e) {
      console.warn('Fallback local para reordenação:', e);
    }
    setQuickDemos(prev => {
      const copy = [...prev];
      copy.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
      return copy.map((item, idx) => ({ ...item, ordem: idx + 1 }));
    });
  };

  // Navigation from breadcrumbs
  const handleBackToDashboard = () => {
    setSelectedCompany(null);
    setSelectedPerson(null);
    setPersonSearchResults(null);
    setSearchError(null);
    setActiveTab('dashboard');
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans antialiased transition-colors"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Top Navigation */}
      <Navbar
        themePreference={themePreference}
        setThemePreference={setThemePreference}
        isDark={isDark}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        usersList={usersList}
        creditsUsed={currentPlan.creditosUtilizados}
        creditsLimit={currentPlan.limiteMensal}
        onQuickSearchClick={() => setShowQuickSearchModal(true)}
        activeNotificationsCount={alertsList.length}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedCompany(null);
            setSelectedPerson(null);
          }}
          favoritesCount={historyList.filter(h => h.favorito).length}
          monitoringCount={monitoredList.length}
          isAdmin={true}
        />

        {/* Center Workspace Content */}
        <main 
          className="flex-1 overflow-y-auto p-4 md:p-8 transition-colors duration-200"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Search Loading Overlay / Feedback */}
            {isSearching && (
              <div 
                className="mb-6 p-4 rounded-2xl border shadow-xs flex items-center justify-between gap-4"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--accent)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 border-2 rounded-full animate-spin shrink-0" 
                    style={{
                      borderColor: 'var(--accent)',
                      borderTopColor: 'transparent'
                    }}
                  />
                  <div>
                    <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                      Consultando bases governamentais em tempo real...
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      Auditando Receita Federal (CNPJ), SINTEGRA, Certidões Negativas, QSA e Fontes Oficiais.
                    </span>
                  </div>
                </div>
                <div 
                  className="hidden sm:flex items-center gap-2 text-[10px] font-bold px-2.5 py-1 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)'
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Criptografia Ativa</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {searchError && (
              <div 
                className="mb-6 p-4 rounded-2xl border text-xs flex items-center justify-between gap-2"
                style={{
                  backgroundColor: 'var(--danger-subtle)',
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)'
                }}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
                <button
                  onClick={() => setSearchError(null)}
                  className="p-1 cursor-pointer hover:opacity-80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Breadcrumb Navigation when viewing specific entity */}
            {(selectedCompany || selectedPerson) && (
              <div className="mb-4 flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <button
                  onClick={handleBackToDashboard}
                  className="font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Início</span>
                </button>
                <span>/</span>
                <span className="font-bold truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>
                  {selectedCompany?.razaoSocial || selectedPerson?.nome}
                </span>
              </div>
            )}

            {/* VIEW ROUTING */}
            {selectedCompany ? (
              <CompanyDetailView
                empresa={selectedCompany}
                onRefreshCompany={async (cnpj) => {
                  try {
                    setIsSearching(true);
                    setSearchError(null);
                    const res = await apiService.getCnpj(cnpj, true);
                    if (res?.data) {
                      setSelectedCompany(res.data);
                      setAllCompanies(prev => prev.map(c => c.cnpj === res.data.cnpj ? res.data : c));
                    }
                  } catch (err: any) {
                    setSearchError(err.message || 'Erro ao forçar atualização nas fontes governamentais.');
                  } finally {
                    setIsSearching(false);
                  }
                }}
                onSelectPerson={handleSelectPersonByName}
                onSelectCompany={handleSelectCompanyByCnpj}
                onToggleMonitoring={handleToggleMonitoring}
                isMonitored={monitoredList.some(m => m.cnpj === selectedCompany.cnpj)}
                onAddToComparison={handleToggleComparison}
                isCompared={comparedCompanies.some(c => c.cnpj === selectedCompany.cnpj)}
              />
            ) : selectedPerson ? (
              <PersonDetailView
                pessoa={selectedPerson}
                onSelectCompany={handleSelectCompanyByCnpj}
                onBackToSearch={handleBackToDashboard}
              />
            ) : personSearchResults ? (
              <PersonSearchResultsView
                query={personSearchResults.query}
                results={personSearchResults.results}
                onSelectPerson={(person) => {
                  setSelectedPerson(person);
                  setPersonSearchResults(null);
                  // Add to history
                  const newHistoryItem: ConsultaHistorico = {
                    id: `hist-${Date.now()}`,
                    tipo: 'nome',
                    identificador: person.cpfMascarado || 'Pessoa Física',
                    nomeOuRazao: person.nome,
                    dataHora: new Date().toLocaleString('pt-BR'),
                    usuarioId: currentUser.id,
                    situacao: 'Vínculos Localizados',
                    favorito: false
                  };
                  setHistoryList(prev => [newHistoryItem, ...prev]);
                }}
                onBackToSearch={handleBackToDashboard}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardHome
                    onSearch={handlePerformSearch}
                    recentSearches={historyList}
                    onSelectCompany={handleSelectCompanyByCnpj}
                    onSelectPerson={handleSelectPersonByName}
                    onNavigateTab={setActiveTab}
                    monitoredCount={monitoredList.length}
                    creditsAvailable={currentPlan.creditosDisponiveis}
                    quickDemos={quickDemos}
                    onDeleteQuickDemo={handleDeleteQuickDemo}
                  />
                )}

                {activeTab === 'nova_consulta' && (
                  <DashboardHome
                    onSearch={handlePerformSearch}
                    recentSearches={historyList}
                    onSelectCompany={handleSelectCompanyByCnpj}
                    onSelectPerson={handleSelectPersonByName}
                    onNavigateTab={setActiveTab}
                    monitoredCount={monitoredList.length}
                    creditsAvailable={currentPlan.creditosDisponiveis}
                    quickDemos={quickDemos}
                    onDeleteQuickDemo={handleDeleteQuickDemo}
                  />
                )}

                {activeTab === 'historico' && (
                  <HistoryView
                    historyList={historyList}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectCompany={handleSelectCompanyByCnpj}
                    onSelectPerson={handleSelectPersonByName}
                    onDeleteSingle={handleDeleteHistorySingle}
                    onDeleteBulk={handleDeleteHistoryBulk}
                    onClearHistory={handleClearAllHistory}
                  />
                )}

                {activeTab === 'monitoramento' && (
                  <MonitoringView
                    monitoredList={monitoredList}
                    alertsList={alertsList}
                    onRemoveMonitoring={(id) => setMonitoredList(prev => prev.filter(m => m.id !== id))}
                    onSelectCompany={handleSelectCompanyByCnpj}
                    onAddManualMonitoring={(cnpj, razao) => {
                      const newMon: MonitoramentoEmpresa = {
                        id: `mon-${Date.now()}`,
                        empresaId: `emp-${Date.now()}`,
                        cnpj,
                        razaoSocial: razao,
                        dataInicio: new Date().toLocaleDateString('pt-BR'),
                        dataUltimaChecagem: new Date().toLocaleString('pt-BR'),
                        status: 'ATIVO',
                        frequencia: 'DIARIA',
                        situacaoAtual: 'ATIVA'
                      };
                      setMonitoredList(prev => [newMon, ...prev]);
                    }}
                  />
                )}

                {activeTab === 'comparar' && (
                  <CompanyComparator
                    comparedCompanies={comparedCompanies}
                    onRemoveCompany={(cnpj) => setComparedCompanies(prev => prev.filter(c => c.cnpj !== cnpj))}
                    onSelectCompany={handleSelectCompanyByCnpj}
                    onOpenQuickAdd={() => {}}
                    availableCompanies={allCompanies}
                    onAddCompany={(emp) => {
                      if (!comparedCompanies.some(c => c.cnpj === emp.cnpj)) {
                        setComparedCompanies(prev => [...prev, emp]);
                      }
                    }}
                  />
                )}

                {activeTab === 'busca_avancada' && (
                  <AdvancedSearchView
                    allCompanies={allCompanies}
                    onSelectCompany={handleSelectCompanyByCnpj}
                  />
                )}

                {activeTab === 'relatorios' && (
                  <HistoryView
                    historyList={historyList}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectCompany={handleSelectCompanyByCnpj}
                    onSelectPerson={handleSelectPersonByName}
                    onDeleteSingle={handleDeleteHistorySingle}
                    onDeleteBulk={handleDeleteHistoryBulk}
                    onClearHistory={handleClearAllHistory}
                  />
                )}

                {activeTab === 'creditos' && (
                  <CreditsView
                    currentPlan={currentPlan}
                    onSelectPlan={(newPlan) => setCurrentPlan(newPlan)}
                    onAddCredits={(amount) => setCurrentPlan(prev => ({
                      ...prev,
                      creditosDisponiveis: prev.creditosDisponiveis + amount
                    }))}
                  />
                )}

                {activeTab === 'integracoes' && (
                  <IntegrationsView />
                )}

                {activeTab === 'usuarios' && (
                  <UsersView />
                )}

                {activeTab === 'configuracoes' && (
                  <SettingsView
                    quickDemos={quickDemos}
                    onAddQuickDemo={handleAddQuickDemo}
                    onUpdateQuickDemo={handleUpdateQuickDemo}
                    onDeleteQuickDemo={handleDeleteQuickDemo}
                    onReorderQuickDemos={handleReorderQuickDemos}
                    themePreference={themePreference}
                    setThemePreference={setThemePreference}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Quick Search Modal (Ctrl + K) */}
      {showQuickSearchModal && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
        >
          <div 
            className="rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (modalSearchTerm.trim()) {
                  handlePerformSearch(modalSearchTerm.trim(), modalSearchType);
                }
              }}
              className="p-4 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    Consulta Global 360°
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickSearchModal(false)}
                  className="p-1 cursor-pointer hover:opacity-80"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Type Switcher */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'cnpj' as SearchType, label: 'CNPJ' },
                  { id: 'razao_social' as SearchType, label: 'Razão Social' },
                  { id: 'nome' as SearchType, label: 'Pessoa (Nome)' }
                ].map((t) => {
                  const isSelected = modalSearchType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setModalSearchType(t.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                        color: isSelected ? '#000000' : 'var(--text-secondary)'
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                autoFocus
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
                placeholder="Digite o CNPJ ou Nome para buscar..."
                className="w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Pressione Enter para consultar</span>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#000000'
                  }}
                >
                  Buscar Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        alerts={alertsList}
        onSelectCompany={handleSelectCompanyByCnpj}
      />
    </div>
  );
}
