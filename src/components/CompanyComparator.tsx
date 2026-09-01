import React from 'react';
import { Scale, X, ExternalLink } from 'lucide-react';
import { EmpresaData } from '../types';

interface CompanyComparatorProps {
  comparedCompanies: EmpresaData[];
  onRemoveCompany: (cnpj: string) => void;
  onSelectCompany: (cnpj: string) => void;
  onOpenQuickAdd: () => void;
  availableCompanies: EmpresaData[];
  onAddCompany: (empresa: EmpresaData) => void;
}

export const CompanyComparator: React.FC<CompanyComparatorProps> = ({
  comparedCompanies,
  onRemoveCompany,
  onSelectCompany,
  availableCompanies,
  onAddCompany,
}) => {
  const maxCompanies = 5;

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
              <Scale className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Comparador Corporativo 360°
            </h1>
            <span 
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)'
              }}
            >
              {comparedCompanies.length} de {maxCompanies} empresas
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Análise comparativa de porte, estrutura societária, capital e conformidade cadastral
          </p>
        </div>

        {/* Quick Add from Seed */}
        {comparedCompanies.length < maxCompanies && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                const found = availableCompanies.find(c => c.cnpj === e.target.value);
                if (found) onAddCompany(found);
              }}
              defaultValue=""
              className="text-xs p-2.5 rounded-xl border font-medium focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="" disabled>+ Adicionar empresa de exemplo...</option>
              {availableCompanies
                .filter(c => !comparedCompanies.some(comp => comp.cnpj === c.cnpj))
                .map(c => (
                  <option key={c.cnpj} value={c.cnpj}>
                    {c.razaoSocial} ({c.cnpj})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {comparedCompanies.length === 0 ? (
        <div 
          className="rounded-3xl border border-dashed p-12 text-center space-y-4 transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent)'
            }}
          >
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Nenhuma empresa selecionada para comparação
          </h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Ao consultar qualquer empresa, clique no botão &quot;Comparar&quot; ou selecione uma das empresas disponíveis acima.
          </p>
        </div>
      ) : (
        <div 
          className="rounded-3xl border shadow-xs overflow-x-auto transition-colors"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr 
                className="border-b"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)'
                }}
              >
                <th className="p-4 w-48 font-bold uppercase text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Indicador</th>
                {comparedCompanies.map((emp) => (
                  <th key={emp.cnpj} className="p-4 min-w-[200px] align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{emp.razaoSocial}</p>
                        <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{emp.cnpj}</p>
                      </div>
                      <button
                        onClick={() => onRemoveCompany(emp.cnpj)}
                        className="p-1 rounded transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-tertiary)' }}
                        title="Remover"
                      >
                        <X className="w-3.5 h-3.5 hover:text-red-500" />
                      </button>
                    </div>
                    <button
                      onClick={() => onSelectCompany(emp.cnpj)}
                      className="mt-2 text-[10px] font-bold flex items-center gap-1 hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      <span>Ver Dossiê 360°</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              <tr>
                <td className="p-4 font-bold" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>Situação Cadastral</td>
                {comparedCompanies.map((emp) => (
                  <td key={emp.cnpj} className="p-4">
                    <span 
                      className="px-2 py-0.5 rounded font-bold text-[11px] border"
                      style={{
                        backgroundColor: 'var(--success-subtle)',
                        borderColor: 'var(--success-subtle)',
                        color: 'var(--success)'
                      }}
                    >
                      {emp.situacaoCadastral}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>Capital Social</td>
                {comparedCompanies.map((emp) => (
                  <td key={emp.cnpj} className="p-4 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    R$ {(emp.capitalSocial || 0).toLocaleString('pt-BR')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>Porte / Regime</td>
                {comparedCompanies.map((emp) => (
                  <td key={emp.cnpj} className="p-4" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-bold">{emp.porte}</span>
                    <span className="block text-[11px]" style={{ color: 'var(--text-secondary)' }}>{emp.regimeTributarioEstimado}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>Tempo de Atividade</td>
                {comparedCompanies.map((emp) => (
                  <td key={emp.cnpj} className="p-4" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-bold">{emp.tempoAtividadeAnos || '—'} anos</span>
                    <span className="block text-[11px]" style={{ color: 'var(--text-secondary)' }}>Desde {emp.dataAbertura}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>Quadro de Sócios (QSA)</td>
                {comparedCompanies.map((emp) => (
                  <td key={emp.cnpj} className="p-4" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>{emp.socios.length} sócios / administradores</span>
                    <div className="text-[11px] mt-1 truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
                      {emp.socios.map(s => s.nome).join(', ')}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>CNAE Principal</td>
                {comparedCompanies.map((emp) => (
                  <td key={emp.cnpj} className="p-4" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-mono font-bold text-[11px] block">{emp.cnaePrincipal.codigo}</span>
                    <span className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{emp.cnaePrincipal.descricao}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>Localização</td>
                {comparedCompanies.map((emp) => (
                  <td key={emp.cnpj} className="p-4" style={{ color: 'var(--text-primary)' }}>
                    {emp.municipio} / {emp.uf}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold" style={{ backgroundColor: 'var(--surface-secondary)', color: 'var(--text-secondary)' }}>Certidões Negativas</td>
                {comparedCompanies.map((emp) => (
                  <td key={emp.cnpj} className="p-4" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-bold" style={{ color: 'var(--success)' }}>
                      {emp.certidoes.filter(c => c.situacao === 'NEGATIVA').length} de {emp.certidoes.length}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
