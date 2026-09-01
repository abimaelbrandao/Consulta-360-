import React from 'react';
import { 
  User, 
  Building2, 
  MapPin, 
  Briefcase, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { PessoaData } from '../types';

export interface RankedPessoaResult extends PessoaData {
  similarityScore?: number;
  matchType?: 'EXACT' | 'VERY_CLOSE' | 'PARTIAL' | 'LOW';
  matchLabel?: string;
}

interface PersonSearchResultsViewProps {
  query: string;
  results: RankedPessoaResult[];
  onSelectPerson: (person: PessoaData) => void;
  onBackToSearch: () => void;
}

export const PersonSearchResultsView: React.FC<PersonSearchResultsViewProps> = ({
  query,
  results,
  onSelectPerson,
  onBackToSearch
}) => {
  const exactMatches = results.filter(r => (r.similarityScore || 0) === 100);
  const closeMatches = results.filter(r => (r.similarityScore || 0) >= 90 && (r.similarityScore || 0) < 100);
  const partialMatches = results.filter(r => (r.similarityScore || 0) >= 75 && (r.similarityScore || 0) < 90);

  const getScoreBadge = (score?: number, matchType?: string) => {
    const s = score || 0;
    if (s === 100 || matchType === 'EXACT') {
      return (
        <span 
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
          style={{
            backgroundColor: 'var(--success-subtle)',
            color: 'var(--success)',
            borderColor: 'var(--success)'
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Correspondência Exata (100%)
        </span>
      );
    }
    if (s >= 90 || matchType === 'VERY_CLOSE') {
      return (
        <span 
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
          style={{
            backgroundColor: 'var(--accent-subtle)',
            color: 'var(--accent)',
            borderColor: 'var(--accent)'
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Alta Confiabilidade ({s}%)
        </span>
      );
    }
    return (
      <span 
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: 'var(--surface-tertiary)',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border)'
        }}
      >
        <HelpCircle className="w-3.5 h-3.5" />
        Possível Correspondência ({s}%)
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Info */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border shadow-xs transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  borderColor: 'var(--accent)',
                  color: 'var(--text-primary)'
                }}
              >
                <Search className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                Seleção de Pessoa & Homônimos
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {results.length} {results.length === 1 ? 'registro encontrado' : 'registros compatíveis'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Resultados para: <span className="font-extrabold" style={{ color: 'var(--accent)' }}>"{query}"</span>
            </h1>

            <p className="text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {results.length > 1 
                ? 'Foram identificadas pessoas com dados compatíveis ou nomes homônimos nos registros públicos oficiais. Selecione abaixo o titular desejado com base na UF e contexto empresarial para abrir o dossiê detalhado.'
                : 'Registro localizado com grau de similaridade compatível. Confira os dados cadastrais antes de prosseguir.'}
            </p>
          </div>

          <button
            onClick={onBackToSearch}
            className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl border transition-colors hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            Nova Pesquisa
          </button>
        </div>
      </div>

      {/* Homonym Alert Notice */}
      {results.length > 1 && (
        <div 
          className="p-4 rounded-2xl border flex items-start gap-3"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)'
          }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-sm">
              Identificação de Múltiplos Perfis / Homônimos
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              O sistema mantém os registros rigorosamente separados e não unifica pessoas distintas. Verifique o estado (UF), as empresas vinculadas e o CPF mascarado para escolher o perfil correto.
            </p>
          </div>
        </div>
      )}

      {/* Candidates List */}
      <div className="space-y-4">
        {results.map((candidate, idx) => {
          const isExact = (candidate.similarityScore || 0) === 100;
          return (
            <div
              key={candidate.id || idx}
              id={`person-candidate-${candidate.id || idx}`}
              className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 border shadow-xs transition-all hover:border-[var(--accent)] space-y-4"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: isExact ? 'var(--accent)' : 'var(--border)'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-xs"
                    style={{
                      backgroundColor: isExact ? 'var(--accent)' : 'var(--surface-secondary)',
                      color: isExact ? '#000000' : 'var(--text-primary)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <User className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        {candidate.nome}
                      </h2>
                      {getScoreBadge(candidate.similarityScore, candidate.matchType)}
                      {candidate.temMultiplosHomonimos && (
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                          style={{
                            backgroundColor: 'var(--surface-tertiary)',
                            color: 'var(--text-secondary)',
                            borderColor: 'var(--border)'
                          }}
                        >
                          Homônimo Registrado
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {candidate.profissaoConhecida && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                          {candidate.profissaoConhecida}
                        </span>
                      )}
                      {candidate.estadoPrincipal && (
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                          UF Principal: {candidate.estadoPrincipal}
                        </span>
                      )}
                      <span className="font-mono" style={{ color: 'var(--text-tertiary)' }}>
                        CPF: {candidate.cpfMascarado || '***.***.***-**'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPerson(candidate)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90 active:scale-95"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#000000'
                  }}
                >
                  <span>Abrir Dossiê Completo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Linked Companies Preview */}
              {candidate.empresasVinculadas && candidate.empresasVinculadas.length > 0 ? (
                <div 
                  className="p-3.5 rounded-xl border space-y-2 text-xs"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <p className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                    Vínculos Empresariais Públicos ({candidate.empresasVinculadas.length}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {candidate.empresasVinculadas.map((v, i) => (
                      <div 
                        key={i} 
                        className="p-2.5 rounded-lg border flex flex-col justify-between"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <span className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {v.razaoSocial}
                        </span>
                        <div className="flex items-center justify-between text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                          <span>CNPJ: {v.cnpj}</span>
                          <span className="font-medium" style={{ color: 'var(--accent)' }}>{v.cargo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div 
                  className="p-3 rounded-xl border text-xs text-center"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  Sem participações societárias ativas averbadas.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
