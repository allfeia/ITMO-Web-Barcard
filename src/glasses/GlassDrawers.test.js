import { describe, it, expect, vi, beforeEach } from "vitest";

import { drawBlueGlass } from "./BlueGlass.js";
import { drawPinkGlass } from "./PinkGlass.js";
import { drawRedGlass } from "./RedGlass.js";
import { drawYellowGlass } from "./YellowGlass.js";
import { canvaStyles } from "../start-page/utils/canvaStyles.js";

const mockCtx = {
  fillStyle: "",
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  ellipse: vi.fn(),
  roundRect: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  closePath: vi.fn(),
  clearRect: vi.fn(),
};

const mockCanvas = {
  getContext: vi.fn().mockReturnValue(mockCtx),
  width: 0,
  height: 0,
};

describe("glass drawing functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvas.width = 0;
    mockCanvas.height = 0;
  });

  it("drawBlueGlass рисует синий бокал", () => {
    drawBlueGlass(mockCanvas);
    expect(mockCtx.fillStyle).toBe("#9DA3EF");
    expect(mockCtx.moveTo).toHaveBeenCalledWith(28, 8);
    expect(mockCtx.fillRect).toHaveBeenCalledWith(47.5, 48, 5, 36);
  });

  it("drawPinkGlass рисует розовый бокал", () => {
    drawPinkGlass(mockCanvas);
    expect(mockCtx.fillStyle).toBe("#FFC5EB");
    expect(mockCtx.fillRect).toHaveBeenCalledWith(47.5, 54, 5, 30);
  });

  it("drawRedGlass рисует красный бокал", () => {
    drawRedGlass(mockCanvas);
    expect(mockCtx.fillStyle).toBe("#E35C5C");
    expect(mockCtx.roundRect).toHaveBeenCalledWith(32, 8, 36, 42, 3);
  });

  it("drawYellowGlass рисует жёлтый бокал из двух эллипсов", () => {
    drawYellowGlass(mockCanvas);
    expect(mockCtx.fillStyle).toBe("#FED233");
    expect(mockCtx.ellipse).toHaveBeenCalledTimes(2);
    expect(mockCtx.fillRect).toHaveBeenCalledWith(47.5, 51, 5, 33);
  });

  it("canvaStyles очищает canvas", () => {
    canvaStyles(mockCanvas);
    expect(mockCanvas.width).toBe(75);
    expect(mockCanvas.height).toBe(75);
    expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 75, 75);
  });

  it("все функции безопасны при canvas === null", () => {
    expect(() => drawBlueGlass(null)).not.toThrow();
    expect(() => drawPinkGlass(null)).not.toThrow();
    expect(() => drawRedGlass(null)).not.toThrow();
    expect(() => drawYellowGlass(null)).not.toThrow();
    expect(() => canvaStyles(null)).not.toThrow();
  });
});
