/* NEXUS-89 interactions — vanilla JS, no dependencies */
(function () {
  "use strict";

  var cfg = window.NEXUS_CONFIG || { projects: {} };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function safeUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      var u = new URL(value.trim());
      return u.protocol === "https:" ? u.href : null;
    } catch (e) { return null; }
  }

  function validEmail(value) {
    return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  /* ---------- Year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Project links ---------- */
  $all(".link-off[data-project]").forEach(function (el) {
    var proj = cfg.projects && cfg.projects[el.dataset.project];
    var url = proj ? safeUrl(proj[el.dataset.kind]) : null;
    if (!url) return;
    var a = document.createElement("a");
    a.className = "link-on";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = (el.dataset.kind === "repo" ? "REPOSITORY" : "LIVE DEMO") + " ↗";
    a.setAttribute("aria-label", (el.dataset.kind === "repo" ? "Repository" : "Live demo") + " for " + el.dataset.project + " (opens in a new tab)");
    el.replaceWith(a);
  });

  /* ---------- Contact console ---------- */
  var status = $("#txStatus");
  function setStatus(msg, isErr) {
    if (!status) return;
    status.textContent = "> " + msg;
    status.classList.toggle("is-err", !!isErr);
  }

  function linkInto(slot, url, label) {
    if (!slot) return;
    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = label;
    slot.textContent = "";
    slot.classList.remove("t-muted");
    slot.appendChild(a);
  }

  var email = validEmail(cfg.email) ? cfg.email.trim() : null;
  var copyBtn = $("#copyEmail");
  if (email) {
    var slot = $("#emailSlot");
    var a = document.createElement("a");
    a.href = "mailto:" + email;
    a.textContent = email;
    slot.textContent = "";
    slot.classList.remove("t-muted");
    slot.appendChild(a);

    if (copyBtn) {
      copyBtn.hidden = false;
      copyBtn.addEventListener("click", function () {
        function ok() { setStatus("[OK] email copied to clipboard"); }
        function fail() { setStatus("[ERR] copy failed. Select the address above and copy it manually.", true); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(ok, fail);
        } else {
          fail();
        }
      });
    }
  }

  var gh = safeUrl(cfg.github);
  var li = safeUrl(cfg.linkedin);
  if (gh) linkInto($("#githubSlot"), gh, gh.replace(/^https:\/\//, ""));
  if (li) linkInto($("#linkedinSlot"), li, li.replace(/^https:\/\//, ""));

  var footerSocial = $("#footerSocial");
  if (footerSocial) {
    [["GitHub", gh], ["LinkedIn", li]].forEach(function (pair) {
      if (!pair[1]) return;
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = pair[1];
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = pair[0];
      item.appendChild(link);
      footerSocial.appendChild(item);
    });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = $("#navToggle");
  var nav = $("#siteNav");
  var mq = window.matchMedia("(max-width: 859px)");

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".nav-toggle__label").textContent = open ? "CLOSE" : "MENU";
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    mq.addEventListener("change", function () { setMenu(false); });
  }

  /* ---------- Active nav (scroll-spy) ---------- */
  var navLinks = $all("[data-nav]");
  var sectionIds = navLinks.map(function (l) { return l.dataset.nav; });
  var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);

  function markActive(id) {
    navLinks.forEach(function (l) {
      if (l.dataset.nav === id) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) markActive(en.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { io.observe(s); });
  }
  markActive("home");

  /* ---------- Boot sequence (optional, short, skippable) ---------- */
  var boot = $("#boot");
  var app = $("#app");
  var seen = false;
  try { seen = sessionStorage.getItem("nexus89-boot") === "1"; } catch (e) { /* storage unavailable */ }

  if (boot && app && !reduceMotion && !seen) {
    var lines = [
      "[ NEXUS-89 SYSTEM INITIALIZATION ]",
      "[ LOADING INTERFACE MODULES ... OK ]",
      "[ VERIFYING PORTFOLIO DATA ... OK ]",
      "[ ESTABLISHING CREATIVE CONNECTION ... OK ]",
      "[ SYSTEM READY ]"
    ];
    var list = $("#bootLines");
    var skip = $("#bootSkip");
    var timers = [];
    var closed = false;

    function closeBoot() {
      if (closed) return;
      closed = true;
      timers.forEach(clearTimeout);
      boot.hidden = true;
      app.removeAttribute("inert");
      try { sessionStorage.setItem("nexus89-boot", "1"); } catch (e) { /* ignore */ }
      var h1 = $("#hero-title");
      if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
    }

    boot.hidden = false;
    app.setAttribute("inert", "");
    skip.focus();
    skip.addEventListener("click", closeBoot);
    boot.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBoot(); });

    lines.forEach(function (text, i) {
      timers.push(setTimeout(function () {
        var li = document.createElement("li");
        li.textContent = text;
        list.appendChild(li);
      }, 150 + i * 240));
    });
    timers.push(setTimeout(closeBoot, 150 + lines.length * 240 + 500));
  }
})();
