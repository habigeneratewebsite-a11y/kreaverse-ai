// pages/dashboard.js

import { useEffect, useRef, useState } from "react";
import Head from "next/head";

export default function Dashboard() {
  const audioRef = useRef(null);

  // =========================
  // API
  // =========================
  const [apiKey, setApiKey] = useState("");
  const [apiStatus, setApiStatus] = useState(null);
  const [checkingKey, setCheckingKey] = useState(false);

  // =========================
  // MAIN
  // =========================
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [style, setStyle] = useState("");
  const [negativeTags, setNegativeTags] = useState("");

  // =========================
  // ADVANCED
  // =========================
  const [customMode, setCustomMode] = useState(false);
  const [instrumental, setInstrumental] = useState(false);
  const [vocalGender, setVocalGender] = useState("female");
  const [modelVersion, setModelVersion] = useState("V4");
  const [seed, setSeed] = useState("");
  const [personaStrength, setPersonaStrength] = useState(50);
  const [styleStrength, setStyleStrength] = useState(50);

  // =========================
  // AUDIO UPLOAD
  // =========================
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [audioConfirmed, setAudioConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);

  // =========================
  // COVER IMAGE
  // =========================
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  // =========================
  // GENERATION
  // =========================
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [taskId, setTaskId] = useState("");
  const [generatedAudio, setGeneratedAudio] = useState("");
  const [queue, setQueue] = useState([]);

  // =========================
  // TOAST
  // =========================
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  function showToast(message, type = "success") {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3000);
  }

  // =========================
  // CHECK API KEY
  // =========================
  async function checkApiKey() {
    try {
      setCheckingKey(true);

      const res = await fetch("/api/check-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setApiStatus("valid");
        showToast("API key valid");
      } else {
        setApiStatus("invalid");
        showToast(data.error || "Invalid API key", "error");
      }
    } catch (err) {
      showToast("Check key failed", "error");
    } finally {
      setCheckingKey(false);
    }
  }

  // =========================
  // AUDIO SELECT
  // =========================
  function handleAudioChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    setAudioFile(file);
    setAudioConfirmed(false);

    const url = URL.createObjectURL(file);
    setAudioPreview(url);

    showToast("Audio selected");
  }

  // =========================
  // CONFIRM AUDIO
  // =========================
  async function confirmAudioUpload() {
    if (!audioFile) {
      showToast("Select audio first", "error");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", audioFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setAudioConfirmed(true);

      showToast("Audio upload confirmed");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  // =========================
  // COVER IMAGE
  // =========================
  function handleCoverImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  // =========================
  // GENERATE
  // =========================
  async function generateMusic() {
    try {
      setLoading(true);
      setGeneratedAudio("");
      setStatus("Preparing request...");

      const payload = {
        apiKey: apiKey.trim(),

        title,
        lyrics,
        style,
        negative_tags: negativeTags,

        custom_mode: customMode,
        instrumental,
        vocal_gender: vocalGender,

        model: modelVersion,
        seed,

        persona_strength: personaStrength,
        style_strength: styleStrength,
      };

      setStatus("Generating music...");

      const res = await fetch("/api/suno/cover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Generation failed");
      }

      setTaskId(data.taskId);

      setQueue((prev) => [
        {
          id: data.taskId,
          title,
          status: "queued",
        },
        ...prev,
      ]);

      showToast("Music generation started");

      pollStatus(data.taskId);
    } catch (err) {
      showToast(err.message || "Generate failed", "error");
      setLoading(false);
    }
  }

  // =========================
  // POLL STATUS
  // =========================
  async function pollStatus(id) {
    let finished = false;

    while (!finished) {
      try {
        const res = await fetch("/api/suno/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: id,
            apiKey,
          }),
        });

        const data = await res.json();

        if (data.status) {
          setStatus(data.status);
        }

        setQueue((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: data.status,
                }
              : item
          )
        );

        if (data.status === "completed") {
          finished = true;

          setGeneratedAudio(data.audioUrl);

          setLoading(false);

          showToast("Generation completed");
        }

        if (data.status === "failed") {
          finished = true;

          setLoading(false);

          showToast("Generation failed", "error");
        }

        await new Promise((resolve) => setTimeout(resolve, 4000));
      } catch (err) {
        finished = true;
        setLoading(false);
        showToast("Status polling failed", "error");
      }
    }
  }

  // =========================
  // RETRY
  // =========================
  function retryGeneration() {
    generateMusic();
  }

  return (
    <>
      <Head>
        <title>Kreaverse AI Dashboard</title>
      </Head>

      <div className="container">
        {/* TOAST */}
        {toast.show && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        <div className="header">
          <h1>Kreaverse AI</h1>
          <p>Premium Suno Music Generator</p>
        </div>

        {/* API KEY */}
        <div className="card">
          <h2>API Configuration</h2>

          <input
            type="password"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />

          <button
            className="primary"
            onClick={checkApiKey}
            disabled={checkingKey}
          >
            {checkingKey ? "Checking..." : "Check API Key"}
          </button>

          {apiStatus === "valid" && (
            <div className="successText">API key valid</div>
          )}

          {apiStatus === "invalid" && (
            <div className="errorText">API key invalid</div>
          )}
        </div>

        {/* MAIN */}
        <div className="card">
          <h2>Music Settings</h2>

          <label>Title</label>
          <input
            type="text"
            placeholder="Song title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label>Lyrics</label>
          <textarea
            placeholder="Enter lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
          />

          <label>Style</label>
          <input
            type="text"
            placeholder="EDM, Pop, Rock..."
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />

          <label>Negative Tags</label>
          <input
            type="text"
            placeholder="low quality, noise..."
            value={negativeTags}
            onChange={(e) => setNegativeTags(e.target.value)}
          />
        </div>

        {/* ADVANCED */}
        <div className="card">
          <h2>Advanced Controls</h2>

          <div className="row">
            <label>Custom Mode</label>

            <input
              type="checkbox"
              checked={customMode}
              onChange={() => setCustomMode(!customMode)}
            />
          </div>

          <div className="row">
            <label>Instrumental</label>

            <input
              type="checkbox"
              checked={instrumental}
              onChange={() => setInstrumental(!instrumental)}
            />
          </div>

          <label>Vocal Gender</label>

          <select
            value={vocalGender}
            onChange={(e) => setVocalGender(e.target.value)}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="duet">Duet</option>
          </select>

          <label>Model Version</label>

          <select
            value={modelVersion}
            onChange={(e) => setModelVersion(e.target.value)}
          >
            <option value="V4">V4</option>
            <option value="V3_5">V3.5</option>
          </select>

          <label>Seed</label>

          <input
            type="number"
            placeholder="Random seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
          />

          <label>Persona Strength ({personaStrength})</label>

          <input
            type="range"
            min="0"
            max="100"
            value={personaStrength}
            onChange={(e) => setPersonaStrength(e.target.value)}
          />

          <label>Style Strength ({styleStrength})</label>

          <input
            type="range"
            min="0"
            max="100"
            value={styleStrength}
            onChange={(e) => setStyleStrength(e.target.value)}
          />
        </div>

        {/* AUDIO */}
        <div className="card">
          <h2>Upload Audio Reference</h2>

          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioChange}
          />

          {audioPreview && (
            <>
              <audio controls src={audioPreview} ref={audioRef} />

              <button
                className="primary"
                onClick={confirmAudioUpload}
                disabled={uploading}
              >
                {uploading
                  ? "Uploading..."
                  : "Confirm Upload"}
              </button>
            </>
          )}

          {audioConfirmed && (
            <div className="successText">
              Audio upload confirmed
            </div>
          )}
        </div>

        {/* COVER */}
        <div className="card">
          <h2>Cover Image</h2>

          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImage}
          />

          {coverPreview && (
            <img
              src={coverPreview}
              className="coverPreview"
            />
          )}
        </div>

        {/* GENERATE */}
        <div className="card">
          <button
            className="generateBtn"
            onClick={generateMusic}
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate Music"}
          </button>

          {status && (
            <div className="statusBox">
              Status: {status}
            </div>
          )}

          {generatedAudio && (
            <div className="resultBox">
              <audio controls src={generatedAudio} />

              <a
                href={generatedAudio}
                target="_blank"
                rel="noreferrer"
              >
                Download Audio
              </a>

              <button onClick={retryGeneration}>
                Retry Generate
              </button>
            </div>
          )}
        </div>

        {/* QUEUE */}
        <div className="card">
          <h2>Generation Queue</h2>

          {queue.length === 0 && (
            <div>No queue yet</div>
          )}

          {queue.map((item) => (
            <div key={item.id} className="queueItem">
              <div>{item.title || "Untitled"}</div>
              <div>{item.status}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        body {
          background: #060816;
        }

        .container {
          min-height: 100vh;
          background: linear-gradient(
            180deg,
            #060816,
            #0b1020
          );
          padding: 20px;
          color: white;
          font-family: sans-serif;
        }

        .header {
          margin-bottom: 20px;
        }

        .header h1 {
          margin: 0;
          font-size: 34px;
        }

        .header p {
          color: #94a3b8;
        }

        .card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(20px);
        }

        input,
        textarea,
        select {
          width: 100%;
          margin-top: 10px;
          margin-bottom: 16px;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          color: white;
        }

        textarea {
          min-height: 120px;
        }

        button {
          border: none;
          cursor: pointer;
        }

        .primary,
        .generateBtn {
          background: linear-gradient(
            90deg,
            #7c3aed,
            #2563eb
          );
          color: white;
          padding: 14px 20px;
          border-radius: 14px;
          width: 100%;
          font-weight: bold;
        }

        .generateBtn {
          font-size: 18px;
        }

        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .statusBox {
          margin-top: 20px;
          background: rgba(255,255,255,0.06);
          padding: 12px;
          border-radius: 12px;
        }

        .resultBox {
          margin-top: 20px;
        }

        .resultBox a {
          display: block;
          margin-top: 10px;
          color: #60a5fa;
        }

        .queueItem {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 14px 18px;
          border-radius: 12px;
          z-index: 9999;
          color: white;
          font-weight: bold;
        }

        .toast.success {
          background: #16a34a;
        }

        .toast.error {
          background: #dc2626;
        }

        .successText {
          color: #4ade80;
        }

        .errorText {
          color: #f87171;
        }

        .coverPreview {
          width: 100%;
          border-radius: 16px;
          margin-top: 10px;
        }

        audio {
          width: 100%;
          margin-top: 12px;
          margin-bottom: 12px;
        }
      `}</style>
    </>
  );
}
