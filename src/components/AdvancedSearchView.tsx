import React, { useState } from 'react';
import { 
  Filter, 
  RotateCcw, 
  ExternalLink, 
  MapPin 
} from 'lucide-react';
import { EmpresaData } from '../types';

interface AdvancedSearchViewProps {
  allCompanies: EmpresaData[];
  onSelectCompany: (cnpj: string) => void;
}

export const AdvancedSearchView: React.FC<AdvancedSearchViewProps> = ({
  allCompanies,
  onSelectCompany
}) => {
  const [uf, setUf] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [porte, setPorte] = useState('');
  const [situacao, setSituacao] = useState('');
  const [simplesNacional, setSimplesNacional] = useState('');
  const [termoCnae, setTermoCnae] = useState('');
  const [minCapital, setMinCapital] = useState('');

  const handleReset = () => {
    setUf('');
    setMunicipio('');
    setPorte('');
    setSituacao('');
    setSimplesNacional('');
    setTermoCnae('');
    setMinCapital('');
  };

  const filtered = allCompanies.filter((emp) => {
    if (uf && emp.uf.toLowerCase() !== uf.toLowerCase()) return false;
    if (municipio && !emp.municipio.toLowerCase().includes(municipio.toLowerCase())) return false;
    if (porte && emp.porte !== porte) return false;
    if (situacao && emp.situacaoCadastral !== situacao) return false;
    if (simplesNacional === 'sim' && !emp.simplesNacional.optante) return false;
    if (simplesNacional === 'nao' && emp.simplesNacional.optante) return false;
    if (termoCnae) {
      const matchPrincipal = emp.cnaePrincipal.descricao.toLowerCase().includes(termoCnae.toLowerCase()) || emp.cnaePrincipal.codigo.includes(termoCnae);
      const matchSecundario = emp.cnaesSecundarios?.some(c => c.descricao.toLowerCase().includes(termoCnae.toLowerCase()) || c.codigo.includes(termoCnae));
      if (!matchPrincipal && !matchSecundario) return false;
    }
    if (minCapital && (emp.capitalSocial || 0) < Number(minCapital)) return false;
    return true;
  });

  const ufsList = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'];

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
              <Filter className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Busca Avançada & Filtros Multicritério
            </h1>
            <span 
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)'
              }}
            >
              {filtered.length} resultados
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Pesquisa segmentada por Estado, Município, faixa de capital social, CNAEs e enquadramento tributário
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto border hover:opacity-80"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar Filtros</span>
        </button>
      </div>

      {/* Filter Matrix Card */}
      <div 
        className="rounded-3xl p-5 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
          Parâmetros de Segmentação
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* UF */}
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Estado (UF)
            </label>
            <select
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">Todas as UFs</option>
              {ufsList.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Município */}
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Município
            </label>
            <input
              type="text"
              placeholder="Ex: São Paulo, Brasília..."
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Porte */}
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Porte da Empresa
            </label>
            <select
              value={porte}
              onChange={(e) => setPorte(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">Todos os portes</option>
              <option value="ME">Microempresa (ME)</option>
              <option value="EPP">Empresa de Pequeno Porte (EPP)</option>
              <option value="DEMAIS">Demais / Grandes Empresas</option>
            </select>
          </div>

          {/* Situação Cadastral */}
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Situação Cadastral
            </label>
            <select
              value={situacao}
              onChange={(e) => setSituacao(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">Todas as situações</option>
              <option value="ATIVA">ATIVA</option>
              <option value="BAIXADA">BAIXADA</option>
              <option value="SUSPENSA">SUSPENSA</option>
              <option value="INAPTA">INAPTA</option>
            </select>
          </div>

          {/* Simples Nacional */}
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Opção Simples Nacional
            </label>
            <select
              value={simplesNacional}
              onChange={(e) => setSimplesNacional(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">Indiferente</option>
              <option value="sim">Apenas Optantes</option>
              <option value="nao">Apenas Não Optantes</option>
            </select>
          </div>

          {/* Termo CNAE */}
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Palavra-chave CNAE / Atividade
            </label>
            <input
              type="text"
              placeholder="Ex: solar, software, comércio..."
              value={termoCnae}
              onChange={(e) => setTermoCnae(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Capital Social Mínimo */}
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Capital Social Mínimo (R$)
            </label>
            <input
              type="number"
              placeholder="Ex: 100000"
              value={minCapital}
              onChange={(e) => setMinCapital(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div 
            className="rounded-3xl p-12 text-center text-xs border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-tertiary)'
            }}
          >
            Nenhuma empresa atende aos filtros especificados. Ajuste os parâmetros de busca.
          </div>
        ) : (
          filtered.map((emp) => (
            <div
              key={emp.cnpj}
              onClick={() => onSelectCompany(emp.cnpj)}
              className="p-4 rounded-2xl border shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:scale-[1.005]"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: 'var(--success-subtle)',
                      color: 'var(--success)',
                      borderColor: 'var(--success-subtle)'
                    }}
                  >
                    {emp.situacaoCadastral}
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {emp.razaoSocial}
                  </span>
                  {emp.nomeFantasia && (
                    <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                      ({emp.nomeFantasia})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-mono">{emp.cnpj}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                    {emp.municipio}/{emp.uf}
                  </span>
                  <span>Porte: {emp.porte}</span>
                  <span>Capital: R$ {(emp.capitalSocial || 0).toLocaleString('pt-BR')}</span>
                </div>

                <p className="text-[11px] line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                  CNAE: {emp.cnaePrincipal.codigo} - {emp.cnaePrincipal.descricao}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <span className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                  Ver Dossiê 360°
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
