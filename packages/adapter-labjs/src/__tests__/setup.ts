/**
 * Test setup for lab.js integration tests.
 *
 * Provides polyfills for browser APIs that jsdom does not support
 * but lab.js requires (SVG matrices, AudioContext, etc.).
 *
 * @module
 */

// lab.js uses SVG matrix functions that jsdom does not support.
// We need to polyfill createSVGMatrix for lab.js to initialize.

// lab.js also requires AudioContext for audio timing
class MockAudioContext {
  state = "running";
  sampleRate = 44100;
  currentTime = 0;
  destination = {};
  listener = {};

  createGain(): MockGainNode {
    return new MockGainNode();
  }

  createOscillator(): MockOscillatorNode {
    return new MockOscillatorNode();
  }

  createBufferSource(): unknown {
    return {
      buffer: null,
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
    };
  }

  createAnalyser(): unknown {
    return {
      connect: () => {},
      disconnect: () => {},
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteFrequencyData: () => {},
      getByteTimeDomainData: () => {},
    };
  }

  decodeAudioData(): Promise<unknown> {
    return Promise.resolve({});
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  suspend(): Promise<void> {
    return Promise.resolve();
  }

  resume(): Promise<void> {
    return Promise.resolve();
  }
}

class MockGainNode {
  gain = { value: 1 };
  connect(): void {}
  disconnect(): void {}
}

class MockOscillatorNode {
  frequency = { value: 440 };
  type = "sine";
  connect(): void {}
  disconnect(): void {}
  start(): void {}
  stop(): void {}
}

// Add AudioContext to window
if (typeof window !== "undefined") {
  (window as unknown as { AudioContext: typeof MockAudioContext }).AudioContext = MockAudioContext;
  (window as unknown as { webkitAudioContext: typeof MockAudioContext }).webkitAudioContext =
    MockAudioContext;

  // lab.js uses performance.timing.navigationStart which jsdom does not provide
  if (!performance.timing) {
    const now = Date.now();
    Object.defineProperty(performance, "timing", {
      value: {
        navigationStart: now,
        unloadEventStart: 0,
        unloadEventEnd: 0,
        redirectStart: 0,
        redirectEnd: 0,
        fetchStart: now,
        domainLookupStart: now,
        domainLookupEnd: now,
        connectStart: now,
        connectEnd: now,
        secureConnectionStart: 0,
        requestStart: now,
        responseStart: now,
        responseEnd: now,
        domLoading: now,
        domInteractive: now,
        domContentLoadedEventStart: now,
        domContentLoadedEventEnd: now,
        domComplete: now,
        loadEventStart: now,
        loadEventEnd: now,
      },
      configurable: true,
      enumerable: true,
    });
  }
}

interface MockSVGMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  multiply(secondMatrix: MockSVGMatrix): MockSVGMatrix;
  inverse(): MockSVGMatrix;
  translate(x: number, y: number): MockSVGMatrix;
  scale(scaleFactor: number): MockSVGMatrix;
  scaleNonUniform(scaleFactorX: number, scaleFactorY: number): MockSVGMatrix;
  rotate(angle: number): MockSVGMatrix;
  rotateFromVector(x: number, y: number): MockSVGMatrix;
  flipX(): MockSVGMatrix;
  flipY(): MockSVGMatrix;
  skewX(angle: number): MockSVGMatrix;
  skewY(angle: number): MockSVGMatrix;
}

/**
 * Creates a mock SVG matrix for lab.js canvas support.
 */
function createMockSVGMatrix(): MockSVGMatrix {
  const matrix: MockSVGMatrix = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0,
    multiply: () => matrix,
    inverse: () => matrix,
    translate: () => matrix,
    scale: () => matrix,
    scaleNonUniform: () => matrix,
    rotate: () => matrix,
    rotateFromVector: () => matrix,
    flipX: () => matrix,
    flipY: () => matrix,
    skewX: () => matrix,
    skewY: () => matrix,
  };
  return matrix;
}

// Add createSVGMatrix to SVGSVGElement prototype if it does not exist
const originalCreateElementNS = document.createElementNS.bind(document);

// Override createElementNS to add createSVGMatrix to SVG elements
// @ts-expect-error - Overriding built-in method with compatible signature
document.createElementNS = (namespaceURI: string | null, qualifiedName: string): Element => {
  const element = originalCreateElementNS(namespaceURI, qualifiedName);

  // If this is an SVG element, add the createSVGMatrix method
  if (namespaceURI === "http://www.w3.org/2000/svg" && qualifiedName === "svg") {
    (element as unknown as { createSVGMatrix: () => MockSVGMatrix }).createSVGMatrix =
      createMockSVGMatrix;
  }

  return element;
};

// Also patch SVGSVGElement prototype directly
if (typeof SVGSVGElement !== "undefined") {
  (SVGSVGElement.prototype as unknown as { createSVGMatrix: () => MockSVGMatrix }).createSVGMatrix =
    createMockSVGMatrix;
}

// lab.js may also need these on the window
if (typeof window !== "undefined") {
  (window as unknown as { SVGMatrix: unknown }).SVGMatrix = class SVGMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
  };
}
