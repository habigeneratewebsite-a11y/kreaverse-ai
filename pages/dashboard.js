import { useState, useEffect } from 'react'

export default function Dashboard() {

  const [apiKey, setApiKey] = useState('')
  const [connected, setConnected] = useState(false)
  const [credit, setCredit] = useState(null)
  const [popup, setPopup] = useState(null)
  const [popupType, setPopupType] = useState("info")

  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

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
  const [showModelPopup, setShowModelPopup] = useState(false)

  useEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.innerHTML = `
      @keyframes glow {
        from { box-shadow: 0 0 5px #00f5ff; }
        to { box-shadow: 0 0 20px #3b82f6; }
      }
      @keyframes fadeIn {
        from { opacity:0; transform:translateY(20px); }
        to { opacity:1; transform:translateY(0); }
      }
      @keyframes spin {
        from { transform:rotate(0deg); }
        to { transform:rotate(360deg); }
      }
    `
    document.head.appendChild(styleTag)
  }, [])

  function showToast(message, type="info") {
    setPopup(message)
    setPopupType(type)
    setTimeout(()=>setPopup(null),3000)
  }

  async function confirmApiKey() {
    if (!apiKey) return showToast("Masukkan API Key","error")

    const res = await fetch("/api/check-key",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ apiKey })
    })

    const data = await res.json()

    if(data.success){
      setConnected(true)
      setCredit(data.credit)
      showToast("API Key Terhubung ✅","success")
    } else {
      setConnected(false)
      showToast("API Key Salah ❌","error")
    }
  }

  async function uploadFileWithProgress() {

    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append("file", file)

      xhr.open("POST","/api/upload",true)
      xhr.setRequestHeader("x-api-key", apiKey)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percent)
        }
      }

      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.response))
        } else {
          reject("Upload gagal")
        }
      }

      xhr.onerror = function() {
        reject("Upload error")
      }

      xhr.send(formData)
    })
  }

  async function generateCover() {

    if(!connected) return showToast("Konfirmasi API Key dulu","error")
    if(!file) return showToast("Pilih file audio","error")

    setLoading(true)
    setUploadProgress(0)

    try {

      const uploadData = await uploadFileWithProgress()

      await fetch("/api/suno/cover",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key":apiKey
        },
        body:JSON.stringify({
          uploadUrl:uploadData.fileUrl,
          prompt,
          style,
          title,
          customMode,
          instrumental,
          model,
          vocalGender,
          negativeTags,
          styleWeight,
          weirdnessConstraint:weirdness,
          audioWeight,
          callBackUrl:"https://webhook.site/test123"
        })
      })

      showToast("Task Created ✅","success")

    } catch(err) {
      showToast("Gagal upload","error")
    }

    setLoading(false)
  }

  const modelLabel = model === "V5_5"
    ? "Kreaverse AI V5.5"
    : model.replace("_",".")

  return (
    <div style={pageStyle}>
      <div style={{...cardStyle,animation:'fadeIn 0.6s ease'}}>

        <h2>Kreaverse AI – Suno Pro</h2>

        {/* API KEY */}
        <label>API Key</label>
        <input value={apiKey} onChange={e=>setApiKey(e.target.value)} style={inputStyle}/>
        <button style={buttonStyle} onClick={confirmApiKey}>Konfirmasi API Key</button>

        {connected && (
          <div style={connectedBox}>
            ✅ Terhubung | Credit: {credit}
          </div>
        )}

        <hr style={{margin:"20px 0"}}/>

        {/* FILE */}
        <label>Upload Audio File</label>
        <input type="file" accept="audio/*"
          onChange={e=>setFile(e.target.files[0])}
          style={inputStyle}
        />

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={progressBarOuter}>
            <div style={{...progressBarInner,width:`${uploadProgress}%`}}/>
          </div>
        )}

        {/* PROMPT */}
        <label>Prompt</label>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={inputStyle}/>

        {/* MODEL */}
        <label>Model</label>
        <div style={modelBox} onClick={()=>setShowModelPopup(true)}>
          {modelLabel}
          {model === "V5_5" && (
            <span style={badgeStyle}>Terbaru</span>
          )}
        </div>

        {showModelPopup && (
          <div style={modalOverlay} onClick={()=>setShowModelPopup(false)}>
            <div style={modalBox} onClick={(e)=>e.stopPropagation()}>
              {["V5_5","V5","V4_5PLUS","V4_5","V4"].map(m=>(
                <div key={m}
                  style={modalItem}
                  onClick={()=>{setModel(m);setShowModelPopup(false)}}
                >
                  {m === "V5_5" ? "Kreaverse AI V5.5" : m.replace("_",".")}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDER */}
        <Slider label="Style Weight" value={styleWeight} setValue={setStyleWeight}/>
        <Slider label="Weirdness Constraint" value={weirdness} setValue={setWeirdness}/>
        <Slider label="Audio Weight" value={audioWeight} setValue={setAudioWeight}/>

        <button style={buttonStyle} onClick={generateCover}>
          {loading ? <Spinner/> : "Generate Cover"}
        </button>

      </div>

      {popup && (
        <div style={{
          position:"fixed",
          bottom:20,
          background: popupType==="success" ? "#16a34a" : "#dc2626",
          color:"white",
          padding:"10px 20px",
          borderRadius:10
        }}>
          {popup}
        </div>
      )}
    </div>
  )
}

function Slider({label,value,setValue}) {
  return (
    <div style={{marginBottom:15}}>
      <label>{label}: {value}</label>
      <input type="range" min="0" max="1" step="0.01"
        value={value}
        onChange={e=>setValue(parseFloat(e.target.value))}
        style={{width:"100%"}}
      />
      <input type="number" min="0" max="1" step="0.01"
        value={value}
        onChange={e=>setValue(parseFloat(e.target.value))}
        style={inputStyle}
      />
    </div>
  )
}

function Spinner() {
  return (
    <div style={{
      width:20,
      height:20,
      border:"3px solid white",
      borderTop:"3px solid transparent",
      borderRadius:"50%",
      animation:"spin 1s linear infinite",
      margin:"0 auto"
    }}/>
  )
}

const pageStyle = {
  minHeight:'100vh',
  background:'linear-gradient(135deg,#0f172a,#1e293b)',
  display:'flex',
  justifyContent:'center',
  alignItems:'center'
}

const cardStyle = {
  width:500,
  background:'#1e293b',
  padding:25,
  borderRadius:15,
  color:'white'
}

const inputStyle = {
  width:'100%',
  padding:10,
  marginBottom:12,
  borderRadius:6,
  border:'1px solid #334155',
  background:'#0f172a',
  color:'white'
}

const buttonStyle = {
  width:'100%',
  padding:12,
  borderRadius:6,
  border:'none',
  background:'#3b82f6',
  color:'white'
}

const connectedBox = {
  marginTop:10,
  padding:10,
  background:'#065f46',
  borderRadius:6
}

const modelBox = {
  padding:10,
  borderRadius:8,
  background:'#0f172a',
  border:'1px solid #334155',
  marginBottom:15,
  display:'flex',
  alignItems:'center',
  justifyContent:'space-between',
  cursor:'pointer'
}

const badgeStyle = {
  marginLeft:10,
  padding:'2px 8px',
  fontSize:10,
  background:'linear-gradient(90deg,#00f5ff,#3b82f6)',
  borderRadius:20,
  animation:'glow 1.5s ease-in-out infinite alternate'
}

const modalOverlay = {
  position:'fixed',
  top:0,
  left:0,
  right:0,
  bottom:0,
  background:'rgba(0,0,0,0.6)',
  display:'flex',
  justifyContent:'center',
  alignItems:'center'
}

const modalBox = {
  background:'#1e293b',
  padding:20,
  borderRadius:12,
  width:300
}

const modalItem = {
  padding:10,
  borderBottom:'1px solid #334155',
  cursor:'pointer'
}

const progressBarOuter = {
  width:"100%",
  height:8,
  background:"#334155",
  borderRadius:10,
  marginBottom:15
}

const progressBarInner = {
  height:8,
  background:"#3b82f6",
  borderRadius:10
}
