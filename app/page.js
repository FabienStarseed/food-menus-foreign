'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Settings, ChefHat, Loader2, X, Info, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('lingu_menu_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('lingu_menu_api_key', apiKey);
    setShowSettings(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access denied", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setImage(file);
      setPreview(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg');
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const translateMenu = async () => {
    if (!image) return;
    setLoading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('apiKey', apiKey);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.menu) {
        setResults(data.menu);
      } else {
        alert(data.error || "Translation failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '10px', borderRadius: '12px', background: 'var(--accent-gold-soft)' }}>
            <UtensilsCrossed size={28} color="var(--accent-gold)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>LinguMenu</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI-Powered Culinary Guide</p>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <Settings size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {!preview && !cameraActive && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card" 
            style={{ padding: '40px 20px', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}
          >
            <ChefHat size={48} color="var(--accent-gold)" style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h2 style={{ marginBottom: '10px' }}>Translate a Menu</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.9rem' }}>Snap a photo or upload an image of any menu to begin.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-primary" onClick={startCamera}>
                <Camera size={20} /> Use Camera
              </button>
              <button className="btn-secondary" onClick={() => fileInputRef.current.click()}>
                <Upload size={20} /> Upload Image
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </motion.div>
        )}

        {cameraActive && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px' }}>
              <button onClick={stopCamera} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', padding: '15px', color: '#fff' }}>
                <X size={24} />
              </button>
              <button onClick={capturePhoto} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '5px solid #fff', background: 'transparent', padding: '5px' }}>
                <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '50%' }} />
              </button>
              <div style={{ width: '54px' }} /> {/* Spacer */}
            </div>
          </div>
        )}

        {preview && !loading && !results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', marginBottom: '20px' }}>
              <img src={preview} alt="Preview" style={{ width: '100%', display: 'block', borderRadius: '24px' }} />
              <button 
                onClick={() => {setPreview(null); setImage(null);}} 
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '8px', color: '#fff' }}
              >
                <X size={18} />
              </button>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '20px' }} onClick={translateMenu}>
              Translate Menu
            </button>
          </motion.div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ position: 'relative', width: '100%', height: '300px', marginBottom: '40px', overflow: 'hidden', borderRadius: '24px' }}>
              <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
              <div className="scanning-line" />
            </div>
            <Loader2 className="animate-spin" size={40} color="var(--accent-gold)" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ marginBottom: '10px' }}>AI is analyzing the menu...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Identifying dishes and preparing translations.</p>
          </div>
        )}

        {results && (
          <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Menu Insights</h2>
              <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setResults(null)}>
                New Scan
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card" 
                  style={{ padding: '20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>{item.translation}</h3>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-emerald)' }}>{item.price}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', fontStyle: 'italic' }}>{item.original}</p>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '400px', padding: '30px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3>Settings</h3>
                <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                  <X size={20} />
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Enter your Google Gemini API Key. Your key is stored locally in your browser.
              </p>
              <form onSubmit={handleSaveKey}>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste Gemini API Key here"
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff', marginBottom: '20px' }}
                />
                <button className="btn-primary" style={{ width: '100%' }}>
                  Save Settings
                </button>
              </form>
              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', gap: '10px' }}>
                <Info size={16} color="var(--text-secondary)" />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Don't have a key? Get one for free at <a href="https://aistudio.google.com/" target="_blank" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Google AI Studio</a>.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
