import { useState } from 'react'

export default function Dashboard() {

  const [apiKey, setApiKey] = useState('')
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('')
  const [title, setTitle] = useState('')
  const [model, setModel] = useState('V5_5')
  const [customMode, setCustomMode] = useState(true)
  const [instrumental, setInstrumental] = useState(false)
  const [vocalGender, setVocalGender] = useState('m')
  const [negativeTags, setNegativeTags] = useState('')
  const [styleWeight, setStyleWeight] = useState(0.5)
  const [weirdness, setWeirdness] = useState(0.5)
  const [audioWeight, setAudioWeight] = useState(0.5)
  const [loading, setLoading] = useState(false)

  async function generateCover() {

    if (!file) return alert("Select audio file")

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

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
        uploadUrl: uploadData.fileUrl,
        prompt,
        style,
        title,
        customMode,
        instrumental,
        model,
        vocalGender,
        negativeTags,
        styleWeight,
        weirdnessConstraint: weirdness,
        audioWeight,
        callBackUrl: "https://webhook.site/test123"
      })
    })

    await sunoRes.json()
    setLoading(false)
    alert("Task Created ✅")
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <h2>Kreaverse AI – Suno Pro</h2>

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

        <select value={model}
          onChange={e=>setModel(e.target.value)}
          style={inputStyle}
        >
          <option value="V5_5">V5_5 (Latest)</option>
          <option value="V5">V5</option>
          <option value="V4_5PLUS">V4_5PLUS</option>
          <option value="V4_5">V4_5</option>
          <option value="V4">V4</option>
        </select>

        <select value={vocalGender}
          onChange={e=>setVocalGender(e.target.value)}
          style={inputStyle}
        >
          <option value="m">Male</option>
          <option value="f">Female</option>
        </select>

        <input placeholder="Negative Tags"
          value={negativeTags}
          onChange={e=>setNegativeTags(e.target.value)}
          style={inputStyle}
        />

        <Slider label="Style Weight" value={styleWeight} setValue={setStyleWeight}/>
        <Slider label="Weirdness Constraint" value={weirdness} setValue={setWeirdness}/>
        <Slider label="Audio Weight" value={audioWeight} setValue={setAudioWeight}/>

        <button onClick={generateCover} style={buttonStyle}>
          {loading ? "Generating..." : "Generate Cover"}
        </button>

      </div>
    </div>
  )
}

function Slider({label,value,setValue}) {
  return (
    <div style={{marginBottom:15}}>
      <label>{label}: {value}</label>
      <input type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={e=>setValue(parseFloat(e.target.value))}
        style={{width:'100%'}}
      />
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
  width: 500,
  background: '#1e293b',
  padding: 25,
  borderRadius: 15,
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

const buttonStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 6,
  border: 'none',
  background: '#3b82f6',
  color: 'white'
}
