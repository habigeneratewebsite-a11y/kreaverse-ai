import { useState } from "react"

export default function Dashboard() {

  const [apiKey, setApiKey] = useState("")
  const [connected, setConnected] = useState(false)
  const [credit, setCredit] = useState(null)

  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [uploadETA, setUploadETA] = useState(0)

  const [popup, setPopup] = useState(null)
  const [popupType, setPopupType] = useState("info")
  const [checkingKey, setCheckingKey] = useState(false)

  function toast(message,type="info"){
    setPopup(message)
    setPopupType(type)
    setTimeout(()=>setPopup(null),3000)
  }

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
      toast("Server error","error")
    }

    setCheckingKey(false)
  }

  async function uploadDirectToKie(){

    if(!connected){
      toast("Konfirmasi API Key dulu","error")
      return
    }

    if(!file){
      toast("Pilih file audio dulu","error")
      return
    }

    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append("file", file)

    const startTime = Date.now()

    xhr.open("POST","https://kieai.redpandaai.co/api/file-stream-upload",true)
    xhr.setRequestHeader("Authorization",`Bearer ${apiKey}`)

    xhr.upload.onprogress = (event)=>{
      if(event.lengthComputable){

        const percent = Math.round((event.loaded/event.total)*100)
        setUploadProgress(percent)

        const elapsed = (Date.now()-startTime)/1000
        const speed = (event.loaded/1024/elapsed).toFixed(1)
        const remaining = ((event.total-event.loaded)/1024/(event.loaded/1024/elapsed)).toFixed(1)

        setUploadSpeed(speed)
        setUploadETA(remaining)
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

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        <h2>Kreaverse AI – Suno Pro</h2>

        <label>API Key</label>
        <input value={apiKey} onChange={e=>setApiKey(e.target.value)} style={inputStyle}/>
        <button style={buttonStyle} onClick={confirmApiKey}>
          {checkingKey ? "Checking..." : "Konfirmasi API Key"}
        </button>

        {connected && (
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

        <button style={buttonStyleSecondary} onClick={uploadDirectToKie}>
          Konfirmasi Upload
        </button>

        {uploadProgress>0 && (
          <>
            <div style={progressOuter}>
              <div style={{...progressInner,width:`${uploadProgress}%`}}/>
            </div>
            <div style={{fontSize:12}}>
              Speed: {uploadSpeed} KB/s | ETA: {uploadETA}s
            </div>
          </>
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

const pageStyle={
  minHeight:"100vh",
  background:"linear-gradient(135deg,#0f172a,#1e293b)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center"
}

const cardStyle={
  width:500,
  background:"#1e293b",
  padding:25,
  borderRadius:15,
  color:"white"
}

const inputStyle={
  width:"100%",
  padding:10,
  marginBottom:12,
  borderRadius:6,
  border:"1px solid #334155",
  background:"#0f172a",
  color:"white"
}

const buttonStyle={
  width:"100%",
  padding:12,
  borderRadius:6,
  border:"none",
  background:"#3b82f6",
  color:"white"
}

const buttonStyleSecondary={
  width:"100%",
  padding:12,
  borderRadius:6,
  border:"none",
  background:"#475569",
  color:"white",
  marginBottom:10
}

const connectedBox={
  marginTop:10,
  padding:10,
  background:"#065f46",
  borderRadius:6
}

const progressOuter={
  width:"100%",
  height:8,
  background:"#334155",
  borderRadius:10,
  marginBottom:8
}

const progressInner={
  height:8,
  background:"#3b82f6",
  borderRadius:10
}
