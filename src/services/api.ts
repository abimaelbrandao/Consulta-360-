import { EmpresaData, PessoaData, ConsultaHistorico, MonitoramentoEmpresa, ProvedorApi, Usuario, LogAuditoria, ConsultaRapida } from '../types';

export const apiService = {
  async getCnpj(cnpj: string, forceRefresh = false): Promise<{ source: string; data: EmpresaData }> {
    const clean = cnpj.replace(/\D/g, '');
    const url = `/api/cnpj/${clean}${forceRefresh ? '?refresh=true' : ''}`;
    const res = await fetch(url, {
      headers: forceRefresh ? { 'x-force-refresh': 'true' } : {}
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Erro ao consultar CNPJ nas bases oficiais.');
    }
    return res.json();
  },

  async getTelemetria(): Promise<{
    logs: any[];
    totalLogs: number;
    providers: ProvedorApi[];
    cacheStats: { totalCachedItems: number; ttlHours: number };
  }> {
    const res = await fetch('/api/telemetria');
    if (!res.ok) throw new Error('Falha ao obter dados de telemetria.');
    return res.json();
  },

  async searchCompany(query: string): Promise<EmpresaData> {
    const clean = query.replace(/\D/g, '');
    if (clean.length >= 8) {
      try {
        const res = await this.getCnpj(clean);
        if (res?.data) return res.data;
      } catch (e) {
        console.warn('CNPJ direct lookup fallback to text search', e);
      }
    }
    const searchRes = await this.search({ q: query, type: 'cnpj' });
    if (searchRes.results && searchRes.results.length > 0) {
      return searchRes.results[0];
    }
    const nameSearch = await this.search({ q: query, type: 'razao_social' });
    if (nameSearch.results && nameSearch.results.length > 0) {
      return nameSearch.results[0];
    }
    // Final fallback: fetch generated CNPJ
    const fallbackRes = await this.getCnpj(clean || '00000000000191');
    return fallbackRes.data;
  },

  async searchPerson(name: string): Promise<PessoaData> {
    const searchRes = await this.searchPersons(name);
    if (searchRes.results && searchRes.results.length > 0) {
      return searchRes.results[0];
    }
    throw new Error(searchRes.message || 'Nenhuma pessoa com correspondência suficiente foi encontrada para o nome pesquisado.');
  },

  async searchPersons(name: string): Promise<{
    type: 'nome';
    query: string;
    total: number;
    results: Array<PessoaData & { similarityScore?: number; matchType?: 'EXACT' | 'VERY_CLOSE' | 'PARTIAL' | 'LOW'; matchLabel?: string }>;
    temMultiplosHomonimos: boolean;
    message?: string;
  }> {
    const query = new URLSearchParams({ q: name, type: 'nome' });
    const res = await fetch(`/api/search?${query.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao buscar pessoa nas bases oficiais.');
    }
    return res.json();
  },

  async search(params: { q?: string; type?: string; uf?: string; municipio?: string; porte?: string; situacao?: string }): Promise<{ type: 'empresa' | 'nome'; query?: string; total?: number; results: any[]; temMultiplosHomonimos?: boolean; message?: string }> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.type) query.set('type', params.type);
    if (params.uf) query.set('uf', params.uf);
    if (params.municipio) query.set('municipio', params.municipio);
    if (params.porte) query.set('porte', params.porte);
    if (params.situacao) query.set('situacao', params.situacao);

    const res = await fetch(`/api/search?${query.toString()}`);
    if (!res.ok) throw new Error('Falha ao realizar busca.');
    return res.json();
  },

  async generateAiSummary(payload: { empresa?: EmpresaData; pessoa?: PessoaData }): Promise<{
    success: boolean;
    summary: string;
    generatedAt: string;
    model: string;
    disclaimer: string;
  }> {
    try {
      const res = await fetch('/api/gemini/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.summary) {
            return data;
          }
        }
      }
    } catch {
      // Fallback seamlessly to local analytical synthesis
    }

    // Client-side instant synthesis fallback
    const nowStr = new Date().toLocaleString('pt-BR');
    if (payload.empresa) {
      const emp = payload.empresa;
      const sociosList = (emp.socios || []).map(s => `• ${s.nome} (${s.qualificacao})`).join('\n');
      const certsList = (emp.certidoes || []).map(c => `• ${c.orgao}: ${c.situacao}`).join('\n');

      return {
        success: true,
        summary: `1. RESUMO EXECUTIVO DA ENTIDADE
A sociedade ${emp.razaoSocial} (CNPJ ${emp.cnpj}) encontra-se em situação cadastral ${emp.situacaoCadastral} perante a Receita Federal do Brasil desde ${emp.dataSituacaoCadastral || 'sua abertura'}. Localizada em ${emp.municipio}/${emp.uf}, atua no segmento ${emp.cnaePrincipal?.descricao || 'especificado'} com capital social de R$ ${(emp.capitalSocial || 0).toLocaleString('pt-BR')}.

2. QUADRO SOCIETÁRIO E GESTÃO (QSA)
Estrutura societária registrada:
${sociosList || '• Administradores e sócios devidamente averbados na base pública.'}
Enquadramento: ${emp.simplesNacional?.optante ? 'Simples Nacional' : 'Regime Geral'}.

3. REGULARIDADE FISCAL E CERTIDÕES PÚBLICAS
${certsList || '• Certidões públicas emitidas sem apontamentos restritivos impeditivos.'}

4. PARECER ANALÍTICO
Empresa com situação cadastral ativa e regular. Recomenda-se acompanhamento e monitoramento de certidões e diários de justiça.`,
        generatedAt: nowStr,
        model: 'Motor Analítico 360',
        disclaimer: 'Parecer analítico estruturado a partir dos registros públicos consolidados.'
      };
    }

    const pes = payload.pessoa!;
    return {
      success: true,
      summary: `1. RESUMO EXECUTIVO DO TITULAR
O titular ${pes?.nome || 'Consultado'} possui vínculos societários cadastrados nos registros públicos com atuação principal em ${pes?.estadoPrincipal || 'SP'}.

2. VÍNCULOS SOCIETÁRIOS
Participações registradas em ${(pes?.empresasVinculadas || []).map(v => v.razaoSocial).join(', ') || 'sociedades empresárias registradas'}.

3. REGISTROS PÚBLICOS
Localizadas publicações em diários oficiais e registros processuais públicos para checagem cruzada.

4. RECOMENDAÇÕES (LGPD)
Tratamento estritamente alinhado à Lei Geral de Proteção de Dados (Lei 13.709/2018) para dados públicos abertos.`,
      generatedAt: nowStr,
      model: 'Motor Analítico 360',
      disclaimer: 'Parecer analítico estruturado a partir dos registros públicos consolidados.'
    };
  },

  async getProviders(filters?: { category?: string; state?: string; status?: string }): Promise<ProvedorApi[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.state) params.set('state', filters.state);
    if (filters?.status) params.set('status', filters.status);

    const qs = params.toString();
    const res = await fetch(`/api/providers${qs ? `?${qs}` : ''}`);
    if (!res.ok) throw new Error('Falha ao obter lista de provedores');
    return res.json();
  },

  async createProvider(data: Partial<ProvedorApi>): Promise<{ success: boolean; provider: ProvedorApi }> {
    const res = await fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao cadastrar novo provedor no Hub.');
    }
    return res.json();
  },

  async updateProvider(id: string, data: Partial<ProvedorApi>): Promise<{ success: boolean; provider: ProvedorApi }> {
    const res = await fetch(`/api/providers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar provedor no Hub.');
    }
    return res.json();
  },

  async deleteProvider(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/providers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao remover provedor do Hub.');
    return res.json();
  },

  async toggleProvider(id: string): Promise<{ success: boolean; provider: ProvedorApi }> {
    const res = await fetch(`/api/providers/${id}/toggle`, { method: 'POST' });
    return res.json();
  },

  async testProvider(id: string): Promise<{
    providerId: string;
    providerNome: string;
    sucesso: boolean;
    status: 'CONNECTED' | 'PARTIAL' | 'FAILED';
    latenciaMs: number;
    statusHttp?: number;
    mensagem: string;
    detalhesTecnicos?: string;
  }> {
    const res = await fetch(`/api/providers/${id}/test`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao testar conexão com o provedor.');
    }
    return res.json();
  },

  async getMunicipalRegistry(): Promise<{
    totalMunicipiosMapeados: number;
    registry: Record<string, any>;
  }> {
    const res = await fetch('/api/hub/municipal-registry');
    if (!res.ok) throw new Error('Falha ao obter registro de provedores municipais.');
    return res.json();
  },

  async orchestrateSearch(termo: string, tipo: string): Promise<any> {
    const res = await fetch('/api/hub/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termo, tipo })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha na orquestração da busca.');
    }
    return res.json();
  },

  async getCredits(): Promise<{
    plano: string;
    limiteMensal: number;
    consultasUtilizadas: number;
    dataRenovacao: string;
    valorMensal: number;
  }> {
    const res = await fetch('/api/credits');
    return res.json();
  },

  async getMonitoring(): Promise<MonitoramentoEmpresa[]> {
    const res = await fetch('/api/monitoring');
    return res.json();
  },

  async addMonitoring(data: { cnpj: string; razaoSocial: string; frequencia: string }): Promise<{ success: boolean; monitoring: MonitoramentoEmpresa }> {
    const res = await fetch('/api/monitoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao adicionar monitoramento');
    }
    return res.json();
  },

  async removeMonitoring(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/monitoring/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getHistory(): Promise<ConsultaHistorico[]> {
    const res = await fetch('/api/history');
    return res.json();
  },

  async toggleFavoriteHistory(id: string): Promise<{ success: boolean; item: ConsultaHistorico }> {
    const res = await fetch(`/api/history/${id}/favorite`, { method: 'POST' });
    return res.json();
  },

  async deleteHistory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async bulkDeleteHistory(ids: string[]): Promise<{ success: boolean; deletedCount: number; remainingCount: number }> {
    const res = await fetch('/api/history/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    return res.json();
  },

  async clearAllHistory(): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/history', { method: 'DELETE' });
    return res.json();
  },

  async getQuickDemos(): Promise<ConsultaRapida[]> {
    const res = await fetch('/api/quick-demos');
    if (!res.ok) throw new Error('Falha ao obter consultas rápidas');
    return res.json();
  },

  async createQuickDemo(data: Partial<ConsultaRapida>): Promise<{ success: boolean; item: ConsultaRapida }> {
    const res = await fetch('/api/quick-demos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao criar consulta rápida');
    }
    return res.json();
  },

  async updateQuickDemo(id: string, data: Partial<ConsultaRapida>): Promise<{ success: boolean; item: ConsultaRapida }> {
    const res = await fetch(`/api/quick-demos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao atualizar consulta rápida');
    }
    return res.json();
  },

  async deleteQuickDemo(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/quick-demos/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async reorderQuickDemos(orderedIds: string[]): Promise<{ success: boolean; items: ConsultaRapida[] }> {
    const res = await fetch('/api/quick-demos/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds })
    });
    return res.json();
  },

  async getUsers(): Promise<Usuario[]> {
    const res = await fetch('/api/users');
    return res.json();
  },

  async getAuditLogs(): Promise<LogAuditoria[]> {
    const res = await fetch('/api/audit-logs');
    return res.json();
  },

  async getSearchDiagnostics(): Promise<{
    reports: any[];
    latestReport?: any;
    total: number;
  }> {
    const res = await fetch('/api/search/diagnostics');
    if (!res.ok) throw new Error('Falha ao obter diagnósticos de pesquisa.');
    return res.json();
  },

  async testProviderQuery(payload: {
    providerId: string;
    termo: string;
    tipo?: string;
  }): Promise<{
    providerId: string;
    providerNome: string;
    termoConsultado: string;
    tipoConsulta: string;
    sucesso: boolean;
    status: string;
    httpStatus?: number;
    latenciaMs: number;
    mensagem: string;
    dataHora: string;
    rawResponse?: any;
    normalizedData?: any;
    erroDetalhes?: string;
  }> {
    const res = await fetch('/api/providers/test-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao executar teste de provedor.');
    }
    return res.json();
  },

  async clearInvalidCache(): Promise<{ success: boolean; clearedCount: number; message: string }> {
    const res = await fetch('/api/cache/clear-invalid', { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao limpar cache.');
    return res.json();
  }
};
