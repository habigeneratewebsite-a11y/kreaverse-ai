import { useState, useEffect } from "react"

export default function Dashboard() {

  // ================= API =================
  const [apiKey, setApiKey] = useState("")
  const [connected, setConnected] = useState(false)
  const [credit, setCredit] = useState(null)
  const [checkingKey, setCheckingKey] = useState(false)

  // ================= FILE =================
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [uploadETA, setUploadETA] = useState(0)

  // ================= SUNO PARAMETER =================
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("")
  const [title, setTitle] = useState("")
  const [model, setModel] = useState("V5_5")
  const [customMode, setCustomMode] = useState(true)
  const [instrumental, setInstrumental] = useState(false)
  const [vocalGender, setVocalGender] = useState("m")
  const [negativeTags, setNegativeTags] = useState("")
  const [styleWeight, setStyleWeight] = useState(0.5)
  const [weirdness, setWeirdness] = useState(0.5)
  const [audioWeight, setAudioWeight] = useState(0.5)

  const [loadingGenerate, setLoadingGenerate] = useState(false)

  const [popup, setPopup] = useState(null)
  const [popupType, setPopupType] = useState("info")
  const [showModelPopup, setShowModelPopup] = useState(false)
  const [showGenderPopup, setShowGenderPopup] = useState(false)

  useEffect(()=>{
    const style=document.createElement("style")
    style.innerHTML=`
      @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      @keyframes glow{from{box-shadow:0 0 5px #00f5ff}to{box-shadow:0 0 20px #3b82f6}}
    `
    document.head.appendChild(style)
  },[])

  function toast(msg,type="info"){
    setPopup(msg)
    setPopupType(type)
    setTimeout(()=>setPopup(null),3000)
  }

  // ✅ VALIDASI API KEY
  async function confirmApiKey(){
    if(!apiKey) return toast("Masukkan API Key","error")

    setCheckingKey(true)

    const res = await fetch("/api/check-key",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ apiKey })
    })

    const data = await res.json()

    if(res.ok && data.success){
      setConnected(true)
      setCredit(data.credit)
      toast("API Key Terhubung ✅","success")
    }else{
      setConnected(false)
      toast("API Key Salah ❌","error")
    }

    setCheckingKey(false)
  }

  // ✅ UPLOAD LANGSUNG KE KIE
  async function confirmUpload(){

    if(!connected) return toast("Konfirmasi API Key dulu","error")
    if(!file) return toast("Pilih file dulu","error")

    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append("file", file)

    const startTime = Date.now()

    xhr.open("POST","https://kieai.redpandaai.co/api/file-stream-upload",true)
    xhr.setRequestHeader("Authorization",`Bearer ${apiKey}`)

    xhr.upload.onprogress=(event)=>{
      if(event.lengthComputable){
        const percent=Math.round((event.loaded/event.total)*100)
        setUploadProgress(percent)

        const elapsed=(Date.now()-startTime)/1000
        const speed=(event.loaded/1024/elapsed).toFixed(1)
        const eta=((event.total-event.loaded)/1024/(event.loaded/1024/elapsed)).toFixed(1)

        setUploadSpeed(speed)
        setUploadETA(eta)
      }
    }

    xhr.onload=()=>{
      if(xhr.status===200){
        const response=JSON.parse(xhr.response)
        setFileUrl(response.data.fileUrl)
        toast("Upload Berhasil ✅","success")
      }else{
        toast("Upload Gagal ❌","error")
      }
    }

    xhr.send(formData)
  }

  // ✅ GENERATE COVER
  async function confirmGenerate(){

    if(!fileUrl) return toast("Upload file dulu","error")
    if(!prompt) return toast("Masukkan prompt","error")

    setLoadingGenerate(true)

    await fetch("/api/suno/cover",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-api-key":apiKey
      },
      body:JSON.stringify({
        uploadUrl:fileUrl,
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

    toast("Generate Task Created ✅","success")
    setLoadingGenerate(false)
  }

  const modelLabel=model==="V5_5"?"Kreaverse AI V5.5":model.replace("_",".")

  return(
    <div style={pageStyle}>
      <div style={cardStyle}>

        <h2>Kreaverse AI – Suno Pro</h2>

        <label>API Key</label>
        <input value={apiKey} onChange={e=>setApiKey(e.target.value)} style={inputStyle}/>
        <button style={buttonStyle} onClick={confirmApiKey}>
          {checkingKey?<Spinner/>:"Konfirmasi API Key"}
        </button>

        {connected&&(
          <div style={connectedBox}>
            ✅ Terhubung | Credit: {credit}
          </div>
        )}

        <hr style={{margin:"20px 0"}}/>

        <label>Upload Audio File</label>
        <input type="file" accept="audio/*"
          onChange={e=>setFile(e.target.files[0])}
          style={inputStyle}
        />

        <button style={buttonStyleSecondary} onClick={confirmUpload}>
          Konfirmasi Upload
        </button>

        {uploadProgress>0&&(
          <>
            <div style={progressOuter}>
              <div style={{...progressInner,width:`${uploadProgress}%`}}/>
            </div>
            <div style={{fontSize:12}}>
              Speed: {uploadSpeed} KB/s | ETA: {uploadETA}s
            </div>
          </>
        )}

        <hr style={{margin:"20px 0"}}/>

        <label>Lyrics / Prompt</label>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={inputStyle}/>

        <label>Style</label>
        <input value={style} onChange={e=>setStyle(e.target.value)} style={inputStyle}/>

        <label>Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={inputStyle}/>

        <label>Model</label>
        <div style={modelBox}>{modelLabel}</div>

        <label>Vocal Gender</label>
        <div style={modelBox}>{vocalGender==="m"?"Male":"Female"}</div>

        <label>Negative Tags</label>
        <input value={negativeTags} onChange={e=>setNegativeTags(e.target.value)} style={inputStyle}/>

        <label>
          <input type="checkbox" checked={customMode} onChange={()=>setCustomMode(!customMode)}/> Custom Mode
        </label>

        <label>
          <input type="checkbox" checked={instrumental} onChange={()=>setInstrumental(!instrumental)}/> Instrumental
        </label>

        <Slider label="Style Weight" value={styleWeight} setValue={setStyleWeight}/>
        <Slider label="Weirdness Constraint" value={weirdness} setValue={setWeirdness}/>
        <Slider label="Audio Weight" value={audioWeight} setValue={setAudioWeight}/>

        <button style={buttonStyle} onClick={confirmGenerate}>
          {loadingGenerate?<Spinner/>:"Generate Cover"}
        </button>

      </div>

      {popup&&(
        <div style={{
          position:"fixed",
          bottom:20,
          background:popupType==="success"?"#16a34a":"#dc2626",
          color:"white",
          padding:"12px 20px",
          borderRadius:12
        }}>
          {popup}
        </div>
      )}
    </div>
  )
}

function Slider({label,value,setValue}){
  return(
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

function Spinner(){
  return(
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

const pageStyle={minHeight:"100vh",background:"linear-gradient(135deg,#0f172a,#1e293b)",display:"flex",justifyContent:"center",alignItems:"center"}
const cardStyle={width:500,background:"#1e293b",padding:25,borderRadius:15,color:"white"}
const inputStyle={width:"100%",padding:10,marginBottom:12,borderRadius:6,border:"1px solid #334155",background:"#0f172a",color:"white"}
const buttonStyle={width:"100%",padding:12,borderRadius:6,border:"none",background:"#3b82f6",color:"white"}
const buttonStyleSecondary={width:"100%",padding:12,borderRadius:6,border:"none",background:"#475569",color:"white",marginBottom:10}
const connectedBox={marginTop:10,padding:10,background:"#065f46",borderRadius:6}
const modelBox={padding:10,borderRadius:8,background:"#0f172a",border:"1px solid #334155",marginBottom:15}
const progressOuter={width:"100%",height:8,background:"#334155",borderRadius:10,marginBottom:8}
const progressInner={height:8,background:"#3b82f6",borderRadius:10}
