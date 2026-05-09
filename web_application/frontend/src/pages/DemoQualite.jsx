import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowBigLeft, Upload, CheckCircle, AlertTriangle,
  ShieldCheck, Camera, Activity, Scan, Eye, Sun, Maximize2, Cpu,
  Video, X, ZapIcon
} from 'lucide-react';

// ============================================================
// ScanEffect
// ============================================================
const ScanEffect = ({ imageUrl }) => (
  <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-blue-400">
    <img src={imageUrl} alt="Scan" className="w-full h-auto opacity-80" />
    <div className="absolute inset-0 bg-blue-950/30" />
    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent
      via-blue-400 to-transparent shadow-[0_0_18px_4px_rgba(96,165,250,0.8)]"
      style={{ animation: 'scanLine 2s ease-in-out infinite', top: 0 }} />
    <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-blue-400/20 to-transparent"
      style={{ animation: 'scanLine 2s ease-in-out infinite', top: 0 }} />
    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl" />
    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr" />
    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl" />
    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br" />
    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
      <span className="bg-blue-900/80 text-blue-200 text-xs px-3 py-1 rounded-full
        flex items-center gap-2 backdrop-blur-sm border border-blue-400/30">
        <Scan className="w-3 h-3 animate-pulse" />
        Analyse biométrique en cours...
      </span>
    </div>
    <style>{`
      @keyframes scanLine {
        0%   { transform: translateY(0); opacity: 1; }
        45%  { opacity: 1; }
        50%  { transform: translateY(calc(var(--img-h,400px) - 4px)); opacity: 0.8; }
        51%  { opacity: 0; transform: translateY(0); }
        55%  { opacity: 1; }
        100% { transform: translateY(0); opacity: 1; }
      }
    `}</style>
  </div>
);


// ============================================================
// WebcamCapture — modal caméra
// ============================================================
const WebcamCapture = ({ onCapture, onClose }) => {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const [ready, setReady]     = useState(false);
  const [error, setError]     = useState(null);
  const [flash, setFlash]     = useState(false);

  // Démarrer la caméra dès l'ouverture du modal
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      } catch (err) {
        setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      }
    };
    startCamera();

    // Nettoyage : couper la caméra à la fermeture
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    // Flash blanc
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    // Convertir en File
    canvas.toBlob((blob) => {
      const file = new File([blob], 'webcam_capture.jpg', { type: 'image/jpeg' });
      onCapture(file, URL.createObjectURL(blob));
    }, 'image/jpeg', 0.95);
  }, [onCapture]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg mx-4">

        {/* Header modal */}
        <div className="bg-blue-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            <span className="font-semibold">Capture webcam</span>
          </div>
          <button onClick={onClose}
            className="p-1 hover:bg-blue-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-4">
          {error ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3
              text-red-500 text-center">
              <AlertTriangle className="w-10 h-10" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-black shadow-inner">
              {/* Flux vidéo */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
                style={{ transform: 'scaleX(-1)' }}  // miroir naturel
              />

              {/* Flash blanc au moment de la capture */}
              {flash && (
                <div className="absolute inset-0 bg-white opacity-80 pointer-events-none" />
              )}

              {/* Overlay de cadrage visage */}
              {ready && (
                <div className="absolute inset-0 flex items-center justify-center
                  pointer-events-none">
                  <div className="w-40 h-52 border-2 border-blue-400 rounded-full
                    opacity-50 shadow-[0_0_0_9999px_rgba(0,0,0,0.2)]" />
                </div>
              )}

              {/* Indicateur "caméra prête" */}
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm animate-pulse">
                    Initialisation de la caméra...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Canvas caché pour la capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-600
                rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleCapture}
              disabled={!ready || !!error}
              className={`flex-2 flex-grow py-2.5 rounded-xl font-medium text-sm
                flex items-center justify-center gap-2 transition-all ${
                ready && !error
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ZapIcon className="w-4 h-4" />
              Prendre la photo
            </button>
          </div>

          <p className="text-xs text-center text-gray-400">
            Positionnez votre visage dans l'ovale puis cliquez sur "Prendre la photo"
          </p>
        </div>
      </div>
    </div>
  );
};


// ============================================================
// ScoreCard
// ============================================================
const ScoreCard = ({ icon: Icon, label, score, color, show }) => {
  const [barWidth,  setBarWidth]  = useState(0);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(() => setBarWidth(score), 200);
    const t2 = setTimeout(() => {
      const steps = 90; const interval = 1800 / steps; const increment = score / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) { setDisplayed(score); clearInterval(timer); }
        else setDisplayed(Math.round(current));
      }, interval);
      return () => clearInterval(timer);
    }, 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show, score]);

  const barColor = score >= 70 ? 'bg-green-400' : score >= 40 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className={`transition-all duration-700 ease-out ${
      show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${color}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          <span className="text-lg font-bold text-gray-800 tabular-nums">
            {displayed}<span className="text-xs text-gray-400 font-normal">/100</span>
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`}
            style={{ width: `${barWidth}%`, transition: 'width 1.6s cubic-bezier(0.25,1,0.5,1)' }} />
        </div>
      </div>
    </div>
  );
};


// ============================================================
// GlobalScore
// ============================================================
const GlobalScore = ({ score, recommendation, show }) => {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!show) return;
    const steps = 100; const interval = 2500 / steps; const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) { setDisplayed(score); clearInterval(timer); }
      else setDisplayed(Math.round(current));
    }, interval);
    return () => clearInterval(timer);
  }, [show, score]);

  const ringColor  = recommendation === 'bonne' ? 'border-green-500'
    : recommendation === 'acceptable' ? 'border-yellow-400' : 'border-red-500';
  const textColor  = recommendation === 'bonne' ? 'text-green-600'
    : recommendation === 'acceptable' ? 'text-yellow-500' : 'text-red-600';
  const label      = recommendation === 'bonne' ? 'Bonne qualité'
    : recommendation === 'acceptable' ? 'Acceptable' : 'À remplacer';

  return (
    <div className={`flex flex-col items-center transition-all duration-1000 ease-out ${
      show ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
    }`}>
      <div className={`inline-flex items-center justify-center w-36 h-36
        rounded-full border-8 mb-3 shadow-lg ${ringColor}`}>
        <div className="text-center">
          <span className={`text-4xl font-bold tabular-nums ${textColor}`}>{displayed}</span>
          <span className={`text-sm ${textColor}`}>/100</span>
        </div>
      </div>
      <h3 className={`text-lg font-bold uppercase tracking-wide ${textColor}`}>{label}</h3>
    </div>
  );
};


// ============================================================
// Page principale
// ============================================================
const DemoQualite = () => {
  const [file, setFile]               = useState(null);
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [status, setStatus]           = useState({ type: '', message: '' });
  const [visibleCount, setVisibleCount] = useState(0);
  const [showWebcam, setShowWebcam]   = useState(false);
  const [inputMode, setInputMode]     = useState('upload'); // 'upload' | 'webcam'

  const resultRef = useRef(null);

  const metrics = result ? [
    { icon: Eye,       label: 'Netteté (Sobel)',  score: result.sharpness_score,  color: 'bg-blue-500'   },
    { icon: Sun,       label: 'Luminosité',        score: result.brightness_score, color: 'bg-yellow-500' },
    { icon: Maximize2, label: 'Taille du visage',  score: result.face_size_score,  color: 'bg-purple-500' },
    { icon: Cpu,       label: 'GraFIQs (IA)',      score: result.grafiqs_score,    color: 'bg-teal-500'   },
  ] : [];

  // Dévoilement séquentiel des résultats
  useEffect(() => {
    if (!result) { setVisibleCount(0); return; }
    const delays = [400, 1800, 3200, 4600, 6000];
    const timers = delays.map((d, i) => setTimeout(() => setVisibleCount(i + 1), d));
    return () => timers.forEach(clearTimeout);
  }, [result]);

  // Réinitialiser l'état image
  const resetImage = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setVisibleCount(0);
    setStatus({ type: '', message: '' });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreviewUrl(URL.createObjectURL(f)); setResult(null); setVisibleCount(0); setStatus({ type: '', message: '' }); }
  };

  // Callback depuis WebcamCapture
  const handleWebcamCapture = useCallback((capturedFile, capturedUrl) => {
    setFile(capturedFile);
    setPreviewUrl(capturedUrl);
    setResult(null);
    setVisibleCount(0);
    setStatus({ type: '', message: '' });
    setShowWebcam(false);
  }, []);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);
    setVisibleCount(0);
    setStatus({ type: 'info', message: 'Analyse biométrique en cours...' });

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('http://localhost:8000/api/quality', {
        method: 'POST', body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setResult(data);
        const isValid = data.recommendation !== 'a_remplacer';
        setStatus({
          type: isValid ? 'success' : 'error',
          message: isValid ? 'Image validée par le système.' : 'Image rejetée par le filtre de qualité.',
        });
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      } else {
        setStatus({ type: 'error', message: data.detail || "Erreur lors de l'analyse." });
      }
    } catch {
      setStatus({ type: 'error', message: "Impossible de contacter le serveur backend." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6 md:px-20 pb-12">

      {/* Modal Webcam */}
      {showWebcam && (
        <WebcamCapture
          onCapture={handleWebcamCapture}
          onClose={() => setShowWebcam(false)}
        />
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-blue-700 p-8 text-white">
          <Link to="/" className="inline-flex items-center text-blue-200 hover:text-white
            mb-4 transition-colors">
            <ArrowBigLeft className="w-5 h-5 mr-2" /> Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8" />
            Audit de Qualité (FIQA)
          </h1>
          <p className="mt-2 text-blue-100">
            Uploadez une photo ou prenez-en une avec votre webcam — notre moteur hybride
            (GraFIQs + OpenCV) évalue la qualité biométrique critère par critère.
          </p>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-12">

          {/* ---- Colonne gauche ---- */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Camera className="text-blue-600 w-6 h-6" />
              Soumettre une image
            </h2>

            {/* Sélecteur de mode upload / webcam */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                  text-sm font-medium transition-all ${
                  inputMode === 'upload'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                Fichier
              </button>
              <button
                type="button"
                onClick={() => setInputMode('webcam')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg
                  text-sm font-medium transition-all ${
                  inputMode === 'webcam'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Video className="w-4 h-4" />
                Webcam
              </button>
            </div>

            <form onSubmit={handleEvaluate} className="space-y-4">

              {/* Zone image — aperçu / scan / placeholder / webcam */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl
                overflow-hidden hover:border-blue-300 transition-colors">

                {/* Aperçu normal */}
                {previewUrl && !loading && (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="w-full h-56 object-cover" />
                    {/* Bouton changer */}
                    <button
                      type="button"
                      onClick={resetImage}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70
                        text-white rounded-full p-1.5 transition-colors"
                      title="Supprimer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="p-2 text-center text-xs text-gray-400 bg-gray-50
                      border-t border-gray-200">
                      {file?.name || 'Photo webcam'}
                    </div>
                  </div>
                )}

                {/* Scan pendant loading */}
                {previewUrl && loading && <ScanEffect imageUrl={previewUrl} />}

                {/* Placeholder upload */}
                {!previewUrl && inputMode === 'upload' && (
                  <>
                    <input type="file" accept="image/*" onChange={handleFileChange}
                      className="hidden" id="quality-upload" />
                    <label htmlFor="quality-upload"
                      className="cursor-pointer flex flex-col items-center p-8">
                      <Upload className="w-12 h-12 text-blue-400 mb-3" />
                      <span className="text-gray-700 font-medium">Sélectionner une image</span>
                      <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WEBP</span>
                    </label>
                  </>
                )}

                {/* Placeholder webcam */}
                {!previewUrl && inputMode === 'webcam' && (
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="w-full flex flex-col items-center p-8 hover:bg-blue-50
                      transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center
                      justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                      <Video className="w-8 h-8 text-blue-500" />
                    </div>
                    <span className="text-gray-700 font-medium">Ouvrir la webcam</span>
                    <span className="text-xs text-gray-400 mt-1">
                      Prenez votre photo en direct
                    </span>
                  </button>
                )}
              </div>

              {/* Bouton rouvrir webcam si photo déjà prise */}
              {previewUrl && inputMode === 'webcam' && !loading && (
                <button
                  type="button"
                  onClick={() => setShowWebcam(true)}
                  className="w-full py-2 border border-blue-300 text-blue-600
                    rounded-xl text-sm hover:bg-blue-50 transition-colors flex
                    items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Reprendre une photo
                </button>
              )}

              {/* Bouton lancer */}
              <button
                disabled={loading || !file}
                className={`w-full py-3 rounded-xl font-medium transition-all flex
                  items-center justify-center gap-2 ${
                  loading || !file
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                }`}
              >
                {loading
                  ? <><Scan className="w-4 h-4 animate-pulse" /> Analyse en cours...</>
                  : <><Activity className="w-4 h-4" /> Lancer le diagnostic</>
                }
              </button>

              {/* Statut */}
              {status.message && (
                <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${
                  status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200'
                  : status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {status.type === 'error'
                    ? <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                  {status.message}
                </div>
              )}
            </form>
          </div>

          {/* ---- Colonne droite : résultats séquentiels ---- */}
          <div ref={resultRef}
            className="space-y-5 bg-gray-50 p-6 rounded-2xl border border-gray-100
              scroll-mt-8 min-h-64">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="text-blue-600 w-6 h-6" />
              Résultats de l'analyse
            </h2>

            {result ? (
              <div className="space-y-5">

                <div className="flex justify-center py-2">
                  <GlobalScore score={result.final_score}
                    recommendation={result.recommendation} show={visibleCount >= 1} />
                </div>

                <div className={`transition-all duration-700 ${visibleCount >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className={`text-xs px-3 py-1.5 rounded-full inline-flex
                    items-center gap-1.5 mx-auto block w-fit ${
                    result.face_detected
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-orange-50 text-orange-600 border border-orange-200'
                  }`}>
                    {result.face_detected
                      ? <><CheckCircle className="w-3 h-3" /> Visage détecté par YOLO</>
                      : <><AlertTriangle className="w-3 h-3" /> Mode fallback (image entière)</>}
                  </div>
                </div>

                <div className={`border-t border-gray-200 pt-3 transition-all duration-700 ${
                  visibleCount >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wide">
                    Détail par critère
                  </p>
                  <div className="space-y-3">
                    {metrics.map((m, i) => (
                      <ScoreCard key={i} icon={m.icon} label={m.label}
                        score={m.score} color={m.color} show={visibleCount >= i + 2} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-56
                text-gray-300 text-center">
                <ShieldCheck className="w-14 h-14 mb-3 opacity-40" />
                <p className="text-sm">En attente d'une image pour afficher le diagnostic.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoQualite;