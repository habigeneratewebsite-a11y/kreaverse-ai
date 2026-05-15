import { IncomingForm } from 'formidable'
import fs from 'fs'
import { validateApiKey } from './secure-test'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = req.headers['x-api-key']
  const check = await validateApiKey(apiKey)

  if (check.error) {
    return res.status(401).json({ error: check.error })
  }

  const form = new IncomingForm()

  form.parse(req, async (err, fields, files) => {

    if (err) {
      return res.status(500).json({ error: 'File parse failed' })
    }

    const file = files.file?.[0]

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    try {
      const fileStream = fs.createReadStream(file.filepath)

      const formData = new FormData()
      formData.append('file', fileStream, file.originalFilename)

      const uploadRes = await fetch(
        'https://kieai.redpandaai.co/api/file-stream-upload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.KIE_API_KEY}`
          },
          body: formData
        }
      )

      const uploadData = await uploadRes.json()

      return res.status(200).json(uploadData.data)

    } catch (error) {
      return res.status(500).json({
        error: 'Upload to Kie failed',
        detail: error.message
      })
    }
  })
}
