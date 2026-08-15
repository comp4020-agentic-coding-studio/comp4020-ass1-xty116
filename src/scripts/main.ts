import { getSkyState, type SkyState } from "./sky-state";

interface Star {
  x: number;
  y: number;
  radius: number;
  visibilityRank: number;
  warmth: number;
  band: boolean;
  brilliance: number;
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
  const field = Array.from({ length: 680 }, () => {
    const visibilityRank = random();
    return {
      x: random(),
      y: 0.018 + random() * 0.7,
      radius: 0.35 + (1 - visibilityRank) ** 5 * 2.15,
      visibilityRank,
      warmth: random(),
      band: false,
      brilliance: random(),
    };
  });

  const band = Array.from({ length: 460 }, () => {
    const x = random();
    const centre = 0.69 - x * 0.56;
    const spread = (random() + random() + random() - 1.5) * 0.2;
    const visibilityRank = random();
    return {
      x,
      y: Math.min(0.72, Math.max(0.025, centre + spread)),
      radius: 0.28 + (1 - visibilityRank) ** 3 * 1.25,
      visibilityRank,
      warmth: random(),
      band: true,
      brilliance: random(),
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
  context.translate(width * 0.5, height * 0.38);
  context.rotate(-0.49);

  const bandWidth = Math.max(170, height * 0.3);
  const bandLength = Math.hypot(width, height) * 1.35;
  const blur = Math.max(14, Math.min(34, width * 0.012));

  context.globalCompositeOperation = "screen";
  context.filter = `blur(${blur}px)`;
  const haze = context.createLinearGradient(0, -bandWidth, 0, bandWidth);
  haze.addColorStop(0, "rgb(83 175 185 / 0)");
  haze.addColorStop(0.28, `rgb(83 175 185 / ${0.055 * opacity})`);
  haze.addColorStop(0.48, `rgb(236 222 193 / ${0.18 * opacity})`);
  haze.addColorStop(0.56, `rgb(255 179 131 / ${0.12 * opacity})`);
  haze.addColorStop(0.76, `rgb(123 172 190 / ${0.07 * opacity})`);
  haze.addColorStop(1, "rgb(83 175 185 / 0)");
  context.fillStyle = haze;
  context.fillRect(-bandLength, -bandWidth, bandLength * 2, bandWidth * 2);

  const coreWidth = bandWidth * 0.34;
  const core = context.createLinearGradient(0, -coreWidth, 0, coreWidth);
  core.addColorStop(0, "rgb(255 216 174 / 0)");
  core.addColorStop(0.42, `rgb(255 216 174 / ${0.1 * opacity})`);
  core.addColorStop(0.58, `rgb(148 213 208 / ${0.075 * opacity})`);
  core.addColorStop(1, "rgb(148 213 208 / 0)");
  context.fillStyle = core;
  context.fillRect(-bandLength, -coreWidth, bandLength * 2, coreWidth * 2);

  context.globalCompositeOperation = "source-over";
  context.filter = `blur(${Math.max(8, blur * 0.52)}px)`;
  const dust = context.createLinearGradient(0, -coreWidth, 0, coreWidth);
  dust.addColorStop(0, "rgb(2 8 16 / 0)");
  dust.addColorStop(0.45, `rgb(2 8 16 / ${0.26 * opacity})`);
  dust.addColorStop(0.54, `rgb(2 8 16 / ${0.34 * opacity})`);
  dust.addColorStop(1, "rgb(2 8 16 / 0)");
  context.fillStyle = dust;
  context.fillRect(-bandLength, -coreWidth, bandLength * 2, coreWidth * 2);
  context.restore();
}

function drawBrightStar(
  context: CanvasRenderingContext2D,
  star: Star,
  x: number,
  y: number,
  alpha: number,
): void {
  const reach = star.radius * (4.8 + star.brilliance * 2.2);
  const halo = context.createRadialGradient(x, y, 0, x, y, reach);
  halo.addColorStop(0, starColour(star.warmth, alpha * 0.42));
  halo.addColorStop(0.2, starColour(star.warmth, alpha * 0.16));
  halo.addColorStop(1, starColour(star.warmth, 0));
  context.fillStyle = halo;
  context.fillRect(x - reach, y - reach, reach * 2, reach * 2);

  const ray = star.radius * (2.8 + star.brilliance * 2.4);
  context.fillStyle = starColour(star.warmth, alpha * 0.34);
  context.fillRect(x - ray, y - 0.28, ray * 2, 0.56);
  context.fillRect(x - 0.28, y - ray, 0.56, ray * 2);
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
    const alpha = Math.min(
      0.98,
      0.34 + prominence * 0.58 + star.brilliance * 0.12,
    );
    const x = star.x * width;
    const y = star.y * height;

    if (star.radius > 1.28 && !star.band) {
      drawBrightStar(context, star, x, y, alpha);
    }

    context.beginPath();
    context.arc(x, y, star.radius, 0, Math.PI * 2);
    context.fillStyle = starColour(star.warmth, alpha);
    context.fill();

    if (star.band && star.brilliance > 0.82) {
      context.beginPath();
      context.arc(x, y, star.radius * 2.2, 0, Math.PI * 2);
      context.fillStyle = starColour(star.warmth, alpha * 0.12);
      context.fill();
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
