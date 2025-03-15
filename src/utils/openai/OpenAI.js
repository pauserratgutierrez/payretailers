import OpenAI from 'openai'

// Not a singleton (multiple instances with different API keys could be needed)
export class OpenAIWrapper {
  constructor(config = {}) {
    const { apiKey } = config
    if (!apiKey) throw new Error('API key is required to initialize OpenAI client')

    // https://platform.openai.com/docs/api-reference
    this.client = new OpenAI({
      apiKey: apiKey,
      maxRetries: 2,
      timeout: 20 * 1000,
    })
  }

  getClient() {
    return this.client
  }
}