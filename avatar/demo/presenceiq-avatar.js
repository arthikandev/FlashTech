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
    onPresenceIQReady: () => onPresenceIQReady
  });

  // src/config.ts
  function getConfig() {
    const c = window.__PRESENCEIQ_CONFIG__ ?? {};
    return {
      backendUrl: c.backendUrl ?? "http://localhost:3000",
      bpWebhookSecret: c.bpWebhookSecret ?? "",
      beyondPresenceApiKey: c.beyondPresenceApiKey,
      bpAgentId: c.bpAgentId,
      mockMode: c.mockMode ?? !c.beyondPresenceApiKey
    };
  }

  // src/pipeline.ts
  async function fetchPipeline(backendUrl, visitorId, businessId, waitForCrmMs = 500) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8e3);
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
    return [
      `You are a ${business.personaTone} assistant for ${business.name} (${business.industry}).`,
      `Visitor: ${visitor.name ?? "guest"} (language: ${visitor.language}).`,
      `Intent score: ${intelligence.intentScore}/100.`,
      `Recommended action: ${intelligence.recommendedAction}.`,
      signals,
      `Open with exactly: "${intelligence.personalisedOpener}"`
    ].filter(Boolean).join("\n");
  }

  // src/beyondpresence/voices.ts
  var VOICE_BY_LANGUAGE = {
    en: "REPLACE_WITH_ELEVENLABS_EN_VOICE_ID",
    si: "REPLACE_WITH_ELEVENLABS_SI_VOICE_ID",
    ta: "REPLACE_WITH_ELEVENLABS_TA_VOICE_ID"
  };
  function voiceIdForLanguage(language, industry) {
    const lang = language.toLowerCase().slice(0, 2);
    const base = VOICE_BY_LANGUAGE[lang] ?? VOICE_BY_LANGUAGE.en;
    if (industry === "bank" && lang === "en") {
      return base;
    }
    return base;
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
      window.addEventListener("presenceiq:mock-session-end", () => {
        void this.flushSession();
      });
    }
    async flushSession() {
      if (!this.sessionHandler || !this.opts.bpWebhookSecret) return;
      try {
        const payload = this.sessionHandler();
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
      const bp = getBpGlobal();
      if (bp?.onSessionEnd) {
        bp.onSessionEnd(() => void this.flushSession());
      }
    }
    async flushSession() {
      if (!this.sessionHandler) return;
      const payload = this.sessionHandler();
      await postSessionWebhook(
        this.opts.backendUrl,
        this.opts.bpWebhookSecret,
        payload
      );
    }
  };
  function applyPipelineToAgent(client2, data) {
    const voiceId = voiceIdForLanguage(data.visitor.language, data.business.industry);
    const systemPrompt = [
      `You are a ${data.business.personaTone} assistant for ${data.business.name}.`,
      `Visitor: ${data.visitor.name ?? "guest"} (${data.visitor.language}).`,
      `Intent: ${data.intelligence.intentScore}/100. Action: ${data.intelligence.recommendedAction}.`,
      `Open with exactly: "${data.intelligence.personalisedOpener}"`
    ].join("\n");
    return client2.updateAgentContext({
      systemPrompt,
      firstMessage: data.intelligence.personalisedOpener,
      voiceId
    });
  }
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

  // src/index.ts
  var CONTAINER_ID = "presenceiq-avatar";
  var lastPipeline = null;
  var lastVisitorId = null;
  var lastBusinessId = null;
  var client = null;
  function setAvatarLoading(loading) {
    const el = document.getElementById(CONTAINER_ID);
    if (!el) return;
    el.style.visibility = "hidden";
    el.setAttribute("data-piq-loading", loading ? "true" : "false");
    if (loading) {
      el.setAttribute("aria-busy", "true");
    } else {
      el.removeAttribute("aria-busy");
    }
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
        CONTAINER_ID
      );
      await client.init();
      client.hideAvatar();
      client.onSessionEnd(() => {
        const transcript = [
          {
            role: "user",
            text: "Demo session ended",
            timestamp: Date.now()
          },
          {
            role: "assistant",
            text: lastPipeline?.intelligence.personalisedOpener ?? "Goodbye",
            timestamp: Date.now()
          }
        ];
        return defaultSessionPayload(visitorId, businessId, transcript);
      });
    }
    setAvatarLoading(true);
    try {
      const data = await fetchPipeline(config.backendUrl, visitorId, businessId);
      lastPipeline = data;
      console.log("[PresenceIQ] pipeline", {
        pipelineMs: data.pipelineMs,
        opener: data.intelligence.personalisedOpener,
        systemPrompt: buildSystemPrompt(data)
      });
      await applyPipelineToAgent(client, data);
      client.showAvatar();
    } catch (err) {
      console.error("[PresenceIQ] pipeline error", err);
      await client.updateAgentContext({
        systemPrompt: "You are a helpful banking assistant for Seylan Bank.",
        firstMessage: "Hello! How can I help you today?"
      });
      client.showAvatar();
    } finally {
      setAvatarLoading(false);
    }
  }
  function bootstrap() {
    window.addEventListener("presenceiq:ready", (e) => {
      void onPresenceIQReady(e);
    });
    console.log("[PresenceIQ] Avatar integration loaded", getConfig());
  }
  bootstrap();
  return __toCommonJS(index_exports);
})();
