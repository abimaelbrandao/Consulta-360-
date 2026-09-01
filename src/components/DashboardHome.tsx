import React, { useState } from 'react';
import { 
  Search, 
  Building2, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Scale, 
  Radio, 
  Layers,
  TrendingUp,
  FileCheck,
  X,
  SlidersHorizontal,
  Sparkles,
  Infinity as InfinityIcon
} from 'lucide-react';
import { SearchType, ConsultaHistorico, ConsultaRapida } from '../types';

interface DashboardHomeProps {
  onSearch: (term: string, type: SearchType) => void;
  recentSearches: ConsultaHistorico[];
  onSelectCompany: (cnpj: string) => void;
  onSelectPerson: (name: string) => void;
  onNavigateTab: (tab: any) => void;
  monitoredCount: number;
  creditsAvailable: number;
  quickDemos?: ConsultaRapida[];
  onDeleteQuickDemo?: (id: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onSearch,
  recentSearches,
  onSelectCompany,
  onSelectPerson,
  onNavigateTab,
  monitoredCount,
  creditsAvailable,
  quickDemos = [],
  onDeleteQuickDemo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('cnpj');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    onSearch(searchTerm.trim(), searchType);
  };

  const activeDemos = quickDemos.filter(d => d.ativo !== false);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero & Primary Search Section - Fully adaptive Light / Dark */}
      <div 
        className="relative rounded-[28px] p-6 sm:p-10 md:p-12 overflow-hidden border shadow-sm transition-all duration-200"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Subtle Ambient Glows */}
        <div 
          className="absolute -top-24 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ backgroundColor: 'var(--accent-subtle)' }}
        />
        <div 
          className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: 'var(--info-subtle)' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide border transition-colors shadow-xs"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              borderColor: 'var(--accent)',
              color: 'var(--text-primary)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>Versão Ilimitada • Acesso Total a Todas as Ferramentas</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Consulta Premium <span style={{ color: 'var(--accent)' }}>360°</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed font-normal" style={{ color: 'var(--text-secondary)' }}>
            Inteligência cadastral e empresarial em uma única plataforma consolidada
          </p>

          {/* Search Box Card */}
          <form onSubmit={handleSubmit} className="pt-4 text-left">
            <div 
              className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl border shadow-sm space-y-3 transition-colors"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              {/* Type Switcher iOS Segmented Pills */}
              <div 
                className="flex items-center gap-1.5 p-1 rounded-xl sm:rounded-2xl overflow-x-auto"
                style={{ backgroundColor: 'var(--surface-tertiary)' }}
              >
                {[
                  { id: 'cnpj' as SearchType, label: 'CNPJ' },
                  { id: 'razao_social' as SearchType, label: 'Empresa / Razão Social' },
                  { id: 'cpf' as SearchType, label: 'CPF (Base Pública)' },
                  { id: 'nome' as SearchType, label: 'Nome da Pessoa' },
                ].map((t) => {
                  const isSelected = searchType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSearchType(t.id)}
                      className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg sm:rounded-xl text-xs font-semibold transition-all duration-150 text-center whitespace-nowrap ${
                        isSelected
                          ? 'shadow-xs font-bold scale-[1.01]'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--surface)' : 'transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Input and Submit Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div 
                  className="relative flex-1 rounded-xl sm:rounded-2xl border transition-colors flex items-center"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--accent)' }} />
                  <input
                    id="input-main-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      searchType === 'cnpj'
                        ? 'Digite o CNPJ (ex: 00.000.000/0001-91)...'
                        : searchType === 'razao_social'
                        ? 'Digite a Razão Social ou Nome Fantasia...'
                        : searchType === 'cpf'
                        ? 'Digite o CPF para consulta pública autorizada...'
                        : 'Digite o nome completo da pessoa...'
                    }
                    className="w-full pl-12 pr-10 py-3.5 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:opacity-50"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  id="btn-submit-search"
                  type="submit"
                  className="px-6 py-3.5 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#000000'
                  }}
                >
                  <Search className="w-4 h-4" />
                  <span>Pesquisar 360°</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Examples Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
              Consultas Rápidas de Exemplo:
            </span>
            
            {activeDemos.length === 0 ? (
              <span className="text-[11px] italic" style={{ color: 'var(--text-tertiary)' }}>
                Nenhum atalho rápido ativo
              </span>
            ) : (
              activeDemos.map((demo) => (
                <div
                  key={demo.id}
                  className="group relative inline-flex items-center"
                >
                  <button
                    onClick={() => {
                      setSearchType(demo.tipo);
                      setSearchTerm(demo.valor);
                      onSearch(demo.valor, demo.tipo);
                    }}
                    className="px-3 py-1.5 text-[11px] rounded-xl transition-all duration-150 border font-medium flex items-center gap-1.5 hover:opacity-85 active:scale-95"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)'
                    }}
                    title={`Clique para pesquisar: ${demo.valor} (${demo.descricao || demo.tipo})`}
                  >
                    <span>{demo.label}</span>
                    {demo.tipo === 'nome' && <User className="w-3 h-3 opacity-60" />}
                  </button>

                  {/* Discrete 'X' delete button */}
                  {onDeleteQuickDemo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteQuickDemo(demo.id);
                      }}
                      className="ml-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                      style={{ color: 'var(--text-tertiary)' }}
                      title={`Remover atalho "${demo.label}"`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}

            {/* Quick config button */}
            <button
              onClick={() => onNavigateTab('configuracoes')}
              className="p-1.5 transition-colors rounded-lg hover:opacity-80"
              style={{ color: 'var(--text-tertiary)' }}
              title="Gerenciar atalhos de Consultas Rápidas"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          className="p-5 rounded-[22px] border shadow-xs transition-all duration-200"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Consultas Realizadas
            </span>
            <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-2xl font-extrabold mt-2" style={{ color: 'var(--text-primary)' }}>
            {recentSearches.length + 140}
          </p>
          <span className="text-[10px] font-semibold mt-1 block" style={{ color: 'var(--success)' }}>
            +18 hoje • Tempo real
          </span>
        </div>

        <div 
          className="p-5 rounded-[22px] border shadow-xs transition-all duration-200"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Empresas Monitoradas
            </span>
            <Radio className="w-4 h-4" style={{ color: 'var(--info)' }} />
          </div>
          <p className="text-2xl font-extrabold mt-2" style={{ color: 'var(--text-primary)' }}>
            {monitoredCount}
          </p>
          <span className="text-[10px] font-medium mt-1 block" style={{ color: 'var(--text-secondary)' }}>
            Varredura diária de alterações
          </span>
        </div>

        <div 
          className="p-5 rounded-[22px] border shadow-xs transition-all duration-200"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Acesso & Consultas
            </span>
            <InfinityIcon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-2xl font-extrabold mt-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <span>Ilimitado</span>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </p>
          <span className="text-[10px] font-semibold mt-1 block" style={{ color: 'var(--success)' }}>
            Todas as funções desbloqueadas
          </span>
        </div>

        <div 
          className="p-5 rounded-[22px] border shadow-xs transition-all duration-200"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Compliance & Auditoria
            </span>
            <FileCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-2xl font-extrabold mt-2" style={{ color: 'var(--text-primary)' }}>
            100%
          </p>
          <span className="text-[10px] font-semibold mt-1 block" style={{ color: 'var(--success)' }}>
            Bases Públicas Oficiais
          </span>
        </div>
      </div>

      {/* Recentes e Módulos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recentes */}
        <div 
          className="lg:col-span-2 rounded-[24px] border p-6 shadow-xs space-y-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Pesquisas Recentes
            </h2>
            <button
              onClick={() => onNavigateTab('historico')}
              className="text-xs font-semibold hover:underline flex items-center gap-1"
              style={{ color: 'var(--accent)' }}
            >
              <span>Ver todas ({recentSearches.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentSearches.length === 0 ? (
            <div className="p-8 text-center text-xs space-y-1">
              <p style={{ color: 'var(--text-secondary)' }}>Nenhuma pesquisa recente registrada nesta sessão.</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Utilize o campo de busca acima para consultar qualquer entidade.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentSearches.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.tipo === 'nome') {
                      onSelectPerson(item.nomeOuRazao);
                    } else {
                      onSelectCompany(item.identificador);
                    }
                  }}
                  className="py-3 flex items-center justify-between px-3 rounded-2xl cursor-pointer transition-colors hover:opacity-85"
                  style={{
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: item.tipo === 'nome' ? 'var(--info-subtle)' : 'var(--accent-subtle)',
                        color: item.tipo === 'nome' ? 'var(--info)' : 'var(--accent)'
                      }}
                    >
                      {item.tipo === 'nome' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                        {item.nomeOuRazao}
                      </h3>
                      <p className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {item.identificador}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                      style={{
                        backgroundColor: 'var(--success-subtle)',
                        color: 'var(--success)',
                        borderColor: 'var(--success-subtle)'
                      }}
                    >
                      {item.situacao}
                    </span>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {item.dataHora}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Módulos & Ferramentas */}
        <div 
          className="rounded-[24px] border p-6 shadow-xs space-y-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Layers className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Módulos & Ferramentas
          </h2>

          <div className="space-y-2.5">
            {[
              {
                id: 'busca_avancada',
                title: 'Busca Avançada & Filtros',
                desc: 'Filtragem por CNAE, UF, Porte e Capital',
                icon: Search,
                colorVar: 'var(--accent)',
                bgVar: 'var(--accent-subtle)'
              },
              {
                id: 'comparar',
                title: 'Comparador de Empresas',
                desc: 'Análise lado a lado de 2 ou mais CNPJs',
                icon: Scale,
                colorVar: 'var(--info)',
                bgVar: 'var(--info-subtle)'
              },
              {
                id: 'monitoramento',
                title: 'Radar de Monitoramento',
                desc: 'Alertas automáticos de quadro societário',
                icon: Radio,
                colorVar: 'var(--success)',
                bgVar: 'var(--success-subtle)'
              },
              {
                id: 'integracoes',
                title: 'Painel de Integrações & APIs',
                desc: 'Hierarquia de órgãos oficiais e telemetria',
                icon: TrendingUp,
                colorVar: 'var(--accent)',
                bgVar: 'var(--accent-subtle)'
              },
            ].map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => onNavigateTab(mod.id)}
                  className="p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 flex items-center justify-between hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: mod.bgVar,
                        color: mod.colorVar
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {mod.title}
                      </h3>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
