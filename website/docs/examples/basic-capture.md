---
sidebar_position: 1
---

# Basic Capture Example

A complete HTML page demonstrating behavioral capture without any experiment framework.

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slopit Behavioral Capture Demo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }

    .task {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .prompt {
      font-size: 1.1em;
      margin-bottom: 15px;
    }

    textarea {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #ddd;
      border-radius: 4px;
      resize: vertical;
      box-sizing: border-box;
    }

    textarea:focus {
      outline: none;
      border-color: #0066cc;
    }

    .controls {
      margin-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .char-count {
      color: #666;
      font-size: 0.9em;
    }

    button {
      background: #0066cc;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background: #0052a3;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .results {
      margin-top: 30px;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .metric-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
    }

    .metric-card h4 {
      margin: 0 0 5px 0;
      color: #666;
      font-size: 0.9em;
    }

    .metric-card .value {
      font-size: 1.5em;
      font-weight: bold;
      color: #333;
    }

    .raw-data {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: "Fira Code", monospace;
      font-size: 12px;
      max-height: 400px;
      overflow-y: auto;
    }

    .flag {
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .flag.info { background: #e7f3ff; color: #004085; }
    .flag.low { background: #fff3cd; color: #856404; }
    .flag.medium { background: #f8d7da; color: #721c24; }
    .flag.high { background: #d4edda; color: #155724; }

    .hidden { display: none; }
  </style>
  <script type="importmap">
  {
    "imports": {
      "@slopit/core": "https://esm.sh/@slopit/core@0.1.0",
      "@slopit/behavioral": "https://esm.sh/@slopit/behavioral@0.1.0",
      "zod": "https://esm.sh/zod@3.24.1"
    }
  }
  </script>
</head>
<body>
  <h1>Behavioral Capture Demo</h1>
  <p>
    This demo shows slopit capturing keystroke dynamics, focus events, and paste detection.
    Type a response below and submit to see the captured data.
  </p>

  <div class="task">
    <div class="prompt">
      <strong>Writing Task:</strong> Describe your typical morning routine in detail.
    </div>

    <textarea
      id="response"
      rows="6"
      placeholder="Start typing here..."
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    ></textarea>

    <div class="controls">
      <span class="char-count">
        <span id="char-count">0</span> characters
      </span>
      <button id="submit-btn">Submit Response</button>
    </div>
  </div>

  <div id="results" class="results hidden">
    <h2>Captured Data</h2>

    <div id="flags-container"></div>

    <h3>Metrics</h3>
    <div class="metrics" id="metrics-grid"></div>

    <h3>Raw Data</h3>
    <pre class="raw-data" id="raw-data"></pre>

    <button id="reset-btn" style="margin-top: 20px;">Try Again</button>
  </div>

  <script type="module">
    import { createBehavioralCapture } from "@slopit/behavioral";
    import { generateSessionId } from "@slopit/core";

    // Elements
    const textarea = document.getElementById("response");
    const charCount = document.getElementById("char-count");
    const submitBtn = document.getElementById("submit-btn");
    const resetBtn = document.getElementById("reset-btn");
    const results = document.getElementById("results");
    const metricsGrid = document.getElementById("metrics-grid");
    const flagsContainer = document.getElementById("flags-container");
    const rawData = document.getElementById("raw-data");
    const task = document.querySelector(".task");

    // Create capture instance
    const capture = createBehavioralCapture({
      keystroke: {
        enabled: true,
        captureKeyUp: true,
        includeModifiers: true,
      },
      focus: {
        enabled: true,
        useVisibilityAPI: true,
        useBlurFocus: true,
      },
      paste: {
        enabled: true,
        prevent: false,
        capturePreview: true,
        previewLength: 100,
      },
    });

    // Track start time
    const trialStartTime = performance.now();

    // Attach capture to textarea
    capture.attach(textarea, trialStartTime);

    // Update character count
    textarea.addEventListener("input", () => {
      charCount.textContent = textarea.value.length;
    });

    // Handle submit
    submitBtn.addEventListener("click", () => {
      if (textarea.value.trim().length === 0) {
        alert("Please enter a response.");
        return;
      }

      const endTime = performance.now();
      const data = capture.getData();
      const flags = capture.getFlags();

      // Detach capture
      capture.detach();

      // Display results
      displayResults(data, flags, endTime - trialStartTime, textarea.value);
    });

    // Handle reset
    resetBtn.addEventListener("click", () => {
      location.reload();
    });

    function displayResults(data, flags, responseTime, response) {
      // Hide task, show results
      task.classList.add("hidden");
      results.classList.remove("hidden");

      // Display flags
      if (flags.length > 0) {
        flagsContainer.innerHTML = "<h3>Flags</h3>" + flags.map(flag => `
          <div class="flag ${flag.severity}">
            <strong>${flag.type}</strong>: ${flag.message}
          </div>
        `).join("");
      }

      // Display metrics
      const metrics = data.metrics || {};
      const keystroke = metrics.keystroke || {};
      const focus = metrics.focus || {};
      const timing = metrics.timing || {};

      metricsGrid.innerHTML = `
        <div class="metric-card">
          <h4>Response Time</h4>
          <div class="value">${(responseTime / 1000).toFixed(1)}s</div>
        </div>
        <div class="metric-card">
          <h4>Total Keystrokes</h4>
          <div class="value">${keystroke.totalKeystrokes || 0}</div>
        </div>
        <div class="metric-card">
          <h4>Deletions</h4>
          <div class="value">${keystroke.deletions || 0}</div>
        </div>
        <div class="metric-card">
          <h4>Mean IKI</h4>
          <div class="value">${(keystroke.meanIKI || 0).toFixed(0)}ms</div>
        </div>
        <div class="metric-card">
          <h4>IKI Std Dev</h4>
          <div class="value">${(keystroke.stdIKI || 0).toFixed(0)}ms</div>
        </div>
        <div class="metric-card">
          <h4>Pauses (>2s)</h4>
          <div class="value">${keystroke.pauseCount || 0}</div>
        </div>
        <div class="metric-card">
          <h4>Characters/Min</h4>
          <div class="value">${(timing.charactersPerMinute || 0).toFixed(0)}</div>
        </div>
        <div class="metric-card">
          <h4>Blur Events</h4>
          <div class="value">${focus.blurCount || 0}</div>
        </div>
        <div class="metric-card">
          <h4>Paste Events</h4>
          <div class="value">${(data.paste || []).length}</div>
        </div>
      `;

      // Display raw data
      const exportData = {
        sessionId: generateSessionId(),
        response: response,
        responseTime: responseTime,
        characterCount: response.length,
        wordCount: response.trim().split(/\s+/).filter(w => w.length > 0).length,
        behavioral: data,
        flags: flags,
      };

      rawData.textContent = JSON.stringify(exportData, null, 2);
    }
  </script>
</body>
</html>
```

## How It Works

### 1. Import Map

The import map allows using ESM imports directly in the browser.

```html
<script type="importmap">
{
  "imports": {
    "@slopit/core": "https://esm.sh/@slopit/core@0.1.0",
    "@slopit/behavioral": "https://esm.sh/@slopit/behavioral@0.1.0"
  }
}
</script>
```

### 2. Create Capture Instance

Configure what to capture.

```javascript
const capture = createBehavioralCapture({
  keystroke: { enabled: true },
  focus: { enabled: true },
  paste: { enabled: true, prevent: false },
});
```

### 3. Attach to Element

Start capturing when the page loads.

```javascript
const trialStartTime = performance.now();
capture.attach(textarea, trialStartTime);
```

### 4. Retrieve Data on Submit

Get all captured data and computed metrics.

```javascript
const data = capture.getData();
const flags = capture.getFlags();
capture.detach();
```

## Key Observations

Try the demo and observe:

1. **Keystroke timing**: The mean IKI (Inter-Keystroke Interval) shows average time between keypresses
2. **Deletions**: Count of Backspace and Delete keys
3. **Pauses**: Number of gaps longer than 2 seconds
4. **Focus events**: Detected when you switch tabs or windows
5. **Paste events**: Recorded when you paste text (try pasting to see)

## Running Locally

Save the HTML to a file and serve it with any HTTP server.

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Open `http://localhost:8000` in your browser.

## Notes

- The import map requires a modern browser (Chrome 89+, Edge 89+, Firefox 108+, Safari 16.4+)
- For production use, bundle dependencies instead of using CDN imports
- The example disables autocorrect and spellcheck to get cleaner keystroke data
