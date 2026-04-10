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

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

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

  // Document title
  document.title = `${p.name} | ${p.title}`;

  // Update canonical and OG tags dynamically (belt-and-suspenders)
  updateMeta('og:title',       `${p.name} | ${p.title}`);
  updateMeta('og:description', p.bio);

  // Nav + Hero
  document.getElementById('navName').textContent   = getInitials(p.name);
  document.getElementById('heroName').textContent  = p.name;
  document.getElementById('heroTitle').textContent = p.title;
  document.getElementById('heroBio').textContent   = p.bio;

  // About
  document.getElementById('aboutBio').textContent = p.bio;

  // Skills
  const skillsList = document.getElementById('skillsList');
  skillsList.innerHTML = '';
  data.skills.forEach(skill => {
    const span = document.createElement('span');
    span.className   = 'skill-tag';
    span.textContent = skill;
    span.setAttribute('role', 'listitem');
    skillsList.appendChild(span);
  });

  // Projects
  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = '';
  data.projects.forEach(project => {
    const card = document.createElement('article');
    card.className = 'project-card';

    const tagsHtml = project.tags?.length
      ? `<div class="project-tags" aria-label="Technologies used">
           ${project.tags.map(tag => `<span class="project-tag">${escapeHtml(tag)}</span>`).join('')}
         </div>`
      : '';

    const isExternalLink = project.link && project.link !== '#';

    card.innerHTML = `
      <h3 class="project-title">${escapeHtml(project.title)}</h3>
      ${tagsHtml}
      <p class="project-desc">${escapeHtml(project.description)}</p>
      <div class="project-links">
        ${isExternalLink
          ? `<a href="${escapeHtml(project.link)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHtml(project.title)} on GitHub">View Project →</a>`
          : `<span class="project-link-disabled">Coming Soon</span>`
        }
      </div>
    `;
    projectsList.appendChild(card);
  });

  // Contact / Social Links
  const socialLinks = document.getElementById('socialLinks');
  socialLinks.innerHTML = '';

  const socials = [
    { key: 'email',    href: `mailto:${p.email}`,   label: '✉ Email'    },
    { key: 'github',   href: p.github,               label: '⌥ GitHub'   },
    { key: 'linkedin', href: p.linkedin,             label: 'in LinkedIn' },
  ];

  socials.forEach(({ key, href, label }) => {
    if (!p[key]) return;
    const a = document.createElement('a');
    a.href  = href;
    a.textContent = label;
    a.setAttribute('aria-label', label.replace(/[✉⌥]/g, '').trim());
    if (key !== 'email') {
      a.target = '_blank';
      a.rel    = 'noopener noreferrer';
    }
    socialLinks.appendChild(a);
  });

  // Footer
  document.getElementById('footerName').textContent = p.name;
}

// ─── Skeleton Loaders ────────────────────────────────────────────────────────
function showSkeletons() {
  const skillsList = document.getElementById('skillsList');
  skillsList.innerHTML = Array(6).fill(0).map(() =>
    `<span class="skill-tag skeleton">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`
  ).join('');

  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = Array(2).fill(0).map(() =>
    `<div class="project-card skeleton-card">
       <div class="skel skel-title"></div>
       <div class="skel skel-tag"></div>
       <div class="skel skel-text"></div>
       <div class="skel skel-text short"></div>
     </div>`
  ).join('');
}

// ─── Error State ─────────────────────────────────────────────────────────────
function showError() {
  const hero = document.getElementById('heroName');
  hero.textContent  = 'Could not load data';
  hero.style.color  = '#f87171';
  hero.style.fontSize = '2rem';

  document.getElementById('skillsList').innerHTML    = '<p style="color:var(--text-secondary)">Skills unavailable.</p>';
  document.getElementById('projectsList').innerHTML  = '<p style="color:var(--text-secondary)">Projects unavailable.</p>';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
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
