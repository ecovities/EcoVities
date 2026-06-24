import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";

export function ScanView() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let frameId: number;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        tick();
      } catch {
        setError("Camera access denied. You can also enter an EcoID manually.");
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && scanning) {
            handleResult(code.data);
            return;
          }
        }
      }
      frameId = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelAnimationFrame(frameId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleResult(data: string) {
    setScanning(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    // Expected QR payload format: "ecovities:<eco_id>" (see ReceiveView)
    const ecoId = data.startsWith("ecovities:") ? data.slice("ecovities:".length) : data;
    navigate(`/pay/${encodeURIComponent(ecoId)}`);
  }

  return (
    <div className="flex-col flex-1 h-full bg-gray-900 relative flex">
      <div className="px-4 pt-6 pb-4 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-white hover:bg-white/20 rounded-full transition"
          aria-label="Close"
        >
          <span className="material-symbols-rounded">close</span>
        </button>
        <h1 className="text-xl font-medium text-white">Scan QR Code</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative overflow-hidden flex items-center justify-center bg-gray-800 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          {scanning && (
            <div className="absolute w-full h-1 bg-primary-container scan-line shadow-[0_0_15px_3px_var(--color-primary-container)]" />
          )}

          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl" />
        </div>

        {error && (
          <div className="mt-6 max-w-xs text-center">
            <p className="text-white/80 text-sm mb-3">{error}</p>
            <button
              onClick={() => navigate("/contacts")}
              className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium"
            >
              Enter EcoID instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
