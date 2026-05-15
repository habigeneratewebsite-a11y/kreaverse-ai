import formidable from "formidable"
import fs from "fs"
import FormData from "form-data"

export const config = {
  api: {
    bodyParser: false
  }
}

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

  const form = formidable({
    multiples: false,
    maxFileSize: 1024 * 1024 * 200 // 200MB limit
  })

  form.parse(req, async (err, fields, files) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "File parsing failed"
      })
    }

    const file = files.file

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      })
    }

    try {

      const formData = new FormData()

      formData.append(
        "file",
        fs.createReadStream(file.filepath),
        file.originalFilename
      )

      // ✅ Upload ke Kie File API sesuai dokumentasi
      const response = await fetch(
        "https://kieai.redpandaai.co/api/file-stream-upload",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.KIE_API_KEY}`,
            ...formData.getHeaders()
          },
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        return res.status(400).json({
          success: false,
          message: data.msg || "Upload to Kie failed"
        })
      }

      return res.status(200).json({
        success: true,
        fileUrl: data.data.fileUrl,
        fileId: data.data.fileId,
        fileName: data.data.fileName,
        expiresAt: data.data.expiresAt
      })

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: "Upload error",
        detail: error.message
      })
    }
  })
}
