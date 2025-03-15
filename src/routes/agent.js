import { Router } from 'express'

import { AgentController } from '../controllers/agent.js'

export function createAgentRouter({ agentModel }) {
  const agentRouter = Router()

  const agentController = new AgentController({ agentModel })

  agentRouter.get('/dataset/setup', agentController.setupDataset)
  agentRouter.post('/response', agentController.getResponse)

  return agentRouter
}