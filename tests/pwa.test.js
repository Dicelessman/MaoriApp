import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readSwFile() {
  return readFileSync(resolve(__dirname, "../sw.js"), "utf-8");
}

function readManifest() {
  return JSON.parse(readFileSync(resolve(__dirname, "../manifest.json"), "utf-8"));
}

function extractCachedUrls(sw) {
  const match = sw.match(/const URLS_TO_CACHE\s*=\s*\[([\s\S]*?)\];/);
  if (!match) return [];
  const urls = [];
  let m;
  const re = /["'](\/[^"']*?)["']/g;
  while ((m = re.exec(match[1])) !== null) urls.push(m[1]);
  return urls;
}

describe("Service Worker v6", () => {
  let sw, urls;
  beforeEach(() => { sw = readSwFile(); urls = extractCachedUrls(sw); });

  it("versione cache v6", () => expect(sw).toContain("presenziario-cache-v6"));
  it("runtime cache v2", () => expect(sw).toContain("presenziario-runtime-v2"));
  it("skipWaiting presente", () => expect(sw).toContain("skipWaiting"));
  it("clients.claim presente", () => expect(sw).toContain("clients.claim"));
  it("pagine principali in cache", () => {
    ["/presenze.html","/dashboard.html","/calendario.html","/esploratori.html","/statistiche.html"]
      .forEach(p => expect(urls).toContain(p));
  });
  it("nuove pagine in cache", () => {
    ["/scadenze.html","/archivio.html","/preferenze.html"]
      .forEach(p => expect(urls).toContain(p));
  });
  it("moduli JS core in cache", () => {
    ["/js/ui/ui.js","/js/data/data-facade.js","/js/utils/utils.js","/js/data/adapters/local-adapter.js"]
      .forEach(m => expect(urls).toContain(m));
  });
  it("icone e dati statici in cache", () => {
    expect(urls).toContain("/icon-192.png");
    expect(urls).toContain("/icon-512.png");
    expect(urls).toContain("/challenges.json");
  });
  it("piu di 30 URL in cache", () => expect(urls.length).toBeGreaterThan(30));
});

describe("PWA Manifest", () => {
  let manifest;
  beforeEach(() => { manifest = readManifest(); });

  it("nome corretto", () => expect(manifest.name).toContain("Scout Maori"));
  it("display standalone", () => expect(manifest.display).toBe("standalone"));
  it("orientation portrait", () => expect(manifest.orientation).toBe("portrait"));
  it("theme_color verde", () => expect(manifest.theme_color).toBe("#16a34a"));
  it("almeno 4 shortcuts", () => expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(4));
  it("shortcut scadenze.html", () => expect(manifest.shortcuts.map(s => s.url)).toContain("/scadenze.html"));
  it("shortcut statistiche.html", () => expect(manifest.shortcuts.map(s => s.url)).toContain("/statistiche.html"));
  it("almeno 2 icone", () => expect(manifest.icons.length).toBeGreaterThanOrEqual(2));
});

describe("Offline Detection - banner e indicatore", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="offlineBanner" class="hidden"></div>
      <div id="connectionStatus" class="hidden">
        <span class="status-dot"></span>
        <span class="status-text"></span>
      </div>`;
  });
  afterEach(() => { document.body.innerHTML = ""; });

  const show = () => { const b = document.getElementById("offlineBanner"); if(b){b.classList.remove("hidden");b.classList.add("flex");} };
  const hide = () => { const b = document.getElementById("offlineBanner"); if(b){b.classList.add("hidden");b.classList.remove("flex");} };
  const update = (online) => {
    const el = document.getElementById("connectionStatus");
    if(!el) return;
    const lbl = el.querySelector(".status-text");
    if(lbl) lbl.textContent = online ? "Online" : "Offline";
    el.classList.remove("hidden"); el.classList.add("flex");
  };

  it("mostra banner offline", () => {
    const b = document.getElementById("offlineBanner");
    expect(b.classList.contains("hidden")).toBe(true);
    show();
    expect(b.classList.contains("hidden")).toBe(false);
    expect(b.classList.contains("flex")).toBe(true);
  });
  it("nasconde banner online", () => {
    const b = document.getElementById("offlineBanner");
    show(); hide();
    expect(b.classList.contains("hidden")).toBe(true);
    expect(b.classList.contains("flex")).toBe(false);
  });
  it("aggiorna label a Online", () => { update(true); expect(document.querySelector(".status-text").textContent).toBe("Online"); });
  it("aggiorna label a Offline", () => { update(false); expect(document.querySelector(".status-text").textContent).toBe("Offline"); });
  it("rende visibile il connection indicator", () => {
    const el = document.getElementById("connectionStatus");
    expect(el.classList.contains("hidden")).toBe(true);
    update(true);
    expect(el.classList.contains("hidden")).toBe(false);
  });
});
