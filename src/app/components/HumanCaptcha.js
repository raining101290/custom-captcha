import { createSectors, DEFAULT_GRID, MOVE_INTERVAL_MAX, MOVE_INTERVAL_MIN, randInt, rnd, SHAPES, validateSelection } from "../utils/helper";
import { PuzzleStep } from "./PuzzleStep";

const { useEffect, useState, useRef } = require("react");

export function HumanCaptcha() {
  const [step, setStep] = useState("camera");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasCam, setHasCam] = useState(true);
  const [square, setSquare] = useState({ x: 40, y: 40, size: 220 });
  const moveTimer = useRef(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [grid, setGrid] = useState(DEFAULT_GRID);
  const [targetShape, setTargetShape] = useState(SHAPES[randInt(0, 2)]);
  const [sectors, setSectors] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [passed, setPassed] = useState(null);

  // setup camera
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scheduleMove();
        }
      } catch (e) {
        console.warn("Camera unavailable", e);
        setHasCam(false);
      }
    })();
    return () => {
      if (moveTimer.current) clearTimeout(moveTimer.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // move square randomly
  const scheduleMove = () => {
    if (moveTimer.current) clearTimeout(moveTimer.current);
    const delay = randInt(MOVE_INTERVAL_MIN, MOVE_INTERVAL_MAX);
    moveTimer.current = setTimeout(() => {
      const v = videoRef.current;
      if (!v) return scheduleMove();
      const rect = v.getBoundingClientRect();
      const size = Math.max(160, Math.min(rect.width, rect.height) * (0.35 + rnd() * 0.15));
      const x = randInt(0, Math.max(0, rect.width - size));
      const y = randInt(0, Math.max(0, rect.height - size));
      setSquare({ x, y, size });
      scheduleMove();
    }, delay);
  };

  // capture camera frame
  const onContinue = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || v.clientWidth;
    canvas.height = v.videoHeight || v.clientHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // mirror
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    setSnapshotUrl(canvas.toDataURL("image/png"));

    setTargetShape(SHAPES[randInt(0, 2)]);
    setGrid(DEFAULT_GRID);
    setSectors(createSectors(DEFAULT_GRID, targetShape));
    setSelected(new Set());

    if (moveTimer.current) clearTimeout(moveTimer.current);
    setStep("puzzle");
  };

  const toggleSelect = (row, col) => {
    const key = `${row}:${col}`;
    const s = new Set(selected);
    if (s.has(key)) s.delete(key);
    else s.add(key);
    setSelected(s);
  };

  const onValidate = () => {
    const ok = validateSelection(sectors, selected, targetShape);
    setPassed(ok);
    setStep("result");
  };

  // instructions
  const instruction = (() => {
    if (step === "camera") return "Center your face in the square and press Continue.";
    if (step === "puzzle") return `Select ${targetShape}`;
    return passed ? "You passed the CAPTCHA." : "CAPTCHA failed. Please try again.";
  })();

  return (
    <div className="bg-white shadow-lg p-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-center">{step === 'puzzle' ? instruction :'Take Selfie'}</h1>
        {step === "camera" && <p className="text-sm text-gray-600 text-center" aria-live="polite">{instruction}</p>}
        
      </header>

      {step === "camera" && (
        <section className="relative">
          {hasCam ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <video ref={videoRef} className="w-full h-[360px] object-cover bg-black" playsInline muted />
              <div className="absolute border-4 border-cyan-400/80 rounded-lg pointer-events-none"
                style={{
                  left: square.x,
                  top: square.y,
                  width: square.size,
                  height: square.size,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.25) inset"
                }}
              />
            </div>
          ) : (
            <div className="p-6 text-center border rounded-xl bg-gray-50">
              <p className="mb-2 font-medium">Camera unavailable.</p>
              <p className="text-sm text-gray-600">Grant camera permission or try a different device.</p>
            </div>
          )}
          <div className="flex justify-center mt-4">
            <button className="px-4 py-2 uppercase bg-[#de9b0c] text-white shadow hover:brightness-110" onClick={onContinue}>Continue</button>
          </div>
        </section>
      )}

      {step === "puzzle" && snapshotUrl && (
        <PuzzleStep
          snapshotUrl={snapshotUrl}
          grid={grid}
          sectors={sectors}
          selected={selected}
          toggleSelect={toggleSelect}
          onValidate={onValidate}
        />
      )}

      {step === "result" && (
        <div className="p-6 text-center">
          <p className={`text-lg font-semibold ${passed ? "text-green-600" : "text-red-600"}`}>
            {passed ? "CAPTCHA Passed" : "CAPTCHA Failed"}
          </p>
          <button className="mt-4 px-4 py-2 bg-[#de9b0c] text-white shadow hover:brightness-110" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}
    </div>
  );
}