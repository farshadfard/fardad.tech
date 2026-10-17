/* fardad.tech — interactions & animations (vanilla JS, no dependencies) */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const NUC = { A: "#4fd1c5", T: "#f6ad55", G: "#a78bfa", C: "#f472b6" };
  const PAIR = { A: "T", T: "A", G: "C", C: "G" };
  const BASES = "ATGC";
  const rand = (n) => Math.floor(Math.random() * n);
  const randBase = () => BASES[rand(4)];

  $("#year").textContent = new Date().getFullYear();
  requestAnimationFrame(() => document.documentElement.classList.add("is-loaded"));
  window.addEventListener("load", () => document.documentElement.classList.add("is-loaded"));

  /* ---------------- Nav ---------------- */
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const links = $(".nav__links");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("a", links).forEach((a) =>
    a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("is-open");
      document.body.style.overflow = "";
    })
  );

  const sectionLinks = new Map($$('.nav__links a[href^="#"]').map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        sectionLinks.forEach((a) => a.classList.remove("is-active"));
        sectionLinks.get(e.target.id)?.classList.add("is-active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sectionLinks.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------------- Scroll-linked ---------------- */
  const progress = $(".scroll-progress");
  const timeline = $(".timeline");
  const chromoFill = $(".chromosome__fill");
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("is-scrolled", y > 30);
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      chromoFill.style.transform = `scaleY(${p})`;
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------------- Cursor glow ---------------- */
  const glow = $(".cursor-glow");
  if (finePointer && !reduceMotion) {
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function follow() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx - 260}px, ${gy - 260}px)`;
      requestAnimationFrame(follow);
    })();
  } else glow.style.display = "none";

  /* ---------------- Reveal on scroll ---------------- */
  // stagger siblings that reveal together
  $$(".reveal").forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
  });
  const revealer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      revealer.unobserve(e.target);
    }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".reveal, .dag, .heatmap").forEach((el) => revealer.observe(el));

  /* ---------------- Counters ---------------- */
  const counter = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const to = parseFloat(el.dataset.to);
      const dec = parseInt(el.dataset.decimals || "0", 10);
      const dur = 1800;
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = (to * eased).toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      };
      reduceMotion ? (el.textContent = to.toFixed(dec)) : requestAnimationFrame(step);
      counter.unobserve(el);
    }),
    { threshold: 0.6 }
  );
  $$(".count").forEach((el) => counter.observe(el));

  /* ---------------- Typed words ---------------- */
  const typed = $(".typed");
  if (typed) {
    const words = typed.dataset.words.split("|");
    if (reduceMotion) typed.textContent = words[0];
    else {
      let w = 0, c = 0, deleting = false;
      const tick = () => {
        const word = words[w];
        c += deleting ? -1 : 1;
        typed.textContent = word.slice(0, c);
        let delay = deleting ? 35 : 70;
        if (!deleting && c === word.length) { deleting = true; delay = 2200; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 1200);
    }
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });

    /* tilt cards */
    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1000px) rotateX(${-py * 5}deg) rotateY(${px * 6}deg) translateY(-3px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  /* ---------------- Sequence ticker ---------------- */
  const ticker = $("#ticker");
  if (ticker) {
    const genes = ["SPAST", "RNASEH2B", "COQ8A", "IDH1 R132H", "ATL1", "KIF5A", "SPG11", "REEP1"];
    let html = "";
    for (let g = 0; g < genes.length; g++) {
      html += `<span class="lbl">${genes[g]}</span>`;
      const len = 34 + rand(12);
      const varAt = 10 + rand(len - 20);
      for (let i = 0; i < len; i++) {
        const b = randBase();
        html += i === varAt ? `<b class="var">${b}</b>` : `<b class="${b}">${b}</b>`;
      }
    }
    ticker.innerHTML = html + html; // duplicated for seamless loop
  }

  /* ---------------- DNA double helix (canvas) ---------------- */
  const canvas = $("#helix");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1, running = true;
    const PAIRS = 46;
    const seq = Array.from({ length: PAIRS }, randBase);
    const motes = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3, s: Math.random() * 0.0004 + 0.0001, b: randBase() }));
    let mx = 0, my = 0, smx = 0, smy = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    if (finePointer) window.addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

    new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) requestAnimationFrame(draw); }).observe(canvas);

    const hexA = (hex, a) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
    };

    let t0 = performance.now();
    function draw(now) {
      if (!running) return;
      const t = reduceMotion ? 0 : (now - t0) / 1000;
      smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
      ctx.clearRect(0, 0, W, H);

      // floating nucleotide motes
      for (const m of motes) {
        if (!reduceMotion) { m.y -= m.s * 16; if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); } }
        ctx.fillStyle = hexA(NUC[m.b], 0.35);
        ctx.beginPath();
        ctx.arc(m.x * W + smx * 30 * m.r, m.y * H + smy * 30 * m.r, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const mobile = W < 760;
      const cx = mobile ? W * 0.78 : W * 0.74;
      const cy = H * 0.5;
      const len = mobile ? H * 1.1 : H * 1.25;
      const R = mobile ? Math.min(70, W * 0.16) : Math.min(130, W * 0.085);
      const tilt = -0.42 + smx * 0.25;           // helix axis angle
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const spin = t * 0.55 + smy * 1.2;
      const twist = 0.36;

      // build strand points
      const pts = [];
      for (let i = 0; i < PAIRS; i++) {
        const u = i / (PAIRS - 1) - 0.5;
        const ang = i * twist + spin;
        const along = u * len;
        const off1 = Math.cos(ang) * R, z1 = Math.sin(ang);
        const off2 = Math.cos(ang + Math.PI) * R, z2 = Math.sin(ang + Math.PI);
        const rot = (a, o) => [cx + a * sinT + o * cosT, cy + a * cosT - o * sinT];
        const [x1, y1] = rot(along, off1);
        const [x2, y2] = rot(along, off2);
        // fade the ends
        const edge = 1 - Math.pow(Math.abs(u) * 2, 3);
        pts.push({ x1, y1, z1, x2, y2, z2, edge, b: seq[i] });
      }

      // rungs (base pairs) — back to front by mean depth
      const order = pts.map((p, i) => i).sort((a, b) => (pts[a].z1 + pts[a].z2) - (pts[b].z1 + pts[b].z2));
      for (const i of order) {
        const p = pts[i];
        const mxp = (p.x1 + p.x2) / 2, myp = (p.y1 + p.y2) / 2;
        const a = 0.18 + 0.32 * p.edge;
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = hexA(NUC[p.b], a * (0.6 + 0.4 * (p.z1 + 1) / 2));
        ctx.beginPath(); ctx.moveTo(p.x1, p.y1); ctx.lineTo(mxp, myp); ctx.stroke();
        ctx.strokeStyle = hexA(NUC[PAIR[p.b]], a * (0.6 + 0.4 * (p.z2 + 1) / 2));
        ctx.beginPath(); ctx.moveTo(mxp, myp); ctx.lineTo(p.x2, p.y2); ctx.stroke();
      }

      // backbones
      const backbone = (k, color) => {
        ctx.lineWidth = 1.4;
        for (let i = 0; i < pts.length - 1; i++) {
          const p = pts[i], q = pts[i + 1];
          const z = (p[`z${k}`] + q[`z${k}`]) / 2;
          ctx.strokeStyle = hexA(color, (0.15 + 0.55 * (z + 1) / 2) * p.edge);
          ctx.beginPath(); ctx.moveTo(p[`x${k}`], p[`y${k}`]); ctx.lineTo(q[`x${k}`], q[`y${k}`]); ctx.stroke();
        }
      };
      backbone(1, "#c8f3ef");
      backbone(2, "#fde3c2");

      // nucleotide nodes
      for (const p of pts) {
        for (const k of [1, 2]) {
          const z = p[`z${k}`];
          const depth = (z + 1) / 2;
          const r = 1.6 + depth * 3.2;
          const col = k === 1 ? NUC[p.b] : NUC[PAIR[p.b]];
          const alpha = (0.25 + 0.75 * depth) * p.edge;
          if (depth > 0.7) {
            ctx.fillStyle = hexA(col, 0.12 * alpha);
            ctx.beginPath(); ctx.arc(p[`x${k}`], p[`y${k}`], r * 3.2, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = hexA(col, alpha);
          ctx.beginPath(); ctx.arc(p[`x${k}`], p[`y${k}`], r, 0, Math.PI * 2); ctx.fill();
        }
      }

      if (!reduceMotion) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    // occasional point mutation in the helix
    if (!reduceMotion) setInterval(() => { seq[rand(PAIRS)] = randBase(); }, 900);
  }

  /* ---------------- Pipeline DAG + terminal ---------------- */
  const dag = $("#dag");
  const term = $("#term");
  if (dag && term) {
    const nodes = $$(".node", dag);
    nodes.forEach((n, i) => n.style.setProperty("--i", i));

    // travelling pulses along the wires
    const svg = $(".dag__wires", dag);
    if (!reduceMotion) {
      $$(".wire", svg).forEach((w, i) => {
        const id = `w${i}`;
        w.id = id;
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("r", "3");
        c.setAttribute("class", "pulse-dot");
        c.innerHTML = `<animateMotion dur="${2.4 + (i % 3) * 0.4}s" begin="${1.6 + i * 0.25}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#${id}"/></animateMotion>`;
        svg.appendChild(c);
      });
    }

    const pad = (s, n) => s + " ".repeat(Math.max(1, n - s.length));
    const hash = () => `${rand(256).toString(16).padStart(2, "0")}/${Math.random().toString(16).slice(2, 8)}`;
    const procs = [
      { name: "FASTQC (cohort)", total: 24, step: 1 },
      { name: "DRAGMAP_ALIGN (alt-masked)", total: 24, step: 2 },
      { name: "SCATTER_INTERVALS", total: 1, step: 3 },
      { name: "GATK_HAPLOTYPECALLER", total: 600, step: 4 },
      { name: "DEEPVARIANT", total: 600, step: 4 },
      { name: "GLOW_MERGE_CALLSETS", total: 24, step: 5 },
      { name: "CNV_HPO_AWARE", total: 24, step: 6 },
      { name: "BIOMARKERS (TMB·MSI·ROH·LOH)", total: 24, step: 6 },
      { name: "ACMG_CLINICAL_REPORT", total: 24, step: 6 },
    ];

    const highlight = (step) => nodes.forEach((n) => n.classList.toggle("is-active", Number(n.dataset.step) === step));
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let started = false;

    const run = async () => {
      while (true) {
        term.innerHTML = "";
        const header = [
          `<span class="w">N E X T F L O W</span>  ~  version 24.10.0`,
          `Launching <span class="hl">\`papco/main.nf\`</span> [stoic_franklin] DSL2 - revision: ${Math.random().toString(16).slice(2, 12)}`,
          ``,
          `executor &gt;  slurm (${procs.reduce((s, p) => s + p.total, 0)})`,
        ];
        for (const h of header) { term.innerHTML += h + "\n"; await sleep(260); }

        for (const p of procs) {
          highlight(p.step);
          const line = document.createElement("span");
          term.appendChild(line);
          term.appendChild(document.createTextNode("\n"));
          const h = hash();
          const frames = reduceMotion ? 1 : 10;
          for (let f = 1; f <= frames; f++) {
            const done = Math.round((p.total * f) / frames);
            const pct = String(Math.round((100 * f) / frames)).padStart(3, " ");
            line.innerHTML = `[${h}] <span class="proc">process &gt;</span> ${pad(p.name, 29)}[${pct}%] ${done} of ${p.total}${f === frames ? ' <span class="ok">✔</span>' : ""}`;
            await sleep(70);
          }
          await sleep(160);
        }
        highlight(0);
        const tail = [
          ``,
          `<span class="hl">GIAB benchmark</span> · SNV + INDEL  F1 ≥ <span class="w">0.99</span>  recall ≥ <span class="w">0.99</span>`,
          `<span class="warn">ACMG</span>  · pathogenic / likely-pathogenic variants flagged for review`,
          `Completed at: ${new Date().toLocaleDateString()}  ·  Duration: <span class="w">&lt; 1h / exome</span>`,
          `Succeeded   : <span class="ok">${procs.reduce((s, p) => s + p.total, 0)}</span>`,
        ];
        for (const tl of tail) { term.innerHTML += tl + "\n"; await sleep(280); }
        await sleep(5200);
      }
    };

    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { started = true; run(); }
    }, { threshold: 0.3 }).observe(term);
  }

  /* ---------------- Heatmap ---------------- */
  const hm = $("#heatmap");
  if (hm) {
    const langs = [
      ["Python", 5, "Advanced"],
      ["Bash", 5, "Advanced"],
      ["Rust", 4, "Int.–advanced"],
      ["R", 4, "Int.–advanced"],
      ["Groovy", 3, "Intermediate"],
      ["SQL", 2, "Basic"],
    ];
    const cols = 12;
    hm.style.setProperty("--cols", cols);
    let html = "";
    langs.forEach(([name, lvl, label], r) => {
      html += `<div class="hm-row" role="row"><span class="hm-label" role="rowheader">${name}</span>`;
      const filled = Math.round((lvl / 5) * cols);
      for (let c = 0; c < cols; c++) {
        const on = c < filled;
        const k = on ? 0.35 + 0.65 * (c + 1) / filled : 0;
        const jitter = on ? (Math.random() * 0.15 - 0.05) : 0;
        const a = Math.max(0.06, Math.min(1, k + jitter));
        const bg = on ? `rgba(79,209,197,${a.toFixed(2)})` : "rgba(255,255,255,.04)";
        html += `<i class="hm-cell" role="cell" style="background:${bg};color:rgba(79,209,197,.8);--dl:${(r * 40 + c * 30)}ms"></i>`;
      }
      html += `<span class="hm-level">${label}</span></div>`;
    });
    html += `<div class="hm-legend"><span>novice</span><i></i><span>expert</span></div>`;
    hm.innerHTML = html;
  }
})();
