(function () {
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

  window.dataLayer = window.dataLayer || [];

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

  function track(name, payload) {
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
