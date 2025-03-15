import express, { json } from 'express'
import { CONFIG } from './config.js'
import { OpenAIWrapper } from './utils/openai/OpenAI.js'

import { createAgentRouter } from './routes/agent.js'

import { AgentModel } from './models/agent.js'

// OpenAI
const openaiWrapper = new OpenAIWrapper({ apiKey: process.env.OPENAI_API_KEY })
const openai = openaiWrapper.getClient()

// Initialize models
const agentModel = new AgentModel({
  openai,
  vectorStoreParams: CONFIG.VECTOR_STORE_PARAMS,
  dataset: CONFIG.DATASET_GITHUB
})

// API Server
const server = express()
server.use(json())
server.disable('x-powered-by')

// CORS Middleware
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// API Routes
server.use('/agent', createAgentRouter({ agentModel }))

// 404 Route
server.use((req, res) => res.sendStatus(404).send({ error: 'Route not found' }))

const PORT = process.env.AGENT_PORT || 1234
server.listen(PORT, () => console.log(`API Server running on port ${PORT}`))