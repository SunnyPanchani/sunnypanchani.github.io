# Sunny Panchani — Engineering Portfolio

Personal engineering portfolio website built with HTML5, CSS3, JavaScript, Bootstrap 5, Three.js, and GSAP.
Hosted on GitHub Pages (no backend, no build step required).

---

## Folder Structure

```
portfolio/
├── index.html                  ← Main single-page site (all sections)
├── css/
│   ├── style.css               ← All main styles + design tokens
│   └── project.css             ← Project detail page styles
├── js/
│   ├── three-scene.js          ← Three.js hero background
│   ├── calculators.js          ← 8 engineering calculators + contact form
│   └── main.js                 ← Navbar, loader, animations, scroll spy
├── assets/
│   └── images/                 ← Add your photos here (see checklist below)
├── docs/
│   └── Sunny_Panchani_CV.pdf  ← Place your resume PDF here
└── projects/
    ├── induction-heating.html  ← Project detail page (template)
    ├── hydraulic-grinding.html ← Duplicate template + customise
    ├── glass-chamfering.html
    ├── tct-grinding.html
    └── woodworking-spm.html
```

---

## Deploy to GitHub Pages — Step by Step

1. Create a new GitHub repository named: `sunnypanchani.github.io`
   (or any name — if not your username.github.io, site will be at `username.github.io/repo-name`)

2. Upload all files maintaining the folder structure above.

3. Go to: **Repository → Settings → Pages**

4. Under **Source**, select: `Deploy from a branch`

5. Branch: `main` / `master` — Folder: `/ (root)`

6. Click **Save**. Site goes live in 2–5 minutes at:
   `https://sunnypanchani.github.io`

---

## Content You Must Add Before Going Live

### CRITICAL — Without these, the site has placeholders:

| What | Where to put it | What to do in HTML |
|---|---|---|
| Your photo | `assets/images/sunny-panchani.jpg` | In `#about`, replace `.about-img-placeholder` div with `<img src="assets/images/sunny-panchani.jpg" alt="Sunny Panchani" />` |
| Resume PDF | `docs/Sunny_Panchani_CV.pdf` | Already linked. Just drop the file here. |
| Project photos | `assets/images/projects/` | In each project card: replace `.proj-img-placeholder` div with `<img src="assets/images/projects/XXX.jpg" alt="..." />` |

### RECOMMENDED — Each project detail page needs:

- 4–6 actual photos per project (CAD screenshots, fabrication, assembled, commissioned)
- Real project description replacing the placeholder text
- Actual metrics (fill in the "Key Results" sidebar card)

### HOW to add a new project card to `index.html`:

Copy any existing `<article class="project-card">` block and update:
- Tags, company, year, title, description, metrics
- `href` on the `.proj-cta` link to point to the new project HTML file

### HOW to create a new project detail page:

1. Copy `projects/induction-heating.html`
2. Rename to match your project
3. Update: hero tags, title, subtitle, sidebar spec card, all section content
4. Add images to gallery, replacing `.gallery-placeholder` divs
5. Update the `proj-nav-row` links at the bottom

---

## What Each Calculator Computes

| Calculator | Formula |
|---|---|
| Bolt Torque | T = K × F × d |
| Pneumatic Force | F = P × π × D² / 4 |
| Hydraulic Force | F = P × π × D² / 4 (higher pressure range) |
| Motor Power | P = 2π × N × T / 60 |
| Gear Ratio | i = Z₂/Z₁, N₂ = N₁/i |
| Pulley Speed | N₂ = N₁ × D₁/D₂ |
| Bearing L10 Life | L10h = (C/P)^n × 10⁶ / 60n (ISO 281) |
| Beam Deflection | δ = F × L³ / (48 × E × I) |

---

## Phase 2 (future additions)

- [ ] `projects/hydraulic-grinding.html` — fill content
- [ ] `projects/glass-chamfering.html` — fill content
- [ ] `projects/tct-grinding.html` — fill content
- [ ] `projects/woodworking-spm.html` — fill content
- [ ] Engineering Blog — use Jekyll or add static HTML posts under `/blog/`
- [ ] 3D CAD Viewer — export SolidWorks assemblies to `.gltf` via SimLab or Keyshot, load with Three.js GLTFLoader
- [ ] Dark/Light mode toggle — CSS custom property swap
- [ ] AI/Robotics section — add deployed Python project screenshots and links

---

## Customisation Quick Reference

**Change primary color:**
In `css/style.css`, update `--color-primary: #2563eb;` to any hex.

**Change fonts:**
Update Google Fonts link in `<head>` of `index.html` and the `--font-display` / `--font-body` variables in `style.css`.

**Add a new section:**
- Add a `<section id="your-section">` block in `index.html`
- Add a nav link `<a href="#your-section">` in the navbar
- Style in `style.css`

**Disable Three.js:**
Comment out `<script src="js/three-scene.js"></script>` in `index.html`.
The hero will fall back to the CSS grid background only.

---

## Browser Support

- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 15+ ✓
- Edge 90+ ✓
- Mobile browsers: Three.js is disabled below 768px viewport width for performance.
  All other features work on mobile.

---

## Credits / CDN Libraries Used

| Library | Version | Purpose |
|---|---|---|
| Bootstrap | 5.3.0 | Grid + navbar collapse |
| Three.js | r128 | Hero 3D background |
| GSAP | 3.12.2 | Entrance + scroll animations |
| ScrollTrigger | 3.12.2 | GSAP scroll triggers |
| AOS | 2.3.1 | Section reveal animations |
| Font Awesome | 6.4.0 | Icons |
| Google Fonts | — | Space Grotesk, Inter, JetBrains Mono |

All CDN — no npm, no build step, no Node.js required.
