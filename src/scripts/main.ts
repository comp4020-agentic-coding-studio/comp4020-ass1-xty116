import { getSkyState, type SkyState } from "./sky-state";

interface Star {
  x: number;
  y: number;
  radius: number;
  visibilityRank: number;
  warmth: number;
  band: boolean;
}

function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function makeStars(): Star[] {
  const random = mulberry32(4020);
  const field = Array.from({ length: 520 }, () => {
    const visibilityRank = random();
    return {
      x: random(),
      y: 0.025 + random() * 0.68,
      radius: 0.45 + (1 - visibilityRank) ** 4 * 1.8,
      visibilityRank,
      warmth: random(),
      band: false,
    };
  });

  const band = Array.from({ length: 240 }, () => {
    const x = random();
    const centre = 0.64 - x * 0.5;
    const spread = (random() + random() + random() - 1.5) * 0.17;
    const visibilityRank = random();
    return {
      x,
      y: Math.min(0.69, Math.max(0.03, centre + spread)),
      radius: 0.35 + (1 - visibilityRank) ** 3 * 1.05,
      visibilityRank,
      warmth: random(),
      band: true,
    };
  });

  return [...field, ...band];
}

const stars = makeStars();
const scene = document.querySelector<HTMLElement>("#sky-scene");
const canvas = document.querySelector<HTMLCanvasElement>("#star-canvas");
const control = document.querySelector<HTMLInputElement>("#light-pollution");
const levelOutput = document.querySelector<HTMLElement>("#state-level");
const nameOutput = document.querySelector<HTMLElement>("#state-name");
const contextOutput = document.querySelector<HTMLElement>("#state-context");
const observationOutput = document.querySelector<HTMLElement>(
  "#state-observation",
);

let currentState = getSkyState(Number(control?.value ?? 4));

function starColour(warmth: number, alpha: number): string {
  if (warmth > 0.82) return `rgb(255 218 174 / ${alpha})`;
  if (warmth < 0.18) return `rgb(186 218 255 / ${alpha})`;
  return `rgb(246 248 255 / ${alpha})`;
}

function drawMilkyWay(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity: number,
): void {
  if (opacity <= 0) return;

  context.save();
  context.translate(width * 0.5, height * 0.35);
  context.rotate(-0.47);
  const bandWidth = Math.max(150, height * 0.25);
  const haze = context.createLinearGradient(0, -bandWidth, 0, bandWidth);
  haze.addColorStop(0, "rgb(188 207 220 / 0)");
  haze.addColorStop(0.5, `rgb(188 207 220 / ${0.09 * opacity})`);
  haze.addColorStop(1, "rgb(188 207 220 / 0)");
  context.fillStyle = haze;
  context.fillRect(-width, -bandWidth, width * 2, bandWidth * 2);
  context.restore();
}

function drawSky(): void {
  if (!canvas || !scene) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const bounds = scene.getBoundingClientRect();
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  drawMilkyWay(context, width, height, currentState.milkyWayOpacity);

  for (const star of stars) {
    const threshold = star.band
      ? currentState.starFraction * currentState.milkyWayOpacity
      : currentState.starFraction;
    if (star.visibilityRank > threshold) continue;

    const prominence = 1 - star.visibilityRank;
    const alpha = Math.min(0.98, 0.42 + prominence * 0.64);
    const x = star.x * width;
    const y = star.y * height;

    context.beginPath();
    context.arc(x, y, star.radius, 0, Math.PI * 2);
    context.fillStyle = starColour(star.warmth, alpha);
    context.fill();

    if (star.radius > 1.45) {
      context.fillStyle = starColour(star.warmth, alpha * 0.28);
      context.fillRect(x - star.radius * 2.5, y - 0.35, star.radius * 5, 0.7);
      context.fillRect(x - 0.35, y - star.radius * 2.5, 0.7, star.radius * 5);
    }
  }
}

function applyState(state: SkyState): void {
  if (!scene || !control) return;
  currentState = state;
  scene.dataset.bortle = String(state.level);
  scene.style.setProperty("--sky-glow", String(state.skyGlow));
  scene.style.setProperty("--ground-lift", String(state.groundLift));
  control.style.setProperty(
    "--range-position",
    `${((state.level - 1) / 8) * 100}%`,
  );
  control.setAttribute(
    "aria-valuetext",
    `Bortle class ${state.level}: ${state.name}`,
  );

  if (levelOutput) levelOutput.textContent = String(state.level);
  if (nameOutput) nameOutput.textContent = state.name;
  if (contextOutput) contextOutput.textContent = state.context;
  if (observationOutput) observationOutput.textContent = state.observation;
  drawSky();
}

if (scene && canvas && control) {
  control.addEventListener("input", () => {
    applyState(getSkyState(Number(control.value)));
  });

  applyState(currentState);

  const observer = new ResizeObserver(drawSky);
  observer.observe(scene);
}
