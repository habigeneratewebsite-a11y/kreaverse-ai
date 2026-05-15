import { useState, useEffect } from "react"

export default function Dashboard() {

  // ================= API =================
  const [apiKey, setApiKey] = useState("")
  const [connected, setConnected] = useState(false)
  const [credit, setCredit] = useState(null)
  const [checkingKey, setCheckingKey] = useState(false)

  // ================= FORM =================
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

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

  // ================= UI =================
  const [popup, setPopup] = useState(null)
  const [popupType, setPopupType] = useState("info")
  const [showModelPopup, setShowModelPopup] = useState(false)
  const [showGenderPopup, setShowGenderPopup] = useState(false)
  const [loadingGenerate, setLoadingGenerate] = useState(false)

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

  // ✅ REAL VALIDATION
  async function confirmApiKey(){

    if(!apiKey){
      toast("Masukkan API Key","error")
      return
    }

    setCheckingKey(true)

    try{
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
      } else {
        setConnected(false)
        toast(data.message || "API Key Salah ❌","error")
      }

    }catch(e){
      toast("Server tidak dapat dihubungi","error")
    }

    setCheckingKey(false)
  }

  // ✅ UPLOAD CONFIRM BUTTON
  async function confirmUpload(){

    if(!connected) return toast("Konfirmasi API Key dulu","error")
    if(!file) return toast("Pilih file audio dulu","error")

    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append("file", file)

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
        toast("Upload Berhasil ✅","success")
      } else {
        toast("Upload Gagal ❌","error")
      }
    }

    xhr.onerror = ()=>{
      toast("Upload Error ❌","error")
    }

    xhr.send(formData)
  }

  // ✅ GENERATE CONFIRM BUTTON
  async function confirmGenerate(){
    if(!connected) return toast("Konfirmasi API Key dulu","error")
    if(!file) return toast("Upload file dulu","error")
    if(!prompt) return toast("Masukkan prompt","error")

    setLoadingGenerate(true)

    try{
      const uploadRes = await fetch("/api/upload",{
        method:"POST",
        headers:{ "x-api-key":apiKey },
        body:new FormData().append("file",file)
      })

      const uploadData = await uploadRes.json()

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

      toast("Generate Task Created ✅","success")

    }catch(e){
      toast("Generate Gagal ❌","error")
    }

    setLoadingGenerate(false)
  }

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
        <button style={buttonStyle} onClick={confirmApiKey}>
          {checkingKey ? <Spinner/> : "Konfirmasi API Key"}
        </button>

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
        <button style={buttonStyleSecondary} onClick={confirmUpload}>
          Konfirmasi Upload
        </button>

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

        {/* MODEL POPUP */}
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

        {/* VOCAL GENDER POPUP */}
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

        {/* CUSTOM MODE */}
        <label>
          <input type="checkbox" checked={customMode} onChange={()=>setCustomMode(!customMode)}/>
          Custom Mode
        </label>

        <label>
          <input type="checkbox" checked={instrumental} onChange={()=>setInstrumental(!instrumental)}/>
          Instrumental
        </label>

        {/* SLIDERS */}
        <Slider label="Style Weight" value={styleWeight} setValue={setStyleWeight}/>
        <Slider label="Weirdness Constraint" value={weirdness} setValue={setWeirdness}/>
        <Slider label="Audio Weight" value={audioWeight} setValue={setAudioWeight}/>

        <button style={buttonStyle} onClick={confirmGenerate}>
          {loadingGenerate ? <Spinner/> : "Generate Cover"}
        </button>

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

/* MODAL */
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
const buttonStyleSecondary={width:"100%",padding:12,borderRadius:6,border:"none",background:"#475569",color:"white",marginBottom:10}
const connectedBox={marginTop:10,padding:10,background:"#065f46",borderRadius:6}
const modelBox={padding:10,borderRadius:8,background:"#0f172a",border:"1px solid #334155",marginBottom:15,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}
const badgeStyle={marginLeft:10,padding:"2px 8px",fontSize:10,background:"linear-gradient(90deg,#00f5ff,#3b82f6)",borderRadius:20,animation:"glow 1.5s ease-in-out infinite alternate"}
const modalOverlay={position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",display:"flex",justifyContent:"center",alignItems:"center"}
const modalBox={background:"#1e293b",padding:20,borderRadius:12,width:300}
const modalItem={padding:12,borderBottom:"1px solid #334155",cursor:"pointer"}
const progressOuter={width:"100%",height:8,background:"#334155",borderRadius:10,marginBottom:15}
const progressInner={height:8,background:"#3b82f6",borderRadius:10}
