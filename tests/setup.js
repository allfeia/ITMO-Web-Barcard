// tests/setup.js

Object.defineProperty(globalThis.HTMLCanvasElement.prototype, "getContext", {
    value: () => ({
        clearRect: () => {},
        fillRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        fill: () => {},
        stroke: () => {},
        arc: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
    })
});
