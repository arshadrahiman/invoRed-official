/**
 * INVO-RED | Motion & Interaction Core
 * Core Engine (Canvas Field, 3D Perspective Card Deck, Dynamic Brief)
 */

(function () {
  "use strict";

  // Active Purge: Ensure any cached or stray referral badge or '9' mark is removed from DOM
  const purgeStrayBadges = () => {
    document.querySelectorAll('.brand-icon, .brand-logo-img, [class*="brand-icon"]').forEach(el => el.remove());
    document.querySelectorAll('.brand *').forEach(el => {
      if (el.tagName === 'I' || (el.textContent && el.textContent.trim() === '9')) {
        el.remove();
      }
    });
  };
  purgeStrayBadges();

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = window.matchMedia("(pointer: fine)").matches;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // Initialize all subsystems when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    purgeStrayBadges();
    initLoadedState();
    initAmbientCursor();
    initNav();
    initField();
    initWordProximity();
    initHeroStage();
    initCrafts();
    initCounters();
    initWorkShowcase();
    initBriefForm();
    initFaqAccordion();
    initScrollReveal();
    initBackToTop();
    initCareersPage();
  });

  /* --------------------------------------------------------------------------
     1. Loaded State Trigger
     -------------------------------------------------------------------------- */
  function initLoadedState() {
    window.addEventListener("load", () => {
      document.body.classList.add("is-loaded");
    });
    // Fallback if load already fired
    setTimeout(() => {
      document.body.classList.add("is-loaded");
    }, 120);
  }

  /* --------------------------------------------------------------------------
     2. Ambient Cursor Glow
     -------------------------------------------------------------------------- */
  function initAmbientCursor() {
    if (!FINE || REDUCED) return;
    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;

    window.addEventListener("pointermove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function render() {
      curX += (mouseX - curX) * 0.12;
      curY += (mouseY - curY) * 0.12;
      glow.style.transform = `translate(${curX - 250}px, ${curY - 250}px)`;
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  /* --------------------------------------------------------------------------
     3. Navigation & Fullscreen Menu
     -------------------------------------------------------------------------- */
  function initNav() {
    const nav = $(".nav");
    const burger = $(".burger");
    const menu = $(".menu");
    if (!nav) return;

    let lastY = 0;

    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y > 35) {
        nav.setAttribute("data-scrolled", "true");
      } else {
        nav.removeAttribute("data-scrolled");
      }

      if (y > 320 && y > lastY && !menu.getAttribute("data-open")) {
        nav.setAttribute("data-hide", "true");
      } else {
        nav.removeAttribute("data-hide");
      }
      lastY = y;
    }, { passive: true });

    if (burger && menu) {
      const toggleMenu = () => {
        const isOpen = menu.getAttribute("data-open") === "true";
        if (isOpen) {
          menu.removeAttribute("data-open");
          burger.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        } else {
          menu.setAttribute("data-open", "true");
          burger.setAttribute("aria-expanded", "true");
          document.body.style.overflow = "hidden";
        }
      };

      burger.addEventListener("click", toggleMenu);

      $$(".menu a").forEach((a) => {
        a.addEventListener("click", () => {
          menu.removeAttribute("data-open");
          burger.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
     4. Interactive Vector Canvas Field
     -------------------------------------------------------------------------- */
  function initField() {
    const c = $("#field");
    if (!c || REDUCED) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let w, h, cols, rows, gap;
    let mx = 0, my = 0, on = false, mk = 0, t = 0;

    const size = () => {
      const dpr = FINE ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = FINE ? (w < 700 ? 28 : 36) : 32;
      cols = Math.ceil(w / gap);
      rows = Math.ceil(h / gap);
    };

    size();
    window.addEventListener("resize", size, { passive: true });

    const hero = $(".hero");
    if (hero) {
      hero.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
        on = true;
      });
      hero.addEventListener("pointerleave", () => {
        on = false;
      });
    }

    let frame = 0;
    function renderField() {
      if (!FINE && (++frame % 2 !== 0)) {
        requestAnimationFrame(renderField);
        return;
      }

      t += FINE ? 0.008 : 0.016;
      mk += ((on ? 1 : 0) - mk) * 0.1;
      ctx.clearRect(0, 0, w, h);

      const dx0 = w * (0.5 + Math.sin(t) * 0.38);
      const dy0 = h * (0.5 + Math.cos(t * 0.72) * 0.3);
      const R = Math.max(360, Math.min(w, 1400) * 0.42);

      ctx.lineWidth = 1.2;

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gap + gap / 2;
          const y = j * gap + gap / 2;

          const nd = clamp(1 - Math.hypot(dx0 - x, dy0 - y) / R, 0, 1);
          const nm = mk * clamp(1 - Math.hypot(mx - x, my - y) / 320, 0, 1);

          const k = Math.max(nd, nm);
          const a = nm > nd ? Math.atan2(my - y, mx - x) : Math.atan2(dy0 - y, dx0 - x);
          const len = 3.5 + k * 10;

          // Electric Cyber Cyan & InvoRed subtle gradient
          const alpha = (0.12 + k * 0.72).toFixed(3);
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;

          ctx.beginPath();
          ctx.moveTo(x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2);
          ctx.lineTo(x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2);
          ctx.stroke();
        }
      }

      requestAnimationFrame(renderField);
    }
    requestAnimationFrame(renderField);
  }

  /* --------------------------------------------------------------------------
     5. Headline Word-Proximity Luminance
     -------------------------------------------------------------------------- */
  function initWordProximity() {
    const h1 = $("#h1");
    if (!h1 || !FINE || REDUCED) return;

    const words = $$(".w", h1);
    let centers = null;

    const measure = () => {
      centers = words.map((w) => {
        const r = w.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      });
    };

    h1.addEventListener("pointermove", (e) => {
      if (!centers) measure();
      words.forEach((w, i) => {
        const [cx, cy] = centers[i];
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const k = clamp(1 - dist / 320, 0, 1).toFixed(2);
        w.style.setProperty("--k", k);
      });
    });

    h1.addEventListener("pointerleave", () => {
      centers = null;
      words.forEach((w) => w.style.removeProperty("--k"));
    });

    window.addEventListener("resize", () => {
      centers = null;
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     6. 3D Interactive Card Deck & Perspective Stage
     -------------------------------------------------------------------------- */
  const CRAFTS_DATA = [
    {
      key: "web",
      num: "01",
      title: "Web Architecture",
      subtitle: "Hand-engineered reactive systems",
      art: () => `
        <svg class="art" viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="rgba(0, 242, 254, 0.25)" stroke-width="1">
            ${Array.from({ length: 11 }, (_, i) => `<line x1="${30 + i * 34}" y1="20" x2="${30 + i * 34}" y2="260"/>`).join("")}
          </g>
          <rect x="30" y="40" width="160" height="22" rx="4" fill="#00F2FE"/>
          <rect x="30" y="70" width="220" height="14" rx="3" fill="#F0F2EE" fill-opacity="0.9"/>
          <rect x="30" y="92" width="170" height="14" rx="3" fill="#F0F2EE" fill-opacity="0.6"/>
          <rect x="30" y="114" width="130" height="14" rx="3" fill="#F0F2EE" fill-opacity="0.4"/>
          <g transform="translate(30, 150)">
            <rect width="100" height="24" rx="6" fill="#FF334B"/>
            <rect x="110" width="80" height="24" rx="6" fill="rgba(255,255,255,0.15)"/>
          </g>
          <g transform="translate(260, 40)" stroke="#00F2FE" stroke-width="1.5">
            <rect width="110" height="180" rx="8" fill="#090B0F"/>
            <circle cx="55" cy="40" r="24" stroke="#48D586" stroke-dasharray="4 2"/>
            <line x1="20" y1="85" x2="90" y2="85" stroke-opacity="0.5"/>
            <line x1="20" y1="105" x2="80" y2="105" stroke-opacity="0.5"/>
            <line x1="20" y1="125" x2="70" y2="125" stroke-opacity="0.5"/>
          </g>
        </svg>
      `
    },
    {
      key: "ai",
      num: "02",
      title: "Generative AI & LLMs",
      subtitle: "Custom agents & neural pipelines",
      art: () => `
        <svg class="art" viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="rgba(0, 242, 254, 0.4)" stroke-width="1.2">
            <circle cx="100" cy="140" r="32" fill="#0D1117"/>
            <circle cx="200" cy="80" r="28" fill="#0D1117"/>
            <circle cx="200" cy="200" r="28" fill="#0D1117"/>
            <circle cx="310" cy="140" r="36" fill="#0D1117" stroke="#FF334B"/>
            <line x1="132" y1="140" x2="172" y2="80"/>
            <line x1="132" y1="140" x2="172" y2="200"/>
            <line x1="228" y1="80" x2="274" y2="140"/>
            <line x1="228" y1="200" x2="274" y2="140"/>
          </g>
          <circle cx="100" cy="140" r="8" fill="#00F2FE"/>
          <circle cx="200" cy="80" r="6" fill="#48D586"/>
          <circle cx="200" cy="200" r="6" fill="#48D586"/>
          <circle cx="310" cy="140" r="10" fill="#FF334B"/>
          <text x="200" y="255" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="rgba(240,242,238,0.7)" letter-spacing="2">VECTOR PIPELINE · ACTIVE</text>
        </svg>
      `
    },
    {
      key: "mobile",
      num: "03",
      title: "Mobile App Ecosystems",
      subtitle: "iOS & Android native performance",
      art: () => `
        <svg class="art" viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(135, 25)">
            <rect width="130" height="230" rx="24" fill="#0B0D12" stroke="#00F2FE" stroke-width="2"/>
            <rect x="42" y="10" width="46" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
            <rect x="16" y="32" width="98" height="42" rx="8" fill="rgba(0,242,254,0.15)" stroke="#00F2FE" stroke-opacity="0.4"/>
            <rect x="16" y="84" width="44" height="44" rx="8" fill="#141820"/>
            <rect x="70" y="84" width="44" height="44" rx="8" fill="#141820"/>
            <rect x="16" y="136" width="98" height="60" rx="8" fill="#141820"/>
            <circle cx="65" cy="216" r="6" fill="rgba(255,255,255,0.4)"/>
          </g>
        </svg>
      `
    },
    {
      key: "cloud",
      num: "04",
      title: "Cloud Infrastructure",
      subtitle: "Zero-downtime distributed scaling",
      art: () => `
        <svg class="art" viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(70, 45)" stroke="rgba(240,242,238,0.2)" stroke-width="1.2">
            <rect width="260" height="50" rx="6" fill="#0E1217" stroke="#48D586"/>
            <circle cx="20" cy="25" r="4" fill="#48D586"/>
            <line x1="45" y1="25" x2="200" y2="25"/>
            <rect y="65" width="260" height="50" rx="6" fill="#0E1217"/>
            <circle cx="20" cy="90" r="4" fill="#00F2FE"/>
            <line x1="45" y1="90" x2="220" y2="90"/>
            <rect y="130" width="260" height="50" rx="6" fill="#0E1217"/>
            <circle cx="20" cy="155" r="4" fill="#FF334B"/>
            <line x1="45" y1="155" x2="180" y2="155"/>
          </g>
        </svg>
      `
    },
    {
      key: "brand",
      num: "05",
      title: "Digital Design Systems",
      subtitle: "Tokens, iconography & brand marks",
      art: () => `
        <svg class="art" viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(100, 40)">
            <rect width="60" height="60" rx="10" fill="#FF334B"/>
            <rect x="70" width="60" height="60" rx="10" fill="#00F2FE"/>
            <rect x="140" width="60" height="60" rx="10" fill="#48D586"/>
            <rect y="70" width="60" height="60" rx="10" fill="#F0F2EE"/>
            <rect x="70" y="70" width="60" height="60" rx="10" fill="#141820" stroke="#F0F2EE" stroke-width="1.5"/>
            <circle cx="170" cy="100" r="28" stroke="#00F2FE" stroke-width="2"/>
            <text x="100" y="165" text-anchor="middle" font-family="JetBrains Mono" font-size="12" fill="rgba(240,242,238,0.8)" letter-spacing="1">TOKENS · 100% SCALE</text>
          </g>
        </svg>
      `
    }
  ];

  function initHeroStage() {
    const stage = $("#heroStage");
    if (!stage) return;

    // Build Stack and Legend
    stage.innerHTML = `
      <div class="stack" id="deckStack">
        ${CRAFTS_DATA.map((c, i) => `
          <div class="layer layer--${i} layer--${c.key}" data-slot="${i}" data-key="${c.key}" style="--i: ${i}; --front: ${i === 0 ? 1 : 0};" ${i === 0 ? 'data-front="true"' : ""}>
            <div class="craft__badge">
              <span>${c.num} · ${c.title}</span>
              <i>· ${c.subtitle}</i>
            </div>
            ${c.art()}
          </div>
        `).join("")}
      </div>
      <div class="legend" id="deckLegend">
        ${CRAFTS_DATA.map((c, i) => `
          <button type="button" data-idx="${i}" ${i === 0 ? 'data-front="true"' : ""}>${c.title.split(" ")[0]}</button>
        `).join("")}
      </div>
    `;

    const stack = $("#deckStack", stage);
    const layers = $$(".layer", stack);
    const legendBtns = $$("#deckLegend button", stage);
    let order = layers.map((_, i) => i);

    const deal = () => {
      order.forEach((cardIdx, slot) => {
        const l = layers[cardIdx];
        l.style.setProperty("--i", slot);
        l.style.setProperty("--front", slot === 0 ? "1" : "0");
        l.dataset.slot = slot;
        if (slot === 0) {
          l.setAttribute("data-front", "true");
        } else {
          l.removeAttribute("data-front");
        }
      });

      legendBtns.forEach((b, j) => {
        if (j === order[0]) {
          b.setAttribute("data-front", "true");
        } else {
          b.removeAttribute("data-front");
        }
      });
    };

    const shuffle = () => {
      const topIdx = order[0];
      const topCard = layers[topIdx];
      order.push(order.shift());

      topCard.classList.remove("flying");
      void topCard.offsetWidth; // Force reflow
      topCard.classList.add("flying");

      setTimeout(() => topCard.classList.remove("flying"), 850);
      deal();
    };

    // Click/Tap to shuffle
    stage.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      shuffle();
    });

    // Legend Click to jump
    legendBtns.forEach((btn, targetIdx) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        while (order[0] !== targetIdx) {
          order.push(order.shift());
        }
        deal();
      });
    });

    // 3D Perspective Tilt on Mouse Move
    if (FINE && !REDUCED) {
      stage.addEventListener("pointermove", (e) => {
        const rect = stage.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        stack.style.setProperty("--rx", `${-ny * 11}deg`);
        stack.style.setProperty("--ry", `${nx * 13}deg`);
      });

      stage.addEventListener("pointerleave", () => {
        stack.style.setProperty("--rx", "0deg");
        stack.style.setProperty("--ry", "0deg");
      });
    }
  }

  /* --------------------------------------------------------------------------
     7. Crafts / Services Section Tabs & 3D Art Switcher
     -------------------------------------------------------------------------- */
  function initCrafts() {
    const tabs = $$(".cr__tabs button");
    const panels = $$(".cr__panel");
    const artCard = $(".cr__card");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.getAttribute("data-k");

        tabs.forEach((t) => {
          const isSelected = t === tab;
          t.setAttribute("aria-selected", isSelected ? "true" : "false");
        });

        panels.forEach((p) => {
          if (p.getAttribute("data-k") === key) {
            p.removeAttribute("hidden");
          } else {
            p.setAttribute("hidden", "true");
          }
        });

        // Update 3D Art Card SVG
        if (artCard) {
          const match = CRAFTS_DATA.find((c) => c.key === key);
          if (match) {
            artCard.innerHTML = match.art();
          }
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     8. Counters & Key Metrics Odometer
     -------------------------------------------------------------------------- */
  function initCounters() {
    const counters = $$(".counter-val");
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.getAttribute("data-target") || 0;
        const duration = 1800;
        const start = performance.now();

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          // Ease out expo
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = Math.floor(ease * target);
          el.textContent = current.toLocaleString();
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target.toLocaleString();
          }
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.25 });

    counters.forEach((c) => observer.observe(c));
  }

  /* --------------------------------------------------------------------------
     9. Interactive Work Showcase
     -------------------------------------------------------------------------- */
  function initWorkShowcase() {
    const media = $(".case__media");
    const deskBtn = $("#viewDesk");
    const phoneBtn = $("#viewPhone");
    const deskImg = $("#caseDeskImg");
    const phoneImg = $("#casePhoneImg");
    const urlSpan = $(".case__bar span.url");
    const rows = $$(".idx__row");

    if (deskBtn && phoneBtn && media) {
      deskBtn.addEventListener("click", () => {
        media.setAttribute("data-view", "desk");
        deskBtn.setAttribute("aria-pressed", "true");
        phoneBtn.setAttribute("aria-pressed", "false");
      });

      phoneBtn.addEventListener("click", () => {
        media.setAttribute("data-view", "phone");
        phoneBtn.setAttribute("aria-pressed", "true");
        deskBtn.setAttribute("aria-pressed", "false");
      });
    }

    if (rows.length && deskImg) {
      rows.forEach((row) => {
        row.addEventListener("mouseenter", () => {
          const img = row.getAttribute("data-img");
          const url = row.getAttribute("data-url");
          if (img && deskImg) deskImg.src = img;
          if (img && phoneImg) phoneImg.src = img;
          if (url && urlSpan) urlSpan.textContent = url;
        });

        row.addEventListener("click", () => {
          const img = row.getAttribute("data-img");
          const url = row.getAttribute("data-url");
          if (img && deskImg) deskImg.src = img;
          if (img && phoneImg) phoneImg.src = img;
          if (url && urlSpan) urlSpan.textContent = url;
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
     10. Dynamic Brief Form with AJAX
     -------------------------------------------------------------------------- */
  function initBriefForm() {
    const form = $("#brief");
    if (!form) return;

    const briefLine = $("#briefLine");
    const radioInputs = $$('input[name="need"]', form);
    const note = $("#briefNote");
    const submitBtn = $('button[type="submit"]', form);

    const NEED_LABELS = {
      web: "a high-performance web application",
      ai: "a custom Generative AI or agent pipeline",
      mobile: "a cross-platform mobile application",
      marketing: "a strategic digital marketing campaign",
      brand: "a complete brand identity system",
      unsure: "expert consultation & architecture advice"
    };

    radioInputs.forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked && briefLine) {
          const phrase = NEED_LABELS[input.value] || input.value;
          briefLine.innerHTML = `You need <u>${phrase}</u>.`;
        }
      });
    });

    // AJAX Form Submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending brief...";
      }

      const formData = new FormData(form);

      try {
        const res = await fetch(form.action || "./contactme.php", {
          method: "POST",
          body: formData,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "application/json"
          }
        });

        if (res.ok) {
          if (note) {
            note.className = "formnote2 is-success";
            note.textContent = "Thank you! Your brief has been received. Our team will reach out within 24 hours.";
          }
          form.reset();
          if (briefLine) {
            briefLine.innerHTML = `You need <u>${NEED_LABELS.web}</u>.`;
          }
        } else {
          throw new Error("Submission failed");
        }
      } catch (err) {
        // Fallback: direct submit if AJAX network issue
        if (note) {
          note.className = "formnote2 is-error";
          note.textContent = "Brief sent. We will review your specifications promptly.";
        }
        form.submit();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = "Send the brief";
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     11. FAQ Minimalist Accordion
     -------------------------------------------------------------------------- */
  function initFaqAccordion() {
    const items = $$(".faq-item");
    if (!items.length) return;

    items.forEach((item) => {
      const q = $(".faq-q", item);
      if (!q) return;

      q.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        // Close others for clean single-expand behavior
        items.forEach((other) => other.classList.remove("is-open"));
        if (!isOpen) {
          item.classList.add("is-open");
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     12. IntersectionObserver Scroll Reveal
     -------------------------------------------------------------------------- */
  function initScrollReveal() {
    if (REDUCED) return;
    const elements = $$(".rv");
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    elements.forEach((el) => observer.observe(el));
  }

  /* --------------------------------------------------------------------------
     13. Back to Top Button
     -------------------------------------------------------------------------- */
  function initBackToTop() {
    const btn = $(".back-to-top");
    if (!btn) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        btn.classList.add("is-visible");
      } else {
        btn.classList.remove("is-visible");
      }
    }, { passive: true });

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* --------------------------------------------------------------------------
     14. Careers Page Enhancements
     -------------------------------------------------------------------------- */
  function initCareersPage() {
    const fileBox = $(".file-upload-box");
    const fileInput = $("#fileUpload");
    const nameDisplay = $("#fileSelectedName");
    const careerForm = $("#careerForm");

    if (fileBox && fileInput) {
      fileInput.addEventListener("change", () => {
        if (fileInput.files && fileInput.files[0]) {
          const f = fileInput.files[0];
          if (nameDisplay) {
            nameDisplay.textContent = `Selected: ${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`;
          }
        }
      });

      // Drag and drop events
      ["dragenter", "dragover"].forEach((evt) => {
        fileBox.addEventListener(evt, (e) => {
          e.preventDefault();
          fileBox.classList.add("dragover");
        });
      });

      ["dragleave", "drop"].forEach((evt) => {
        fileBox.addEventListener(evt, (e) => {
          e.preventDefault();
          fileBox.classList.remove("dragover");
        });
      });

      fileBox.addEventListener("drop", (e) => {
        if (e.dataTransfer && e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          const f = fileInput.files[0];
          if (nameDisplay) {
            nameDisplay.textContent = `Selected: ${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`;
          }
        }
      });
    }

    // Connect Job Card "Apply Now" buttons to form
    const applyBtns = $$(".apply-job-btn");
    applyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const role = btn.getAttribute("data-role");
        const radio = $(`input[name="status"][value="${role}"]`);
        if (radio) {
          radio.checked = true;
          const briefLine = $("#careerBriefLine");
          if (briefLine) {
            briefLine.innerHTML = `Applying for: <u>${role}</u>.`;
          }
        }
        const target = $("#apply");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    const statusRadios = $$('input[name="status"]', careerForm);
    const careerBriefLine = $("#careerBriefLine");
    statusRadios.forEach((r) => {
      r.addEventListener("change", () => {
        if (r.checked && careerBriefLine) {
          careerBriefLine.innerHTML = `Applying for: <u>${r.value}</u>.`;
        }
      });
    });
  }

})();
