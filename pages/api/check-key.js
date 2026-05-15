export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { apiKey } = req.body

  try {

    const response = await fetch("https://api.kie.ai/api/v1/user/info", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid API Key"
      })
    }

    return res.status(200).json({
      success: true,
      credit: data?.data?.credit || 0
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Connection failed"
    })
  }
}
