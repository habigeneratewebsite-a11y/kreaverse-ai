export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    })
  }

  const apiKey = req.headers["x-api-key"]

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "Missing API key"
    })
  }

  const {
    uploadUrl,
    prompt,
    style,
    title,
    customMode,
    instrumental,
    model,
    negativeTags,
    vocalGender,
    styleWeight,
    weirdnessConstraint,
    audioWeight,
    callBackUrl
  } = req.body

  // ✅ VALIDASI WAJIB SESUAI DOKUMENTASI
  if (!uploadUrl) {
    return res.status(400).json({
      success: false,
      message: "uploadUrl required"
    })
  }

  if (!prompt && customMode === false) {
    return res.status(400).json({
      success: false,
      message: "prompt required when customMode is false"
    })
  }

  if (!model) {
    return res.status(400).json({
      success: false,
      message: "model required"
    })
  }

  if (!callBackUrl) {
    return res.status(400).json({
      success: false,
      message: "callBackUrl required"
    })
  }

  try {

    const response = await fetch(
      "https://api.kie.ai/api/v1/generate/upload-cover",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.KIE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uploadUrl,
          prompt,
          style,
          title,
          customMode,
          instrumental,
          model,
          negativeTags,
          vocalGender,
          styleWeight,
          weirdnessConstraint,
          audioWeight,
          callBackUrl
        })
      }
    )

    const data = await response.json()

    if (!response.ok || data.code !== 200) {
      return res.status(400).json({
        success: false,
        message: data.msg || "Suno Cover Failed",
        errorCode: data.code
      })
    }

    return res.status(200).json({
      success: true,
      taskId: data.data.taskId
    })

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Suno Cover API Error",
      detail: error.message
    })
  }
}
