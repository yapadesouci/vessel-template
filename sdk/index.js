// src/errors.ts
var VesselPermissionDenied = class extends Error {
  constructor(api) {
    super(`VesselPermissionDenied: Permission denied: '${api}' is not declared in this system's manifest`);
    this.name = "VesselPermissionDenied";
  }
};
var VesselHandshakeTimeout = class extends Error {
  constructor() {
    super("Vessel handshake timed out after 5 seconds");
    this.name = "VesselHandshakeTimeout";
  }
};
var VesselHandshakeError = class extends Error {
  constructor(detail) {
    super(`Vessel handshake failed: ${detail}`);
    this.name = "VesselHandshakeError";
  }
};
var VesselStorageQuotaExceeded = class extends Error {
  constructor() {
    super("Storage quota exceeded: max 10MB per system");
    this.name = "VesselStorageQuotaExceeded";
  }
};

// src/bridge.ts
function parseApiError(errorString) {
  if (errorString.startsWith("VesselPermissionDenied")) return new VesselPermissionDenied(errorString.split(":")[1] ?? "");
  if (errorString.startsWith("VesselStorageQuotaExceeded")) return new VesselStorageQuotaExceeded();
  return new Error(errorString);
}
function createBridge() {
  const pending = /* @__PURE__ */ new Map();
  let handshakeResolve = null;
  let handshakeReject = null;
  let handshakeTimeoutId = null;
  function handleMessage(event) {
    const data = event.data;
    if (!data || data.vessel !== true) return;
    if (data.type === "handshake-ack") {
      if (handshakeTimeoutId !== null) {
        clearTimeout(handshakeTimeoutId);
        handshakeTimeoutId = null;
      }
      if (data.error) {
        handshakeReject?.(new VesselHandshakeError(data.error));
      } else {
        handshakeResolve?.();
      }
      return;
    }
    if (data.type === "api-response") {
      const req = pending.get(data.id);
      if (!req) return;
      pending.delete(data.id);
      if (data.error) {
        req.reject(parseApiError(data.error));
      } else {
        req.resolve(data.result);
      }
    }
  }
  window.addEventListener("message", handleMessage);
  function ready2() {
    return new Promise((resolve, reject) => {
      handshakeResolve = resolve;
      handshakeReject = reject;
      window.parent.postMessage({ vessel: true, type: "handshake" }, "*");
      handshakeTimeoutId = setTimeout(() => {
        handshakeTimeoutId = null;
        reject(new VesselHandshakeTimeout());
      }, 5e3);
    });
  }
  function call(api, payload) {
    return new Promise((resolve, reject) => {
      const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16))).map(
        (b, i) => [4, 6, 8, 10].includes(i) ? `-${b.toString(16).padStart(2, "0")}` : b.toString(16).padStart(2, "0")
      ).join("");
      pending.set(id, { resolve, reject });
      window.parent.postMessage({ vessel: true, type: "api-call", id, api, payload }, "*");
    });
  }
  function destroy() {
    if (handshakeTimeoutId !== null) {
      clearTimeout(handshakeTimeoutId);
      handshakeTimeoutId = null;
    }
    window.removeEventListener("message", handleMessage);
    pending.clear();
  }
  return { ready: ready2, call, destroy };
}
var _bridge = createBridge();

// src/storage.ts
function createStorage(call) {
  return {
    get: (key) => call("storage.get", { key }),
    set: async (key, value) => {
      await call("storage.set", { key, value });
    }
  };
}
var storage = createStorage(_bridge.call.bind(_bridge));

// src/notifications.ts
function createNotifications(call) {
  return {
    send: async (payload) => {
      await call("notifications.send", payload);
    }
  };
}
var notifications = createNotifications(_bridge.call.bind(_bridge));

// src/clipboard.ts
function createClipboard(call) {
  return {
    write: async (text) => {
      await call("clipboard.write", { text });
    }
  };
}
var clipboard = createClipboard(_bridge.call.bind(_bridge));

// src/http.ts
function createHttp(call) {
  return {
    fetch: (url, options) => call("http.fetch", { url, ...options })
  };
}
var http = createHttp(_bridge.call.bind(_bridge));

// src/index.ts
var ready = () => _bridge.ready();
export {
  VesselHandshakeError,
  VesselHandshakeTimeout,
  VesselPermissionDenied,
  VesselStorageQuotaExceeded,
  _bridge,
  clipboard,
  createBridge,
  createClipboard,
  createHttp,
  createNotifications,
  createStorage,
  http,
  notifications,
  parseApiError,
  ready,
  storage
};
