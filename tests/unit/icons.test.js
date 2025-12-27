import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import drawHeartIcon from "../../src/icons/heartIcon";
import drawStarIcon from "../../src/icons/starIcon";
import drawUserIcon from "../../src/icons/userIcon";

function makeMockCtx() {
  return {
    setTransform: vi.fn(),
    scale: vi.fn(),
    clearRect: vi.fn(),

    beginPath: vi.fn(),
    closePath: vi.fn(),

    arc: vi.fn(),
    arcTo: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),

    stroke: vi.fn(),
    fill: vi.fn(),

    lineJoin: "",
    lineCap: "",
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
  };
}

function makeCanvas({ width = 18, height = 18, ctx = makeMockCtx() } = {}) {
  return {
    width: 0,
    height: 0,
    getContext: vi.fn(() => ctx),
    getBoundingClientRect: vi.fn(() => ({ width, height })),
  };
}

describe("icons canvas draw helpers", () => {
  const prevDpr = globalThis.window?.devicePixelRatio;

  beforeEach(() => {
    Object.defineProperty(window, "devicePixelRatio", {
      value: 2,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    // восстановим, если надо
    if (prevDpr === undefined) {
      // eslint-disable-next-line no-unused-vars
      try {
        delete window.devicePixelRatio;
      } catch (e) {
        console.log(e);
      }
    } else {
      window.devicePixelRatio = prevDpr;
    }
  });

  it("heartIcon: returns early when canvas is falsy", () => {
    expect(() => drawHeartIcon(null)).not.toThrow();
    expect(() => drawHeartIcon(undefined)).not.toThrow();
  });

  it("heartIcon: returns early when 2d context is not available", () => {
    const canvas = {
      getContext: vi.fn(() => null),
      getBoundingClientRect: vi.fn(() => ({ width: 18, height: 18 })),
      width: 0,
      height: 0,
    };

    drawHeartIcon(canvas);
    expect(canvas.getContext).toHaveBeenCalledWith("2d");
  });

  it("heartIcon: sets canvas size using DPR and draws filled by default", () => {
    const ctx = makeMockCtx();
    const canvas = makeCanvas({ width: 20, height: 10, ctx }); // s = 10

    drawHeartIcon(canvas, { color: "#abc" }); // filled default = true

    // width/height are rounded + clamped >= 1 in heartIcon
    expect(canvas.width).toBe(Math.max(1, Math.round(20 * 2)));
    expect(canvas.height).toBe(Math.max(1, Math.round(10 * 2)));

    expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(ctx.scale).toHaveBeenCalledWith(2, 2);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 20, 10);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.lineTo).toHaveBeenCalledTimes(1);
    expect(ctx.closePath).toHaveBeenCalled();

    expect(ctx.fill).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).not.toHaveBeenCalled();

    // стиль проставлен
    expect(ctx.strokeStyle).toBe("#abc");
    expect(ctx.fillStyle).toBe("#abc");
  });

  it("heartIcon: when filled=false uses stroke()", () => {
    const ctx = makeMockCtx();
    const canvas = makeCanvas({ width: 18, height: 18, ctx });

    drawHeartIcon(canvas, { filled: false });

    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it("starIcon: returns early when canvas is falsy", () => {
    expect(() => drawStarIcon(null)).not.toThrow();
  });

  it("starIcon: returns early when 2d context is not available", () => {
    const canvas = {
      getContext: vi.fn(() => null),
      getBoundingClientRect: vi.fn(() => ({ width: 18, height: 18 })),
      width: 0,
      height: 0,
    };

    drawStarIcon(canvas);
    expect(canvas.getContext).toHaveBeenCalledWith("2d");
  });

  it("starIcon: sets canvas size using DPR and draws a filled star by default", () => {
    const ctx = makeMockCtx();
    const canvas = makeCanvas({ width: 30, height: 30, ctx });

    drawStarIcon(canvas, { color: "red" });

    expect(canvas.width).toBe(30 * 2);
    expect(canvas.height).toBe(30 * 2);

    expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(ctx.scale).toHaveBeenCalledWith(2, 2);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 30, 30);

    // 10 вершин -> 10 quadraticCurveTo
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(10);
    expect(ctx.closePath).toHaveBeenCalled();

    // filled default true => fill вызывается
    expect(ctx.fill).toHaveBeenCalledTimes(1);
    // starIcon не вызывает stroke вообще
    expect(ctx.stroke).not.toHaveBeenCalled();

    expect(ctx.fillStyle).toBe("red");
  });

  it("starIcon: when filled=false does not fill (and does not stroke)", () => {
    const ctx = makeMockCtx();
    const canvas = makeCanvas({ width: 18, height: 18, ctx });

    drawStarIcon(canvas, { filled: false });

    expect(ctx.fill).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });

  it("starIcon: clamps cornerRadius params (still draws without errors)", () => {
    const ctx = makeMockCtx();
    const canvas = makeCanvas({ width: 18, height: 18, ctx });

    expect(() =>
      drawStarIcon(canvas, {
        cornerRadiusOuter: 999,
        cornerRadiusInner: -999,
      }),
    ).not.toThrow();

    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(10);
  });

  it("userIcon: returns early when canvas is falsy", () => {
    expect(() => drawUserIcon(null)).not.toThrow();
  });

  it("userIcon: returns early when 2d context is not available", () => {
    const canvas = {
      getContext: vi.fn(() => null),
      getBoundingClientRect: vi.fn(() => ({ width: 18, height: 18 })),
      width: 0,
      height: 0,
    };

    drawUserIcon(canvas);
    expect(canvas.getContext).toHaveBeenCalledWith("2d");
  });

  it("userIcon: sets canvas size using DPR and draws filled by default (head + body)", () => {
    const ctx = makeMockCtx();
    const canvas = makeCanvas({ width: 40, height: 20, ctx });

    drawUserIcon(canvas, { color: "#00ff00" });

    expect(canvas.width).toBe(40 * 2);
    expect(canvas.height).toBe(20 * 2);

    expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
    expect(ctx.scale).toHaveBeenCalledWith(2, 2);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 40, 20);

    // голова: arc + stroke + (если filled) fill
    expect(ctx.arc).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    // filled=true => fill 2 раза: голова + тело
    expect(ctx.fill).toHaveBeenCalledTimes(2);

    expect(ctx.strokeStyle).toBe("#00ff00");
    expect(ctx.fillStyle).toBe("#00ff00");
  });

  it("userIcon: when filled=false only strokes head and does not fill", () => {
    const ctx = makeMockCtx();
    const canvas = makeCanvas({ width: 18, height: 18, ctx });

    drawUserIcon(canvas, { filled: false });

    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(ctx.fill).not.toHaveBeenCalled();
  });
});