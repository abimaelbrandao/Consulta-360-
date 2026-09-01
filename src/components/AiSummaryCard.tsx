import React, { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check, ShieldAlert, Download, AlertCircle, FileCheck2 } from 'lucide-react';
import { EmpresaData, PessoaData } from '../types';
import { apiService } from '../services/api';
import { exportService } from '../services/exportService';

interface AiSummaryCardProps {
  empresa?: EmpresaData;
  pessoa?: PessoaData;
  onSummaryGenerated?: (text: string) => void;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  empresa,
  pessoa,
  onSummaryGenerated
}) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [generatedDate, setGeneratedDate] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>('gemini-3.7-flash');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await apiService.generateAiSummary({ empresa, pessoa });
      setSummary(res.summary);
      setGeneratedDate(res.generatedAt);
      setModelName(res.model);
      if (onSummaryGenerated) {
        onSummaryGenerated(res.summary);
      }
    } catch (err) {
      console.error('Erro ao gerar resumo analítico:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!summary) {
      handleGenerate();
    }
  }, [empresa?.cnpj, pessoa?.id]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (empresa) {
      exportService.downloadSummaryText(empresa, summary || undefined);
    }
  };

  return (
    <div 
      className="rounded-3xl p-5 md:p-6 border shadow-sm relative overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Subtle Glow Effect */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: 'var(--accent)' }}
      />

      {/* Header */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b relative z-10"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
            style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                Resumo Inteligente & Parecer Executivo
              </h3>
              <span 
                className="text-[10px] font-mono px-2 py-0.5 rounded border font-semibold"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)'
                }}
              >
                {modelName}
              </span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              Síntese objetiva e imparcial estritamente baseada nos dados públicos encontrados
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={handleCopy}
            disabled={!summary || loading}
            className="px-2.5 py-1.5 text-xs rounded-xl transition-all flex items-center gap-1 border hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
            title="Copiar texto"
          >
            {copied ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          {empresa && (
            <button
              onClick={handleDownload}
              disabled={!summary || loading}
              className="px-2.5 py-1.5 text-xs rounded-xl transition-all flex items-center gap-1 border hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
              title="Baixar somente resumo"
            >
              <Download className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              <span>Baixar Resumo</span>
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#000000'
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Gerando...' : 'Regerar'}</span>
          </button>
        </div>
      </div>

      {/* Distinction Banner: Informação Oficial vs Análise IA */}
      <div 
        className="mb-4 p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 relative z-10"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)'
        }}
      >
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
        <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Separação de Camadas:</strong> Os dados cadastrais, certidões e quadros societários apresentados neste dossiê constituem <span className="font-semibold" style={{ color: 'var(--success)' }}>Informação Oficial Encontrada</span> em fontes governamentais. O texto abaixo é uma <span className="font-semibold" style={{ color: 'var(--accent)' }}>Análise Gerada por IA</span> para facilitação de leitura executiva.
        </div>
      </div>

      {/* Summary Content Body */}
      <div className="relative z-10 min-h-[100px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Cruzando dados cadastrais, certidões e vínculos para síntese com IA...
            </p>
          </div>
        ) : summary ? (
          <div 
            className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans p-4 rounded-2xl border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            {summary}
          </div>
        ) : (
          <div className="text-center py-6 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Clique em &quot;Regerar&quot; para produzir a síntese analítica desta consulta.
          </div>
        )}
      </div>

      {/* Footer Status Indicators */}
      <div 
        className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] relative z-10"
        style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" style={{ color: 'var(--success)' }}>
            <FileCheck2 className="w-3 h-3" />
            Dado Confirmado
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <AlertCircle className="w-3 h-3" />
            Fontes Auditadas
          </span>
        </div>
        {generatedDate && (
          <span>
            Sintetizado em: {generatedDate}
          </span>
        )}
      </div>
    </div>
  );
};
