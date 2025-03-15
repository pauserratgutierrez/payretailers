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
  ]
}