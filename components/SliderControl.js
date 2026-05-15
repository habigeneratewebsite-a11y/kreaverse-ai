import { useState } from "react"

export default function SliderControl({ label, value, setValue }) {

  const [inputVal, setInputVal] = useState(value)

  function handleChange(v) {
    const num = parseFloat(v)
    setInputVal(num)
    setValue(num)
  }

  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ display: "block", marginBottom: 5 }}>
        {label}
      </label>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={e => handleChange(e.target.value)}
        style={{ width: "100%" }}
      />

      <input
        type="number"
        min="0"
        max="1"
        step="0.01"
        value={inputVal}
        onChange={e => handleChange(e.target.value)}
        style={{
          marginTop: 5,
          width: "100%",
          padding: 8,
          borderRadius: 6,
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white"
        }}
      />
    </div>
  )
}
