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

  getDatasetResponses = async (req, res) => {
    try {
      const { input, vectorStoreId, previous_response_id } = req.body
      if (!vectorStoreId) return res.status(400).json({ error: 'Missing vectorStoreId' })
      if (!input) return res.status(400).json({ error: 'Missing input' })

      const response = await this.agentModel.getDatasetResponses({ input, vectorStoreId, previous_response_id })
      res.json({ response_id: response.id, output_text: response.output_text })
    } catch (error) {
      console.log(`Error in getDatasetResponses: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  getBuyResponses = async (req, res) => {
    try {
      const { base64Image, firstName, lastName } = req.body
      if (!base64Image) return res.status(400).json({ error: 'Missing base64Image' })
      if (!firstName) return res.status(400).json({ error: 'Missing firstName' })
      if (!lastName) return res.status(400).json({ error: 'Missing lastName' })

      const response = await this.agentModel.getBuyResponses({ base64Image, firstName, lastName })
      res.json({ form_action: response.form_action })
    } catch (error) {
      console.log(`Error in getBuyResponses: ${error.message}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}