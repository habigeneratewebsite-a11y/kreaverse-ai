import { validateApiKey } from '../secure-test'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ✅ Validasi API key Kreaverse
  const apiKey = req.headers['x-api-key']
  const check = await validateApiKey(apiKey)

  if (check.error) {
    return res.status(401).json({ error: check.error })
  }

  const { uploadUrl, prompt, callBackUrl } = req.body

  if (!uploadUrl || !prompt || !callBackUrl) {
    return res.status(400).json({
      error: 'uploadUrl, prompt, and callBackUrl are required'
    })
  }

  try {
    const response = await fetch('https://api.kie.ai/api/v1/generate/upload-cover', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl,
        prompt: prompt,
        customMode: false,
        instrumental: false,
        model: "V4",
        callBackUrl: callBackUrl
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
