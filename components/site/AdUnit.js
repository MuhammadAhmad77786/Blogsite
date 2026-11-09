"use client";
import { useEffect, useRef, useState } from "react";

const scripts = {};
function loadScript(src, attrs = {}) {
  if (!scripts[src]) {
    scripts[src] = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
      s.onload = resolve;
      s.onerror = () => {
        delete scripts[src];
        reject(new Error("ad script failed"));
      };
      document.head.appendChild(s);
    });
  }
  return scripts[src];
}

/**
 * Reserves space immediately (no layout shift), then loads the network script only after the
 * page has finished loading AND the slot is near the viewport.
 */
export default function AdUnit({ network, placement, client, slot, ezoicId, cid, crid, size }) {
  const box = useRef(null);
  const ran = useRef(false);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    let io;
    const watch = () => {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          const start = () => setGo(true);
          if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 2500 });
          else setTimeout(start, 400);
        },
        { rootMargin: "300px 0px" }
      );
      io.observe(el);
    };
    if (document.readyState === "complete") watch();
    else window.addEventListener("load", watch, { once: true });
    return () => {
      window.removeEventListener("load", watch);
      if (io) io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!go || ran.current) return;
    ran.current = true;
    (async () => {
      try {
        if (network === "adsense") {
          await loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`, { crossorigin: "anonymous" });
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } else if (network === "ezoic") {
          window.ezstandalone = window.ezstandalone || {};
          window.ezstandalone.cmd = window.ezstandalone.cmd || [];
          await loadScript("https://www.ezojs.com/ezoic/sa.min.js");
          window.ezstandalone.cmd.push(() => window.ezstandalone.showAds(Number(ezoicId)));
        } else if (network === "medianet") {
          window._mNHandle = window._mNHandle || {};
          window._mNHandle.queue = window._mNHandle.queue || [];
          await loadScript(`https://contextual.media.net/dmedianet.js?cid=${encodeURIComponent(cid)}`);
          window._mNHandle.queue.push(() => window._mNDetails.loadTag(crid, size, crid));
        }
      } catch {
        // ad blocked or network down: leave the reserved box empty
      }
    })();
  }, [go, network, client, ezoicId, cid, crid, size]);

  return (
    <aside ref={box} className={`bf-ad bf-ad-${placement}`} aria-label="Advertisement">
      <span className="bf-ad-label">Advertisement</span>
      {go && network === "adsense" && (
        <ins className="adsbygoogle" style={{ display: "block", width: "100%" }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
      )}
      {go && network === "ezoic" && <div id={`ezoic-pub-ad-placeholder-${ezoicId}`} />}
      {go && network === "medianet" && <div id={crid} />}
    </aside>
  );
}
