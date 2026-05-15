import { validateApiKey } from './secure-test'

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { apiKey } = req.body

  const check = await validateApiKey(apiKey)

  if (check.error) {
    return res.status(401).json({
      success: false,
      message: check.error
    })
  }

  // ✅ sementara kita dummy credit
  return res.status(200).json({
    success: true,
    message: "API Key Connected ✅",
    credit: 999
  })
}
