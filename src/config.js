export const CONFIG = {
  VECTOR_STORE_PARAMS: {
    chunking_strategy: { type: 'auto' },
    expires_after: { anchor: 'last_active_at', days: 4 },
    metadata: { lookup_id: 'payretailers_agent' }, // Always as first key-value pair!
    name: 'PayRetailers Agent',
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