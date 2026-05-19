(function () {
  const GA4_MEASUREMENT_ID = "G-8W2TGXWMLH";
  const POSTHOG_API_KEY = "phc_t8PB4EKdyMRVVuuAYG9i3sAVYwL4osjusYrowjV9GPUF";
  const POSTHOG_HOST = "https://us.i.posthog.com";
  const storageKey = "hm_events_v1";
  const visitorKey = "hm_visitor_id";
  const sessionKey = "hm_session_id";
  const memoryStore = {};

  function storageGet(store, key) {
    try {
      return store.getItem(key);
    } catch (error) {
      return memoryStore[key] || null;
    }
  }

  function storageSet(store, key, value) {
    try {
      store.setItem(key, value);
    } catch (error) {
      memoryStore[key] = String(value);
    }
  }

  function id(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function getOrCreate(key, prefix) {
    let value = storageGet(localStorage, key);
    if (!value) {
      value = id(prefix);
      storageSet(localStorage, key, value);
    }
    return value;
  }

  const visitorId = getOrCreate(visitorKey, "visitor");
  const sessionId = storageGet(sessionStorage, sessionKey) || id("session");
  storageSet(sessionStorage, sessionKey, sessionId);

  function loadScript(src, id) {
    if (id && document.getElementById(id)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    if (id) script.id = id;
    const first = document.getElementsByTagName("script")[0];
    first.parentNode.insertBefore(script, first);
  }

  window.dataLayer = window.dataLayer || [];

  if (GA4_MEASUREMENT_ID && !window.hmGa4Ready) {
    window.hmGa4Ready = true;
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_MEASUREMENT_ID), "hm-ga4-tag");
    window.gtag("js", new Date());
    window.gtag("config", GA4_MEASUREMENT_ID);
  }

  if (POSTHOG_API_KEY && !window.hmPostHogReady) {
    window.hmPostHogReady = true;
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify register register_once reset get_distinct_id get_session_id startSessionRecording stopSessionRecording".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      defaults: "2026-01-30",
      person_profiles: "identified_only"
    });
  }

  function readEvents() {
    try {
      return JSON.parse(storageGet(localStorage, storageKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function writeEvent(event) {
    const events = readEvents();
    events.push(event);
    storageSet(localStorage, storageKey, JSON.stringify(events.slice(-100)));
  }

  function flattenForGa(payload) {
    const clean = {};
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (key === "email") return;
      if (value === undefined || value === null) {
        clean[key] = "";
      } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        clean[key] = value;
      } else {
        clean[key] = JSON.stringify(value);
      }
    });
    return clean;
  }

  function track(name, payload) {
    const analyticsPayload = {
      visitor_id: visitorId,
      session_id: sessionId,
      path: window.location.pathname,
      title: document.title,
      ...(payload || {})
    };
    const event = {
      event: name,
      visitor_id: visitorId,
      session_id: sessionId,
      path: window.location.pathname,
      title: document.title,
      timestamp: new Date().toISOString(),
      payload: payload || {}
    };
    window.dataLayer.push(event);
    writeEvent(event);
    if (typeof window.gtag === "function") {
      window.gtag("event", name, flattenForGa(analyticsPayload));
    }
    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(name, analyticsPayload);
    }
    if (window.HUGOMOJO_DEBUG === true) console.log("[HugoMojo]", event);
  }

  window.HugoMojoTrack = {
    track,
    visitorId,
    sessionId,
    events: readEvents
  };

  document.addEventListener("DOMContentLoaded", function () {
    track("page_view");
    document.addEventListener("click", function (event) {
      const el = event.target.closest("[data-event]");
      if (!el) return;
      track(el.getAttribute("data-event"), {
        plan: el.getAttribute("data-plan") || null,
        price: el.getAttribute("data-price") || null,
        href: el.getAttribute("href") || null
      });
    });
  });
})();
