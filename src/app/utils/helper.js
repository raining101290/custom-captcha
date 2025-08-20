// ----------------------------- Constants -----------------------------------
export const SHAPES = ["triangle", "square", "circle"];
export const DEFAULT_GRID = 4; // 4x4 grid
export const WATERMARK_RATIO = 0.5; // half of sectors get watermarks
export const MOVE_INTERVAL_MIN = 700;
export const MOVE_INTERVAL_MAX = 1700;

export function rnd() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 0xffffffff;
  }
  return Math.random();
}

export function randInt(min, max) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createSectors(n, targetShape) {
  const total = n * n;
  const watermarkCount = Math.floor(total * WATERMARK_RATIO);
  const indices = shuffle(Array.from({ length: total }, (_, i) => i)).slice(0, watermarkCount);
  const sectors = [];
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / n);
    const col = i % n;
    const marked = indices.includes(i);
    sectors.push({
      row,
      col,
      hasWatermark: marked,
      shape: marked ? SHAPES[randInt(0, 2)] : undefined
    });
  }
  // ensure at least one watermark is of target shape
  if (!sectors.some(s => s.hasWatermark && s.shape === targetShape)) {
    const candidates = sectors.filter(s => s.hasWatermark);
    if (candidates.length) candidates[0].shape = targetShape;
  }
  return sectors;
}

export function validateSelection(sectors, selected, targetShape) {
  for (const s of sectors) {
    const key = `${s.row}:${s.col}`;
    const shouldPick = s.hasWatermark && s.shape === targetShape;
    if (shouldPick && !selected.has(key)) return false;
    if (!shouldPick && selected.has(key)) return false;
  }
  return true;
}

// draw a shape in canvas
export function drawShape(ctx, shape, cx, cy, size) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  const half = size / 2;
  if (shape === "square") ctx.rect(-half, -half, size, size);
  else if (shape === "circle") ctx.arc(0, 0, half, 0, Math.PI * 2);
  else {
    // triangle
    const h = half * Math.sqrt(3);
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(-half, h / 2);
    ctx.lineTo(half, h / 2);
    ctx.closePath();
  }
  ctx.stroke();
  ctx.restore();
}