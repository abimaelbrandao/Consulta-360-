import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  FileCode, 
  Server, 
  ShieldAlert, 
  Copy, 
  Check, 
  Trash2,
  Filter,
  Sparkles
} from 'lucide-react';
import { SearchDiagnosticReport, SearchDiagnosticEntry } from '../types';
import { apiService } from '../services/api';

export const SearchDiagnosticView: React.FC = () => {
  const [reports, setReports] = useState<SearchDiagnosticReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [expandedEntryIndex, setExpandedEntryIndex] = useState<number | null>(null);
  const [rawJsonCopied, setRawJsonCopied] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | 'cnpj' | 'razao_social' | 'nome'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      const res = await apiService.getSearchDiagnostics();
      if (res && res.reports) {
        setReports(res.reports);
        if (res.reports.length > 0 && !selectedReportId) {
          setSelectedReportId(res.reports[0].id);
        }
      }
    } catch (err) {
      console.error('Falha ao carregar diagnósticos de busca:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const filteredReports = reports.filter(r => {
    const matchType = filterType === 'ALL' || r.tipoBusca === filterType;
    const matchTerm = !searchTerm.trim() || r.termo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchTerm;
  });

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const handleCopyJson = (data: any) => {
    if (!data) return;
    navigator.clipboard.writeText(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    setRawJsonCopied(true);
    setTimeout(() => setRawJsonCopied(false), 2000);
  };

  const getStatusBadge = (status: SearchDiagnosticEntry['status'], httpStatus?: number) => {
    switch (status) {
      case 'found':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Sucesso {httpStatus ? `(${httpStatus})` : ''}
          </span>
        );
      case 'not_found':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            Não Localizado (404)
          </span>
        );
      case 'rate_limited':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <ShieldAlert className="w-3 h-3" />
            Rate Limit (429)
          </span>
        );
      case 'unauthorized':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
            <ShieldAlert className="w-3 h-3" />
            Não Autorizado (401)
          </span>
        );
      case 'timeout':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
            <Clock className="w-3 h-3" />
            Timeout (408)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            Erro {httpStatus ? `(${httpStatus})` : ''}
          </span>
        );
    }
  };

  // Metrics summary
  const totalConsultas = reports.length;
  const totalSucesso = reports.filter(r => r.resultadoEncontrado).length;
  const taxaResolucao = totalConsultas > 0 ? Math.round((totalSucesso / totalConsultas) * 100) : 100;
  const latenciaMedia = totalConsultas > 0 ? Math.round(reports.reduce((acc, r) => acc + r.duracaoTotalMs, 0) / totalConsultas) : 0;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="p-4 rounded-2xl border shadow-xs transition-colors"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Consultas Diagnosticadas</span>
            <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            {totalConsultas}
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Histórico das últimas buscas orquestradas
          </p>
        </div>

        <div 
          className="p-4 rounded-2xl border shadow-xs transition-colors"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Taxa de Resolução</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-600">
            {taxaResolucao}%
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Consultas com retorno enriquecido
          </p>
        </div>

        <div 
          className="p-4 rounded-2xl border shadow-xs transition-colors"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Latência Média Cascata</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            {latenciaMedia} <span className="text-sm font-normal text-muted">ms</span>
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Tempo total de consolidação multi-fontes
          </p>
        </div>

        <div 
          className="p-4 rounded-2xl border shadow-xs transition-colors"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span>Tolerância a Falhas</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-amber-600">
            100% Ativa
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Fallback & Reconciliação Contínua
          </p>
        </div>
      </div>

      {/* Main Diagnostic Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Queries List */}
        <div className="lg:col-span-4 space-y-4">
          <div 
            className="p-4 rounded-2xl border shadow-xs space-y-3"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Search className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                Consultas Recentes
              </h2>
              <button
                onClick={loadDiagnostics}
                disabled={loading}
                className="p-1.5 rounded-lg border hover:opacity-80 transition-colors"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                title="Atualizar Diagnósticos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Filtrar por termo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border focus:outline-none transition-colors"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-xl border focus:outline-none"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="ALL">Todos</option>
                <option value="cnpj">CNPJ</option>
                <option value="razao_social">Razão Social</option>
                <option value="nome">Pessoa</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredReports.length === 0 ? (
                <div className="py-8 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Nenhum registro de busca diagnosticado.
                </div>
              ) : (
                filteredReports.map(report => {
                  const isSelected = selectedReport?.id === report.id;
                  return (
                    <button
                      key={report.id}
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setExpandedEntryIndex(null);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                        isSelected 
                          ? 'border-accent shadow-xs' 
                          : 'hover:border-neutral-400'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--surface-secondary)' : 'var(--surface)',
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border)'
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {report.termo}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {report.tipoBusca}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {report.duracaoTotalMs}ms
                        </span>
                        <span>
                          {report.fontesComSucesso}/{report.fontesConsultadasTotal} fontes OK
                        </span>
                        <span className="text-[10px]">
                          {report.dataHora.split(' ')[1] || report.dataHora}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Query Deep Inspection */}
        <div className="lg:col-span-8 space-y-4">
          {selectedReport ? (
            <div 
              className="p-6 rounded-3xl border shadow-xs space-y-6"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-accent">
                      Diagnóstico Detalhado de Execução
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700">
                      ID: {selectedReport.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {selectedReport.termo}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    Data/Hora: {selectedReport.dataHora} • Duração total da orquestração: <strong className="text-accent">{selectedReport.duracaoTotalMs}ms</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedReport.resultadoEncontrado ? 'Dados Consolidados' : 'Consulta Processada'}
                  </span>
                </div>
              </div>

              {/* Providers Execution Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>Comportamento por Provedor ({selectedReport.entradas.length} Fontes Consultadas)</span>
                  <span className="text-[11px] font-normal lowercase">Clique no provedor para inspecionar payload bruto</span>
                </h4>

                <div className="space-y-2">
                  {selectedReport.entradas.map((entry, idx) => {
                    const isExpanded = expandedEntryIndex === idx;
                    return (
                      <div 
                        key={idx}
                        className="rounded-2xl border transition-all overflow-hidden"
                        style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)' }}
                      >
                        <button
                          onClick={() => setExpandedEntryIndex(isExpanded ? null : idx)}
                          className="w-full text-left p-4 flex items-center justify-between gap-3 hover:opacity-90"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-accent">
                              <Server className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                                  {entry.providerNome}
                                </span>
                                <span className="text-[10px] text-muted truncate hidden sm:inline">
                                  {entry.categoria}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted truncate mt-0.5">
                                {entry.mensagem}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono text-muted">
                              {entry.latenciaMs}ms
                            </span>
                            {getStatusBadge(entry.status, entry.httpStatus)}
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted" />
                            )}
                          </div>
                        </button>

                        {/* Expanded detail & Raw JSON inspector */}
                        {isExpanded && (
                          <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 rounded-xl bg-surface border" style={{ borderColor: 'var(--border)' }}>
                                <span className="text-[10px] text-muted uppercase font-bold">URL Consultada:</span>
                                <p className="font-mono text-[11px] truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>
                                  {entry.urlConsultada || 'N/A (Consulta Interna Reconciliada)'}
                                </p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-surface border" style={{ borderColor: 'var(--border)' }}>
                                <span className="text-[10px] text-muted uppercase font-bold">Registros Retornados:</span>
                                <p className="font-bold text-[11px] mt-0.5" style={{ color: 'var(--text-primary)' }}>
                                  {entry.quantidadeRegistros} registro(s) extraídos
                                </p>
                              </div>
                            </div>

                            {entry.rawJson ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                    <FileCode className="w-3.5 h-3.5 text-accent" />
                                    Payload Bruto Retornado (JSON)
                                  </span>
                                  <button
                                    onClick={() => handleCopyJson(entry.rawJson)}
                                    className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 hover:opacity-80"
                                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                  >
                                    {rawJsonCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    <span>{rawJsonCopied ? 'Copiado!' : 'Copiar JSON'}</span>
                                  </button>
                                </div>

                                <pre 
                                  className="p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-64 border"
                                  style={{
                                    backgroundColor: 'var(--surface)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-primary)'
                                  }}
                                >
                                  {JSON.stringify(entry.rawJson, null, 2)}
                                </pre>
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl border text-xs text-muted text-center" style={{ borderColor: 'var(--border)' }}>
                                Nenhum payload bruto anexado a esta resposta ou erro ocorrido antes da recepção do JSON ({entry.erroDetalhes || entry.mensagem}).
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="p-12 rounded-3xl border text-center space-y-3"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <Activity className="w-8 h-8 mx-auto text-muted" />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Nenhum Diagnóstico Selecionado
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Realize uma pesquisa no sistema (por CNPJ, Razão Social ou Nome) para visualizar a telemetria e o fluxo de reconciliação em tempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
