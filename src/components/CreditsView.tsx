import React, { useState } from 'react';
import { 
  Coins, 
  Check, 
  Zap 
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
      tipo: 'BASIC' as const,
      nome: 'Plano Básico',
      preco: 'R$ 149/mês',
      limite: 100,
      features: [
        '100 consultas 360°/mês',
        'Quadro Societário (QSA)',
        'Certidões públicas básicas',
        'Exportação em PDF simples',
        '1 usuário cadastrado'
      ]
    },
    {
      tipo: 'PRO' as const,
      nome: 'Plano Profissional',
      preco: 'R$ 399/mês',
      limite: 500,
      popular: true,
      features: [
        '500 consultas 360°/mês',
        'Resumo Inteligente com IA (Gemini 3.7)',
        'Mapeamento de Rede Societária Interativo',
        'Monitoramento de até 20 empresas',
        'Comparador Corporativo até 5 empresas',
        'Exportação PDF Premium + Excel/CSV',
        'Até 5 usuários com controle RBAC'
      ]
    },
    {
      tipo: 'PREMIUM' as const,
      nome: 'Plano Premium Corporativo',
      preco: 'R$ 890/mês',
      limite: 2000,
      features: [
        '2.000 consultas 360°/mês',
        'IA Generativa Ilimitada para dossiês',
        'Monitoramento de até 100 empresas',
        'Acesso prioritário às APIs governamentais',
        'Exportação em lote',
        'Até 20 usuários com logs de auditoria',
        'Suporte dedicado com SLA 2h'
      ]
    },
    {
      tipo: 'ENTERPRISE' as const,
      nome: 'Enterprise / API Dedicada',
      preco: 'Sob Consulta',
      limite: 10000,
      features: [
        'Consultas sob demanda ou volumetria livre',
        'Webhooks e API REST integrada',
        'Infraestrutura isolada dedicada',
        'Usuários ilimitados e Single Sign-On (SSO)',
        'Auditoria estendida LGPD de 5 anos'
      ]
    }
  ];

  const usagePercent = Math.min(100, Math.round((currentPlan.creditosUtilizados / currentPlan.limiteMensal) * 100));

  const handleTopUp = (amount: number) => {
    onAddCredits(amount);
    setPurchasedMessage(`+${amount} créditos adicionados com sucesso ao seu saldo!`);
    setTimeout(() => setPurchasedMessage(null), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div 
        className="rounded-3xl p-6 border shadow-xs transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Coins className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                Gestão de Créditos & Assinatura
              </h1>
              <span 
                className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)'
                }}
              >
                Plano Atual: {currentPlan.tipo}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Acompanhe seu consumo mensal e recarregue créditos avulsos quando necessário
            </p>
          </div>

          {/* Balance Gauge */}
          <div 
            className="p-4 rounded-2xl border min-w-[280px]"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>Saldo Restante</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {currentPlan.creditosDisponiveis} / {currentPlan.limiteMensal}
              </span>
            </div>

            <div 
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--surface-tertiary)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: 'var(--accent)',
                  width: `${100 - usagePercent}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
              <span>{usagePercent}% consumido</span>
              <span>Renovação: {currentPlan.dataRenovacao}</span>
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

      {/* Quick Top-Up Packages */}
      <div 
        className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          Recarga de Créditos Avulsos (Sem mensalidade adicional)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { credits: 50, price: 'R$ 49', bonus: '' },
            { credits: 150, price: 'R$ 119', bonus: '+15 bônus' },
            { credits: 500, price: 'R$ 299', bonus: '+50 bônus' }
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
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>+{pkg.credits} Créditos</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {pkg.price} {pkg.bonus && <span className="font-semibold" style={{ color: 'var(--success)' }}>• {pkg.bonus}</span>}
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
                Comprar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="space-y-4">
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Planos de Assinatura Mensal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = currentPlan.tipo === p.tipo;
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
                {p.popular && (
                  <span 
                    className="absolute -top-2.5 right-4 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#000000'
                    }}
                  >
                    Mais Escolhido
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
                      creditosDisponiveis: p.limite
                    })}
                    disabled={isCurrent}
                    className="w-full py-2.5 rounded-xl font-bold text-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
                    style={{
                      backgroundColor: isCurrent ? 'var(--surface-secondary)' : 'var(--accent)',
                      color: isCurrent ? 'var(--text-secondary)' : '#000000',
                      border: isCurrent ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    {isCurrent ? 'Plano Atual Ativo' : 'Migrar para este Plano'}
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
