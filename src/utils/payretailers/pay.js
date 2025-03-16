export async function makePayment(paymentData = {}) {
  const API_URL = 'https://api-sandbox.payretailers.com/payments/v2/transactions'

  const credentials = Buffer.from(`${process.env.PAYRETAILERS_API_USER}:${process.env.PAYRETAILERS_API_PASSWORD}`).toString('base64')
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Basic ${credentials}` }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Payment API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error in makePayment:', error)
    throw error
  }
}