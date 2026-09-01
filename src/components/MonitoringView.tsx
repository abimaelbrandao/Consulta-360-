import React, { useState } from 'react';
import { 
  Radio, 
  Plus, 
  Trash2, 
  Bell, 
  ExternalLink, 
  Building2 
} from 'lucide-react';
import { MonitoramentoEmpresa, AlertaMonitoramento } from '../types';

interface MonitoringViewProps {
  monitoredList: MonitoramentoEmpresa[];
  alertsList: AlertaMonitoramento[];
  onRemoveMonitoring: (id: string) => void;
  onSelectCompany: (cnpj: string) => void;
  onAddManualMonitoring: (cnpj: string, razao: string) => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  monitoredList,
  alertsList,
  onRemoveMonitoring,
  onSelectCompany,
  onAddManualMonitoring
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCnpj, setNewCnpj] = useState('');
  const [newRazao, setNewRazao] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCnpj.trim()) return;
    onAddManualMonitoring(newCnpj.trim(), newRazao.trim() || 'Empresa Cadastrada');
    setNewCnpj('');
    setNewRazao('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div 
        className="rounded-3xl p-6 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Radio className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Painel de Monitoramento Contínuo
            </h1>
            <span 
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)'
              }}
            >
              <Radio className="w-3 h-3 animate-pulse" />
              Ativo
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Varredura automática e alertas de alterações no QSA, Certidões e Situação Cadastral
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto hover:opacity-90 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#000000'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Monitorar Nova Empresa</span>
        </button>
      </div>

      {/* Grid: Monitored Companies & Recent Alterations Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Monitored Companies */}
        <div className="lg:col-span-2 space-y-4">
          <div 
            className="rounded-3xl p-5 border shadow-xs space-y-4 transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Building2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                Empresas em Acompanhamento Ativo ({monitoredList.length})
              </h2>
            </div>

            {monitoredList.length === 0 ? (
              <div className="p-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Nenhuma empresa cadastrada no monitoramento.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {monitoredList.map((m) => (
                  <div
                    key={m.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{m.razaoSocial}</p>
                        <span 
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: 'var(--success-subtle)',
                            borderColor: 'var(--success-subtle)',
                            color: 'var(--success)'
                          }}
                        >
                          {m.situacaoAtual}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        CNPJ: {m.cnpj} • Frequência: {m.frequencia}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        Última checagem: {m.dataUltimaChecagem}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => onSelectCompany(m.cnpj)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all border hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <span>Ver Dossiê</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveMonitoring(m.id)}
                        className="p-1.5 rounded-xl transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Parar monitoramento"
                      >
                        <Trash2 className="w-4 h-4 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Alerts History Feed */}
        <div 
          className="rounded-3xl p-5 border shadow-xs space-y-4 transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Bell className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Histórico de Alterações
            </h2>
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-tertiary)' }}>Tempo Real</span>
          </div>

          <div className="space-y-3">
            {alertsList.map((al) => (
              <div
                key={al.id}
                className="p-3.5 rounded-2xl border text-xs space-y-1.5"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between gap-1">
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-bold border"
                    style={{
                      backgroundColor: 'var(--accent-subtle)',
                      borderColor: 'var(--accent)',
                      color: 'var(--accent)'
                    }}
                  >
                    {al.tipoAlerta.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{al.dataHora}</span>
                </div>

                <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{al.titulo}</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{al.descricao}</p>
                
                <div className="pt-1 flex items-center justify-between text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span>CNPJ: {al.cnpj}</span>
                  <button
                    onClick={() => onSelectCompany(al.cnpj)}
                    className="hover:underline font-bold"
                    style={{ color: 'var(--accent)' }}
                  >
                    Inspecionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 modal-backdrop-overlay z-50 flex items-center justify-center p-4">
          <div 
            className="rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border animate-in fade-in zoom-in-95"
            style={{
              backgroundColor: 'var(--modal-background)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Cadastrar Empresa para Monitoramento
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              O sistema fará checagens automáticas periódicas e registrará qualquer alteração cadastral ou fiscal pública.
            </p>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  CNPJ
                </label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0001-91"
                  value={newCnpj}
                  onChange={(e) => setNewCnpj(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Razão Social (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Nome da empresa..."
                  value={newRazao}
                  onChange={(e) => setNewRazao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs rounded-xl transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-xs rounded-xl shadow-xs transition-all hover:opacity-90 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#000000'
                  }}
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
