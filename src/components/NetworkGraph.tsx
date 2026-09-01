import React, { useState } from 'react';
import { Building2, User, ArrowRight, ExternalLink, Info, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { EmpresaData } from '../types';

interface NetworkGraphProps {
  empresa: EmpresaData;
  onSelectCompany: (cnpj: string) => void;
  onSelectPerson: (name: string) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  empresa,
  onSelectCompany,
  onSelectPerson,
}) => {
  const [selectedNode, setSelectedNode] = useState<{
    type: 'main' | 'socio' | 'related_company';
    data: any;
  } | null>(null);
  const [zoom, setZoom] = useState(1);

  const socios = empresa.socios || [];

  return (
    <div 
      className="rounded-3xl p-4 md:p-6 border shadow-xs transition-colors"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Visualização em Rede Societária 360°
            </h3>
            <span 
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)'
              }}
            >
              EMPRESA → SÓCIOS → EMPRESAS RELACIONADAS
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Mapeamento de participações societárias e vínculos públicos oficiais
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.6))}
            className="p-1.5 rounded-xl text-xs border transition-colors hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.7))}
            className="p-1.5 rounded-xl text-xs border transition-colors hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-xl text-xs border transition-colors hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
            title="Redefinir Visualização"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Area */}
      <div 
        className="relative overflow-x-auto min-h-[420px] rounded-2xl border p-6 flex items-center justify-center transition-colors"
        style={{
          backgroundColor: 'var(--surface-secondary)',
          borderColor: 'var(--border)'
        }}
      >
        <div 
          className="transition-transform duration-300 origin-center flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 w-full max-w-5xl"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Column 1: Main Company */}
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              Empresa Principal
            </div>

            <div
              onClick={() => setSelectedNode({ type: 'main', data: empresa })}
              className="cursor-pointer group relative p-4 rounded-3xl border-2 shadow-md max-w-[240px] text-center transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--accent)',
                color: 'var(--text-primary)'
              }}
            >
              <div 
                className="w-10 h-10 mx-auto mb-2 rounded-2xl flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#000000'
                }}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div className="font-bold text-xs truncate" title={empresa.razaoSocial} style={{ color: 'var(--text-primary)' }}>
                {empresa.razaoSocial}
              </div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--accent)' }}>
                {empresa.cnpj}
              </div>
              <div 
                className="mt-2 inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                {empresa.porte} • {empresa.situacaoCadastral}
              </div>
            </div>
          </div>

          {/* Connection Indicator 1 */}
          <div className="hidden md:flex flex-col items-center" style={{ color: 'var(--text-tertiary)' }}>
            <span className="text-[10px] font-semibold mb-1">QSA</span>
            <div className="w-12 h-0.5 relative" style={{ backgroundColor: 'var(--border)' }}>
              <ArrowRight className="w-3 h-3 absolute -right-2 -top-1" style={{ color: 'var(--accent)' }} />
            </div>
          </div>

          {/* Column 2: Sócios / Administradores */}
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              <User className="w-3.5 h-3.5" style={{ color: 'var(--info)' }} />
              Sócios e Administradores ({socios.length})
            </div>

            <div className="flex flex-col gap-4">
              {socios.length === 0 ? (
                <div 
                  className="p-4 rounded-2xl border border-dashed text-xs text-center"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  Quadro societário não informado na base pública
                </div>
              ) : (
                socios.map((socio) => (
                  <div
                    key={socio.id}
                    onClick={() => setSelectedNode({ type: 'socio', data: socio })}
                    className="cursor-pointer group p-3.5 rounded-2xl border shadow-xs transition-all w-64 hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border"
                          style={{
                            backgroundColor: 'var(--info-subtle)',
                            borderColor: 'var(--info-subtle)',
                            color: 'var(--info)'
                          }}
                        >
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate" title={socio.nome} style={{ color: 'var(--text-primary)' }}>
                            {socio.nome}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>
                            {socio.qualificacao}
                          </p>
                        </div>
                      </div>

                      {socio.participacaoSocietaria !== undefined && socio.participacaoSocietaria > 0 && (
                        <span 
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0"
                          style={{
                            backgroundColor: 'var(--success-subtle)',
                            borderColor: 'var(--success-subtle)',
                            color: 'var(--success)'
                          }}
                        >
                          {socio.participacaoSocietaria}%
                        </span>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t flex items-center justify-between text-[10px]" style={{ borderColor: 'var(--border)' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        {socio.empresasRelacionadas?.length || 0} empresa(s) vinculada(s)
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPerson(socio.nome);
                        }}
                        className="hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
                        style={{ color: 'var(--accent)' }}
                      >
                        Ver Perfil
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connection Indicator 2 */}
          <div className="hidden md:flex flex-col items-center" style={{ color: 'var(--text-tertiary)' }}>
            <span className="text-[10px] font-semibold mb-1">Vínculos</span>
            <div className="w-12 h-0.5 relative" style={{ backgroundColor: 'var(--border)' }}>
              <ArrowRight className="w-3 h-3 absolute -right-2 -top-1" style={{ color: 'var(--success)' }} />
            </div>
          </div>

          {/* Column 3: Outras Empresas Relacionadas */}
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
              Empresas Relacionadas
            </div>

            <div className="flex flex-col gap-3">
              {socios.flatMap(s => s.empresasRelacionadas || []).length === 0 ? (
                <div 
                  className="p-4 rounded-2xl border border-dashed text-xs text-center w-56"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  Nenhuma outra empresa cruzada identificada
                </div>
              ) : (
                // Unique related companies
                Array.from(
                  new Map(
                    socios.flatMap(s => s.empresasRelacionadas || []).map(item => [item.cnpj, item])
                  ).values()
                ).map((related: { cnpj: string; razaoSocial: string; qualificacao: string; situacao: any }, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedNode({ type: 'related_company', data: related })}
                    className="cursor-pointer p-3 rounded-2xl border shadow-xs transition-all w-60 hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold truncate" title={related.razaoSocial} style={{ color: 'var(--text-primary)' }}>
                        {related.razaoSocial}
                      </p>
                      <span 
                        className="text-[9px] font-semibold px-1.5 py-0.2 rounded border"
                        style={{
                          backgroundColor: 'var(--success-subtle)',
                          borderColor: 'var(--success-subtle)',
                          color: 'var(--success)'
                        }}
                      >
                        {related.situacao}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {related.cnpj}
                    </p>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCompany(related.cnpj);
                        }}
                        className="text-[10px] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        style={{ color: 'var(--accent)' }}
                      >
                        Consultar 360°
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Node Inspector Modal/Drawer */}
      {selectedNode && (
        <div 
          className="mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in transition-colors"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-xl"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000000'
              }}
            >
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                {selectedNode.type === 'main' && `Empresa Principal: ${selectedNode.data.razaoSocial}`}
                {selectedNode.type === 'socio' && `Sócio: ${selectedNode.data.nome}`}
                {selectedNode.type === 'related_company' && `Empresa Relacionada: ${selectedNode.data.razaoSocial}`}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {selectedNode.type === 'socio' && `Qualificação: ${selectedNode.data.qualificacao} | Entrada: ${selectedNode.data.dataEntrada || 'Não informada'}`}
                {selectedNode.type === 'main' && `CNPJ: ${selectedNode.data.cnpj} | Capital: R$ ${(selectedNode.data.capitalSocial || 0).toLocaleString('pt-BR')}`}
                {selectedNode.type === 'related_company' && `CNPJ: ${selectedNode.data.cnpj} | Qualificação do vínculo: ${selectedNode.data.qualificacao}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {selectedNode.type === 'related_company' && (
              <button
                onClick={() => onSelectCompany(selectedNode.data.cnpj)}
                className="px-3.5 py-1.5 font-bold text-xs rounded-xl shadow-xs transition-all hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#000000'
                }}
              >
                Abrir Consulta 360°
              </button>
            )}
            {selectedNode.type === 'socio' && (
              <button
                onClick={() => onSelectPerson(selectedNode.data.nome)}
                className="px-3.5 py-1.5 font-bold text-xs rounded-xl shadow-xs transition-all hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#000000'
                }}
              >
                Consultar Pessoa
              </button>
            )}
            <button
              onClick={() => setSelectedNode(null)}
              className="px-2.5 py-1.5 text-xs rounded-xl transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text-secondary)'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
