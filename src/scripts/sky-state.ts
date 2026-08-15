export interface SkyState {
  level: number;
  name: string;
  context: string;
  observation: string;
  starFraction: number;
  milkyWayOpacity: number;
  skyGlow: number;
  groundLift: number;
}

export const SKY_STATES: readonly SkyState[] = [
  {
    level: 1,
    name: "Pristine dark sky",
    context: "Remote darkness",
    observation:
      "The Milky Way is structured and luminous; faint stars fill the gaps between constellations.",
    starFraction: 1,
    milkyWayOpacity: 0.9,
    skyGlow: 0.02,
    groundLift: 0,
  },
  {
    level: 2,
    name: "Typical dark site",
    context: "Protected night",
    observation:
      "The Milky Way remains detailed, with dark lanes and a sky crowded beyond the familiar patterns.",
    starFraction: 0.84,
    milkyWayOpacity: 0.76,
    skyGlow: 0.06,
    groundLift: 0.02,
  },
  {
    level: 3,
    name: "Rural sky",
    context: "Beyond the city edge",
    observation:
      "The Milky Way is still obvious, but the horizon begins to carry a distant human glow.",
    starFraction: 0.69,
    milkyWayOpacity: 0.6,
    skyGlow: 0.12,
    groundLift: 0.05,
  },
  {
    level: 4,
    name: "Rural-suburban transition",
    context: "Canberra outskirts",
    observation:
      "The Milky Way softens. Familiar constellations remain, while the quiet background stars begin to go.",
    starFraction: 0.54,
    milkyWayOpacity: 0.42,
    skyGlow: 0.2,
    groundLift: 0.09,
  },
  {
    level: 5,
    name: "Suburban sky",
    context: "Streetlit neighbourhood",
    observation:
      "Skyglow is visible in most directions. The Milky Way is weak and many faint stars are no longer distinct.",
    starFraction: 0.4,
    milkyWayOpacity: 0.24,
    skyGlow: 0.31,
    groundLift: 0.14,
  },
  {
    level: 6,
    name: "Bright suburban sky",
    context: "Outer urban glow",
    observation:
      "The background sky looks washed out. Bright constellation stars survive, but their depth has collapsed.",
    starFraction: 0.29,
    milkyWayOpacity: 0.1,
    skyGlow: 0.44,
    groundLift: 0.2,
  },
  {
    level: 7,
    name: "Urban sky",
    context: "Inside the light dome",
    observation:
      "The Milky Way has disappeared to the unaided eye. Only the stronger constellation lines remain easy to trace.",
    starFraction: 0.19,
    milkyWayOpacity: 0.03,
    skyGlow: 0.58,
    groundLift: 0.27,
  },
  {
    level: 8,
    name: "City sky",
    context: "Bright city centre",
    observation:
      "The sky itself appears luminous. Fainter constellation stars are lost against the raised background.",
    starFraction: 0.12,
    milkyWayOpacity: 0,
    skyGlow: 0.73,
    groundLift: 0.35,
  },
  {
    level: 9,
    name: "Inner-city sky",
    context: "Maximum skyglow",
    observation:
      "Only the brightest stars and planets stand clear. The universe is still there; the contrast is not.",
    starFraction: 0.07,
    milkyWayOpacity: 0,
    skyGlow: 0.88,
    groundLift: 0.44,
  },
] as const;

export function getSkyState(requestedLevel: number): SkyState {
  const safeLevel = Number.isFinite(requestedLevel)
    ? Math.round(requestedLevel)
    : 1;
  const index = Math.min(SKY_STATES.length - 1, Math.max(0, safeLevel - 1));
  return SKY_STATES[index] ?? SKY_STATES[0];
}
