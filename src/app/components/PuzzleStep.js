import { useEffect, useRef } from "react";
import { drawShape } from "../utils/helper";

export function PuzzleStep({ snapshotUrl, grid, sectors, selected, toggleSelect, onValidate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = snapshotUrl;
    img.onload = () => {
      canvas.width = img.width/2;
      canvas.height = img.height/2;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const sectorW = canvas.width / grid;
      const sectorH = canvas.height / grid;

      sectors.forEach(s => {
        const x = s.col * sectorW;
        const y = s.row * sectorH;
        // draw watermark if exists
        if (s.hasWatermark) drawShape(ctx, s.shape, x + sectorW / 2, y + sectorH / 2, Math.min(sectorW, sectorH) * 0.5);
        // draw grid
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.strokeRect(x, y, sectorW, sectorH);
        // highlight selected
        if (selected.has(`${s.row}:${s.col}`)) {
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillRect(x, y, sectorW, sectorH);
        }
      });
    };
  }, [snapshotUrl, grid, sectors, selected]);

  const handleClick = e => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const sectorW = canvas.width / grid;
    const sectorH = canvas.height / grid;
    const col = Math.floor(x / sectorW);
    const row = Math.floor(y / sectorH);
    toggleSelect(row, col);
  };

  return (
    <section className="relative">
      <canvas ref={canvasRef} className="w-full max-h-[480px] border-2 border-white rounded-xl cursor-pointer" onClick={handleClick} />
      <div className="flex justify-center mt-4">
        <button className="px-4 py-2 bg-[#de9b0c] uppercase text-white shadow hover:brightness-110" onClick={onValidate}>Validate</button>
      </div>
    </section>
  );
}