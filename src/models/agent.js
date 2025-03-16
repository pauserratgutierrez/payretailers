import { toFile } from 'openai'
import { GHContent, GHMetadata } from '../utils/github/utils.js'
import { makePayment } from '../utils/payretailers/pay.js'

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

  async getDatasetResponses({ input, vectorStoreId, previous_response_id }) {
    try {
      const response = await this.openai.responses.create({
        input,
        model: 'gpt-4o-mini',
        instructions:
`Ets "PayRetailers Agent", l'agent d'intel·ligència artificial especialitzat per a PayRetailers. La teva tasca és oferir respostes clares, concises i precises.

Per aconseguir-ho, segueix aquestes directrius:
  - Utilitza tota la informació disponible a les pàgines "https://payretailers.com/" i "https://payretailers.dev/" a través de la tool "file_search".
  - Si no trobes la informació necessària, informa-ho obertament sense inventar res.
  - Si necessites més context o detalls per respondre adequadament, demana'ls a l'usuari.
  - Mantingues un to directe, resolutiu i enfocat en oferir la millor resposta possible.
  - Quan retornis codi, aquest ha d'estar envoltat amb tres cometes inverses \`\`\`codi\`\`\` i indetat amb 2 espais per nivell d'indentació.`,
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

      // Calculate cost
      const usage = { 'gpt-4o-mini': { promptTokenCost: 0.15 / 1000000, completionTokenCost: 0.6 / 1000000 } }
      const inputTokensCost = response.usage.input_tokens * usage['gpt-4o-mini'].promptTokenCost
      const outputTokensCost = response.usage.output_tokens * usage['gpt-4o-mini'].completionTokenCost
      const totalCost = inputTokensCost + outputTokensCost
      console.log(`Response generated with ID: ${response.id}. Total cost: $${totalCost.toFixed(4)}`)

      return response
    } catch (error) {
      console.error('Error in getDatasetResponses:', error)
      throw error
    }
  }

  async getBuyResponses({ base64Image, firstName, lastName }) {
    try {
      const openaiResponse = await this.openai.responses.create({
        model: 'gpt-4o-mini',
        input: [{
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 
`Ets un model d’interpretació d’imatges especialitzat en ecommerce. Se’t proporciona una captura de pantalla d’una pàgina de producte d’un ecommerce. La teva tasca és identificar i extreure amb precisió dos elements clau de la imatge:
  
  - **Preu del producte:** Inclou la quantitat sense la moneda (per exemple, "29,99").
  - **Descripció del producte:** Text que resumeix les característiques i especificacions principals.

**Instruccions:**
1. Analitza detalladament l’imatge per detectar el text visible que representi el preu i la descripció.
2. Si es detecten múltiples preus o descripcions, selecciona l’element que correspongui al producte principal de la pàgina.
3. Si algun dels elements no és clar o no es pot identificar, retorna el valor \`null\` per aquest camp.
4. La resposta ha d’estar estructurada en format JSON amb les claus \`"preu"\` i \`"descripcio"\`.

**Exemple de resposta:**
{ "preu": "29,99", "descripcio": "Camiseta 100% cotó, talla M, amb estampat modern." }

Segueix aquestes instruccions amb precisió, utilitzant només la informació visible a la imatge, sense afegir suposicions externes.`
            },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'low'
            }
          ]
        }]
      })

      const { preu, descripcio } = JSON.parse(openaiResponse.output_text)

      const paymentData = {
        paymentMethodId: 'b04f2ffd-0751-4771-9d07-e9c866977896',
        // amount: '10000',
        amount: preu,
        currency: 'BRL',
        // description: 'Test Demo',
        description: descripcio,
        trackingId: 'Test-Tracking',
        notificationUrl: 'https://link.com/notification',
        returnUrl: 'https://link.com/return',
        cancelUrl: 'https://link.com/cancel',
        language: 'ES',
        customer: {
          firstName,
          lastName,
          email: 'test@gmail.com',
          country: 'BR',
          personalId: '49586181049',
          city: 'Buenos Aires',
          address: 'dsa',
          zip: '130',
          phone: '1149682315',
          deviceId: 'DEVICE',
          ip: '181.166.176.12'
        }
      }

      const paymentResponse = await makePayment(paymentData)
      if (paymentResponse.status === 'FAILED') console.error(`Payment failed with message: ${paymentResponse.message}`)
      if (paymentResponse.form && paymentResponse.form.action) console.log(`Redirect URL for payment completion: ${paymentResponse.form.action}`)
      
      return { form_action: paymentResponse.form.action }
    } catch (error) {
      console.error('Error in getBuyResponses:', error)
      throw error
    }
  }
}