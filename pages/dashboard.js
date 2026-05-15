import { useState, useEffect } from "react"

export default function Dashboard() {

  // ================= API STATE =================
  const [apiKey, setApiKey] = useState("")
  const [connected, setConnected] = useState(false)
  const [credit, setCredit] = useState(null)

  // ================= FORM STATE =================
  const [file, setFile] = useState(null)
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

  // ================= GENERATE STATE =================
  const [taskId, setTaskId] = useState(null)
  const [status, setStatus] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)

  // ================= UI STATE =================
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [popup, setPopup] = useState(null)
  const [popupType, setPopupType] = useState("info")
  const [showModelPopup, setShowModelPopup] = useState(false)
  const [showGenderPopup, setShowGenderPopup] = useState(false)

  // ================= ANIMATION =================
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes glow {
        from { box-shadow: 0 0 5px #00f5ff; }
        to { box-shadow: 0 0 20px #3b82f6; }
      }
      @keyframes fadeIn {
        from { opacity:0; transform:translateY(15px); }
        to { opacity:1; transform:translateY(0); }
      }
      @keyframes spin {
        from { transform:rotate(0deg); }
        to { transform:rotate(360deg); }
      }
    `
    document.head.appendChild(style)
  }, [])

  function toast(message,type="info"){
    setPopup(message)
    setPopupType(type)
    setTimeout(()=>setPopup(null),3000)
  }

  // ================= CHECK API =================
  async function confirmApiKey(){
    if(!apiKey) return toast("Masukkan API Key","error")

    const res = await fetch("/api/check-key",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ apiKey })
    })

    const data = await res.json()

    if(data.success){
      setConnected(true)
      setCredit(data.credit)
      toast("API Key Terhubung ✅","success")
    } else {
      setConnected(false)
      toast("API Key Salah ❌","error")
    }
  }

  // ================= UPLOAD =================
  async function uploadFileWithProgress(){
    return new Promise((resolve,reject)=>{
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append("file",file)

      xhr.open("POST","/api/upload",true)
      xhr.setRequestHeader("x-api-key",apiKey)

      xhr.upload.onprogress = (event)=>{
        if(event.lengthComputable){
          const percent = Math.round((event.loaded/event.total)*100)
          setUploadProgress(percent)
        }
      }

      xhr.onload = ()=>{
        if(xhr.status===200){
          resolve(JSON.parse(xhr.response))
        } else {
          reject("Upload gagal")
        }
      }

      xhr.send(formData)
    })
  }

  // ================= GENERATE =================
  async function generateCover(){

    if(!connected) return toast("Konfirmasi API Key dulu","error")
    if(!file) return toast("Pilih file audio","error")

    setLoading(true)
    setUploadProgress(0)

    try{

      const uploadData = await uploadFileWithProgress()

      const sunoRes = await fetch("/api/suno/cover",{
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
          negativeTags,
          vocalGender,
          styleWeight,
          weirdnessConstraint:weirdness,
          audioWeight,
          callBackUrl:"https://webhook.site/test123"
        })
      })

      const sunoData = await sunoRes.json()

      setTaskId(sunoData?.data?.taskId)
      setStatus("PENDING")

    }catch(err){
      toast("Generate gagal ❌","error")
    }

    setLoading(false)
  }

  // ================= REALTIME POLLING =================
  useEffect(()=>{
    if(!taskId) return

    const interval = setInterval(async()=>{
      const res = await fetch(`/api/suno/status?taskId=${taskId}`,{
        headers:{ "x-api-key":apiKey }
      })

      const data = await res.json()
      const currentStatus = data?.data?.status

      setStatus(currentStatus)

      if(currentStatus==="SUCCESS"){
        const audio = data?.data?.response?.sunoData?.[0]?.audioUrl
        setAudioUrl(audio)
        clearInterval(interval)
      }

    },5000)

    return ()=>clearInterval(interval)

  },[taskId])

  const modelLabel = model==="V5_5"
    ? "Kreaverse AI V5.5"
    : model.replace("_",".")

  const genderLabel = vocalGender==="m"?"Male":"Female"

  return (
    <div style={pageStyle}>
      <div style={{...cardStyle,animation:"fadeIn 0.6s ease"}}>

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

        {uploadProgress>0 && (
          <div style={progressOuter}>
            <div style={{...progressInner,width:`${uploadProgress}%`}}/>
          </div>
        )}

        {/* PROMPT */}
        <label>Lyrics / Prompt</label>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={inputStyle}/>

        {/* STYLE */}
        <label>Style</label>
        <input value={style} onChange={e=>setStyle(e.target.value)} style={inputStyle}/>

        {/* TITLE */}
        <label>Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={inputStyle}/>

        {/* MODEL */}
        <label>Model</label>
        <div style={modelBox} onClick={()=>setShowModelPopup(true)}>
          {modelLabel}
          {model==="V5_5" && <span style={badgeStyle}>Terbaru</span>}
        </div>

        {showModelPopup && (
          <Modal onClose={()=>setShowModelPopup(false)}>
            {["V5_5","V5","V4_5PLUS","V4_5","V4"].map(m=>(
              <div key={m} style={modalItem}
                onClick={()=>{setModel(m);setShowModelPopup(false)}}
              >
                {m==="V5_5"?"Kreaverse AI V5.5":m.replace("_",".")}
              </div>
            ))}
          </Modal>
        )}

        {/* VOCAL GENDER */}
        <label>Vocal Gender</label>
        <div style={modelBox} onClick={()=>setShowGenderPopup(true)}>
          {genderLabel}
        </div>

        {showGenderPopup && (
          <Modal onClose={()=>setShowGenderPopup(false)}>
            <div style={modalItem} onClick={()=>{setVocalGender("m");setShowGenderPopup(false)}}>Male</div>
            <div style={modalItem} onClick={()=>{setVocalGender("f");setShowGenderPopup(false)}}>Female</div>
          </Modal>
        )}

        {/* NEGATIVE TAGS */}
        <label>Negative Tags</label>
        <input value={negativeTags} onChange={e=>setNegativeTags(e.target.value)} style={inputStyle}/>

        {/* SLIDERS */}
        <Slider label="Style Weight" value={styleWeight} setValue={setStyleWeight}/>
        <Slider label="Weirdness Constraint" value={weirdness} setValue={setWeirdness}/>
        <Slider label="Audio Weight" value={audioWeight} setValue={setAudioWeight}/>

        <button style={buttonStyle} onClick={generateCover}>
          {loading?<Spinner/>:"Generate Cover"}
        </button>

        {status && (
          <div style={statusBox}>
            Status: {status}
          </div>
        )}

        {audioUrl && (
          <audio controls src={audioUrl} style={{width:"100%",marginTop:15}}/>
        )}

      </div>

      {popup && (
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

function Modal({children,onClose}){
  return(
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
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

/* STYLES */
const pageStyle={minHeight:"100vh",background:"linear-gradient(135deg,#0f172a,#1e293b)",display:"flex",justifyContent:"center",alignItems:"center"}
const cardStyle={width:500,background:"#1e293b",padding:25,borderRadius:15,color:"white"}
const inputStyle={width:"100%",padding:10,marginBottom:12,borderRadius:6,border:"1px solid #334155",background:"#0f172a",color:"white"}
const buttonStyle={width:"100%",padding:12,borderRadius:6,border:"none",background:"#3b82f6",color:"white"}
const connectedBox={marginTop:10,padding:10,background:"#065f46",borderRadius:6}
const modelBox={padding:10,borderRadius:8,background:"#0f172a",border:"1px solid #334155",marginBottom:15,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}
const badgeStyle={marginLeft:10,padding:"2px 8px",fontSize:10,background:"linear-gradient(90deg,#00f5ff,#3b82f6)",borderRadius:20,animation:"glow 1.5s ease-in-out infinite alternate"}
const modalOverlay={position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",display:"flex",justifyContent:"center",alignItems:"center"}
const modalBox={background:"#1e293b",padding:20,borderRadius:12,width:300}
const modalItem={padding:12,borderBottom:"1px solid #334155",cursor:"pointer"}
const progressOuter={width:"100%",height:8,background:"#334155",borderRadius:10,marginBottom:15}
const progressInner={height:8,background:"#3b82f6",borderRadius:10}
const statusBox={marginTop:15,padding:10,background:"#334155",borderRadius:6}
