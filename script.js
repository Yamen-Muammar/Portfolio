// ─── State ───────────────────────────────────────────────────────────────────
let activeCategory = 'all';
let activeView     = 'index';
let allProjects    = [];

const pointerFine   = window.matchMedia('(pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', async () => {

  // ─── Footer Year ──────────────────────────────────────────────────────────
  document.getElementById('year').textContent = new Date().getFullYear();

  // ─── Mobile Nav Toggle ────────────────────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ─── Global UI (independent of data) ─────────────────────────────────────
  initClock();
  initScrollProgress();
  initCursor();

  // ─── Skeleton Loaders ─────────────────────────────────────────────────────
  showSkeletons();

  // ─── Fetch Portfolio Data ─────────────────────────────────────────────────
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}: Could not load portfolio data`);
    const data = await response.json();

    populatePortfolio(data);

  } catch (error) {
    console.error('Portfolio data error:', error);
    showError();
  }

  // ─── Scroll Fade-In Observer ──────────────────────────────────────────────
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: '0px', threshold: 0.1 }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

});

// ─── Populate All Sections ──────────────────────────────────────────────────
function populatePortfolio(data) {
  const p = data.personal;

  document.title = `${p.name} | ${p.title}`;
  updateMeta('og:title',       `${p.name} | ${p.title}`);
  updateMeta('og:description', p.bio);

  renderHeader(p);
  renderHero(p);
  renderMarquee(data.skills || []);
  renderAbout(data.about || {});
  renderProjects(data.projects || []);
  renderGallery(data.projects || []);
  renderResume(p, data.experience || [], data.skills || [], data.languages || []);
  renderContact(p);

  document.getElementById('footerName').textContent = p.name.toUpperCase();

  initMagnetic();
}

// ─── Header ──────────────────────────────────────────────────────────────────
function renderHeader(p) {
  document.getElementById('navName').textContent = p.name.toUpperCase();

  const pill = document.getElementById('statusPill');
  const text = document.getElementById('statusText');
  if (p.availability) {
    pill.classList.remove('is-away');
    text.textContent = 'Available';
  } else {
    pill.classList.add('is-away');
    text.textContent = 'Unavailable';
  }
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function renderHero(p) {
  document.getElementById('heroEyebrow').textContent = p.heroEyebrow || '';

  // Headline: first word solid, remainder stroke-outlined + accent period
  const words = p.name.trim().split(/\s+/);
  const first = words.shift();
  const rest  = words.join(' ');
  document.getElementById('heroName').innerHTML = `
    <span class="hero-line-solid">${escapeHtml(first)}</span><br>
    <span class="hero-line-stroke">${escapeHtml(rest)}</span><span class="hero-period">.</span>
  `;

  document.getElementById('heroBio').textContent = p.bio || '';

  const caption = p.heroCaption || `FIG.01 — ${getInitials(p.name)} / ${(p.location || '').toUpperCase()}`;
  document.getElementById('heroCaption').textContent = caption;

  document.getElementById('heroBadgesList').innerHTML =
    (p.heroBadges || []).map(b => `<li role="listitem">${escapeHtml(b)}</li>`).join('');
}

// ─── Marquee ─────────────────────────────────────────────────────────────────
function renderMarquee(skills) {
  const track = document.getElementById('marqueeTrack');
  // Content duplicated once: the marq keyframe translates -50% for a seamless loop.
  const segment = skills.map(s =>
    `<span class="marquee-item">${escapeHtml(s)}</span><span class="marquee-sep">✦</span>`
  ).join('');
  track.innerHTML = segment + segment;
}

// ─── About ───────────────────────────────────────────────────────────────────
function renderAbout(about) {
  document.getElementById('aboutHeadline').textContent   = about.headline   || '';
  document.getElementById('aboutParagraph1').textContent = about.paragraph1 || '';
  document.getElementById('aboutParagraph2').textContent = about.paragraph2 || '';

  document.getElementById('aboutStats').innerHTML = (about.stats || []).map(s => `
    <div role="listitem">
      <div class="stat-value">${escapeHtml(s.value)}</div>
      <div class="stat-label">${escapeHtml(s.label)}</div>
    </div>
  `).join('');
}

// ─── Projects (Index / Grid + filters + hover preview) ──────────────────────
function renderProjects(projects) {
  allProjects = projects;

  renderProjectChips();
  initViewToggle();
  rerenderProjects();
}

function getFilteredProjects() {
  return allProjects.filter(p =>
    activeCategory === 'all' || (p.category || 'other') === activeCategory
  );
}

function renderProjectChips() {
  const categories = ['all', ...new Set(allProjects.map(p => p.category || 'other'))];
  const chips = document.getElementById('projectFilters');

  chips.innerHTML = categories.map(cat => {
    const label = cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1);
    return `<button type="button" data-hover data-category="${escapeHtml(cat)}"
              class="${cat === activeCategory ? 'is-active' : ''}">${escapeHtml(label)}</button>`;
  }).join('');

  chips.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      chips.querySelectorAll('button').forEach(b =>
        b.classList.toggle('is-active', b === btn));
      rerenderProjects();
    });
  });
}

function initViewToggle() {
  const toggle = document.getElementById('viewToggle');
  toggle.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      activeView = btn.dataset.view;
      toggle.querySelectorAll('button').forEach(b =>
        b.classList.toggle('is-active', b === btn));
      rerenderProjects();
    });
  });
}

function rerenderProjects() {
  const filtered = getFilteredProjects();
  renderIndexView(filtered);
  renderGridView(filtered);
  renderProjectCount(filtered.length, allProjects.length);

  document.getElementById('projectsIndexView').classList.toggle('is-hidden', activeView !== 'index');
  document.getElementById('projectsGridView').classList.toggle('is-hidden', activeView !== 'grid');
}

function renderProjectCount(shown, total) {
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('projectCount').textContent = `${pad(shown)} / ${pad(total)} PROJECTS`;
}

function renderIndexView(projects) {
  const container = document.getElementById('projectsIndexView');

  const head = `
    <div class="index-head" aria-hidden="true">
      <span>NO.</span><span>PROJECT</span><span>YEAR</span>
      <span class="head-stack">STACK</span><span class="head-type">TYPE</span><span></span>
    </div>`;

  const rows = projects.map((p, i) => {
    const hasLink = p.link && p.link !== '#';
    const inner = `
      <span class="index-no">${String(i + 1).padStart(2, '0')}</span>
      <span class="index-name">${escapeHtml(p.title)}</span>
      <span class="index-year">${escapeHtml(p.year || '—')}</span>
      <span class="index-stack">${escapeHtml(p.stack || '—')}</span>
      ${p.type ? `<span class="type-pill">${escapeHtml(p.type)}</span>` : '<span></span>'}
      ${hasLink ? '<span class="index-arrow" aria-hidden="true">↗</span>' : '<span class="coming-soon">Soon</span>'}
    `;
    return hasLink
      ? `<a class="index-row" data-idx="${i}" data-hover href="${escapeHtml(p.link)}" target="_blank" rel="noopener noreferrer"
           aria-label="View ${escapeHtml(p.title)} on GitHub">${inner}</a>`
      : `<div class="index-row" data-idx="${i}">${inner}</div>`;
  }).join('');

  container.innerHTML = head + rows;

  initHoverPreview(container, projects);
}

function renderGridView(projects) {
  const container = document.getElementById('projectsGridView');

  container.innerHTML = projects.map(p => {
    const hasLink = p.link && p.link !== '#';
    const inner = `
      <div class="grid-card-bar" aria-hidden="true"></div>
      <div class="grid-card-top">
        <span class="grid-card-name">${escapeHtml(p.title)}</span>
        <span class="grid-card-year">${escapeHtml(p.year || '—')}</span>
      </div>
      <p class="grid-card-blurb">${escapeHtml(p.blurb || p.description || '')}</p>
      <div class="grid-card-stack">${escapeHtml(p.stack || '—')}</div>
    `;
    return hasLink
      ? `<a class="grid-card" data-hover href="${escapeHtml(p.link)}" target="_blank" rel="noopener noreferrer"
           aria-label="View ${escapeHtml(p.title)} on GitHub">${inner}</a>`
      : `<div class="grid-card">${inner}</div>`;
  }).join('');
}

// Floating preview card that follows the cursor over index rows (desktop only)
function initHoverPreview(container, projects) {
  if (!pointerFine) return;

  const preview = document.getElementById('projectPreview');

  container.querySelectorAll('.index-row[data-idx]').forEach(row => {
    row.addEventListener('mouseenter', () => {
      const p = projects[+row.dataset.idx];
      if (!p) return;
      preview.innerHTML = `
        <div class="preview-meta">${String(+row.dataset.idx + 1).padStart(2, '0')} — ${escapeHtml(p.type || '')}</div>
        <div class="preview-name">${escapeHtml(p.title)}</div>
        <p class="preview-blurb">${escapeHtml(p.blurb || p.description || '')}</p>
        <div class="preview-stack">${escapeHtml(p.stack || '')}</div>
      `;
      preview.classList.add('is-visible');
    });
    row.addEventListener('mousemove', e => {
      preview.style.transform = `translate(${e.clientX}px, ${e.clientY - 16}px) translate(-50%, -100%)`;
    });
    row.addEventListener('mouseleave', () => {
      preview.classList.remove('is-visible');
    });
  });
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
// A status counts as "finished" when it contains one of these words
function isDoneStatus(status) {
  return /\b(done|live|complete|completed|shipped|released|finished)\b/i.test(status || '');
}

function renderGallery(projects) {
  const list = document.getElementById('galleryList');
  // Only finished projects appear in the screenshots area
  const galleryProjects = projects.filter(p =>
    isDoneStatus(p.status) && ((p.screens && p.screens.length) || p.screenSlots));

  if (!galleryProjects.length) {
    document.getElementById('gallery').classList.add('is-hidden');
    return;
  }
  document.getElementById('gallery').classList.remove('is-hidden');

  list.innerHTML = galleryProjects.map(p => {
    const hasLink = p.link && p.link !== '#';
    // Done statuses render green with a steady dot
    const isDone = isDoneStatus(p.status);
    const statusHtml = p.status
      ? `<span class="gallery-status${isDone ? ' is-done' : ''}"><span class="status-dot" aria-hidden="true"></span>${escapeHtml(p.status)}</span>`
      : `<span class="gallery-stack">${escapeHtml(p.stack || '')}</span>`;
    const repoHtml = hasLink
      ? `<a class="gallery-repo-link" data-hover href="${escapeHtml(p.link)}" target="_blank" rel="noopener noreferrer">View repo ↗</a>`
      : '';

    let cards;
    if (p.screens && p.screens.length) {
      cards = p.screens.map(s => browserWindow(
        `${escapeHtml(s.id || '')} — ${escapeHtml(p.title)}`,
        `<img class="browser-screen" loading="lazy" src="${escapeHtml(s.src)}" alt="${escapeHtml(s.alt || `${p.title} screenshot`)}">`
      )).join('');
    } else {
      const slots = Math.max(p.screenSlots || (p.screens && p.screens.length) || 2, 1);
      cards = Array.from({ length: slots }, () => browserWindow(
        escapeHtml(p.title),
        '<div class="screen-placeholder">SCREENS COMING SOON</div>'
      )).join('');
    }

    return `
      <div class="gallery-block">
        <div class="gallery-block-header">
          <h3 class="gallery-block-title">${escapeHtml(p.title)}</h3>
          ${statusHtml}
          ${repoHtml}
        </div>
        <div class="gallery-grid">${cards}</div>
      </div>
    `;
  }).join('');
}

// label/content are pre-escaped by callers
function browserWindow(label, content) {
  return `
    <div class="browser-window" data-hover>
      <div class="browser-titlebar">
        <span class="browser-dots" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="browser-label">${label}</span>
        <span class="browser-chrome" aria-hidden="true">─ ☐ ✕</span>
      </div>
      ${content}
    </div>
  `;
}

// ─── Résumé ──────────────────────────────────────────────────────────────────
function renderResume(p, experience, skills, languages) {
  // CV button: real download link when resumeUrl is set, otherwise "Coming soon"
  const cta = document.getElementById('resumeCta');
  cta.innerHTML = p.resumeUrl
    ? `<a class="btn-pill btn-solid" data-hover data-mag href="${escapeHtml(p.resumeUrl)}" target="_blank" download>Download CV <span aria-hidden="true">↓</span></a>`
    : `<span class="btn-pill btn-disabled" aria-disabled="true">CV coming soon</span>`;

  document.getElementById('experienceList').innerHTML = experience.map(job => `
    <div class="timeline-entry" role="listitem">
      <span class="timeline-period">${escapeHtml(job.period)}</span>
      <div>
        <div class="timeline-role">${escapeHtml(job.role)}</div>
        <div class="timeline-company">${escapeHtml(job.company)}</div>
        <p class="timeline-note">${escapeHtml(job.note)}</p>
      </div>
    </div>
  `).join('');

  document.getElementById('stackToolsList').innerHTML = skills.map(s =>
    `<span class="tool-pill" role="listitem" data-hover>${escapeHtml(s)}</span>`
  ).join('');

  document.getElementById('languagesList').innerHTML = languages.map(l => `
    <div class="lang-row" role="listitem">
      <span>${escapeHtml(l.name)}</span>
      <span class="lang-level">${escapeHtml(l.level)}</span>
    </div>
  `).join('');
}

// ─── Contact ─────────────────────────────────────────────────────────────────
function renderContact(p) {
  const email = document.getElementById('contactEmail');
  email.href = `mailto:${p.email}`;
  email.textContent = `${p.email} ↗`;

  const links = [
    { label: 'GitHub',    href: p.github,   external: true  },
   //{ label: 'LinkedIn →',  href: p.linkedin, external: true  },
    //{ label: 'Email,',     href: p.email ? `mailto:${p.email}` : '' },
   // { label: p.phone ? `${p.phone} .` : '', href: p.phone ? `tel:${p.phone.replace(/\s/g, '')}` : '' },
  ];

  const row = document.getElementById('contactLinksRow');
  row.innerHTML = '';
  links.forEach(({ label, href, external }) => {
    if (!href || !label) return; // omit any link whose data.json field is empty
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    a.setAttribute('data-hover', '');
    if (external) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    row.appendChild(a);
  });
}

// ─── Live Clock (Gaza time, header + footer) ────────────────────────────────
function initClock() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Gaza',
  });
  const tick = () => {
    const t = fmt.format(new Date());
    document.getElementById('headerClock').textContent = `${t} GAZA`;
    document.getElementById('footerClock').textContent = `${t} / GAZA`;
  };
  tick();
  setInterval(tick, 15000);
}

// ─── Scroll Progress + Header Background ────────────────────────────────────
function initScrollProgress() {
  const bar    = document.getElementById('scrollProgress');
  const header = document.getElementById('siteHeader');
  let scheduled = false;

  const update = () => {
    scheduled = false;
    const h   = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    header.classList.toggle('is-scrolled', h.scrollTop > 40);
  };

  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

// ─── Custom Cursor (desktop only) ───────────────────────────────────────────
function initCursor() {
  // JS-driven transforms bypass the CSS reduced-motion override, so gate here too.
  if (!pointerFine || reducedMotion) return;

  document.body.classList.add('has-cursor');
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  const lerp  = { x: mouse.x, y: mouse.y };

  window.addEventListener('pointermove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });

  window.addEventListener('pointerover', e => {
    const hov = e.target.closest && e.target.closest('[data-hover], a, button');
    ring.classList.toggle('is-hovering', !!hov);
  });

  const loop = () => {
    lerp.x += (mouse.x - lerp.x) * 0.18;
    lerp.y += (mouse.y - lerp.y) * 0.18;
    ring.style.transform = `translate(${lerp.x}px, ${lerp.y}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// ─── Magnetic Buttons ────────────────────────────────────────────────────────
function initMagnetic() {
  if (!pointerFine || reducedMotion) return;

  document.querySelectorAll('[data-mag]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const b  = el.getBoundingClientRect();
      const dx = (e.clientX - (b.left + b.width / 2)) * 0.3;
      const dy = (e.clientY - (b.top + b.height / 2)) * 0.3;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

// ─── Skeleton Loaders ────────────────────────────────────────────────────────
function showSkeletons() {
  document.getElementById('projectsIndexView').innerHTML = Array(3).fill(0).map(() =>
    `<div class="skeleton-card">
       <div class="skel skel-title"></div>
       <div class="skel skel-tag"></div>
       <div class="skel skel-text"></div>
       <div class="skel skel-text short"></div>
     </div>`
  ).join('');

  document.getElementById('stackToolsList').innerHTML = Array(6).fill(0).map(() =>
    `<span class="tool-pill skeleton">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`
  ).join('');
}

// ─── Error State ─────────────────────────────────────────────────────────────
function showError() {
  const hero = document.getElementById('heroName');
  hero.textContent = 'Could not load data';
  hero.style.fontSize = '2rem';
  hero.style.color = 'var(--accent)';

  document.getElementById('projectsIndexView').innerHTML = '<p style="color:var(--muted)">Projects unavailable.</p>';
  document.getElementById('stackToolsList').innerHTML    = '<p style="color:var(--muted)">Skills unavailable.</p>';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
// SECURITY: every data.json value interpolated into innerHTML must pass through
// escapeHtml(). Values written via textContent don't need it (never parsed as HTML).
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function updateMeta(property, content) {
  const el = document.querySelector(`meta[property="${property}"]`);
  if (el) el.setAttribute('content', content);
}
