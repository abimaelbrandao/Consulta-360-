import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  AlertTriangle, 
  Gavel, 
  Newspaper, 
  ExternalLink, 
  Copy, 
  Check, 
  MapPin,
  Briefcase
} from 'lucide-react';
import { PessoaData } from '../types';
import { AiSummaryCard } from './AiSummaryCard';

interface PersonDetailViewProps {
  pessoa: PessoaData;
  onSelectCompany: (cnpj: string) => void;
  onBackToSearch: () => void;
}

export const PersonDetailView: React.FC<PersonDetailViewProps> = ({
  pessoa,
  onSelectCompany,
  onBackToSearch
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyName = () => {
    navigator.clipboard.writeText(pessoa.nome);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Homonym Alert Banner if applicable */}
      {pessoa.temMultiplosHomonimos && (
        <div 
          className="p-4 border rounded-3xl flex items-start gap-3"
          style={{
            backgroundColor: 'var(--accent-subtle)',
            borderColor: 'var(--accent)',
            color: 'var(--text-primary)'
          }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">
              Atenção: Existem múltiplos resultados para este nome
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Foram localizados registros homônimos ({pessoa.quantidadeHomonimosEstimada || 'múltiplos'} ocorrências públicas). Para assegurar a correlação inequívoca, confira o estado federativo (UF), a qualificação societária e o contexto empresarial.
            </p>
          </div>
        </div>
      )}

      {/* Person Header Card */}
      <div 
        className="rounded-3xl p-6 border shadow-xs transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000000'
              }}
            >
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {pessoa.nome}
                </h1>
                <button
                  onClick={handleCopyName}
                  className="p-1 hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: 'var(--text-tertiary)' }}
                  title="Copiar Nome"
                >
                  {copied ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {pessoa.profissaoConhecida && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                    {pessoa.profissaoConhecida}
                  </span>
                )}
                {pessoa.estadoPrincipal && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                    UF Principal: {pessoa.estadoPrincipal}
                  </span>
                )}
                <span className="font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  CPF: {pessoa.cpfMascarado || '***.***.***-** (Protegido por Lei)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onBackToSearch}
              className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors border hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              Nova Consulta
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary for Person */}
      <AiSummaryCard pessoa={pessoa} />

      {/* Linked Companies Card */}
      <div 
        className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Building2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          Vínculos e Participações Societárias Públicas ({pessoa.empresasVinculadas?.length || 0})
        </h2>

        {(!pessoa.empresasVinculadas || pessoa.empresasVinculadas.length === 0) ? (
          <div 
            className="p-6 text-center text-xs rounded-2xl border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-tertiary)'
            }}
          >
            Nenhuma participação societária ativa ou empresa mercantil vinculada para este titular nos registros públicos consultados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pessoa.empresasVinculadas.map((vinculo, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border space-y-2 transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {vinculo.razaoSocial}
                    </h3>
                    <p className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {vinculo.cnpj}
                    </p>
                  </div>
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded font-bold border"
                    style={{
                      backgroundColor: 'var(--success-subtle)',
                      borderColor: 'var(--success-subtle)',
                      color: 'var(--success)'
                    }}
                  >
                    {vinculo.situacao}
                  </span>
                </div>

                <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <p><strong>Cargo / Qualificação:</strong> {vinculo.cargo}</p>
                  {vinculo.participacao !== undefined && vinculo.participacao > 0 && (
                    <p><strong>Participação:</strong> {vinculo.participacao}%</p>
                  )}
                  {vinculo.dataEntrada && (
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Entrada: {vinculo.dataEntrada}</p>
                  )}
                </div>

                <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => onSelectCompany(vinculo.cnpj)}
                    className="text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    style={{ color: 'var(--accent)' }}
                  >
                    <span>Consultar Empresa 360°</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Publications & Notices */}
      {pessoa.publicacoesOficiais && pessoa.publicacoesOficiais.length > 0 && (
        <div 
          className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Newspaper className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Publicações em Diários Oficiais e Órgãos Reguladores
          </h2>

          <div className="space-y-3">
            {pessoa.publicacoesOficiais.map((pub) => (
              <div
                key={pub.id}
                className="p-4 rounded-2xl border space-y-1 text-xs"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pub.veiculo}</span>
                  <span>{pub.data}</span>
                </div>
                <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{pub.titulo}</h4>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{pub.resumo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Legal Proceedings */}
      <div 
        className="rounded-3xl p-6 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Gavel className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          Processos em Fontes Públicas Oficiais ({pessoa.processosPublicos?.length || 0})
        </h2>

        {pessoa.processosPublicos?.length === 0 ? (
          <div className="p-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Nenhum processo judicial público localizado para este nome nas buscas parametrizadas.
          </div>
        ) : (
          <div className="space-y-3">
            {pessoa.processosPublicos?.map((proc) => (
              <div
                key={proc.id}
                className="p-4 rounded-2xl border space-y-1 text-xs"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{proc.numeroProcesso}</span>
                  <span 
                    className="px-2 py-0.5 rounded font-semibold border"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {proc.tribunal}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>Polo: {proc.polo} • Tipo: {proc.tipo}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Última movimentação: {proc.ultimaMovimentacao}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
