import React, { useState } from 'react';
import { 
  Coins, 
  Check, 
  Zap, 
  Sparkles, 
  Infinity as InfinityIcon, 
  ShieldCheck, 
  Layers, 
  BrainCircuit, 
  Radio, 
  Scale, 
  FileSpreadsheet, 
  FileText, 
  Users 
} from 'lucide-react';
import { PlanoCreditos } from '../types';

interface CreditsViewProps {
  currentPlan: PlanoCreditos;
  onSelectPlan: (plan: PlanoCreditos) => void;
  onAddCredits: (amount: number) => void;
}

export const CreditsView: React.FC<CreditsViewProps> = ({
  currentPlan,
  onSelectPlan,
  onAddCredits
}) => {
  const [purchasedMessage, setPurchasedMessage] = useState<string | null>(null);

  const plans = [
    {
      tipo: 'UNLIMITED' as const,
      nome: 'Versão Ilimitada Master',
      preco: 'Acesso Total Vitalício',
      limite: 999999,
      isUnlimited: true,
      destaque: true,
      features: [
        'Consultas 360° Ilimitadas (CNPJ, CPF, Razão Social e Sócios)',
        'IA Generativa Gemini 3.7 Ilimitada (Dossiês e Insights)',
        'Mapeamento de Rede Societária 2D/3D Completo',
        'Monitoramento Contínuo Ilimitado de Empresas',
        'Comparador Corporativo Multi-Empresas sem limites',
        'Exportação em Relatório PDF Premium e Planilhas Excel/CSV',
        'Data Provider Hub com 100% dos Provedores e Fontes Oficiais',
        'Gestão de Usuários RBAC e Trilha de Auditoria LGPD'
      ]
    },
    {
      tipo: 'ENTERPRISE' as const,
      nome: 'Plano Corporativo',
      preco: 'R$ 1.890/mês',
      limite: 10000,
      features: [
        '10.000 consultas 360°/mês',
        'IA Generativa e Resumo Inteligente',
        'Monitoramento de até 500 empresas',
        'Webhooks e API REST Dedicada',
        'Até 50 usuários com perfis customizados'
      ]
    },
    {
      tipo: 'PREMIUM' as const,
      nome: 'Plano Premium',
      preco: 'R$ 890/mês',
      limite: 2000,
      features: [
        '2.000 consultas 360°/mês',
        'Dossiês com IA Generativa',
        'Monitoramento de até 100 empresas',
        'Exportação em Lote',
        'Até 20 usuários com logs de auditoria'
      ]
    },
    {
      tipo: 'PRO' as const,
      nome: 'Plano Profissional',
      preco: 'R$ 399/mês',
      limite: 500,
      features: [
        '500 consultas 360°/mês',
        'Resumo Básico com IA',
        'Monitoramento de até 20 empresas',
        'Comparador até 5 empresas',
        'Até 5 usuários'
      ]
    }
  ];

  const handleTopUp = (amount: number) => {
    onAddCredits(amount);
    setPurchasedMessage(`+${amount} créditos adicionados ao histórico de consultas!`);
    setTimeout(() => setPurchasedMessage(null), 3000);
  };

  const unlockedModules = [
    {
      icon: Layers,
      title: 'Data Provider Hub 360°',
      desc: 'Todas as fontes públicas e provedores oficiais conectados simultaneamente com cruzamento automático.'
    },
    {
      icon: BrainCircuit,
      title: 'IA Generativa Gemini 3.7',
      desc: 'Geração de diagnósticos de risco, resumo executivo de compliance e análise preditiva sem limite.'
    },
    {
      icon: Radio,
      title: 'Monitoramento Contínuo',
      desc: 'Varredura automática e alertas de alterações cadastrais, judiciais e de certidões em tempo real.'
    },
    {
      icon: Scale,
      title: 'Comparador Corporativo',
      desc: 'Análise lado a lado de múltiplos concorrentes, sócios cruzados, certidões e saúde fiscal.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Exportações Executivas',
      desc: 'Relatórios completos em PDF Premium com identidade visual corporativa, CSV e planilhas Excel.'
    },
    {
      icon: Users,
      title: 'Governança & Auditoria LGPD',
      desc: 'Gestão de usuários por perfis RBAC e registro imutável de todas as consultas realizadas.'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner - Unlimited Master Edition */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border shadow-sm transition-colors relative overflow-hidden"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--accent)'
        }}
      >
        <div 
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: 'var(--accent)' }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border shadow-xs"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Versão Ilimitada Master Ativa</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Acesso Total & Recursos Ilimitados
            </h1>

            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Você está utilizando a edição com <strong>acesso ilimitado a todas as funções</strong> da plataforma. Todas as consultas, cruzamentos de fontes, recursos de inteligência artificial e ferramentas executivas estão 100% liberados.
            </p>
          </div>

          {/* Balance Gauge - Unlimited */}
          <div 
            className="p-5 rounded-2xl border min-w-[290px] shadow-xs"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Capacidade de Consultas</span>
              <span className="font-extrabold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                <InfinityIcon className="w-4 h-4" />
                <span>Ilimitada (∞)</span>
              </span>
            </div>

            <div 
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--surface-tertiary)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: 'var(--accent)',
                  width: '100%'
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] mt-2 font-medium" style={{ color: 'var(--text-tertiary)' }}>
              <span>{currentPlan.creditosUtilizados} consultas efetuadas</span>
              <span className="font-semibold" style={{ color: 'var(--success)' }}>Sem teto de consumo</span>
            </div>
          </div>
        </div>

        {purchasedMessage && (
          <div 
            className="mt-4 p-3 border text-xs rounded-2xl flex items-center gap-2"
            style={{
              backgroundColor: 'var(--success-subtle)',
              borderColor: 'var(--success-subtle)',
              color: 'var(--success)'
            }}
          >
            <Check className="w-4 h-4" style={{ color: 'var(--success)' }} />
            <span>{purchasedMessage}</span>
          </div>
        )}
      </div>

      {/* Unlocked Features Grid */}
      <div 
        className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Funcionalidades Desbloqueadas nesta Versão
          </h2>
          <span 
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
            style={{
              backgroundColor: 'var(--success-subtle)',
              borderColor: 'var(--success)',
              color: 'var(--success)'
            }}
          >
            6/6 Módulos Ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlockedModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div 
                key={idx}
                className="p-4 rounded-2xl border space-y-2 transition-all hover:border-[var(--accent)]"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="p-2 rounded-xl"
                    style={{
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent)'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {mod.title}
                  </h3>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {mod.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Top-Up / Extra Quota Simulation */}
      <div 
        className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          Pacotes de Integração Adicionais & Simulação de Volume
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { credits: 500, price: 'Incluso no Plano', bonus: 'Livre de custo' },
            { credits: 2000, price: 'Incluso no Plano', bonus: 'Alta performance' },
            { credits: 10000, price: 'Incluso no Plano', bonus: 'Dedicado' }
          ].map((pkg, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>+{pkg.credits} Consultas</p>
                <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                  {pkg.price} • {pkg.bonus}
                </p>
              </div>
              <button
                onClick={() => handleTopUp(pkg.credits)}
                className="px-3.5 py-1.5 font-bold text-xs rounded-xl transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#000000'
                }}
              >
                Registrar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Coins className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          Estrutura de Planos da Plataforma
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = currentPlan.tipo === p.tipo || (p.tipo === 'UNLIMITED' && (currentPlan.isUnlimited || currentPlan.tipo === 'UNLIMITED'));
            return (
              <div
                key={p.tipo}
                className="p-5 rounded-3xl border transition-all flex flex-col justify-between relative shadow-xs"
                style={{
                  backgroundColor: isCurrent ? 'var(--accent-subtle)' : 'var(--surface)',
                  borderColor: isCurrent ? 'var(--accent)' : 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                {p.destaque && (
                  <span 
                    className="absolute -top-2.5 right-4 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#000000'
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Versão Atual
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{p.nome}</h3>
                    <p className="text-xl font-black mt-1" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {p.preco}
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: isCurrent ? 'var(--accent)' : 'var(--success)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => onSelectPlan({
                      ...currentPlan,
                      tipo: p.tipo,
                      limiteMensal: p.limite,
                      creditosDisponiveis: p.limite,
                      isUnlimited: p.tipo === 'UNLIMITED'
                    })}
                    disabled={isCurrent}
                    className="w-full py-2.5 rounded-xl font-bold text-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-75 cursor-pointer"
                    style={{
                      backgroundColor: isCurrent ? 'var(--accent)' : 'var(--surface-secondary)',
                      color: isCurrent ? '#000000' : 'var(--text-primary)',
                      border: isCurrent ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    {isCurrent ? '✓ Plano Ativo & Desbloqueado' : 'Selecionar Plano'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
