import { useState } from 'react'

export default function Dashboard() {
  const [apiKey, setApiKey] = useState('')
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [taskId, setTaskId] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  async function generateCover() {
    if (!file) return alert("Please select audio file")

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("prompt", prompt)

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      },
      body: formData
    })

    const uploadData = await uploadRes.json()

    if (!uploadData.uploadUrl) {
      setLoading(false)
      return alert("Upload failed")
    }

    const sunoRes = await fetch('/api/suno/cover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        uploadUrl: uploadData.uploadUrl,
        prompt,
        callBackUrl: "https://webhook.site/test123"
      })
    })

    const sunoData = await sunoRes.json()
    setTaskId(sunoData?.data?.taskId || '')
    setLoading(false)
  }

  async function checkStatus() {
    if (!taskId) return

    const res = await fetch(`/api/suno/status?taskId=${taskId}`, {
      headers: {
        'x-api-key': apiKey
      }
    })

    const data = await res.json()
    setStatus(data)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white',
      padding: 20
    }}>
      <div style={{
        maxWidth: 500,
        margin: '0 auto',
        background: '#1e293b',
        padding: 20,
        borderRadius: 12
      }}>

        <h2 style={{ marginBottom: 20 }}>Kreaverse AI - Suno Cover</h2>

        <input
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={inputStyle}
        />

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={inputStyle}
        />

        <textarea
          placeholder="Prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={generateCover}
          style={buttonStyle}
        >
          {loading ? "Processing..." : "Generate Cover"}
        </button>

        {taskId && (
          <>
            <p style={{ marginTop: 20 }}>Task ID: {taskId}</p>
            <button onClick={checkStatus} style={buttonStyle}>
              Check Status
            </button>
          </>
        )}

        {status && (
          <pre style={{
            background: '#0f172a',
            padding: 10,
            marginTop: 20,
            fontSize: 12,
            overflow: 'auto'
          }}>
            {JSON.stringify(status, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: 10,
  marginBottom: 15,
  borderRadius: 6,
  border: '1px solid #334155',
  background: '#0f172a',
  color: 'white'
}

const buttonStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 6,
  border: 'none',
  background: '#3b82f6',
  color: 'white',
  cursor: 'pointer'
}
