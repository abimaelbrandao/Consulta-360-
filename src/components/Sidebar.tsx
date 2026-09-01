import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  History, 
  Radio, 
  Scale, 
  Filter, 
  FileText, 
  Coins, 
  Network, 
  Users, 
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type ActiveNavTab = 
  | 'dashboard' 
  | 'nova_consulta' 
  | 'historico' 
  | 'monitoramento' 
  | 'comparar' 
  | 'busca_avancada' 
  | 'relatorios' 
  | 'creditos' 
  | 'integracoes' 
  | 'usuarios' 
  | 'configuracoes';

interface SidebarProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  favoritesCount: number;
  monitoringCount: number;
  isAdmin: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  monitoringCount,
  isAdmin
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard' as ActiveNavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'nova_consulta' as ActiveNavTab, label: 'Nova Consulta 360°', icon: Search, badge: 'Principal' },
    { id: 'historico' as ActiveNavTab, label: 'Minhas Pesquisas', icon: History, count: favoritesCount > 0 ? favoritesCount : undefined },
    { id: 'monitoramento' as ActiveNavTab, label: 'Monitoramento', icon: Radio, count: monitoringCount },
    { id: 'comparar' as ActiveNavTab, label: 'Comparar Empresas', icon: Scale },
    { id: 'busca_avancada' as ActiveNavTab, label: 'Busca Avançada', icon: Filter },
    { id: 'relatorios' as ActiveNavTab, label: 'Relatórios Gerados', icon: FileText },
    { id: 'creditos' as ActiveNavTab, label: 'Créditos & Planos', icon: Coins },
  ];

  const adminItems = [
    { id: 'integracoes' as ActiveNavTab, label: 'Integrações (APIs)', icon: Network, adminOnly: true },
    { id: 'usuarios' as ActiveNavTab, label: 'Usuários & Permissões', icon: Users, adminOnly: true },
    { id: 'configuracoes' as ActiveNavTab, label: 'Configurações', icon: Settings, adminOnly: false },
  ];

  return (
    <aside 
      className={`border-r backdrop-blur-xl p-3 flex flex-col justify-between hidden md:flex shrink-0 transition-all duration-200 ${
        collapsed ? 'w-18' : 'w-60'
      }`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="space-y-6">
        {/* Collapse toggle button */}
        <div className="flex items-center justify-between px-2">
          {!collapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Inteligência
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-xl transition-colors ml-auto cursor-pointer hover:opacity-80"
            style={{ color: 'var(--text-tertiary)' }}
            title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Menu items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  collapsed ? 'justify-center px-0' : ''
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#000000' : 'var(--text-secondary)',
                  fontWeight: isActive ? '700' : '500'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? '#000000' : 'var(--text-tertiary)' }} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span 
                    className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold border"
                    style={{
                      backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'var(--accent-subtle)',
                      borderColor: isActive ? 'transparent' : 'var(--accent)',
                      color: isActive ? '#000000' : 'var(--accent)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {!collapsed && item.count !== undefined && item.count > 0 && (
                  <span 
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'var(--surface-secondary)',
                      color: isActive ? '#000000' : 'var(--text-secondary)'
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Secondary Management Menu */}
        <div>
          {!collapsed && (
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Gestão
            </div>
          )}
          <nav className="space-y-1">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    collapsed ? 'justify-center px-0' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? '#000000' : 'var(--text-secondary)',
                    fontWeight: isActive ? '700' : '500'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? '#000000' : 'var(--text-tertiary)' }} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && item.adminOnly && !isAdmin && (
                    <span 
                      className="text-[9px] px-1 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-tertiary)'
                      }}
                    >
                      Restrito
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Compliance Box */}
      {!collapsed && (
        <div 
          className="p-3 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: 'var(--success)' }}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Conformidade Legal</span>
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Dados 100% públicos oficiais em estrita observância à LGPD.
          </p>
        </div>
      )}
    </aside>
  );
};
