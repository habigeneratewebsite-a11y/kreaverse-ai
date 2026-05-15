import { useState } from "react"
import ApiKeySection from "../components/ApiKeySection"
import SliderControl from "../components/SliderControl"
import Toast from "../components/Toast"

export default function Dashboard() {

  const [apiKey, setApiKey] = useState(null)
  const [toast, setToast] = useState(null)
  const [styleWeight, setStyleWeight] = useState(0.5)
  const [weirdness, setWeirdness] = useState(0.5)
  const [audioWeight, setAudioWeight] = useState(0.5)

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f172a,#1e293b)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        width: 500,
        background: "#1e293b",
        padding: 25,
        borderRadius: 15,
        color: "white"
      }}>

        <h2>Kreaverse AI – Suno Pro</h2>

        <ApiKeySection onValid={(key) => {
          setApiKey(key)
          setToast({ message: "API Key Connected ✅", type: "success" })
          setTimeout(() => setToast(null), 3000)
        }} />

        <hr style={{ margin: "20px 0" }} />

        <SliderControl
          label="Style Weight"
          value={styleWeight}
          setValue={setStyleWeight}
        />

        <SliderControl
          label="Weirdness Constraint"
          value={weirdness}
          setValue={setWeirdness}
        />

        <SliderControl
          label="Audio Weight"
          value={audioWeight}
          setValue={setAudioWeight}
        />

      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} />
      )}

    </div>
  )
}
