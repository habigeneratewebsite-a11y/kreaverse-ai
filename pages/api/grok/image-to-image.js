
import { validateApiKey } from '../secure-test'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = req.headers['x-api-key']
  const check = await validateApiKey(apiKey)

  if (check.error) {
    return res.status(401).json({ error: check.error })
  }

  const { prompt, image_url } = req.body

  if (!prompt || !image_url) {
    return res.status(400).json({ error: 'prompt and image_url required' })
  }

  try {
    const response = await fetch('https://api.x.ai/v1/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "grok-2-image",
        prompt,
        image_url
      })
    })

    const data = await response.json()

    return res.status(200).json(data)

  } catch (err) {
    return res.status(500).json({ error: 'Grok request failed', detail: err.message })
  }
}
