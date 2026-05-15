import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.innerHTML = `
      @keyframes glow {
        from { box-shadow: 0 0 5px #00f5ff; }
        to { box-shadow: 0 0 15px #3b82f6; }
      }
      @keyframes fadeIn {
        from { opacity:0; transform:translateY(20px); }
        to { opacity:1; transform:translateY(0); }
      }
    `
    document.head.appendChild(styleTag)
  }, [])

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

    await fetch('/api/suno/cover', {
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

    setLoading(false)
    alert("Task Created ✅")
  }

  return (
    <div style={pageStyle}>
      <div style={{...cardStyle, animation:'fadeIn 0.8s ease'}}>

        <h2 style={{marginBottom:20}}>
          Kreaverse AI – Suno Pro
        </h2>

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

        {/* MODEL CUSTOM DROPDOWN */}
        <div style={{marginBottom:15}}>
          <label>Model</label>
          <div style={dropdownBox}>
            Kreaverse AI {model === 'V5_5' ? 'V5.5' : model}
            {model === 'V5_5' && (
              <span style={badgeStyle}>Terbaru</span>
            )}
          </div>

          <div style={dropdownList}>
            {["V5_5","V5","V4_5PLUS","V4_5","V4"].map(m => (
              <div key={m}
                style={dropdownItem}
                onClick={()=>setModel(m)}
              >
                {m === "V5_5" ? "Kreaverse AI V5.5" : m}
              </div>
            ))}
          </div>
        </div>

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
  color: 'white',
  boxShadow:'0 10px 30px rgba(0,0,0,0.5)'
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

const dropdownBox = {
  padding: 10,
  borderRadius: 8,
  background: '#0f172a',
  border: '1px solid #334155',
  marginTop:5,
  marginBottom:5,
  fontWeight:'bold',
  display:'flex',
  alignItems:'center'
}

const dropdownList = {
  background:'#1e293b',
  borderRadius:8,
  overflow:'hidden'
}

const dropdownItem = {
  padding:10,
  cursor:'pointer',
  borderBottom:'1px solid #334155'
}

const badgeStyle = {
  marginLeft:10,
  padding:'2px 8px',
  fontSize:10,
  background:'linear-gradient(90deg,#00f5ff,#3b82f6)',
  borderRadius:20,
  animation:'glow 1.5s ease-in-out infinite alternate'
}

const toggleStyle = {
  display:'block',
  marginBottom:10
}

const buttonStyle = {
  width:'100%',
  padding:12,
  borderRadius:6,
  border:'none',
  background:'#3b82f6',
  color:'white',
  cursor:'pointer'
}
