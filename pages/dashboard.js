import { useState } from 'react'

export default function Dashboard() {
  const [apiKey, setApiKey] = useState('')
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('')
  const [title, setTitle] = useState('')
  const [customMode, setCustomMode] = useState(false)
  const [instrumental, setInstrumental] = useState(false)
  const [model, setModel] = useState('V4')
  const [taskId, setTaskId] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function generateCover() {
    if (!file) return alert("Select audio file")

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("prompt", prompt)

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
      body: formData
    })

    const uploadData = await uploadRes.json()

    const sunoRes = await fetch('/api/suno/cover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        uploadUrl: uploadData.uploadUrl,
        prompt,
        style,
        title,
        customMode,
        instrumental,
        model,
        callBackUrl: "https://webhook.site/test123"
      })
    })

    const data = await sunoRes.json()
    setTaskId(data?.data?.taskId || '')
    setLoading(false)
  }

  async function checkStatus() {
    const res = await fetch(`/api/suno/status?taskId=${taskId}`, {
      headers: { 'x-api-key': apiKey }
    })

    const data = await res.json()
    setStatus(data)
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{marginBottom:20}}>Kreaverse AI – Suno Cover</h2>

        <input placeholder="API Key"
          value={apiKey}
          onChange={e=>setApiKey(e.target.value)}
          style={inputStyle}
        />

        <input type="file"
          accept="audio/*"
          onChange={e=>setFile(e.target.files[0])}
          style={inputStyle}
        />

        <textarea placeholder="Prompt"
          value={prompt}
          onChange={e=>setPrompt(e.target.value)}
          style={inputStyle}
        />

        {customMode && (
          <>
            <input placeholder="Style"
              value={style}
              onChange={e=>setStyle(e.target.value)}
              style={inputStyle}
            />
            <input placeholder="Title"
              value={title}
              onChange={e=>setTitle(e.target.value)}
              style={inputStyle}
            />
          </>
        )}

        <select value={model}
          onChange={e=>setModel(e.target.value)}
          style={inputStyle}
        >
          <option value="V4">V4</option>
          <option value="V4_5">V4_5</option>
          <option value="V4_5PLUS">V4_5PLUS</option>
          <option value="V4_5ALL">V4_5ALL</option>
          <option value="V5">V5</option>
          <option value="V5_5">V5_5</option>
        </select>

        <label style={toggleStyle}>
          <input type="checkbox"
            checked={customMode}
            onChange={()=>setCustomMode(!customMode)}
          /> Custom Mode
        </label>

        <label style={toggleStyle}>
          <input type="checkbox"
            checked={instrumental}
            onChange={()=>setInstrumental(!instrumental)}
          /> Instrumental
        </label>

        <button onClick={generateCover}
          style={buttonStyle}
        >
          {loading ? "Processing..." : "Generate Cover"}
        </button>

        {taskId && (
          <>
            <p style={{marginTop:15}}>Task ID: {taskId}</p>
            <button onClick={checkStatus} style={buttonStyle}>
              Check Status
            </button>
          </>
        )}

        {status && (
          <div style={resultBox}>
            <pre style={{fontSize:12}}>
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg,#0f172a,#1e293b)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const cardStyle = {
  width: 450,
  background: '#1e293b',
  padding: 25,
  borderRadius: 15,
  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
  color: 'white'
}

const inputStyle = {
  width: '100%',
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
  border: '1px solid #334155',
  background: '#0f172a',
  color: 'white'
}

const toggleStyle = {
  display: 'block',
  marginBottom: 10
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

const resultBox = {
  marginTop: 20,
  background: '#0f172a',
  padding: 10,
  borderRadius: 8,
  maxHeight: 200,
  overflow: 'auto'
}
