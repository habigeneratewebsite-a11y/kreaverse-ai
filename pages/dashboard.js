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

  // ================= PARAMETER =================
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("")
  const [title, setTitle] = useState("")
  const [model, setModel] = useState("V5_5")
  const [vocalGender, setVocalGender] = useState("m")
  const [negativeTags, setNegativeTags] = useState("")
  const [customMode, setCustomMode] = useState(true)
  const [instrumental, setInstrumental] = useState(false)
  const [styleWeight, setStyleWeight] = useState(0.5)
  const [weirdness, setWeirdness] = useState(0.5)
  const [audioWeight, setAudioWeight] = useState(0.5)

  // ================= UI =================
  const [popup, setPopup] = useState(null)
  const [popupType, setPopupType] = useState("info")
  const [showModelPopup, setShowModelPopup] = useState(false)
  const [showGenderPopup, setShowGenderPopup] = useState(false)
  const [loadingGenerate, setLoadingGenerate] = useState(false)

  useEffect(()=>{
    const style=document.createElement("style")
    style.innerHTML=`
      @keyframes glow{from{box-shadow:0 0 5px #00f5ff}to{box-shadow:0 0 20px #3b82f6}}
      @keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    `
    document.head.appendChild(style)
  },[])

  function toast(msg,type="info"){
    setPopup({msg,type})
    setTimeout(()=>setPopup(null),3000)
  }

  // ✅ API KEY
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

  // ✅ UPLOAD
  async function confirmUpload(){

    if(!connected) return toast("Konfirmasi API Key dulu","error")
    if(!file) return toast("Pilih file dulu","error")

    const xhr=new XMLHttpRequest()
    const formData=new FormData()
    formData.append("file",file)

    const start=Date.now()

    xhr.open("POST","https://kieai.redpandaai.co/api/file-stream-upload",true)
    xhr.setRequestHeader("Authorization",`Bearer ${apiKey}`)

    xhr.upload.onprogress=(e)=>{
      if(e.lengthComputable){
        const percent=Math.round((e.loaded/e.total)*100)
        setUploadProgress(percent)

        const elapsed=(Date.now()-start)/1000
        const speed=(e.loaded/1024/elapsed).toFixed(1)
        const eta=((e.total-e.loaded)/1024/(e.loaded/1024/elapsed)).toFixed(1)

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

  // ✅ GENERATE
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
  const genderLabel=vocalGender==="m"?"Male":"Female"

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

        <hr/>

        <label>Upload Audio File</label>
        <input type="file" accept="audio/*" onChange={e=>setFile(e.target.files[0])} style={inputStyle}/>
        <button style={buttonStyleSecondary} onClick={confirmUpload}>Konfirmasi Upload</button>

        {uploadProgress>0&&(
          <>
            <div style={progressOuter}>
              <div style={{...progressInner,width:`${uploadProgress}%`}}/>
            </div>
            <div style={{fontSize:12}}>
              Speed: {uploadSpeed} KB/s | ETA: {uploadETA}s | WIB: {new Date().toLocaleTimeString("id-ID")}
            </div>
          </>
        )}

        <hr/>

        <label>Lyrics / Prompt</label>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={inputStyle}/>

        <label>Style</label>
        <input value={style} onChange={e=>setStyle(e.target.value)} style={inputStyle}/>

        <label>Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={inputStyle}/>

        <label>Model</label>
        <div style={modelBox} onClick={()=>setShowModelPopup(true)}>
          {modelLabel}
          {model==="V5_5"&&<span style={badgeStyle}>Terbaru</span>}
        </div>

        {showModelPopup&&(
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

        <label>Vocal Gender</label>
        <div style={modelBox} onClick={()=>setShowGenderPopup(true)}>
          {genderLabel}
        </div>

        {showGenderPopup&&(
          <Modal onClose={()=>setShowGenderPopup(false)}>
            <div style={modalItem} onClick={()=>{setVocalGender("m");setShowGenderPopup(false)}}>Male</div>
            <div style={modalItem} onClick={()=>{setVocalGender("f");setShowGenderPopup(false)}}>Female</div>
          </Modal>
        )}

        <label>Negative Tags</label>
        <input value={negativeTags} onChange={e=>setNegativeTags(e.target.value)} style={inputStyle}/>

        <label><input type="checkbox" checked={customMode} onChange={()=>setCustomMode(!customMode)}/> Custom Mode</label>
        <label><input type="checkbox" checked={instrumental} onChange={()=>setInstrumental(!instrumental)}/> Instrumental</label>

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
          right:20,
          background:popup.type==="success"?"#16a34a":"#dc2626",
          color:"white",
          padding:"14px 22px",
          borderRadius:12,
          animation:"slideUp .4s ease"
        }}>
          {popup.msg}
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
const progressOuter={width:"100%",height:8,background:"#334155",borderRadius:10,marginBottom:8}
const progressInner={height:8,background:"#3b82f6",borderRadius:10}
