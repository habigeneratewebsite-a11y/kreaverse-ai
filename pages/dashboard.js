import { useEffect, useRef, useState } from "react"

export default function Dashboard() {

  // ================= API =================
  const [apiKey, setApiKey] = useState("")
  const [connected, setConnected] = useState(false)
  const [credit, setCredit] = useState(null)

  // ================= AUDIO =================
  const [file, setFile] = useState(null)
  const [audioPreview, setAudioPreview] = useState("")
  const fileInputRef = useRef(null)

  // ================= SUNO FORM =================
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("")
  const [title, setTitle] = useState("")
  const [negativeTags, setNegativeTags] = useState("")

  // ================= OPTIONS =================
  const [model, setModel] = useState("V5_5")
  const [customMode, setCustomMode] = useState(true)
  const [instrumental, setInstrumental] = useState(false)
  const [vocalGender, setVocalGender] = useState("m")

  // ================= ADVANCED =================
  const [styleWeight, setStyleWeight] = useState(0.5)
  const [weirdness, setWeirdness] = useState(0.5)
  const [audioWeight, setAudioWeight] = useState(0.5)

  // ================= GENERATE =================
  const [taskId, setTaskId] = useState(null)
  const [status, setStatus] = useState(null)
  const [audioUrl, setAudioUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  // ================= UI =================
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [popup, setPopup] = useState("")
  const [popupType, setPopupType] = useState("info")

  const [showModelPopup, setShowModelPopup] = useState(false)
  const [showGenderPopup, setShowGenderPopup] = useState(false)

  // ================= ANIMATION =================
  useEffect(() => {
    const styleEl = document.createElement("style")

    styleEl.innerHTML = `
      *{
        box-sizing:border-box;
      }

      body{
        margin:0;
        padding:0;
        background:#020617;
        font-family:Inter,sans-serif;
      }

      @keyframes glow{
        from{
          box-shadow:0 0 8px #3b82f6;
        }
        to{
          box-shadow:0 0 18px #06b6d4;
        }
      }

      @keyframes fadeIn{
        from{
          opacity:0;
          transform:translateY(10px);
        }
        to{
          opacity:1;
          transform:translateY(0);
        }
      }

      @keyframes spin{
        from{
          transform:rotate(0deg);
        }
        to{
          transform:rotate(360deg);
        }
      }
    `

    document.head.appendChild(styleEl)

    return () => {
      document.head.removeChild(styleEl)
    }
  }, [])

  // ================= TOAST =================
  function toast(message, type = "info") {
    setPopup(message)
    setPopupType(type)

    setTimeout(() => {
      setPopup("")
    }, 3000)
  }

  // ================= API KEY =================
  async function confirmApiKey() {

    if (!apiKey) {
      return toast("Masukkan API Key", "error")
    }

    try {

      const res = await fetch("/api/check-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apiKey
        })
      })

      const data = await res.json()

      if (data?.success) {

        setConnected(true)
        setCredit(data?.credit || 0)

        toast("API Key berhasil terhubung ✅", "success")

      } else {

        setConnected(false)
        toast(data?.message || "API Key tidak valid ❌", "error")

      }

    } catch (err) {

      setConnected(false)
      toast("Gagal koneksi server", "error")

    }
  }

  // ================= FILE =================
  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {

    const selected = e.target.files?.[0]

    if (!selected) return

    setFile(selected)

    const preview = URL.createObjectURL(selected)
    setAudioPreview(preview)

    toast("Audio berhasil dipilih ✅", "success")
  }

  // ================= UPLOAD =================
  async function uploadFileWithProgress() {

    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest()
      const formData = new FormData()

      formData.append("file", file)

      xhr.open("POST", "/api/upload", true)

      xhr.setRequestHeader("x-api-key", apiKey)

      xhr.upload.onprogress = (event) => {

        if (event.lengthComputable) {

          const percent = Math.round(
            (event.loaded / event.total) * 100
          )

          setUploadProgress(percent)
        }
      }

      xhr.onload = () => {

        try {

          const response = JSON.parse(xhr.responseText)

          if (xhr.status === 200) {

            resolve(response)

          } else {

            reject(response)

          }

        } catch {

          reject({
            message: "Upload gagal"
          })

        }
      }

      xhr.onerror = () => {

        reject({
          message: "Network upload error"
        })

      }

      xhr.send(formData)
    })
  }

  // ================= GENERATE =================
  async function generateCover() {

    if (!connected) {
      return toast("Konfirmasi API Key dulu", "error")
    }

    if (!file) {
      return toast("Upload audio dulu", "error")
    }

    if (!prompt && !instrumental) {
      return toast("Prompt wajib diisi", "error")
    }

    setLoading(true)
    setUploadProgress(0)
    setAudioUrl("")
    setImageUrl("")
    setStatus("UPLOADING")

    try {

      // ================= UPLOAD =================
      const uploadData = await uploadFileWithProgress()

      if (!uploadData?.fileUrl) {
        throw new Error("Upload URL tidak ditemukan")
      }

      setStatus("GENERATING")

      // ================= PAYLOAD =================
      const payload = {

        uploadUrl: uploadData.fileUrl,

        prompt,
        style,
        title,
        negativeTags,

        model,
        customMode,
        instrumental,

        vocalGender,

        styleWeight,
        weirdnessConstraint: weirdness,
        audioWeight,

        callBackUrl: "https://webhook.site/test123"
      }

      // ================= GENERATE =================
      const res = await fetch("/api/suno/cover", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },

        body: JSON.stringify(payload)

      })

      const data = await res.json()

      if (!data?.data?.taskId) {

        throw new Error(
          data?.message || "Task gagal dibuat"
        )

      }

      setTaskId(data.data.taskId)

      toast("Generate dimulai ✅", "success")

    } catch (err) {

      toast(
        err?.message || "Generate gagal",
        "error"
      )

      setStatus("FAILED")

    }

    setLoading(false)
  }

  // ================= POLLING =================
  useEffect(() => {

    if (!taskId) return

    const interval = setInterval(async () => {

      try {

        const res = await fetch(
          `/api/suno/status?taskId=${taskId}`,
          {
            headers: {
              "x-api-key": apiKey
            }
          }
        )

        const data = await res.json()

        const currentStatus = data?.data?.status

        setStatus(currentStatus)

        if (currentStatus === "SUCCESS") {

          const song =
            data?.data?.response?.sunoData?.[0]

          setAudioUrl(song?.audioUrl || "")
          setImageUrl(song?.imageUrl || "")

          toast("Cover berhasil dibuat ✅", "success")

          clearInterval(interval)
        }

        if (currentStatus === "FAILED") {

          toast("Generate gagal ❌", "error")
          clearInterval(interval)
        }

      } catch {

        clearInterval(interval)

      }

    }, 5000)

    return () => clearInterval(interval)

  }, [taskId])

  // ================= LABEL =================
  const modelLabel =
    model === "V5_5"
      ? "Kreaverse AI V5.5"
      : model.replaceAll("_", ".")

  const genderLabel =
    vocalGender === "m"
      ? "Male Vocal"
      : "Female Vocal"

  // ================= UI =================
  return (
    <div style={pageStyle}>

      <div style={cardStyle}>

        {/* HEADER */}
        <div style={headerStyle}>

          <div>
            <div style={titleStyle}>
              Kreaverse AI
            </div>

            <div style={subtitleStyle}>
              Suno Premium Cover Generator
            </div>
          </div>

          <div style={proBadge}>
            PRO
          </div>

        </div>

        {/* API KEY */}
        <div style={sectionStyle}>

          <label style={labelStyle}>
            API Key
          </label>

          <input
            value={apiKey}
            onChange={(e) =>
              setApiKey(e.target.value)
            }
            placeholder="Masukkan API Key"
            style={inputStyle}
          />

          <button
            style={buttonStyle}
            onClick={confirmApiKey}
          >
            Konfirmasi API Key
          </button>

          {connected && (
            <div style={successBox}>
              ✅ Connected • Credit: {credit}
            </div>
          )}

        </div>

        {/* AUDIO */}
        <div style={sectionStyle}>

          <label style={labelStyle}>
            Upload Audio
          </label>

          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div
            style={uploadBox}
            onClick={openFilePicker}
          >
            <div style={uploadIcon}>
              🎵
            </div>

            <div style={{ fontWeight: 700 }}>
              Tap untuk upload audio
            </div>

            <div style={uploadSubtext}>
              MP3 • WAV • M4A
            </div>
          </div>

          {file && (
            <div style={fileInfoBox}>

              <div>
                📁 {file.name}
              </div>

              <div>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>

            </div>
          )}

          {audioPreview && (
            <audio
              controls
              src={audioPreview}
              style={{
                width: "100%",
                marginTop: 12
              }}
            />
          )}

          {uploadProgress > 0 && (
            <div style={progressOuter}>
              <div
                style={{
                  ...progressInner,
                  width: `${uploadProgress}%`
                }}
              />
            </div>
          )}

        </div>

        {/* PROMPT */}
        <div style={sectionStyle}>

          <label style={labelStyle}>
            Lyrics / Prompt
          </label>

          <textarea
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
            placeholder="Masukkan lyrics atau prompt..."
            style={textareaStyle}
          />

        </div>

        {/* STYLE */}
        <div style={sectionStyle}>

          <label style={labelStyle}>
            Style
          </label>

          <input
            value={style}
            onChange={(e) =>
              setStyle(e.target.value)
            }
            placeholder="Pop, EDM, Rock..."
            style={inputStyle}
          />

        </div>

        {/* TITLE */}
        <div style={sectionStyle}>

          <label style={labelStyle}>
            Title
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Judul lagu"
            style={inputStyle}
          />

        </div>

        {/* NEGATIVE TAGS */}
        <div style={sectionStyle}>

          <label style={labelStyle}>
            Negative Tags
          </label>

          <input
            value={negativeTags}
            onChange={(e) =>
              setNegativeTags(e.target.value)
            }
            placeholder="low quality, noise..."
            style={inputStyle}
          />

        </div>

        {/* MODEL */}
        <div style={sectionStyle}>

          <label style={labelStyle}>
            Model
          </label>

          <div
            style={selectBox}
            onClick={() =>
              setShowModelPopup(true)
            }
          >
            <span>{modelLabel}</span>

            <span style={badgeStyle}>
              NEW
            </span>
          </div>

        </div>

        {/* GENDER */}
        <div style={sectionStyle}>

          <label style={labelStyle}>
            Vocal Gender
          </label>

          <div
            style={selectBox}
            onClick={() =>
              setShowGenderPopup(true)
            }
          >
            {genderLabel}
          </div>

        </div>

        {/* TOGGLES */}
        <div style={toggleContainer}>

          <ToggleCard
            title="Custom Mode"
            active={customMode}
            onClick={() =>
              setCustomMode(!customMode)
            }
          />

          <ToggleCard
            title="Instrumental"
            active={instrumental}
            onClick={() =>
              setInstrumental(!instrumental)
            }
          />

        </div>

        {/* SLIDERS */}
        <div style={sectionStyle}>

          <Slider
            label="Style Weight"
            value={styleWeight}
            setValue={setStyleWeight}
          />

          <Slider
            label="Weirdness"
            value={weirdness}
            setValue={setWeirdness}
          />

          <Slider
            label="Audio Weight"
            value={audioWeight}
            setValue={setAudioWeight}
          />

        </div>

        {/* BUTTON */}
        <button
          style={generateButton}
          onClick={generateCover}
        >
          {loading ? (
            <Spinner />
          ) : (
            "Generate Cover"
          )}
        </button>

        {/* STATUS */}
        {status && (
          <div style={statusBox}>
            Status : {status}
          </div>
        )}

        {/* RESULT */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            style={imageStyle}
          />
        )}

        {audioUrl && (
          <audio
            controls
            src={audioUrl}
            style={{
              width: "100%",
              marginTop: 15
            }}
          />
        )}

      </div>

      {/* TOAST */}
      {popup && (
        <div
          style={{
            ...toastStyle,
            background:
              popupType === "success"
                ? "#16a34a"
                : popupType === "error"
                ? "#dc2626"
                : "#2563eb"
          }}
        >
          {popup}
        </div>
      )}

      {/* MODEL MODAL */}
      {showModelPopup && (
        <Modal
          onClose={() =>
            setShowModelPopup(false)
          }
        >

          {[
            "V5_5",
            "V5",
            "V4_5PLUS",
            "V4_5",
            "V4"
          ].map((m) => (

            <div
              key={m}
              style={modalItem}
              onClick={() => {
                setModel(m)
                setShowModelPopup(false)
              }}
            >
              {m.replaceAll("_", ".")}
            </div>

          ))}

        </Modal>
      )}

      {/* GENDER MODAL */}
      {showGenderPopup && (
        <Modal
          onClose={() =>
            setShowGenderPopup(false)
          }
        >

          <div
            style={modalItem}
            onClick={() => {
              setVocalGender("m")
              setShowGenderPopup(false)
            }}
          >
            Male Vocal
          </div>

          <div
            style={modalItem}
            onClick={() => {
              setVocalGender("f")
              setShowGenderPopup(false)
            }}
          >
            Female Vocal
          </div>

        </Modal>
      )}

    </div>
  )
}

// ================= MODAL =================
function Modal({ children, onClose }) {
  return (
    <div
      style={modalOverlay}
      onClick={onClose}
    >
      <div
        style={modalBox}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {children}
      </div>
    </div>
  )
}

// ================= TOGGLE =================
function ToggleCard({
  title,
  active,
  onClick
}) {

  return (
    <div
      onClick={onClick}
      style={{
        ...toggleCard,
        border: active
          ? "1px solid #3b82f6"
          : "1px solid #334155",
        background: active
          ? "#1d4ed8"
          : "#0f172a"
      }}
    >
      {title}
    </div>
  )
}

// ================= SLIDER =================
function Slider({
  label,
  value,
  setValue
}) {

  return (
    <div style={{ marginBottom: 18 }}>

      <div style={sliderTop}>
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) =>
          setValue(
            parseFloat(e.target.value)
          )
        }
        style={sliderStyle}
      />

    </div>
  )
}

// ================= SPINNER =================
function Spinner() {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        border: "3px solid white",
        borderTop:
          "3px solid transparent",
        borderRadius: "50%",
        animation:
          "spin 1s linear infinite",
        margin: "0 auto"
      }}
    />
  )
}

// ================= STYLES =================
const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(180deg,#020617,#0f172a)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20
}

const cardStyle = {
  width: "100%",
  maxWidth: 650,
  background:
    "rgba(15,23,42,0.95)",
  border:
    "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 24,
  color: "white",
  animation: "fadeIn .4s ease"
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 25
}

const titleStyle = {
  fontSize: 28,
  fontWeight: 800
}

const subtitleStyle = {
  color: "#94a3b8",
  marginTop: 5
}

const proBadge = {
  background:
    "linear-gradient(90deg,#06b6d4,#3b82f6)",
  padding: "8px 14px",
  borderRadius: 999,
  fontWeight: 700,
  animation:
    "glow 1.5s ease infinite alternate"
}

const sectionStyle = {
  marginBottom: 20
}

const labelStyle = {
  display: "block",
  marginBottom: 8,
  fontWeight: 700
}

const inputStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  outline: "none"
}

const textareaStyle = {
  ...inputStyle,
  minHeight: 120,
  resize: "vertical"
}

const buttonStyle = {
  width: "100%",
  marginTop: 12,
  border: "none",
  padding: 14,
  borderRadius: 14,
  background:
    "linear-gradient(90deg,#2563eb,#06b6d4)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer"
}

const generateButton = {
  width: "100%",
  border: "none",
  padding: 16,
  borderRadius: 16,
  background:
    "linear-gradient(90deg,#2563eb,#06b6d4)",
  color: "white",
  fontSize: 16,
  fontWeight: 800,
  cursor: "pointer"
}

const successBox = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  background: "#14532d"
}

const uploadBox = {
  border:
    "2px dashed #334155",
  borderRadius: 20,
  padding: 30,
  textAlign: "center",
  cursor: "pointer",
  background:
    "linear-gradient(180deg,#020617,#0f172a)"
}

const uploadIcon = {
  fontSize: 42,
  marginBottom: 10
}

const uploadSubtext = {
  color: "#94a3b8",
  marginTop: 8
}

const fileInfoBox = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  background: "#0f172a",
  display: "flex",
  justifyContent: "space-between"
}

const selectBox = {
  padding: 16,
  borderRadius: 14,
  border: "1px solid #334155",
  background: "#020617",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}

const badgeStyle = {
  background:
    "linear-gradient(90deg,#06b6d4,#3b82f6)",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700
}

const toggleContainer = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: 12,
  marginBottom: 22
}

const toggleCard = {
  padding: 18,
  borderRadius: 16,
  textAlign: "center",
  fontWeight: 700,
  cursor: "pointer",
  transition: ".2s"
}

const sliderTop = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10
}

const sliderStyle = {
  width: "100%"
}

const progressOuter = {
  width: "100%",
  height: 10,
  background: "#1e293b",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 14
}

const progressInner = {
  height: "100%",
  background:
    "linear-gradient(90deg,#06b6d4,#2563eb)"
}

const statusBox = {
  marginTop: 18,
  padding: 14,
  borderRadius: 14,
  background: "#1e293b",
  textAlign: "center",
  fontWeight: 700
}

const imageStyle = {
  width: "100%",
  borderRadius: 20,
  marginTop: 18
}

const toastStyle = {
  position: "fixed",
  bottom: 25,
  left: "50%",
  transform: "translateX(-50%)",
  color: "white",
  padding: "14px 22px",
  borderRadius: 14,
  zIndex: 99999,
  fontWeight: 700
}

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
}

const modalBox = {
  width: 320,
  background: "#0f172a",
  borderRadius: 20,
  overflow: "hidden",
  border:
    "1px solid #334155"
}

const modalItem = {
  padding: 18,
  borderBottom:
    "1px solid #1e293b",
  cursor: "pointer"
}
