import { toFile } from 'openai'
import { GHContent, GHMetadata } from '../utils/github/utils.js'

export class AgentModel {
  constructor({ openai, vectorStoreParams, dataset }) {
    this.openai = openai
    this.vectorStoreParams = vectorStoreParams
    this.dataset = dataset
  }

  async setupDataset() {
    console.log('Starting dataset setup...')
    let vectorStore = null
    const [vsMK, vsMV] = Object.entries(this.vectorStoreParams.metadata)[0] // First key-value pair

    // Helper function
    const processFiles = async (vectorStore, ghFiles, vsMK, vsMV) => {
      console.log('Processing files...')
  
      for (const file of ghFiles) {
        const { name, sha, download_url, sourceData } = file
        const { owner, repo, branch, path } = sourceData
  
        const ghFileContent = await GHContent(download_url)
        const fileObj = await toFile(Buffer.from(ghFileContent), name)
        const openaiFile = await this.openai.files.create({ file: fileObj, purpose: 'user_data' })
  
        await this.openai.vectorStores.files.createAndPoll(vectorStore.id, {
          file_id: openaiFile.id,
          attributes: {
            [vsMK]: vsMV,
            gh_owner: owner,
            gh_repo: repo,
            gh_path: path,
            gh_branch: branch,
            gh_sha: sha,
            gh_name: name,
          }
        })
        console.log(`File Added: ${name}`)
      }
    }

    // Helper function
    const syncFiles = async (vectorStore, ghFiles, vsFiles, vsMK, vsMV) => {
      const vsFilesMap = new Map(vsFiles.map(f => [f.attributes.gh_name, f]))
      const ghFilesMap = new Map(ghFiles.map(f => [f.name, f]))
  
      for (const ghFile of ghFiles) {
        const vsFile = vsFilesMap.get(ghFile.name)
        if (!vsFile) { // ADDED
          await processFiles(vectorStore, [ghFile], vsMK, vsMV)
        } else if (vsFile.attributes.gh_sha !== ghFile.sha) { // UPDATED
          const { name, sha, download_url, sourceData } = ghFile
          const { owner, repo, branch, path } = sourceData
  
          const ghFileContent = await GHContent(download_url)
          const fileObj = await toFile(Buffer.from(ghFileContent), name)
  
          try {
            if (vsFile.id) await this.openai.vectorStores.files.del(vectorStore.id, vsFile.id)
            if (vsFile.file_id) await this.openai.files.del(vsFile.file_id)
          } catch (error) {
            console.warn(`Error deleting file ${name}: ${error.message}`)
          }

          const openaiFile = await this.openai.files.create({ file: fileObj, purpose: 'user_data' })
  
          await this.openai.vectorStores.files.createAndPoll(vectorStore.id, {
            file_id: openaiFile.id,
            attributes: {
              [vsMK]: vsMV,
              gh_owner: owner,
              gh_repo: repo,
              gh_path: path,
              gh_branch: branch,
              gh_sha: sha,
              gh_name: name,
            }
          })
          console.log(`File Updated: ${name}`)
        } else { // UNCHANGED
          console.log(`File Unchanged: ${ghFile.name}`)
        }
      }
  
      // DELETED
      for (const vsFile of vsFiles) {
        if (!ghFilesMap.has(vsFile.attributes.gh_name)) {
          try {
            if (vsFile.id) await this.openai.vectorStores.files.del(vectorStore.id, vsFile.id)
            if (vsFile.file_id) await this.openai.files.del(vsFile.file_id)
            console.log(`File Deleted: ${vsFile.attributes.gh_name}`)
          } catch (error) {
            console.warn(`Error deleting file ${vsFile.attributes.gh_name}: ${error.message}`)
          }
        }
      }
    }

    try {
      // Get existing Vector Stores
      for await (const vs of this.openai.vectorStores.list({ limit: 20 })) {
        if (vs?.metadata?.[vsMK] === vsMV) {
          vectorStore = vs
          break
        }
      }
  
      // Get all GitHub files metadata
      console.log('Getting all GitHub files metadata...')
      const ghFiles = []
      await Promise.all(this.dataset.map(async data => {
        const { owner, repo, branch, path } = data
        const metadata = await GHMetadata(owner, repo, branch, path)
        ghFiles.push(...metadata)
      }))
      console.log(`Found a total of ${ghFiles.length} files in GitHub. Processing...`)
  
      if (!vectorStore) {
        // Create new Vector Store
        console.log('Creating new Vector Store...')
        vectorStore = await this.openai.vectorStores.create(this.vectorStoreParams)
        console.log('Vector Store created with ID:', vectorStore.id)
  
        await processFiles(vectorStore, ghFiles, vsMK, vsMV)
        console.log('Dataset setup complete.')
        return { vectorStoreId: vectorStore.id }
      } else {
        // Sync existing Vector Store
        console.log('Syncing existing Vector Store with ID:', vectorStore.id)
    
        // Get current Vector Store files
        const vsFiles = []
        for await (const file of this.openai.vectorStores.files.list(vectorStore.id, { limit: 100, filter: 'completed' })) {
          vsFiles.push(file)
        }
    
        if (vsFiles.length === 0) { // Empty
          console.log('Vector Store is empty. Adding all GitHub files...')
          await processFiles(vectorStore, ghFiles, vsMK, vsMV)
        } else { // Sync needed
          console.log(`Found ${vsFiles.length} files in Vector Store. Syncing...`)
          await syncFiles(vectorStore, ghFiles, vsFiles, vsMK, vsMV)
        }
    
        console.log('Dataset setup complete.')
        return { vectorStoreId: vectorStore.id }
      }  
    } catch (error) {
      console.error('Error in setupDataset:', error)
      throw error
    }
  }

  async getResponse({ input, vectorStoreId, previous_response_id }) {
    try {
      const response = await this.openai.responses.create({
        input,
        model: 'gpt-4o-mini',
        instructions:
`Ets 'PayRetailers Agent', l'agent d'intel·ligència artificial per a PayRetailers. Sigues concís i resolutiu. Recorda:
- Tens accés a tota la informació de les pàgines "https://payretailers.com/" i "https://payretailers.dev/" mitjançant la tool "file_search".
- Quan retornis codi, aquest ha d'estar envoltat amb tres cometes inverses \`\`\`codi\`\`\` i indenta amb 2 espais.
- Si no trobes la infromació que necessites, informa-ho obertament sense inventar res. Si necessites més context per respondre adequadament, demana més informació a l'usuari.`,
        previous_response_id,
        store: true,
        stream: false,
        temperature: 0.4,
        tool_choice: { type: 'file_search' },
        tools: [
          {
            type: 'file_search',
            vector_store_ids: [vectorStoreId],
            max_num_results: 16,
            ranking_options: { ranker: 'auto', score_threshold: 0.3 }
          }
        ],
        truncation: 'auto'
      })
      return response
    } catch (error) {
      console.error('Error in getResponse:', error)
      throw error
    }
  }
}