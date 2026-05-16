"use strict";
var PresenceIQAvatar = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    bootstrap: () => bootstrap,
    initPresenceIQAvatar: () => initPresenceIQAvatar,
    onPresenceIQReady: () => onPresenceIQReady
  });

  // src/config.ts
  function getConfig() {
    const c = window.__PRESENCEIQ_CONFIG__ ?? {};
    return {
      backendUrl: c.backendUrl ?? "http://localhost:3001",
      bpWebhookSecret: c.bpWebhookSecret ?? (typeof window !== "undefined" ? window.__piq_bp_webhook_secret : "") ?? "",
      beyondPresenceApiKey: c.beyondPresenceApiKey,
      bpAgentId: c.bpAgentId,
      waitForCrmMs: c.waitForCrmMs ?? 200,
      mockMode: c.mockMode ?? !c.beyondPresenceApiKey
    };
  }

  // src/pipeline.ts
  async function fetchPipeline(backendUrl, visitorId, businessId, waitForCrmMs = 200) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5e3);
    try {
      const res = await fetch(`${backendUrl}/api/pipeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, businessId, waitForCrmMs }),
        signal: controller.signal
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error ?? `Pipeline failed (${res.status})`);
      }
      if (json.data.pipelineMs > 1800) {
        console.warn(
          `[PresenceIQ] pipelineMs ${json.data.pipelineMs} exceeds 1800ms target`
        );
      }
      return json.data;
    } finally {
      clearTimeout(timeout);
    }
  }
  function buildSystemPrompt(data) {
    const { intelligence, visitor, business } = data;
    const signals = intelligence.signals?.length > 0 ? `Signals: ${intelligence.signals.join(", ")}.` : "";
    const tone = business.personaTone ?? "professional";
    return [
      `You are a ${tone} assistant for ${business.name} (${business.industry}).`,
      `Visitor: ${visitor.name ?? "guest"} (language: ${visitor.language}).`,
      `Intent score: ${intelligence.intentScore}/100.`,
      `Recommended action: ${intelligence.recommendedAction}.`,
      signals,
      `Open with exactly: "${intelligence.personalisedOpener}"`
    ].filter(Boolean).join("\n");
  }

  // src/webhook.ts
  async function postSessionWebhook(backendUrl, bpWebhookSecret, payload) {
    const res = await fetch(
      `${backendUrl}/api/webhooks/beyondpresence/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-BP-Webhook-Secret": bpWebhookSecret
        },
        body: JSON.stringify(payload)
      }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`BP session webhook failed (${res.status}): ${body}`);
    }
  }

  // src/beyondpresence/client.ts
  function getBpGlobal() {
    return window.beyondPresence;
  }
  var MockBeyondPresenceClient = class {
    constructor(opts, containerId) {
      this.opts = opts;
      this.sessionEndListenerAttached = false;
      this.containerId = containerId;
    }
    async init() {
      const el = document.getElementById(this.containerId);
      if (el) {
        el.innerHTML = '<div style="padding:12px;border:2px dashed #0ea5e9;border-radius:8px;font-family:sans-serif"><strong>PresenceIQ Avatar (mock)</strong><br/>Set BEYONDPRESENCE_API_KEY in demo/config.js for live agent.</div>';
      }
    }
    async updateAgentContext(update) {
      console.log("[PresenceIQ] mock updateAgentContext", update);
      const el = document.getElementById(this.containerId);
      if (el) {
        const preview = el.querySelector(".piq-opener") ?? document.createElement("p");
        preview.className = "piq-opener";
        preview.textContent = `Opener: ${update.firstMessage}`;
        if (!preview.parentElement) el.appendChild(preview);
      }
    }
    showAvatar() {
      const el = document.getElementById(this.containerId);
      if (el) el.style.visibility = "visible";
      console.log("[PresenceIQ] mock showAvatar");
    }
    hideAvatar() {
      const el = document.getElementById(this.containerId);
      if (el) el.style.visibility = "hidden";
    }
    onSessionEnd(handler) {
      this.sessionHandler = handler;
      if (this.sessionEndListenerAttached) return;
      this.sessionEndListenerAttached = true;
      window.addEventListener("presenceiq:mock-session-end", () => {
        void this.flushSession();
      });
    }
    getLastSession() {
      return this.lastSession;
    }
    async flushSession() {
      if (!this.sessionHandler || !this.opts.bpWebhookSecret) return;
      try {
        const payload = this.sessionHandler(this.lastSession);
        await postSessionWebhook(
          this.opts.backendUrl,
          this.opts.bpWebhookSecret,
          payload
        );
        console.log("[PresenceIQ] mock session posted to backend");
      } catch (err) {
        console.error("[PresenceIQ] post-call webhook failed", err);
      }
    }
  };
  var SdkBeyondPresenceClient = class {
    constructor(opts, containerId) {
      this.opts = opts;
      this.sessionEndListenerAttached = false;
      this.containerId = containerId;
    }
    async init() {
      const bp = getBpGlobal();
      if (!bp?.init) {
        throw new Error(
          "BeyondPresence SDK not loaded. Add BP script tag before presenceiq-avatar.js"
        );
      }
      await bp.init({
        apiKey: this.opts.apiKey,
        agentId: this.opts.agentId
      });
    }
    async updateAgentContext(update) {
      const bp = getBpGlobal();
      if (!bp?.updateAgentContext) {
        throw new Error("beyondPresence.updateAgentContext not available");
      }
      await bp.updateAgentContext(update);
    }
    showAvatar() {
      getBpGlobal()?.show?.();
      const el = document.getElementById(this.containerId);
      if (el) el.style.visibility = "visible";
    }
    hideAvatar() {
      getBpGlobal()?.hide?.();
      const el = document.getElementById(this.containerId);
      if (el) el.style.visibility = "hidden";
    }
    onSessionEnd(handler) {
      this.sessionHandler = handler;
      if (this.sessionEndListenerAttached) return;
      const bp = getBpGlobal();
      if (bp?.onSessionEnd) {
        this.sessionEndListenerAttached = true;
        bp.onSessionEnd((session) => {
          this.lastSession = session ?? {
            messages: bp.getMessages?.() ?? []
          };
          void this.flushSession();
        });
      }
    }
    getLastSession() {
      return this.lastSession;
    }
    async flushSession() {
      if (!this.sessionHandler) return;
      const payload = this.sessionHandler(this.lastSession);
      await postSessionWebhook(
        this.opts.backendUrl,
        this.opts.bpWebhookSecret,
        payload
      );
    }
  };
  function createBeyondPresenceClient(opts, containerId = "presenceiq-avatar") {
    if (opts.mockMode || !opts.apiKey || !opts.agentId) {
      return new MockBeyondPresenceClient(opts, containerId);
    }
    return new SdkBeyondPresenceClient(opts, containerId);
  }
  function defaultSessionPayload(visitorId, businessId, transcript) {
    return {
      visitorId,
      businessId,
      transcript,
      outcome: "informational",
      sentimentArc: [{ turn: 1, score: 0.75 }],
      actionItems: ["Follow up from demo session"],
      duration: 60
    };
  }

  // src/sessionTranscript.ts
  function mapBpMessagesToTranscript(session, fallbackOpener) {
    const raw = session?.messages ?? [];
    const turns = raw.map((m, i) => {
      const text = (m.text ?? m.content ?? "").trim();
      if (!text) return null;
      const role = m.role === "user" || m.role === "human" ? "user" : "assistant";
      return {
        role,
        text,
        timestamp: Date.now() - (raw.length - i) * 1e3
      };
    }).filter((t) => t != null);
    if (turns.length > 0) return turns;
    return [
      {
        role: "assistant",
        text: fallbackOpener,
        timestamp: Date.now() - 1e3
      },
      {
        role: "user",
        text: "Session ended",
        timestamp: Date.now()
      }
    ];
  }

  // src/beyondpresence/startWithRetry.ts
  var BP_INIT_TIMEOUT_MS = 5e3;
  var BP_MAX_ATTEMPTS = 2;
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  function rejectAfter(ms, message) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }
  async function warmAvatarWithRetry(client2, defaultContext) {
    for (let attempt = 1; attempt <= BP_MAX_ATTEMPTS; attempt++) {
      try {
        await Promise.race([
          client2.updateAgentContext(defaultContext),
          rejectAfter(BP_INIT_TIMEOUT_MS, "BP_TIMEOUT")
        ]);
        client2.showAvatar();
        return;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[PresenceIQ] BP warm attempt ${attempt} failed:`, message);
        if (attempt === BP_MAX_ATTEMPTS) {
          window.dispatchEvent(
            new CustomEvent("presenceiq:avatar-fallback", {
              detail: { reason: message }
            })
          );
          throw err;
        }
        await sleep(500);
      }
    }
  }

  // src/types.ts
  function resolveAvatarContainer(options) {
    return options.container ?? options.avatarContainer ?? null;
  }

  // src/index.ts
  var CONTAINER_ID = "presenceiq-avatar";
  var mountContainerId = CONTAINER_ID;
  var DEFAULT_OPENER = "Hello! How can I help you today?";
  var DEFAULT_SYSTEM = "You are a helpful assistant. Greet the visitor warmly and ask how you can help.";
  var bootstrapAttached = false;
  var lastPipeline = null;
  var lastVisitorId = null;
  var lastBusinessId = null;
  var client = null;
  function setAvatarLoading(loading) {
    const el = document.getElementById(mountContainerId);
    if (!el) return;
    el.setAttribute("data-piq-loading", loading ? "true" : "false");
    if (loading) {
      el.setAttribute("aria-busy", "true");
    } else {
      el.removeAttribute("aria-busy");
    }
  }
  function mark(name) {
    try {
      performance.mark(name);
    } catch {
    }
  }
  function measure(name, start, end) {
    try {
      performance.measure(name, start, end);
    } catch {
    }
  }
  function buildSessionEndPayload(session) {
    const visitorId = lastVisitorId;
    const businessId = lastBusinessId;
    if (!visitorId || !businessId) {
      throw new Error("[PresenceIQ] session end without active visitor/business context");
    }
    const opener = lastPipeline?.intelligence.personalisedOpener ?? DEFAULT_OPENER;
    const transcript = mapBpMessagesToTranscript(session, opener);
    const payload = defaultSessionPayload(visitorId, businessId, transcript);
    if (session?.duration != null && session.duration > 0) {
      payload.duration = session.duration;
    }
    if (session?.outcome) {
      payload.outcome = session.outcome;
    }
    return payload;
  }
  function attachSessionEndHandler(bpClient) {
    bpClient.onSessionEnd((session) => buildSessionEndPayload(session));
  }
  async function onPresenceIQReady(event) {
    const detail = event.detail;
    const visitorId = detail.visitorId;
    const businessId = detail.businessId;
    if (!visitorId || !businessId) {
      console.error("[PresenceIQ] presenceiq:ready missing visitorId or businessId");
      return;
    }
    lastVisitorId = visitorId;
    lastBusinessId = businessId;
    const config = getConfig();
    if (!client) {
      client = createBeyondPresenceClient(
        {
          apiKey: config.beyondPresenceApiKey,
          agentId: config.bpAgentId,
          backendUrl: config.backendUrl,
          bpWebhookSecret: config.bpWebhookSecret,
          mockMode: config.mockMode
        },
        mountContainerId
      );
      await client.init();
      client.hideAvatar();
      attachSessionEndHandler(client);
    }
    mark("piq:ready");
    setAvatarLoading(true);
    mark("piq:pipeline-start");
    window.dispatchEvent(new CustomEvent("presenceiq:pipeline-start"));
    const defaultContext = {
      systemPrompt: DEFAULT_SYSTEM,
      firstMessage: DEFAULT_OPENER
    };
    const pipelinePromise = fetchPipeline(
      config.backendUrl,
      visitorId,
      businessId,
      config.waitForCrmMs ?? 200
    );
    const avatarWarmPromise = warmAvatarWithRetry(client, defaultContext);
    const [pipelineSettled, avatarSettled] = await Promise.allSettled([
      pipelinePromise,
      avatarWarmPromise
    ]);
    let data = null;
    if (pipelineSettled.status === "fulfilled") {
      data = pipelineSettled.value;
      lastPipeline = data;
      mark("piq:pipeline-done");
      console.log("[PresenceIQ] pipeline", {
        pipelineMs: data.pipelineMs,
        opener: data.intelligence.personalisedOpener,
        systemPrompt: buildSystemPrompt(data)
      });
      const serverSynced = data.syncStatus === "complete" || data.beyondPresence?.synced === true;
      if (!serverSynced) {
        console.warn(
          "[PresenceIQ] Server BP sync not complete \u2014 avatar displays with warmed default context"
        );
      } else {
        console.log("[PresenceIQ] Server authoritative BP agent sync complete");
      }
      window.dispatchEvent(
        new CustomEvent("presenceiq:pipeline-complete", { detail: data })
      );
    } else {
      const reason = String(pipelineSettled.reason);
      console.error("[PresenceIQ] pipeline error", pipelineSettled.reason);
      try {
        await client.updateAgentContext(defaultContext);
      } catch {
      }
      window.dispatchEvent(
        new CustomEvent("presenceiq:pipeline-error", {
          detail: { error: reason }
        })
      );
      window.dispatchEvent(
        new CustomEvent("presenceiq:avatar-fallback", {
          detail: { reason }
        })
      );
    }
    if (avatarSettled.status === "rejected") {
      console.error("[PresenceIQ] avatar warm failed", avatarSettled.reason);
      window.dispatchEvent(
        new CustomEvent("presenceiq:avatar-fallback", {
          detail: { reason: String(avatarSettled.reason) }
        })
      );
    } else {
      mark("piq:avatar-visible");
      client.showAvatar();
    }
    measure("time-to-pipeline", "piq:pipeline-start", "piq:pipeline-done");
    measure("time-to-avatar", "piq:ready", "piq:avatar-visible");
    setAvatarLoading(false);
  }
  function bootstrap() {
    if (bootstrapAttached) return;
    bootstrapAttached = true;
    window.addEventListener("presenceiq:ready", (e) => {
      void onPresenceIQReady(e);
    });
    console.log("[PresenceIQ] Avatar integration loaded", getConfig());
  }
  function replayReadyIfMissed() {
    const last = window.__piq_last;
    if (last?.visitorId && last?.businessId) {
      void onPresenceIQReady(
        new CustomEvent("presenceiq:ready", {
          detail: {
            visitorId: last.visitorId,
            businessId: last.businessId,
            sessionId: last.sessionId
          }
        })
      );
    }
  }
  function initPresenceIQAvatar(options) {
    const el = resolveAvatarContainer(options);
    if (!el) {
      console.error(
        "[PresenceIQ] initPresenceIQAvatar requires container or avatarContainer"
      );
      return;
    }
    if (!el.id) el.id = CONTAINER_ID;
    mountContainerId = el.id;
    window.__PRESENCEIQ_CONFIG__ = {
      ...window.__PRESENCEIQ_CONFIG__,
      ...options.backendUrl ? { backendUrl: options.backendUrl.replace(/\/$/, "") } : {},
      ...options.webhookSecret ? { bpWebhookSecret: options.webhookSecret } : {},
      ...options.waitForCrmMs !== void 0 ? { waitForCrmMs: options.waitForCrmMs } : {}
    };
    bootstrap();
    replayReadyIfMissed();
  }
  bootstrap();
  if (typeof window !== "undefined") {
    window.PresenceIQAvatar = {
      init: initPresenceIQAvatar,
      initPresenceIQAvatar
    };
  }
  return __toCommonJS(index_exports);
})();
