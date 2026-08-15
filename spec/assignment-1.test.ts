import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { SKY_STATES, getSkyState } from "../src/scripts/sky-state";

const html = readFileSync(resolve("dist/index.html"), "utf8");
const doc = new JSDOM(html).window.document;

describe("assignment 1: one interaction explains the missing night", () => {
  it("offers one nine-step light-pollution control", () => {
    const controls = doc.querySelectorAll('input[type="range"]');
    expect(controls).toHaveLength(1);

    const control = controls[0];
    expect(control?.getAttribute("min")).toBe("1");
    expect(control?.getAttribute("max")).toBe("9");
    expect(control?.getAttribute("step")).toBe("1");
    expect(control?.getAttribute("aria-controls")).toBe("sky-scene sky-status");
  });

  it("defines nine ordered sky states", () => {
    expect(SKY_STATES).toHaveLength(9);
    expect(SKY_STATES.map(({ level }) => level)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);

    for (let index = 1; index < SKY_STATES.length; index += 1) {
      expect(SKY_STATES[index]?.starFraction).toBeLessThan(
        SKY_STATES[index - 1]?.starFraction ?? 0,
      );
    }
  });

  it("clamps requested levels to the published scale", () => {
    expect(getSkyState(-10).level).toBe(1);
    expect(getSkyState(99).level).toBe(9);
  });

  it("announces the changing state without relying on colour", () => {
    const scene = doc.querySelector('[data-testid="sky-scene"]');
    const status = doc.querySelector('[data-testid="sky-status"]');

    expect(scene?.getAttribute("data-bortle")).toBeTruthy();
    expect(status?.getAttribute("role")).toBe("status");
    expect(status?.getAttribute("aria-live")).toBe("polite");
    expect(status?.querySelector('[data-testid="state-name"]')).toBeTruthy();
    expect(status?.querySelector('[data-testid="state-observation"]')).toBeTruthy();
  });

  it("labels the visual as illustrative and links its factual basis", () => {
    expect(doc.body.textContent).toMatch(/illustrative simulation/i);

    const sourceLinks = [...doc.querySelectorAll('[data-testid="source-link"]')];
    expect(sourceLinks.length).toBeGreaterThanOrEqual(2);
    expect(sourceLinks.every((link) => link.getAttribute("href")?.startsWith("https://"))).toBe(true);
  });
});
