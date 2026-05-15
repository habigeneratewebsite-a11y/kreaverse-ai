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

  const { audio_url, title } = req.body

  if (!audio_url) {
    return res.status(400).json({ error: 'audio_url required' })
  }

  try {
    const response = await fetch('https://api.kie.ai/api/v1/suno/cover', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.KIE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url,
        title: title || "Kreaverse Cover"
      })
    })

    const data = await response.json()

    return res.status(200).json(data)

  } catch (err) {
    return res.status(500).json({
      error: 'Suno cover request failed',
      detail: err.message
    })
  }
}
