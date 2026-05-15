import { useState } from 'react'

export default function Dashboard() {
  const [apiKey, setApiKey] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [taskId, setTaskId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function generateCover() {
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/suno/cover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        uploadUrl,
        prompt,
        callBackUrl: "https://webhook.site/test123"
      })
    })

    const data = await res.json()
    setTaskId(data?.data?.taskId || '')
    setLoading(false)
  }

  async function checkStatus() {
    if (!taskId) return alert("No taskId")

    const res = await fetch(`/api/suno/status?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    })

    const data = await res.json()
    setResult(data)
  }

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>Kreaverse AI - Suno Cover</h1>

      <input
        placeholder="API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <input
        placeholder="Upload Audio URL"
        value={uploadUrl}
        onChange={(e) => setUploadUrl(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <textarea
        placeholder="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <button onClick={generateCover} disabled={loading}>
        {loading ? "Generating..." : "Generate Cover"}
      </button>

      <hr />

      {taskId && (
        <>
          <p><b>Task ID:</b> {taskId}</p>
          <button onClick={checkStatus}>Check Status</button>
        </>
      )}

      {result && (
        <pre style={{ marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
