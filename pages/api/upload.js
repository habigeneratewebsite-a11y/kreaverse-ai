import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: { bodyParser: false }
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const form = formidable({ multiples: false })

  form.parse(req, async (err, fields, files) => {

    if (err) {
      return res.status(500).json({ error: "File parse failed" })
    }

    const file = files.file

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    try {

      const formData = new FormData()
      formData.append(
        "file",
        fs.createReadStream(file.filepath),
        file.originalFilename
      )

      const response = await fetch(
        "https://kieai.redpandaai.co/api/file-stream-upload",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.KIE_API_KEY}`
          },
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        return res.status(400).json(data)
      }

      return res.status(200).json({
        fileUrl: data.data.fileUrl
      })

    } catch (error) {
      return res.status(500).json({
        error: "Upload failed",
        detail: error.message
      })
    }
  })
}
