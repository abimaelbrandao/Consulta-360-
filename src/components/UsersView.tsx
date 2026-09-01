import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle2, 
  Search
} from 'lucide-react';
import { Usuario, LogAuditoria } from '../types';
import { initialUsers, initialAuditLogs } from '../data/seedData';

export const UsersView: React.FC = () => {
  const [users] = useState<Usuario[]>(initialUsers);
  const [logs] = useState<LogAuditoria[]>(initialAuditLogs);
  const [filterLog, setFilterLog] = useState('');

  const filteredLogs = logs.filter(l => 
    l.usuarioNome.toLowerCase().includes(filterLog.toLowerCase()) ||
    l.acao.toLowerCase().includes(filterLog.toLowerCase()) ||
    l.detalhes.toLowerCase().includes(filterLog.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
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
              <Users className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Usuários, Permissões & Trilha de Auditoria
            </h1>
            <span 
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              {users.length} usuários
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Controle de perfis de acesso (RBAC) e registro imutável de consultas para conformidade regulatória
          </p>
        </div>

        <button
          onClick={() => alert('Para adicionar novos usuários corporativos, convide por email através do painel de administração.')}
          className="px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto hover:opacity-90 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#000000'
          }}
        >
          <UserPlus className="w-4 h-4" />
          <span>Convidar Usuário</span>
        </button>
      </div>

      {/* Users Table */}
      <div 
        className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Users className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          Membros da Organização e Níveis de Acesso
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b font-bold uppercase text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                <th className="py-3 px-3">Nome / Usuário</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Perfil RBAC</th>
                <th className="py-3 px-3">Consultas Este Mês</th>
                <th className="py-3 px-3">Último Acesso</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:opacity-80">
                  <td className="py-3 px-3 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: '#000000'
                        }}
                      >
                        {u.nome.charAt(0)}
                      </div>
                      <span>{u.nome}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>

                  <td className="py-3 px-3">
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold border"
                      style={{
                        backgroundColor: 'var(--accent-subtle)',
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)'
                      }}
                    >
                      {u.perfil}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold" style={{ color: 'var(--text-primary)' }}>
                    {u.consultasRealizadasMes}
                  </td>

                  <td className="py-3 px-3 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {u.ultimoAcesso}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: 'var(--success)' }}>
                      <CheckCircle2 className="w-3 h-3" />
                      {u.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div 
        className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--success)' }} />
            Trilha Imutável de Auditoria de Acesso (LGPD Compliance)
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar nos logs..."
              value={filterLog}
              onChange={(e) => setFilterLog(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b font-bold uppercase text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                <th className="py-3 px-3">Data e Hora</th>
                <th className="py-3 px-3">Usuário</th>
                <th className="py-3 px-3">Ação Realizada</th>
                <th className="py-3 px-3">Detalhes / Alvo</th>
                <th className="py-3 px-3">Endereço IP</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:opacity-80 text-[11px]">
                  <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-tertiary)' }}>{log.dataHora}</td>
                  <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{log.usuarioNome}</td>
                  <td className="py-2.5 px-3 font-medium" style={{ color: 'var(--accent)' }}>{log.acao}</td>
                  <td className="py-2.5 px-3" style={{ color: 'var(--text-secondary)' }}>{log.detalhes}</td>
                  <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--text-tertiary)' }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
