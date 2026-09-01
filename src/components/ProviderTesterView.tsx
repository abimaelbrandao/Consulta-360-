import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  FileCode, 
  Copy, 
  Check, 
  Server, 
  ShieldAlert, 
  Zap, 
  ArrowRight,
  Sparkles,
  Trash2
} from 'lucide-react';
import { ProvedorApi, ProviderTestResult, SearchType } from '../types';
import { apiService } from '../services/api';

export const ProviderTesterView: React.FC<{ providers: ProvedorApi[] }> = ({ providers }) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>('prov-brasilapi');
  const [testTermo, setTestTermo] = useState<string>('00000000000191');
  const [testType, setTestType] = useState<SearchType>('cnpj');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProviderTestResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [copiedNormalized, setCopiedNormalized] = useState<boolean>(false);
  const [clearingCache, setClearingCache] = useState<boolean>(false);
  const [cacheClearStatus, setCacheClearStatus] = useState<string | null>(null);

  useEffect(() => {
    if (providers.length > 0 && !selectedProviderId) {
      setSelectedProviderId(providers[0].id);
    }
  }, [providers]);

  const handleRunTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProviderId || !testTermo.trim()) {
      setErrorMsg('Selecione um provedor e informe um termo/CNPJ de teste.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setResult(null);

      const testRes = await apiService.testProviderQuery({
        providerId: selectedProviderId,
        termo: testTermo.trim(),
        tipo: testType
      });

      setResult(testRes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao executar teste de provedor.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      setCacheClearStatus(null);
      const res = await apiService.clearInvalidCache();
      setCacheClearStatus(res.message);
      setTimeout(() => setCacheClearStatus(null), 5000);
    } catch (err: any) {
      setCacheClearStatus(err.message || 'Erro ao limpar cache.');
    } finally {
      setClearingCache(false);
    }
  };

  const handleCopyRaw = () => {
    if (!result?.rawResponse) return;
    navigator.clipboard.writeText(JSON.stringify(result.rawResponse, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopyNormalized = () => {
    if (!result?.normalizedData) return;
    navigator.clipboard.writeText(JSON.stringify(result.normalizedData, null, 2));
    setCopiedNormalized(true);
    setTimeout(() => setCopiedNormalized(false), 2000);
  };

  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  return (
    <div className="space-y-6">
      {/* Test Console Input Form */}
      <div 
        className="p-6 rounded-3xl border shadow-xs space-y-6 transition-colors"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Zap className="w-5 h-5 text-accent" />
              Console de Teste & Auditoria de Provedores
            </h2>
            <p className="text-xs text-muted mt-1">
              Dispare requisições HTTP reais contra endpoints públicos ou privados e inspecione a resposta bruta (Raw JSON) junto ao mapeamento do normalizador.
            </p>
          </div>

          <button
            onClick={handleClearCache}
            disabled={clearingCache}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors hover:opacity-80 shrink-0"
            style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            title="Limpar registros inválidos do cache em memória"
          >
            <Trash2 className={`w-3.5 h-3.5 ${clearingCache ? 'animate-spin' : ''}`} style={{ color: 'var(--accent)' }} />
            <span>Limpar Cache Inválido</span>
          </button>
        </div>

        {cacheClearStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{cacheClearStatus}</span>
          </div>
        )}

        <form onSubmit={handleRunTest} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Provider Select */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Selecionar Provedor
            </label>
            <select
              value={selectedProviderId}
              onChange={e => setSelectedProviderId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {providers.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.categoria})
                </option>
              ))}
            </select>
            {selectedProvider && (
              <p className="text-[11px] text-muted font-mono truncate">
                {selectedProvider.urlBase}
              </p>
            )}
          </div>

          {/* Test Type */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Tipo de Consulta
            </label>
            <select
              value={testType}
              onChange={e => setTestType(e.target.value as SearchType)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <option value="cnpj">CNPJ (14 dígitos)</option>
              <option value="razao_social">Razão Social / Nome</option>
              <option value="nome">Pessoa Física / Sócio</option>
            </select>
          </div>

          {/* Test Input Term */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Termo / Identificador de Teste
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testTermo}
                onChange={e => setTestTermo(e.target.value)}
                placeholder="Ex: 00000000000191 ou PETROBRAS"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border focus:outline-none font-mono"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs hover:opacity-90 active:scale-95 text-white shrink-0"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-pulse' : ''}`} />
                <span>{loading ? 'Consultando...' : 'Executar'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Demo Pre-fills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted text-[11px] font-semibold">Exemplos rápidos:</span>
          {[
            { label: 'Banco do Brasil (00.000.000/0001-91)', val: '00000000000191', type: 'cnpj' },
            { label: 'Petrobras (33.000.167/0001-01)', val: '33000167000101', type: 'cnpj' },
            { label: 'Apple Brasil (00.623.904/0001-73)', val: '00623904000173', type: 'cnpj' },
            { label: 'Magazine Luiza (47.960.950/0001-21)', val: '47960950000121', type: 'cnpj' }
          ].map((demo, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setTestTermo(demo.val);
                setTestType(demo.type as SearchType);
              }}
              className="px-2.5 py-1 rounded-lg border text-[11px] font-mono hover:border-accent transition-colors"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Execution Results View */}
      {result && (
        <div className="space-y-6">
          {/* Status summary banner */}
          <div 
            className="p-5 rounded-3xl border shadow-xs space-y-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${
                  result.sucesso 
                    ? 'bg-emerald-500/10 text-emerald-600' 
                    : 'bg-rose-500/10 text-rose-600'
                }`}>
                  {result.sucesso ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      Resultado do Teste: {result.providerNome}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      result.sucesso 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    }`}>
                      {result.status} {result.httpStatus ? `(HTTP ${result.httpStatus})` : ''}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {result.mensagem}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <span className="text-[10px] text-muted uppercase font-bold">Latência:</span>
                  <div className="font-mono font-bold text-accent text-sm">
                    {result.latenciaMs} ms
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted uppercase font-bold">Data/Hora:</span>
                  <div className="text-muted text-xs">
                    {result.dataHora}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dual-Panel Inspector: Raw JSON vs. Normalized Model */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Raw JSON Output */}
            <div 
              className="p-5 rounded-3xl border shadow-xs space-y-3"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FileCode className="w-4 h-4 text-accent" />
                  1. Resposta Bruta da API (Raw JSON)
                </h4>
                <button
                  onClick={handleCopyRaw}
                  className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 hover:opacity-80"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {copiedRaw ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRaw ? 'Copiado!' : 'Copiar Raw'}</span>
                </button>
              </div>

              <pre 
                className="p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-[460px] border leading-relaxed"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                {result.rawResponse 
                  ? JSON.stringify(result.rawResponse, null, 2) 
                  : (result.erroDetalhes || '// Nenhuma resposta bruta recebida')}
              </pre>
            </div>

            {/* Right: Normalized Data Model Output */}
            <div 
              className="p-5 rounded-3xl border shadow-xs space-y-3"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Database className="w-4 h-4 text-emerald-500" />
                  2. Dados Mapeados pelo Normalizador (Schema Canônico)
                </h4>
                <button
                  onClick={handleCopyNormalized}
                  className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 hover:opacity-80"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {copiedNormalized ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNormalized ? 'Copiado!' : 'Copiar Normalizado'}</span>
                </button>
              </div>

              <pre 
                className="p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-[460px] border leading-relaxed"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              >
                {result.normalizedData 
                  ? JSON.stringify(result.normalizedData, null, 2) 
                  : '// Não foi possível normalizar os dados a partir do payload recebido'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
