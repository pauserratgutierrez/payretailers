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
      if (!vectorStoreId) return res.status(400).json({ error: 'Missing vectorStore' })
      if (!input) return res.status(400).json({ error: 'Missing input' })

      const response = await this.agentModel.getResponse({ input, vectorStoreId, previous_response_id })
      res.json({ data: { response } })
    } catch (error) {
      console.log(`Error in getResponse: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}