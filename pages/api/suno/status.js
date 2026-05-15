export default async function handler(req, res) {

  if (req.method !== "GET") {
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

  const { taskId, type } = req.query

  if (!taskId) {
    return res.status(400).json({
      success: false,
      message: "taskId required"
    })
  }

  try {

    // ✅ Pilih endpoint sesuai jenis task
    let endpoint

    if (type === "cover") {
      endpoint = `https://api.kie.ai/api/v1/suno/cover/record-info?taskId=${taskId}`
    } else {
      // Default: Music Generation / Upload Cover (record-info)
      endpoint = `https://api.kie.ai/api/v1/generate/record-info?taskId=${taskId}`
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.KIE_API_KEY}`
      }
    })

    const data = await response.json()

    if (!response.ok || data.code !== 200) {
      return res.status(400).json({
        success: false,
        message: data.msg || "Status check failed",
        errorCode: data.code
      })
    }

    // ✅ FORMAT OUTPUT CLEAN
    return res.status(200).json({
      success: true,
      taskId: data.data.taskId,
      status: data.data.status || null,
      operationType: data.data.operationType || null,
      type: data.data.type || null,
      errorCode: data.data.errorCode || null,
      errorMessage: data.data.errorMessage || null,
      tracks: data.data.response?.sunoData || null,
      coverImages: data.data.response?.images || null,
      raw: data.data
    })

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Status API Error",
      detail: error.message
    })
  }
}
