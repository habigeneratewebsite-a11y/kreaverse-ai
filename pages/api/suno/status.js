import { validateApiKey } from '../secure-test'

export default async function handler(req, res) {

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ✅ Validasi API key Kreaverse
  const apiKey = req.headers['x-api-key']
  const check = await validateApiKey(apiKey)

  if (check.error) {
    return res.status(401).json({ error: check.error })
  }

  // ✅ Ambil taskId dari URL
  const { taskId } = req.query

  if (!taskId) {
    return res.status(400).json({ error: 'taskId required in query' })
  }

  try {
    const response = await fetch(
      `https://api.kie.ai/api/v1/suno/get-music-details?taskId=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.KIE_API_KEY}`
        }
      }
    )

    const data = await response.json()

    return res.status(200).json(data)

  } catch (err) {
    return res.status(500).json({
      error: 'Status check failed',
      detail: err.message
    })
  }
}
