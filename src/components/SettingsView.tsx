import React, { useState } from 'react';
import { 
  Settings, 
  ShieldAlert, 
  Lock, 
  FileCheck2, 
  EyeOff, 
  Database, 
  Sliders, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Sparkles, 
  Zap, 
  Sun, 
  Moon, 
  Laptop 
} from 'lucide-react';
import { ConsultaRapida, SearchType, ThemePreference } from '../types';

interface SettingsViewProps {
  quickDemos: ConsultaRapida[];
  onAddQuickDemo: (demo: Omit<ConsultaRapida, 'id' | 'ordem'>) => Promise<void> | void;
  onUpdateQuickDemo: (id: string, updates: Partial<ConsultaRapida>) => Promise<void> | void;
  onDeleteQuickDemo: (id: string) => Promise<void> | void;
  onReorderQuickDemos: (orderedIds: string[]) => Promise<void> | void;
  themePreference?: ThemePreference;
  setThemePreference?: (pref: ThemePreference) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  quickDemos,
  onAddQuickDemo,
  onUpdateQuickDemo,
  onDeleteQuickDemo,
  onReorderQuickDemos,
  themePreference = 'system',
  setThemePreference
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'lgpd' | 'consultas_rapidas' | 'preferencias'>('consultas_rapidas');

  // Form State for Adding / Editing Quick Demo
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    label: string;
    tipo: SearchType;
    valor: string;
    descricao: string;
    ativo: boolean;
  }>({
    label: '',
    tipo: 'cnpj',
    valor: '',
    descricao: '',
    ativo: true
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal for delete confirmation
  const [demoToDelete, setDemoToDelete] = useState<ConsultaRapida | null>(null);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData({
      label: '',
      tipo: 'cnpj',
      valor: '',
      descricao: '',
      ativo: true
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (demo: ConsultaRapida) => {
    setEditingId(demo.id);
    setFormData({
      label: demo.label,
      tipo: demo.tipo,
      valor: demo.valor,
      descricao: demo.descricao || '',
      ativo: demo.ativo
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      setFormError('Informe o nome/label do atalho.');
      return;
    }
    if (!formData.valor.trim()) {
      setFormError('Informe o termo/valor da busca.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (editingId) {
        await onUpdateQuickDemo(editingId, {
          label: formData.label.trim(),
          tipo: formData.tipo,
          valor: formData.valor.trim(),
          descricao: formData.descricao.trim(),
          ativo: formData.ativo
        });
      } else {
        await onAddQuickDemo({
          label: formData.label.trim(),
          tipo: formData.tipo,
          valor: formData.valor.trim(),
          descricao: formData.descricao.trim(),
          ativo: formData.ativo
        });
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar consulta rápida.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= quickDemos.length) return;

    const newOrder = [...quickDemos];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    const orderedIds = newOrder.map(d => d.id);
    await onReorderQuickDemos(orderedIds);
  };

  const handleConfirmDelete = async () => {
    if (!demoToDelete) return;
    try {
      await onDeleteQuickDemo(demoToDelete.id);
      setDemoToDelete(null);
    } catch (e) {
      console.error(e);
    }
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
              <Settings className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Configurações do Sistema
            </h1>
            <span 
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--success-subtle)',
                borderColor: 'var(--success-subtle)',
                color: 'var(--success)'
              }}
            >
              100% Conforme LGPD
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gerenciamento de atalhos de busca rápida, políticas de privacidade e parâmetros do motor de consulta
          </p>
        </div>

        {/* Navigation Tabs inside Settings */}
        <div 
          className="flex items-center gap-1.5 p-1 rounded-2xl self-start sm:self-auto text-xs border"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)'
          }}
        >
          <button
            onClick={() => setActiveSubTab('consultas_rapidas')}
            className="px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: activeSubTab === 'consultas_rapidas' ? 'var(--surface)' : 'transparent',
              color: activeSubTab === 'consultas_rapidas' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'consultas_rapidas' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>Consultas Rápidas</span>
          </button>

          <button
            onClick={() => setActiveSubTab('lgpd')}
            className="px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: activeSubTab === 'lgpd' ? 'var(--surface)' : 'transparent',
              color: activeSubTab === 'lgpd' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'lgpd' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <ShieldAlert className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
            <span>Governança & LGPD</span>
          </button>

          <button
            onClick={() => setActiveSubTab('preferencias')}
            className="px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: activeSubTab === 'preferencias' ? 'var(--surface)' : 'transparent',
              color: activeSubTab === 'preferencias' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeSubTab === 'preferencias' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>Preferências</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Consultas Rápidas (Configurações → Consultas Rápidas) */}
      {activeSubTab === 'consultas_rapidas' && (
        <div className="space-y-6">
          <div 
            className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  Gerenciamento de Consultas Rápidas de Exemplo
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Personalize os botões de atalho exibidos na página inicial. A exclusão de um atalho não remove o cadastro da empresa do sistema.
                </p>
              </div>

              <button
                id="btn-add-quick-demo"
                onClick={handleOpenAddForm}
                className="px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-xs hover:opacity-90 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#000000'
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Nova Consulta Rápida</span>
              </button>
            </div>

            {/* Quick Demo Form (Add or Edit) */}
            {isFormOpen && (
              <form 
                onSubmit={handleSubmitForm} 
                className="p-5 border rounded-2xl space-y-4 animate-in fade-in"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                    <span>{editingId ? 'Editar Consulta Rápida' : 'Adicionar Nova Consulta Rápida'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1 hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {formError && (
                  <div 
                    className="p-2.5 border rounded-xl text-xs"
                    style={{
                      backgroundColor: 'var(--danger-subtle)',
                      borderColor: 'var(--danger-subtle)',
                      color: 'var(--danger)'
                    }}
                  >
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Nome / Label */}
                  <div>
                    <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Nome / Label do Atalho *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Petrobras S.A."
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Tipo da Consulta */}
                  <div>
                    <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Tipo da Consulta *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as SearchType }))}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="cnpj">CNPJ</option>
                      <option value="razao_social">Razão Social / Fantasia</option>
                      <option value="cpf">CPF</option>
                      <option value="nome">Nome da Pessoa</option>
                    </select>
                  </div>

                  {/* Termo Utilizado na Busca */}
                  <div>
                    <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Termo Utilizado na Busca *
                    </label>
                    <input
                      type="text"
                      placeholder={formData.tipo === 'cnpj' ? '00.000.000/0001-91' : 'Termo para busca...'}
                      value={formData.valor}
                      onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-mono focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Descrição Opcional */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Descrição / Categoria (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Empresa Estatal de Energia"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Ativo Switch */}
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={formData.ativo}
                        onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span>Exibir atalho na página inicial</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-3.5 py-1.5 text-xs rounded-xl transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 font-bold text-xs rounded-xl shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#000000'
                    }}
                  >
                    {isSubmitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Atalho'}
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demos List */}
            {quickDemos.length === 0 ? (
              <div className="p-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Nenhum atalho de consulta rápida cadastrado. Clique no botão &quot;Nova Consulta Rápida&quot; acima para criar atalhos personalizados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b font-bold uppercase text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                      <th className="py-3 px-3 w-16 text-center">Ordem</th>
                      <th className="py-3 px-4">Nome do Atalho</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Termo Consultado</th>
                      <th className="py-3 px-4">Descrição</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {quickDemos.map((demo, idx) => (
                      <tr key={demo.id} className="transition-colors hover:opacity-80">
                        {/* Order & Reorder arrows */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <button
                              onClick={() => handleMove(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 disabled:opacity-20 rounded hover:opacity-80"
                              style={{ color: 'var(--text-tertiary)' }}
                              title="Subir posição"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMove(idx, 'down')}
                              disabled={idx === quickDemos.length - 1}
                              className="p-1 disabled:opacity-20 rounded hover:opacity-80"
                              style={{ color: 'var(--text-tertiary)' }}
                              title="Descer posição"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Label */}
                        <td className="py-3 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold border"
                              style={{
                                backgroundColor: 'var(--accent-subtle)',
                                borderColor: 'var(--accent)',
                                color: 'var(--accent)'
                              }}
                            >
                              {idx + 1}
                            </span>
                            <span>{demo.label}</span>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3 px-4">
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-bold border"
                            style={{
                              backgroundColor: 'var(--surface-secondary)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {demo.tipo === 'cnpj' ? 'CNPJ' : demo.tipo === 'nome' ? 'Nome da Pessoa' : demo.tipo === 'cpf' ? 'CPF' : 'Razão Social / Fantasia'}
                          </span>
                        </td>

                        {/* Value */}
                        <td className="py-3 px-4 font-mono text-[11px]" style={{ color: 'var(--text-primary)' }}>
                          {demo.valor}
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                          {demo.descricao || '-'}
                        </td>

                        {/* Active Toggle Switch */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onUpdateQuickDemo(demo.id, { ativo: !demo.ativo })}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors border cursor-pointer"
                            style={{
                              backgroundColor: demo.ativo ? 'var(--success-subtle)' : 'var(--surface-secondary)',
                              borderColor: demo.ativo ? 'var(--success-subtle)' : 'var(--border)',
                              color: demo.ativo ? 'var(--success)' : 'var(--text-tertiary)'
                            }}
                            title={demo.ativo ? 'Clique para desativar' : 'Clique para ativar'}
                          >
                            {demo.ativo ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>

                        {/* Actions: Edit & Delete */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditForm(demo)}
                              className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                              style={{ color: 'var(--text-secondary)' }}
                              title="Editar consulta rápida"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDemoToDelete(demo)}
                              className="p-1.5 rounded-lg transition-colors hover:text-red-500"
                              style={{ color: 'var(--text-tertiary)' }}
                              title="Excluir atalho"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: Governança & LGPD */}
      {activeSubTab === 'lgpd' && (
        <div 
          className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShieldAlert className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Compromisso Legal de Transparência e Privacidade
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div 
              className="p-4 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <FileCheck2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
                1. Fontes Públicas e Oficiais
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                O <strong>Consulta Premium 360</strong> opera estritamente com dados de acesso público disponibilizados por órgãos governamentais (Receita Federal do Brasil, Secretarias de Estado da Fazenda, Tribunais de Justiça e Diários Oficiais), em conformidade com a Lei de Acesso à Informação (Lei nº 12.527/2011).
              </p>
            </div>

            <div 
              className="p-4 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <EyeOff className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                2. Veto Absoluto a Dados Clandestinos
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                É terminantemente proibido e estruturalmente impossível o processamento de dados vazados, bases sigilosas, informações financeiras confidenciais, prontuários de saúde ou geolocalizações privadas.
              </p>
            </div>

            <div 
              className="p-4 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Lock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                3. Máscara Protetiva de CPF e LGPD
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Documentos de pessoas físicas constantes em quadros societários públicos são mascarados (***.xxx.xxx-**) por padrão para prevenir fraudes e proteger a privacidade dos titulares conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              </p>
            </div>

            <div 
              className="p-4 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Database className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                4. Retenção & Direito de Exclusão do Histórico
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                O histórico de buscas pode ser excluído individualmente, em massa ou totalmente pelo usuário a qualquer momento na aba &quot;Minhas Pesquisas&quot;. A exclusão do histórico remove apenas os registros daquela conta, preservando a integridade dos cadastros públicos compartilhados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Preferências */}
      {activeSubTab === 'preferencias' && (
        <div 
          className="rounded-3xl p-6 border shadow-xs space-y-6 transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div>
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Sun className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Aparência do Sistema
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Personalize o tema visual da interface (Claro, Escuro ou Sincronizado com o Sistema Operacional).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {[
                { id: 'light' as ThemePreference, label: 'Modo Claro', desc: 'Visual clássico de alto contraste', icon: Sun },
                { id: 'dark' as ThemePreference, label: 'Modo Escuro', desc: 'Conforto visual para baixa luminosidade', icon: Moon },
                { id: 'system' as ThemePreference, label: 'Automático (Sistema)', desc: 'Segue a preferência do seu dispositivo', icon: Laptop },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = themePreference === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setThemePreference && setThemePreference(item.id)}
                    className="p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--surface-secondary)',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                          color: isSelected ? '#000000' : 'var(--text-secondary)'
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--accent)',
                            color: '#000000'
                          }}
                        >
                          Ativo
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-xs block" style={{ color: 'var(--text-primary)' }}>
                      {item.label}
                    </span>
                    <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-5" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
              <Settings className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Preferências de Relatório e Consulta
            </h2>

            <div className="space-y-3 text-xs">
              <label 
                className="flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div>
                  <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Auto-gerar Resumo IA em todas as consultas</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Gera parecer analítico executivo automaticamente ao abrir qualquer CNPJ</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} />
              </label>

              <label 
                className="flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div>
                  <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Notificações push de alterações monitoradas</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Emitir aviso instantâneo quando uma empresa monitorada sofrer alteração no QSA</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} />
              </label>

              <label 
                className="flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div>
                  <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Modo Econômico de Dados & Cache Diferenciado</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Consome cache otimizado das últimas 4 horas para consultas repetidas</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Delete Shortcut Modal */}
      {demoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-overlay animate-in fade-in duration-150">
          <div 
            className="rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border"
            style={{
              backgroundColor: 'var(--modal-background)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: 'var(--danger-subtle)',
                  borderColor: 'var(--danger-subtle)',
                  color: 'var(--danger)'
                }}
              >
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Excluir atalho de consulta rápida?
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  O atalho &quot;<strong>{demoToDelete.label}</strong>&quot; deixará de aparecer na lista de exemplos da tela inicial.
                </p>
              </div>
            </div>

            <div 
              className="p-3 rounded-xl border text-xs"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              <p>Tipo: <strong style={{ color: 'var(--text-primary)' }}>{demoToDelete.tipo}</strong></p>
              <p>Termo: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{demoToDelete.valor}</strong></p>
            </div>

            <p className="text-[11px] italic" style={{ color: 'var(--text-tertiary)' }}>
              Esta ação remove apenas o botão de atalho. O cadastro da entidade permanece integralmente preservado no banco de dados.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setDemoToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir atalho</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
