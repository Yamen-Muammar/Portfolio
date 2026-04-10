# Yamen Muammar — Developer Portfolio

A fast, accessible, and production-ready personal portfolio built with **vanilla HTML, CSS, and JavaScript** — deployed on **Vercel**.

🔗 **Live:** [yamenmuammar.vercel.app](https://yamenmuammar.vercel.app)

---

## ✨ Features

- **Data-driven** — all content lives in `data.json`. Update your info in one place.
- **SEO-ready** — Open Graph tags, Twitter Card, JSON-LD structured data, sitemap, robots.txt.
- **Accessible** — skip link, ARIA labels, `focus-visible` styles, `prefers-reduced-motion` support.
- **Secure** — security headers via `vercel.json` (HSTS, X-Frame-Options, CSP-ready, etc.).
- **Responsive** — mobile nav with hamburger menu, fluid typography, adaptive layout.
- **Performance** — no frameworks, lazy-loaded images, static asset caching headers.
- **Polished UX** — skeleton loaders, glitch hover effect on name, smooth scroll fade-ins.

---

## 🗂 Project Structure

```
portfolio/
├── index.html       # Main page (SEO, structure, accessibility)
├── style.css        # All styles (tokens, layout, animations, responsive)
├── script.js        # Data fetching, DOM population, mobile nav
├── data.json        # ← Edit this to update your portfolio content
├── vercel.json      # Security headers + caching config
├── robots.txt       # SEO crawler rules
├── sitemap.xml      # SEO sitemap
├── profile_pic.png  # Your profile photo (replace this)
└── favicon.ico      # Site favicon (generate at favicon.io)
```

---

## 🚀 Getting Started

### Run Locally

No build step needed. Just serve the files with any static server:

```bash
# Using Node.js (npx)
npx serve .

# Using Python
python -m http.server 8000
```

Then open `http://localhost:8000` (or the port shown).

> **Note:** Opening `index.html` directly as a `file://` URL will cause the `data.json` fetch to fail due to CORS. Always use a local server.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo in the [Vercel dashboard](https://vercel.com) for automatic deployments on every push.

---

## ✏️ Customizing Your Content

All portfolio content is in **`data.json`**. Edit it and push — no code changes needed.

```json
{
  "personal": {
    "name": "Your Name",
    "title": "Your Title",
    "bio": "Your bio...",
    "email": "you@example.com",
    "github": "https://github.com/you",
    "linkedin": "https://linkedin.com/in/you"
  },
  "skills": ["Skill 1", "Skill 2"],
  "projects": [
    {
      "title": "Project Name",
      "description": "What it does and how you built it.",
      "link": "https://github.com/you/project",
      "tags": ["Tech 1", "Tech 2"]
    }
  ]
}
```

**To add a profile photo:** replace `profile_pic.png` with your own image (keep the same filename, or update the `src` in `index.html`).

---

## 🔒 Security Headers

Configured in `vercel.json`:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Permissions-Policy` | camera, microphone, geolocation off |

---

## 📋 TODO / Roadmap

- [ ] Add favicon set (generate at [favicon.io](https://favicon.io))
- [ ] Update `sitemap.xml` and `robots.txt` with your real Vercel domain
- [ ] Add real GitHub links to all projects
- [ ] Add a contact form (e.g., [Formspree](https://formspree.io))
- [ ] Add more projects as you build them

---

## 📄 License

MIT — free to use and adapt for your own portfolio.
