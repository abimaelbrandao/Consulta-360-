import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Bell, 
  UserCheck, 
  Coins, 
  Moon, 
  Sun,
  Laptop,
  ChevronDown,
  Sparkles,
  Infinity as InfinityIcon
} from 'lucide-react';
import { Usuario, ThemePreference } from '../types';

interface NavbarProps {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  isDark: boolean;
  currentUser: Usuario;
  setCurrentUser: (u: Usuario) => void;
  usersList: Usuario[];
  creditsUsed: number;
  creditsLimit: number;
  onQuickSearchClick: () => void;
  activeNotificationsCount: number;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  themePreference,
  setThemePreference,
  isDark,
  currentUser,
  setCurrentUser,
  usersList,
  creditsUsed,
  creditsLimit,
  onQuickSearchClick,
  activeNotificationsCount,
  onOpenNotifications
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const remainingCredits = Math.max(0, creditsLimit - creditsUsed);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className="h-16 border-b backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs transition-transform hover:scale-105 duration-200"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#000000'
          }}
        >
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>
              Consulta Premium <span style={{ color: 'var(--accent)' }}>360°</span>
            </span>
            <span 
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)'
              }}
            >
              <Sparkles className="w-3 h-3" />
              Versão Ilimitada
            </span>
          </div>
          <p className="text-[11px] hidden sm:block font-normal" style={{ color: 'var(--text-secondary)' }}>
            Acesso Total Desbloqueado • Fontes Oficiais 360°
          </p>
        </div>
      </div>

      {/* Center Search Shortcut (Desktop) */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <button
          id="btn-global-quick-search"
          onClick={onQuickSearchClick}
          className="w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-2xl border transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span className="font-normal">Consultar CNPJ, Razão Social ou Nome...</span>
          </div>
          <kbd 
            className="hidden lg:inline-flex items-center px-2 py-0.5 text-[10px] font-medium border rounded-md shadow-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-tertiary)'
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Unlimited Access Badge */}
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--accent-subtle)',
            borderColor: 'var(--accent)'
          }}
          title="Versão Ilimitada: você possui acesso total a todas as consultas, recursos de IA e exportações."
        >
          <InfinityIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
          <div className="text-right">
            <span className="text-xs font-black block leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Ilimitado
            </span>
            <span className="text-[9px] block leading-none font-bold" style={{ color: 'var(--accent)' }}>
              Acesso Total
            </span>
          </div>
        </div>

        {/* Notifications */}
        <button
          id="btn-notifications"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-2xl border transition-all duration-150 cursor-pointer hover:opacity-80"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)'
          }}
          title="Notificações e Alertas"
        >
          <Bell className="w-4 h-4" />
          {activeNotificationsCount > 0 && (
            <span 
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2"
              style={{
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--surface)'
              }}
            />
          )}
        </button>

        {/* Theme Selector (Segmented / Dropdown iOS style) */}
        <div className="relative" ref={themeMenuRef}>
          <button
            id="btn-theme-selector"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-2xl border transition-all duration-150 flex items-center gap-1 cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
            title={`Aparência: ${themePreference === 'system' ? 'Sistema' : themePreference === 'dark' ? 'Escuro' : 'Claro'}`}
          >
            {themePreference === 'system' ? (
              <Laptop className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            ) : isDark ? (
              <Moon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            ) : (
              <Sun className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            )}
          </button>

          {showThemeMenu && (
            <div 
              className="absolute right-0 mt-2 w-44 backdrop-blur-xl rounded-2xl shadow-xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Aparência
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'light' as ThemePreference, label: 'Claro', icon: Sun },
                  { id: 'dark' as ThemePreference, label: 'Escuro', icon: Moon },
                  { id: 'system' as ThemePreference, label: 'Sistema', icon: Laptop },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = themePreference === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setThemePreference(item.id);
                        setShowThemeMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                        color: isSelected ? '#000000' : 'var(--text-primary)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? '#000000' : 'var(--text-secondary)' }} />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <span className="text-[10px] font-bold">●</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User RBAC Selector */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="btn-user-profile-menu"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)'
            }}
          >
            <div 
              className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000000'
              }}
            >
              {currentUser.nome.charAt(0)}
            </div>
            <div className="hidden lg:block">
              <span className="text-xs font-semibold block leading-tight" style={{ color: 'var(--text-primary)' }}>
                {currentUser.nome}
              </span>
              <span className="text-[10px] font-medium block leading-none" style={{ color: 'var(--accent)' }}>
                {currentUser.perfil}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 backdrop-blur-xl rounded-2xl shadow-xl border py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="px-3.5 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{currentUser.nome}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{currentUser.email}</p>
                <span 
                  className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)'
                  }}
                >
                  Perfil: {currentUser.perfil}
                </span>
              </div>

              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Alternar Usuário de Demonstração
              </div>

              <div className="px-1.5 space-y-0.5">
                {usersList.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => {
                      setCurrentUser(usr);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer"
                    style={{
                      backgroundColor: usr.id === currentUser.id ? 'var(--accent-subtle)' : 'transparent',
                      color: usr.id === currentUser.id ? 'var(--accent)' : 'var(--text-primary)'
                    }}
                  >
                    <div>
                      <span className="block font-medium">{usr.nome}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{usr.perfil}</span>
                    </div>
                    {usr.id === currentUser.id && <UserCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
