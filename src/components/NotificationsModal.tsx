import React from 'react';
import { X, Bell, ExternalLink, CheckCheck } from 'lucide-react';
import { AlertaMonitoramento } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertaMonitoramento[];
  onSelectCompany: (cnpj: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectCompany
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-overlay">
      <div 
        className="rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 border"
        style={{
          backgroundColor: 'var(--modal-background)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between pb-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Notificações e Alertas
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Eventos cadastrais e alterações societárias detectadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:opacity-80"
            style={{ 
              backgroundColor: 'var(--surface-secondary)', 
              color: 'var(--text-secondary)' 
            }}
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-xs space-y-2">
              <CheckCheck className="w-8 h-8 mx-auto" style={{ color: 'var(--text-tertiary)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum alerta recente pendente.</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Suas empresas monitoradas estão com a situação cadastral estável.
              </p>
            </div>
          ) : (
            alerts.map((al) => (
              <div
                key={al.id}
                className="p-4 rounded-2xl border text-xs space-y-2 transition-all duration-150"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                    {al.titulo}
                  </span>
                  <span 
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0"
                    style={{ 
                      backgroundColor: 'var(--surface-tertiary)', 
                      color: 'var(--text-secondary)' 
                    }}
                  >
                    {al.dataHora}
                  </span>
                </div>
                <p 
                  className="text-[11px] leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {al.descricao}
                </p>
                <div 
                  className="pt-2 flex justify-between items-center text-[10px] border-t"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span className="font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    CNPJ: {al.cnpj}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectCompany(al.cnpj);
                    }}
                    className="font-bold hover:underline flex items-center gap-1 transition-opacity"
                    style={{ color: 'var(--accent)' }}
                  >
                    <span>Inspecionar Dossiê</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div 
          className="pt-3 border-t flex justify-between items-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            Total de {alerts.length} notificações
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#000000'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
