export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    })
  }

  const { apiKey } = req.body

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      message: "API Key required"
    })
  }

  try {

    // ✅ VALIDASI DENGAN ENDPOINT USER INFO
    const response = await fetch(
      "https://api.kie.ai/api/v1/user/info",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      }
    )

    const data = await response.json()

    // ✅ JIKA STATUS BUKAN 200 → INVALID
    if (!response.ok || data.code !== 200) {
      return res.status(401).json({
        success: false,
        message: "API Key invalid or expired"
      })
    }

    // ✅ AMBIL CREDIT ASLI DARI API
    const credit =
      data?.data?.credit ??
      data?.data?.balance ??
      0

    return res.status(200).json({
      success: true,
      credit: credit
    })

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Unable to connect to Kie API"
    })
  }
}
