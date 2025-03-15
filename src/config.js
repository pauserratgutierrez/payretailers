export const CONFIG = {
  AGENT_PARAMS: {
    model: 'gpt-4o-mini',
    instructions:
`Ets 'UOC Agent', l'agent d'intel·ligència artificial per al servei d'atenció de la Universitat Oberta de Catalunya (UOC). La teva missió és respondre a les preguntes dels estudiants, professors o personal administratiu. Tens accés a file search.`,
  },
  VECTOR_STORE_PARAMS: {
    chunking_strategy: { type: 'auto' },
    expires_after: { anchor: 'last_active_at', days: 4 },
    metadata: { lookup_id: 'uoc_agent' }, // Always as first key-value pair!
    name: 'UOC Agent',
  },
  DATASET_GITHUB: [
    {
      owner: 'pauserratgutierrez',
      repo: 'payretailers',
      branch: 'main',
      path: 'dataset/formatted',
    },
      // Additional repositories can be added here
  ],
  OPENAI_MODEL_PRICING: {
    'gpt-4o': { promptTokenCost: 2.5/1000000, completionTokenCost: 10/1000000 },
    'gpt-4o-mini': { promptTokenCost: 0.15/1000000, completionTokenCost: 0.6/1000000 }
  }
}