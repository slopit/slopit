/**
 * Web Component wrapper for the Slopit Dashboard.
 *
 * Allows embedding the dashboard as a custom HTML element:
 *
 * ```html
 * <slopit-dashboard
 *   api-url="http://localhost:8000/api/v1"
 *   study-id="abc123"
 *   theme="dark">
 * </slopit-dashboard>
 * ```
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Dashboard } from "./components/Dashboard.js";
import type { DashboardConfig } from "./types/index.js";
import "./styles/index.css";

/**
 * Custom element that renders the Slopit Dashboard React component.
 */
class SlopitDashboardElement extends HTMLElement {
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;

  static get observedAttributes(): string[] {
    return ["api-url", "study-id", "theme", "polling-interval", "enable-websocket"];
  }

  connectedCallback(): void {
    // Create shadow DOM for style isolation
    const shadow = this.attachShadow({ mode: "open" });

    // Create container
    this.container = document.createElement("div");
    this.container.className = "slopit-dashboard-root";
    shadow.appendChild(this.container);

    // Inject styles into shadow DOM
    const style = document.createElement("style");
    style.textContent = this.getStyles();
    shadow.appendChild(style);

    // Create React root and render
    this.root = createRoot(this.container);
    this.render();
  }

  disconnectedCallback(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  attributeChangedCallback(): void {
    this.render();
  }

  private getConfig(): DashboardConfig {
    const apiUrl = this.getAttribute("api-url") ?? "http://localhost:8000/api/v1";
    const studyId = this.getAttribute("study-id") ?? undefined;
    const theme = (this.getAttribute("theme") as DashboardConfig["theme"]) ?? "system";
    const pollingInterval = this.getAttribute("polling-interval");
    const enableWebSocket = this.getAttribute("enable-websocket");

    return {
      apiUrl,
      studyId,
      theme,
      pollingInterval: pollingInterval ? Number.parseInt(pollingInterval, 10) : undefined,
      enableWebSocket: enableWebSocket !== "false",
    };
  }

  private render(): void {
    if (!this.root) return;

    const config = this.getConfig();
    this.root.render(createElement(Dashboard, { config }));
  }

  private getStyles(): string {
    // Return CSS for shadow DOM
    // This is a simplified version; in production, import the actual CSS
    return `
      :host {
        display: block;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      }

      .slopit-dashboard-root {
        --slopit-bg: #ffffff;
        --slopit-bg-secondary: #f8f9fa;
        --slopit-bg-tertiary: #e9ecef;
        --slopit-text: #212529;
        --slopit-text-secondary: #6c757d;
        --slopit-border: #dee2e6;
        --slopit-clean: #28a745;
        --slopit-clean-bg: #d4edda;
        --slopit-suspicious: #ffc107;
        --slopit-suspicious-bg: #fff3cd;
        --slopit-flagged: #dc3545;
        --slopit-flagged-bg: #f8d7da;
        --slopit-primary: #0d6efd;
        --slopit-primary-hover: #0b5ed7;
        --slopit-space-xs: 0.25rem;
        --slopit-space-sm: 0.5rem;
        --slopit-space-md: 1rem;
        --slopit-space-lg: 1.5rem;
        --slopit-radius-sm: 0.25rem;
        --slopit-radius-md: 0.375rem;

        color: var(--slopit-text);
        background: var(--slopit-bg);
      }

      :host([theme="dark"]) .slopit-dashboard-root,
      .slopit-dashboard-root[data-theme="dark"] {
        --slopit-bg: #1a1a1a;
        --slopit-bg-secondary: #2d2d2d;
        --slopit-bg-tertiary: #404040;
        --slopit-text: #f8f9fa;
        --slopit-text-secondary: #adb5bd;
        --slopit-border: #495057;
        --slopit-clean-bg: #1e4620;
        --slopit-suspicious-bg: #4d3800;
        --slopit-flagged-bg: #4d1a1f;
      }

      .slopit-dashboard {
        min-height: 400px;
        padding: var(--slopit-space-md);
      }

      .slopit-dashboard-header {
        display: flex;
        align-items: center;
        gap: var(--slopit-space-md);
        padding-bottom: var(--slopit-space-md);
        border-bottom: 1px solid var(--slopit-border);
        margin-bottom: var(--slopit-space-md);
      }

      .slopit-dashboard-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
      }

      .slopit-dashboard-nav {
        display: flex;
        gap: var(--slopit-space-sm);
        margin-bottom: var(--slopit-space-md);
      }

      .slopit-nav-item {
        padding: var(--slopit-space-sm) var(--slopit-space-md);
        background: transparent;
        border: 1px solid var(--slopit-border);
        border-radius: var(--slopit-radius-md);
        cursor: pointer;
        color: var(--slopit-text);
      }

      .slopit-nav-item--active {
        background: var(--slopit-primary);
        border-color: var(--slopit-primary);
        color: white;
      }

      .slopit-verdict-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--slopit-space-xs);
        padding: var(--slopit-space-xs) var(--slopit-space-sm);
        border-radius: var(--slopit-radius-sm);
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: capitalize;
      }

      .slopit-verdict-badge--clean {
        background: var(--slopit-clean-bg);
        color: var(--slopit-clean);
      }

      .slopit-verdict-badge--suspicious {
        background: var(--slopit-suspicious-bg);
        color: var(--slopit-suspicious);
      }

      .slopit-verdict-badge--flagged {
        background: var(--slopit-flagged-bg);
        color: var(--slopit-flagged);
      }

      .slopit-session-table {
        width: 100%;
        border-collapse: collapse;
      }

      .slopit-session-table th,
      .slopit-session-table td {
        padding: var(--slopit-space-sm) var(--slopit-space-md);
        text-align: left;
        border-bottom: 1px solid var(--slopit-border);
      }

      .slopit-session-table th {
        background: var(--slopit-bg-secondary);
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--slopit-text-secondary);
        text-transform: uppercase;
      }

      .slopit-session-table tr:hover {
        background: var(--slopit-bg-secondary);
        cursor: pointer;
      }

      .slopit-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: var(--slopit-text-secondary);
      }

      .slopit-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--slopit-border);
        border-top-color: var(--slopit-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .slopit-button {
        display: inline-flex;
        align-items: center;
        padding: var(--slopit-space-sm) var(--slopit-space-md);
        background: var(--slopit-primary);
        color: white;
        border: none;
        border-radius: var(--slopit-radius-md);
        cursor: pointer;
      }

      .slopit-button:hover {
        background: var(--slopit-primary-hover);
      }

      .slopit-button--secondary {
        background: var(--slopit-bg-secondary);
        color: var(--slopit-text);
        border: 1px solid var(--slopit-border);
      }

      .slopit-connection-status {
        display: inline-flex;
        align-items: center;
        gap: var(--slopit-space-xs);
        font-size: 0.875rem;
        margin-left: auto;
      }

      .slopit-connection-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .slopit-connection-indicator--connected { background: var(--slopit-clean); }
      .slopit-connection-indicator--disconnected { background: var(--slopit-text-secondary); }
      .slopit-connection-indicator--error { background: var(--slopit-flagged); }
      .slopit-connection-indicator--connecting { background: var(--slopit-suspicious); }

      .slopit-card {
        background: var(--slopit-bg);
        border: 1px solid var(--slopit-border);
        border-radius: 0.5rem;
        margin-bottom: var(--slopit-space-md);
      }

      .slopit-card-header {
        padding: var(--slopit-space-md);
        border-bottom: 1px solid var(--slopit-border);
        font-weight: 600;
      }

      .slopit-card-body {
        padding: var(--slopit-space-md);
      }

      .slopit-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--slopit-space-sm);
        padding: var(--slopit-space-md);
      }

      .slopit-filters {
        padding: var(--slopit-space-md);
        background: var(--slopit-bg-secondary);
        border-radius: var(--slopit-radius-md);
        margin-bottom: var(--slopit-space-md);
      }

      .slopit-filters select {
        padding: var(--slopit-space-xs) var(--slopit-space-sm);
        border: 1px solid var(--slopit-border);
        border-radius: var(--slopit-radius-sm);
        background: var(--slopit-bg);
        color: var(--slopit-text);
        margin-left: var(--slopit-space-sm);
      }
    `;
  }
}

// Register the custom element
if (typeof customElements !== "undefined" && !customElements.get("slopit-dashboard")) {
  customElements.define("slopit-dashboard", SlopitDashboardElement);
}

export { SlopitDashboardElement };
