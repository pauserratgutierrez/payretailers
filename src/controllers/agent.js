export class AgentController {
  constructor({ agentModel }) {
    this.agentModel = agentModel
  }

  setupDataset = async (req, res) => {
    try {
      const { vectorStoreId } = await this.agentModel.setupDataset()
      res.json({ vectorStoreId })
    } catch (error) {
      console.log(`Error in setupDataset: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  getResponse = async (req, res) => {
    try {
      const { input, vectorStoreId, previous_response_id } = req.body
      if (!vectorStoreId) return res.status(400).json({ error: 'Missing vectorStoreId' })
      if (!input) return res.status(400).json({ error: 'Missing input' })

      const response = await this.agentModel.getResponse({ input, vectorStoreId, previous_response_id })

      const usage = { 'gpt-4o-mini': { promptTokenCost: 0.15/1000000, completionTokenCost: 0.6/1000000 } }
      const promptTokenCost = response.usage.input_tokens * usage['gpt-4o-mini'].promptTokenCost
      const completionTokenCost = response.usage.output_tokens * usage['gpt-4o-mini'].completionTokenCost
      console.log(`Generated a response. Cost: ${promptTokenCost + completionTokenCost}$`)

      res.json({ response_id: response.id, output_text: response.output_text })
    } catch (error) {
      console.log(`Error in getResponse: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}