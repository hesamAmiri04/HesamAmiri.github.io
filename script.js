/* =====================================================================
   Hesam Amiri — portfolio
   single vanilla JS file. no framework. no build step.
   ===================================================================== */

(() => {

/* ---------- year + uptime ---------- */
const yrEl = document.getElementById('yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();

const uptimeEl = document.getElementById('meta-uptime');
const t0 = performance.now();
function tickUptime() {
  if (!uptimeEl) return;
  const ms = performance.now() - t0;
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  uptimeEl.textContent = `${hh}:${mm}:${ss}`;
}
setInterval(tickUptime, 1000); tickUptime();

const revEl = document.getElementById('meta-rev');
if (revEl) {
  const d = new Date();
  revEl.textContent = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

/* ---------- reveal-on-scroll ---------- */
const revealTargets = document.querySelectorAll('.section, .research-card, .interests, .play-card, .timeline, .skills, .contact-grid');
revealTargets.forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
revealTargets.forEach(el => io.observe(el));

/* =====================================================================
   1. HERO SCOPE — pseudo-IQ waveform
   ===================================================================== */
(() => {
  const c = document.getElementById('scope');
  if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    const r = c.getBoundingClientRect();
    c.width  = r.width  * dpr;
    c.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  const phos    = 'rgba(124, 242, 177, 1)';
  const phosDim = 'rgba(124, 242, 177, 0.18)';

  function draw() {
    const w = c.width / dpr, h = c.height / dpr;
    ctx.clearRect(0, 0, w, h);

    // baseline carrier (thin)
    ctx.beginPath();
    ctx.strokeStyle = phosDim;
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x++) {
      const y = h/2 + Math.sin((x/w) * Math.PI * 8 + t) * 4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // primary modulated trace
    ctx.beginPath();
    ctx.strokeStyle = phos;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = phos;
    ctx.shadowBlur = 8;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      // mix 3 sines + a small bursty packet shape
      const burst = Math.exp(-Math.pow((u - ((t*0.05) % 1.4 - 0.2)), 2) * 80);
      const y = h/2
        + Math.sin(u * Math.PI * 14 + t * 1.2) * 28 * (0.4 + burst * 1.2)
        + Math.sin(u * Math.PI * 36 + t * 2.1) * 6
        + Math.sin(u * Math.PI * 80 + t * 3.7) * 2;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // tiny digital tick markers
    ctx.fillStyle = phos;
    for (let i = 0; i < 4; i++) {
      const tx = ((t * 8) + i * 90) % w;
      ctx.fillRect(tx, h - 14, 2, 6);
    }

    t += 0.04;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* =====================================================================
   2. MAC THROUGHPUT CHART — CSMA vs RL
   illustrative: regenerated fresh on hover/replay
   ===================================================================== */
(() => {
  const c = document.getElementById('mac-chart');
  if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    const r = c.getBoundingClientRect();
    c.width  = r.width * dpr;
    c.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // generate two trajectories — CSMA degrades under contention,
  // RL adapts after a learning phase
  function gen() {
    const N = 60;
    const csma = [], rl = [];
    let cs = 0.85, rls = 0.5;
    for (let i = 0; i < N; i++) {
      // contention rises across the window
      const contention = i / N;
      // CSMA: degrades roughly linearly, with noise
      cs = 0.9 - contention * 0.55 + (Math.random() - 0.5) * 0.05;
      // RL: dips early (learning) then recovers and beats CSMA
      const learn = i < 18 ? -0.18 + (i / 18) * 0.18 : 0;
      rls = 0.85 - contention * 0.18 + learn + (Math.random() - 0.5) * 0.03;
      csma.push(Math.max(0.05, Math.min(1, cs)));
      rl.push(Math.max(0.05, Math.min(1, rls)));
    }
    return { csma, rl };
  }

  let data = gen();
  let progress = 0;

  function draw() {
    const w = c.width / dpr, h = c.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const padL = 36, padR = 14, padT = 14, padB = 28;
    const W = w - padL - padR;
    const H = h - padT - padB;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) {
      const y = padT + (H * i / 4);
      ctx.moveTo(padL, y); ctx.lineTo(padL + W, y);
    }
    for (let i = 0; i <= 6; i++) {
      const x = padL + (W * i / 6);
      ctx.moveTo(x, padT); ctx.lineTo(x, padT + H);
    }
    ctx.stroke();

    // axis labels
    ctx.fillStyle = 'rgba(154, 163, 156, 0.7)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('1.0', padL - 6, padT + 6);
    ctx.fillText('0.5', padL - 6, padT + H/2 + 3);
    ctx.fillText('0.0', padL - 6, padT + H);
    ctx.textAlign = 'center';
    ctx.fillText('contention →', padL + W/2, h - 8);
    ctx.save();
    ctx.translate(12, padT + H/2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('throughput', 0, 0);
    ctx.restore();

    // helper to draw a series
    function series(arr, color, glow) {
      const n = Math.floor(arr.length * progress);
      if (n < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 6; }
      for (let i = 0; i < n; i++) {
        const x = padL + (W * i / (arr.length - 1));
        const y = padT + H - arr[i] * H;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    series(data.csma, '#d99a6c', false);
    series(data.rl,   '#7cf2b1', true);

    if (progress < 1) {
      progress += 0.012;
      requestAnimationFrame(draw);
    }
  }
  draw();

  function replay() {
    data = gen();
    progress = 0;
    draw();
  }

  c.addEventListener('mouseenter', replay);
  document.getElementById('mac-replay')?.addEventListener('click', replay);
})();

/* =====================================================================
   3. CLOUD-EDGE TOPOLOGY (SVG, click-interactive)
   ===================================================================== */
(() => {
  const svg = document.getElementById('topology');
  if (!svg) return;
  const nodesG = document.getElementById('topo-nodes');
  const linksG = document.getElementById('topo-links');
  const detail = document.getElementById('topo-detail');

  // layout: cloud at top center; aggregation ring; edge gateways; sensor leaves
  const nodes = [
    { id: 'cloud',  x: 300, y: 50,  r: 24, label: 'CLOUD', kind: 'cloud',
      info: 'OpenStack control plane (Keystone, Neutron, Nova, Glance) — multi-tenant orchestration.' },

    { id: 'agg-1',  x: 170, y: 140, r: 16, label: 'k8s-CP', kind: 'agg',
      info: 'k0s control plane, ConfigMap-driven runtime config, NodePort services facing edge ingest.' },
    { id: 'agg-2',  x: 430, y: 140, r: 16, label: 'NETCONF', kind: 'agg',
      info: 'YANG-modeled config pushed via ncclient, atomic commits across candidate datastore.' },

    { id: 'edge-1', x: 90,  y: 240, r: 13, label: 'EDGE-A', kind: 'edge',
      info: 'WireGuard tunnel up to control plane. Linux netns isolates the gateway namespace.' },
    { id: 'edge-2', x: 230, y: 260, r: 13, label: 'EDGE-B', kind: 'edge',
      info: 'VXLAN overlay across L3 underlay — same broadcast domain, multiple sites.' },
    { id: 'edge-3', x: 370, y: 260, r: 13, label: 'EDGE-C', kind: 'edge',
      info: 'Coordinator node. Bridges 802.15.4 testbed to IP world over UART.' },
    { id: 'edge-4', x: 510, y: 240, r: 13, label: 'EDGE-D', kind: 'edge',
      info: 'GRE tunnel — minimal overhead, no encryption (lab-only).' },

    { id: 'iot-1',  x: 60,  y: 320, r: 8,  label: 'WSN', kind: 'iot',
      info: 'IEEE 802.15.4 non-beacon node. ADC-sampled LDR. Arduino + NRF.' },
    { id: 'iot-2',  x: 200, y: 330, r: 8,  label: 'WSN', kind: 'iot',
      info: 'RL agent runs here on-device. Decides when to transmit per observed channel state.' },
    { id: 'iot-3',  x: 340, y: 330, r: 8,  label: 'WSN', kind: 'iot',
      info: 'CSMA/CA baseline node — used as control in MAC-protocol comparison.' },
    { id: 'iot-4',  x: 540, y: 320, r: 8,  label: 'WSN', kind: 'iot',
      info: 'Sensor leaf. UART-bridged into the gateway.' },
  ];

  const links = [
    ['cloud','agg-1'], ['cloud','agg-2'],
    ['agg-1','edge-1'], ['agg-1','edge-2'],
    ['agg-2','edge-3'], ['agg-2','edge-4'],
    ['edge-1','iot-1'], ['edge-2','iot-2'],
    ['edge-3','iot-3'], ['edge-4','iot-4'],
  ];

  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  // links
  const NS = 'http://www.w3.org/2000/svg';
  links.forEach(([a, b]) => {
    const A = byId[a], B = byId[b];
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', A.x);
    line.setAttribute('y1', A.y);
    line.setAttribute('x2', B.x);
    line.setAttribute('y2', B.y);
    line.setAttribute('stroke-dasharray', '2 4');
    linksG.appendChild(line);
  });

  // nodes
  nodes.forEach(n => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'topo-node');
    g.setAttribute('transform', `translate(${n.x},${n.y})`);
    g.dataset.id = n.id;

    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', n.r);
    g.appendChild(c);

    const t = document.createElementNS(NS, 'text');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dy', n.r + 14);
    t.textContent = n.label;
    g.appendChild(t);

    g.addEventListener('click', () => select(n.id));
    g.addEventListener('mouseenter', () => select(n.id));
    nodesG.appendChild(g);
  });

  function select(id) {
    document.querySelectorAll('.topo-node').forEach(el => el.classList.remove('is-active'));
    const el = document.querySelector(`.topo-node[data-id="${id}"]`);
    el?.classList.add('is-active');
    const n = byId[id];
    if (!n) return;
    detail.querySelector('.detail-v').textContent = `[${n.label}] ${n.info}`;
  }

  // default selection on first scroll-into-view
  const ioTopo = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      select('cloud');
      ioTopo.disconnect();
    }
  }, { threshold: 0.3 });
  ioTopo.observe(svg);
})();

/* =====================================================================
   4. MODULATION EXPLORER — ASK / FSK / BPSK
   ===================================================================== */
(() => {
  const c = document.getElementById('mod');
  if (!c) return;
  const ctx = c.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const carrierIn = document.getElementById('mod-carrier');
  const rateIn    = document.getElementById('mod-rate');
  const modeIn    = document.getElementById('mod-mode');
  const carrierV  = document.getElementById('mod-carrier-v');
  const rateV     = document.getElementById('mod-rate-v');

  function resize() {
    const r = c.getBoundingClientRect();
    c.width  = r.width * dpr;
    c.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function bits(n, seed) {
    // deterministic-ish bit pattern for given seed
    const out = [];
    let s = seed * 9301 + 49297;
    for (let i = 0; i < n; i++) {
      s = (s * 9301 + 49297) % 233280;
      out.push(s % 2);
    }
    return out;
  }

  function draw() {
    const w = c.width / dpr, h = c.height / dpr;
    const carrier = parseFloat(carrierIn.value);
    const rate    = parseInt(rateIn.value, 10);
    const mode    = modeIn.value;

    carrierV.textContent = carrier.toFixed(1);
    rateV.textContent = rate;

    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const x = (w * i / 8); ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let i = 0; i <= 4; i++) {
      const y = (h * i / 4); ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();

    const seq = bits(rate, rate + (mode.length));

    // top: bit pattern
    const topY = h * 0.18, topAmp = h * 0.12;
    ctx.strokeStyle = '#d99a6c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < seq.length; i++) {
      const x0 = (w * i / seq.length);
      const x1 = (w * (i+1) / seq.length);
      const y  = topY + (seq[i] ? -topAmp : topAmp);
      if (i === 0) ctx.moveTo(x0, y);
      else ctx.lineTo(x0, y);
      ctx.lineTo(x1, y);
    }
    ctx.stroke();

    // bit labels
    ctx.fillStyle = 'rgba(217, 154, 108, 0.85)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < seq.length; i++) {
      const x = (w * (i + 0.5) / seq.length);
      ctx.fillText(seq[i], x, topY - topAmp - 6);
    }

    // bottom: modulated waveform
    const midY = h * 0.65, amp = h * 0.22;
    ctx.beginPath();
    ctx.strokeStyle = '#7cf2b1';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = '#7cf2b1';
    ctx.shadowBlur = 4;
    for (let px = 0; px < w; px++) {
      const u = px / w;                       // 0..1 across full window
      const idx = Math.min(seq.length - 1, Math.floor(u * seq.length));
      const bit = seq[idx];
      let y;
      if (mode === 'ask') {
        const a = bit ? amp : amp * 0.18;
        y = midY + Math.sin(u * Math.PI * 2 * carrier) * a;
      } else if (mode === 'fsk') {
        const f = bit ? carrier * 1.6 : carrier * 0.7;
        y = midY + Math.sin(u * Math.PI * 2 * f) * amp;
      } else { // bpsk
        const phase = bit ? 0 : Math.PI;
        y = midY + Math.sin(u * Math.PI * 2 * carrier + phase) * amp;
      }
      px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // labels
    ctx.fillStyle = 'rgba(154, 163, 156, 0.7)';
    ctx.textAlign = 'left';
    ctx.fillText('bits', 8, topY - topAmp - 14);
    ctx.fillText(mode.toUpperCase(), 8, midY - amp - 8);
  }

  [carrierIn, rateIn, modeIn].forEach(el => el.addEventListener('input', draw));
  draw();
})();

/* =====================================================================
   5. NETCONF candidate-datastore commit walkthrough
   ===================================================================== */
(() => {
  const stage = document.getElementById('netconf-stage');
  if (!stage) return;
  const log = document.getElementById('netconf-log');
  const buttons = stage.parentElement.querySelectorAll('.netconf-controls .ghost-btn');

  const dsRunning   = document.querySelector('.ds-running');
  const dsCandidate = document.querySelector('.ds-candidate');
  const dsStartup   = document.querySelector('.ds-startup');

  const txtRunning   = document.getElementById('ds-running');
  const txtCandidate = document.getElementById('ds-candidate');
  const txtStartup   = document.getElementById('ds-startup');

  let state = { running: 'v1.0', candidate: 'v1.0', startup: 'v1.0', edited: false, validated: false };

  function render() {
    txtRunning.textContent   = state.running;
    txtCandidate.textContent = state.candidate;
    txtStartup.textContent   = state.startup;
    dsCandidate.classList.toggle('is-changed', state.edited && !state.committed);
    dsRunning.classList.toggle('is-changed', state.committed);
    dsRunning.classList.toggle('is-locked', false);
  }

  function append(line, cls = 'info') {
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = line + '\n';
    log.appendChild(span);
    log.scrollTop = log.scrollHeight;
  }

  buttons.forEach(b => b.addEventListener('click', () => {
    const step = b.dataset.step;
    switch (step) {
      case 'edit':
        state.edited = true;
        state.candidate = 'v1.1 (pending)';
        append('→ <edit-config target="candidate"> applied. interfaces.GigabitEthernet0/1.description set.', 'info');
        break;
      case 'validate':
        if (!state.edited) { append('! no changes to validate.', 'warn'); break; }
        state.validated = true;
        append('→ <validate source="candidate"> ok. schema + constraints pass.', 'ok');
        break;
      case 'commit':
        if (!state.edited) { append('! commit refused: candidate equals running.', 'warn'); break; }
        if (!state.validated) { append('! commit without validate — proceed carefully.', 'warn'); }
        state.running = 'v1.1';
        state.candidate = 'v1.1';
        state.committed = true;
        append('→ <commit/> ok. running ← candidate. atomic.', 'ok');
        break;
      case 'copy':
        if (state.running === state.startup) { append('! startup already matches running.', 'warn'); break; }
        state.startup = state.running;
        append('→ <copy-config source="running" target="startup"> ok. survives reboot.', 'ok');
        break;
      case 'reset':
        state = { running: 'v1.0', candidate: 'v1.0', startup: 'v1.0', edited: false, validated: false, committed: false };
        log.innerHTML = '';
        append('// idle. press edit-config to begin.', 'info');
        break;
    }
    render();
  }));
})();

})();
