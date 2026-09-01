import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Star, 
  Trash2, 
  Building2, 
  User, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  ShieldAlert 
} from 'lucide-react';
import { ConsultaHistorico } from '../types';

interface HistoryViewProps {
  historyList: ConsultaHistorico[];
  onToggleFavorite: (id: string) => void;
  onSelectCompany: (cnpj: string) => void;
  onSelectPerson: (name: string) => void;
  onDeleteSingle: (id: string) => Promise<void> | void;
  onDeleteBulk: (ids: string[]) => Promise<void> | void;
  onClearHistory: () => Promise<void> | void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyList,
  onToggleFavorite,
  onSelectCompany,
  onSelectPerson,
  onDeleteSingle,
  onDeleteBulk,
  onClearHistory
}) => {
  const [filterText, setFilterText] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [itemToDelete, setItemToDelete] = useState<ConsultaHistorico | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = historyList.filter(item => {
    const matchesText = 
      item.nomeOuRazao.toLowerCase().includes(filterText.toLowerCase()) ||
      item.identificador.toLowerCase().includes(filterText.toLowerCase());
    const matchesFav = onlyFavorites ? item.favorito : true;
    return matchesText && matchesFav;
  });

  const isAllSelected = filtered.length > 0 && filtered.every(item => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(item => item.id));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Confirm Single Delete
  const handleConfirmSingleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsProcessing(true);
      await onDeleteSingle(itemToDelete.id);
      setSelectedIds(prev => prev.filter(id => id !== itemToDelete.id));
      setItemToDelete(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm Bulk Delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsProcessing(true);
      await onDeleteBulk(selectedIds);
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm Clear All History
  const handleConfirmClearAll = async () => {
    try {
      setIsProcessing(true);
      await onClearHistory();
      setSelectedIds([]);
      setShowClearModal(false);
    } finally {
      setIsProcessing(false);
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
              <History className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Minhas Pesquisas & Histórico
            </h1>
            <span 
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              {historyList.length} {historyList.length === 1 ? 'consulta salva' : 'consultas salvas'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Registro cronológico das consultas realizadas. A exclusão remove apenas o histórico desta conta, preservando os cadastros consolidados.
          </p>
        </div>

        {/* Action buttons */}
        {historyList.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {selectedIds.length > 0 && (
              <button
                id="btn-delete-selected"
                onClick={() => setShowBulkDeleteModal(true)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs hover:opacity-90"
                style={{
                  backgroundColor: 'var(--danger-subtle)',
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)'
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir selecionadas ({selectedIds.length})</span>
              </button>
            )}

            <button
              id="btn-clear-history"
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border hover:opacity-80"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar histórico de buscas</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Selection Bar */}
      {selectedIds.length > 0 && (
        <div 
          className="rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border shadow-xs animate-in fade-in slide-in-from-top-2"
          style={{
            backgroundColor: 'var(--accent-subtle)',
            borderColor: 'var(--accent)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span>
              <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'pesquisa selecionada' : 'pesquisas selecionadas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              Desmarcar todas
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs hover:opacity-90 cursor-pointer"
              style={{
                backgroundColor: 'var(--danger)',
                color: '#ffffff'
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir selecionadas</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div 
        className="rounded-2xl p-4 border shadow-xs flex flex-col sm:flex-row items-center gap-3 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Filtrar por nome, razão social ou CNPJ..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none border transition-colors"
            style={{
              backgroundColor: 'var(--input-background)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 shrink-0"
          style={{
            backgroundColor: onlyFavorites ? 'var(--accent)' : 'var(--surface-secondary)',
            color: onlyFavorites ? '#000000' : 'var(--text-primary)',
            borderColor: onlyFavorites ? 'var(--accent)' : 'var(--border)'
          }}
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-black' : ''}`} style={{ color: onlyFavorites ? '#000000' : 'var(--accent)' }} />
          <span>Apenas Favoritos</span>
        </button>
      </div>

      {/* History Table */}
      <div 
        className="rounded-3xl border shadow-xs overflow-hidden transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs space-y-2">
            <History className="w-8 h-8 mx-auto" style={{ color: 'var(--text-tertiary)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Nenhuma consulta encontrada no histórico.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr 
                  className="border-b font-bold uppercase text-[10px]"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <th className="py-3.5 px-3 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="p-1 transition-colors hover:opacity-80"
                      style={{ color: 'var(--text-tertiary)' }}
                      title={isAllSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3 w-10 text-center">Fav</th>
                  <th className="py-3.5 px-4">Entidade Consultada</th>
                  <th className="py-3.5 px-4">Identificador</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Data e Hora</th>
                  <th className="py-3.5 px-4">Situação</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filtered.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr 
                      key={item.id} 
                      className="transition-colors"
                      style={{
                        backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent'
                      }}
                    >
                      {/* Checkbox selector */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => handleToggleSelectRow(item.id, e)}
                          className="p-1 transition-colors hover:opacity-80"
                          style={{ color: isSelected ? 'var(--accent)' : 'var(--text-tertiary)' }}
                          title="Selecionar esta consulta"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Favorite button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onToggleFavorite(item.id)}
                          className="p-1 transition-colors hover:opacity-80"
                          style={{ color: item.favorito ? 'var(--accent)' : 'var(--text-tertiary)' }}
                          title={item.favorito ? 'Remover favorito' : 'Marcar favorito'}
                        >
                          <Star className={`w-4 h-4 ${item.favorito ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      {/* Entity Name */}
                      <td className="py-3 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px]"
                            style={{
                              backgroundColor: item.tipo === 'nome' ? 'var(--info-subtle)' : 'var(--accent-subtle)',
                              color: item.tipo === 'nome' ? 'var(--info)' : 'var(--accent)'
                            }}
                          >
                            {item.tipo === 'nome' ? <User className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="truncate max-w-xs">{item.nomeOuRazao}</span>
                        </div>
                      </td>

                      {/* Identifier */}
                      <td className="py-3 px-4 font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {item.identificador}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 uppercase text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                        {item.tipo}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                        {item.dataHora}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold border"
                          style={{
                            backgroundColor: 'var(--success-subtle)',
                            color: 'var(--success)',
                            borderColor: 'var(--success-subtle)'
                          }}
                        >
                          {item.situacao}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              if (item.tipo === 'nome') {
                                onSelectPerson(item.nomeOuRazao);
                              } else {
                                onSelectCompany(item.identificador);
                              }
                            }}
                            className="px-2.5 py-1 font-semibold rounded-lg transition-all inline-flex items-center gap-1 border hover:opacity-80"
                            style={{
                              backgroundColor: 'var(--surface-secondary)',
                              borderColor: 'var(--border)',
                              color: 'var(--text-primary)'
                            }}
                            title="Reabrir visualização dos dados consolidados"
                          >
                            <span>Reabrir</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          {/* Individual Delete Button */}
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                            style={{ color: 'var(--text-tertiary)' }}
                            title="Excluir esta pesquisa do histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5 hover:text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Confirmação de Exclusão Individual */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-overlay animate-in fade-in duration-150">
          <div 
            className="rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border"
            style={{
              backgroundColor: 'var(--modal-background)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)' }}
              >
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Excluir esta pesquisa?
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Esta ação removerá a pesquisa do seu histórico.
                </p>
              </div>
            </div>

            <div 
              className="p-3.5 rounded-2xl border text-xs"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)'
              }}
            >
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{itemToDelete.nomeOuRazao}</p>
              <p className="font-mono text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{itemToDelete.identificador} • {itemToDelete.dataHora}</p>
            </div>

            <p className="text-[11px] italic" style={{ color: 'var(--text-tertiary)' }}>
              Nota: Os cadastros e relatórios oficiais da entidade permanecem disponíveis no sistema.
            </p>

            <div 
              className="flex items-center justify-end gap-2 pt-3 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSingleDelete}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-xs hover:opacity-90"
                style={{ backgroundColor: 'var(--danger)' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Excluindo...' : 'Excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmação de Exclusão em Massa */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-overlay animate-in fade-in duration-150">
          <div 
            className="rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border"
            style={{
              backgroundColor: 'var(--modal-background)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)' }}
              >
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Excluir {selectedIds.length} {selectedIds.length === 1 ? 'pesquisa selecionada' : 'pesquisas selecionadas'}?
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Esta ação removerá as pesquisas marcadas do seu histórico de buscas.
                </p>
              </div>
            </div>

            <div 
              className="p-3.5 rounded-2xl border text-xs"
              style={{
                backgroundColor: 'var(--danger-subtle)',
                borderColor: 'var(--danger)',
                color: 'var(--danger)'
              }}
            >
              <p>
                Você selecionou <strong>{selectedIds.length}</strong> itens para exclusão definitiva do histórico desta conta.
              </p>
            </div>

            <div 
              className="flex items-center justify-end gap-2 pt-3 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-xs hover:opacity-90"
                style={{ backgroundColor: 'var(--danger)' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Excluindo...' : 'Excluir selecionadas'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Limpar Todo o Histórico */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-overlay animate-in fade-in duration-150">
          <div 
            className="rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border"
            style={{
              backgroundColor: 'var(--modal-background)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--danger-subtle)', color: 'var(--danger)' }}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Deseja realmente excluir todo o histórico de pesquisas?
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Esta ação é irreversível e removerá todos os {historyList.length} registros do seu histórico de buscas.
                </p>
              </div>
            </div>

            <div 
              className="p-3.5 rounded-2xl border text-xs"
              style={{
                backgroundColor: 'var(--danger-subtle)',
                borderColor: 'var(--danger)',
                color: 'var(--danger)'
              }}
            >
              <p>
                <strong>Atenção:</strong> Todas as pesquisas anteriores serão apagadas da lista. Os cadastros consolidados de empresas e sócios continuarão disponíveis no sistema.
              </p>
            </div>

            <div 
              className="flex items-center justify-end gap-2 pt-3 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setShowClearModal(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClearAll}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-xs hover:opacity-90"
                style={{ backgroundColor: 'var(--danger)' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Limpando...' : 'Excluir todo o histórico'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
