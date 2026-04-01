/**
 * gallery.js — PhysicX Simulation Gallery
 * Handles: simulation data, category filtering, search, card rendering, modal
 *
 * Dependencies: shared.css, nav.js (loaded in gallery.html)
 * No external libraries required.
 */

/* ═══════════════════════════════════════════════════════════
   SIMULATION DATA
   Each entry maps to one preview-card.
   `screenshot` paths are relative to assets/screenshots/
═══════════════════════════════════════════════════════════ */
const SIMULATIONS = [
   {
     id: "login-window",
     title: "Login Window",
     desc: "A secure authentication interface that allows users to sign in to the platform, ensuring personalized access to simulations, saved progress, and user-specific features.",
     category: "general",
     badge: { text: "Authentication", cls: "badge-emerald" },
     screenshot: "../assets/screenshots/login page.png",
     
   },
   {
     id: "startup-interface",
     title: "Startup Interface",
     desc: "A visually engaging entry point featuring branding, institutional details, and a direct call-to-action to enter the simulation lab.",
     category: "general",
     badge: { text: "Entry Point", cls: "badge-pink" },
     screenshot: "../assets/screenshots/startup.png",
    
   },
   {
     id: "welcome-screen",
     title: "Welcome Screen",
     desc: "An introductory interface presenting the platform overview, objectives, and key features, designed to orient users before entering the simulation environment.",
     category: "general",
     badge: { text: "Introduction", cls: "badge-indigo" },
     screenshot: "../assets/screenshots/welcome page.png",
    
   },
   {
    id: "main-dashboard",
    title: "Simulation Dashboard",
    desc: "The central workspace providing access to physics domains, simulation statistics, navigation tools, and categorized modules for interactive exploration.",
    category: "general",
    badge: { text: "Core UI", cls: "badge-primary" },
    screenshot: "../assets/screenshots/main dashboard.png",
    
  },
  {
    id: "build-an-atom",
    title: "Build an Atom",
    desc: "An interactive simulation that allows users to construct atoms by adding protons, neutrons, and electrons, helping visualize atomic structure, isotopes, and charge balance in real time.",
    category: "nuclear-physics",
    badge: { text: "Nuclear Physics", cls: "badge-red" },
    screenshot: "../assets/screenshots/Build an Atom.png",
    
  },
  {
    id: "gravitation",
    title: "Gravitation",
    desc: "An interactive simulation exploring gravitational forces between masses, allowing users to study orbital motion, inverse-square law behavior, and the dynamics of planetary systems in real time.",
    category: "mechanics",
    badge: { text: "Mechanics", cls: "badge-orange" },
    screenshot: "../assets/screenshots/gravitation.png",
   
  },
  {
    id: "vector-addition",
    title: "Vector Addition and Subtraction",
    desc: "Visualize vector operations in 2D and 3D space. Explore resultant vectors, component decomposition, and graphical methods interactively.",
    category: "mechanics",
    badge: { text: "Mechanics", cls: "badge-blue" },
    screenshot: "assets/screenshots/vector.png",
   
  },
  {
    id: "projectile-motion",
    title: "Projectile Motion",
    desc: "Simulate projectile trajectories under gravity. Adjust launch angle, initial velocity, and height to study range and maximum height.",
    category: "mechanics",
    badge: { text: "Mechanics", cls: "badge-blue" },
    screenshot: "assets/screenshots/projectile.png",
   
  },
  {
    id: "simple-harmonic-motion",
    title: "Simple Harmonic Motion",
    desc: "Explore oscillatory systems — spring-mass and pendulum. Plot displacement, velocity, and acceleration in real time.",
    category: "mechanics",
    badge: { text: "Mechanics", cls: "badge-blue" },
    screenshot: "assets/screenshots/shm.png",
   
  },
  {
    id: "wave-interference",
    title: "Wave Interference",
    desc: "Study constructive and destructive interference of transverse and longitudinal waves. Visualize superposition in real time.",
    category: "mechanics",
    badge: { text: "Mechanics", cls: "badge-blue" },
    screenshot: "assets/screenshots/waves.png",
    
  },
  {
    id: "blackbody-radiation",
    title: "Blackbody Radiation",
    desc: "Plot Planck's radiation curves at different temperatures. Compare with classical Rayleigh-Jeans predictions and observe the ultraviolet catastrophe.",
    category: "quantum-mechanics",
    badge: { text: "Quantum Mechanics", cls: "badge-rose" },
    screenshot: "assets/screenshots/blackbody.png",
   
  },
  {
    id: "photoelectric-effect",
    title: "Photoelectric Effect",
    desc: "Simulate the photoelectric experiment. Vary light frequency and intensity, and measure stopping potential and photocurrent.",
    category: "quantum-mechanics",
    badge: { text: "Quantum Mechanics", cls: "badge-rose" },
    screenshot: "../assets/screenshots/Photoelectric effect.png",
   
  },
  {
    id: "compton-scattering",
    title: "Compton Scattering",
    desc: "Explore photon-electron scattering. Visualize how X-ray wavelength shifts with scattering angle and verify the Compton formula.",
    category: "quantum-mechanics",
    badge: { text: "Quantum Mechanics", cls: "badge-rose" },
    screenshot: "../assets/screenshots/compton effect.png",
   
  },
  {
    id: "radioactive-decay",
    title: "Radioactive Decay",
    desc: "An interactive simulation that demonstrates the process of radioactive decay, allowing users to explore half-life, decay rates, and the transformation of unstable nuclei over time.",
    category: "nuclear-physics",
    badge: { text: "Nuclear Physics", cls: "badge-red" },
    screenshot: "../assets/screenshots/Radioactive decay.png",
   
  },
  {
    id: "electric-field",
    title: "Electric Field Visualization",
    desc: "Place point charges and watch field lines and equipotential surfaces form in real time. Study Coulomb's law and field superposition.",
    category: "electromagnetism",
    badge: { text: "Electromagnetism", cls: "badge-orange" },
    screenshot: "assets/screenshots/electric-field.png",
  
  },
  {
    id: "magnetic-field-lines",
    title: "Magnetic Field Lines",
    desc: "Visualize magnetic fields around current-carrying conductors, bar magnets, and solenoids. Interact with field configurations dynamically.",
    category: "electromagnetism",
    badge: { text: "Electromagnetism", cls: "badge-orange" },
    screenshot: "assets/screenshots/magnetic-field.png",
 
  },
  {
    id: "units-measurement",
    title: "Units & Measurement",
    desc: "A practical tool for converting and analyzing physical quantities across different unit systems, helping users understand measurement standards, dimensional consistency, and real-world applications.",
    category: "tools",
    badge: { text: "Tools", cls: "badge-green" },
    screenshot: "../assets/screenshots/Unit and Measurement.png",
   
  },
  {
    id: "graph-plotter",
    title: "Graph Plotter",
    desc: "Plot any mathematical function interactively. Supports custom equations, zoom, pan, and multi-curve overlays for comparative analysis.",
    category: "tools",
    badge: { text: "Tools", cls: "badge-slate" },
    screenshot: "../assets/screenshots/3D graph plotter with different colour.png",
   
  },
  {
    id: "3d-equation-plotter",
    title: "3D Equation Plotter",
    desc: "An interactive visualization tool for plotting and analyzing three-dimensional mathematical functions, enabling users to explore surfaces, contours, and spatial relationships in real time.",
    category: "tools",
    badge: { text: "Tools", cls: "badge-slate" },
    screenshot: "../assets/screenshots/3D equation plotter.png",
  
  },
  {
    id: "scientific-calculator",
    title: "Scientific Calculator",
    desc: "A full-featured scientific calculator with history, unit conversion, and support for physics constants built right in.",
    category: "mathematics",
    badge: { text: "Mathematics", cls: "badge-slate" },
    screenshot: "assets/screenshots/calculator.png",
   
  },
];

/* ═══════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════ */
let activeCategory = "all";
let searchQuery    = "";

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

/**
 * Returns the filtered simulation list based on
 * current activeCategory and searchQuery.
 */
function getFiltered() {
  const q = searchQuery.trim().toLowerCase();
  return SIMULATIONS.filter((sim) => {
    const catMatch =
      activeCategory === "all" || sim.category === activeCategory;
    const searchMatch =
      !q ||
      sim.title.toLowerCase().includes(q) ||
      sim.desc.toLowerCase().includes(q) ||
      sim.badge.text.toLowerCase().includes(q);
    return catMatch && searchMatch;
  });
}

/**
 * Build the SVG zoom icon used in the card thumbnail overlay.
 */
function zoomIconSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="14"/>
      <line x1="8" y1="11" x2="14" y2="11"/>
    </svg>`;
}

/**
 * Build placeholder icon for cards without screenshots.
 */
function placeholderSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>`;
}

/**
 * Renders a single preview-card DOM element.
 * @param {Object} sim — simulation data object
 * @returns {HTMLElement}
 */
function buildCard(sim) {
  const card = document.createElement("article");
  card.className = "preview-card reveal";
  card.dataset.simId = sim.id;

  // Thumb
  const thumb = document.createElement("div");
  thumb.className = "preview-card__thumb";
  thumb.setAttribute("role", "button");
  thumb.setAttribute("tabindex", "0");
  thumb.setAttribute("aria-label", `Preview screenshot of ${sim.title}`);

  if (sim.screenshot) {
    const img = document.createElement("img");
    img.src   = sim.screenshot;
    img.alt   = `Screenshot: ${sim.title}`;
    img.loading = "lazy";

    // Graceful fallback to placeholder on error
    img.onerror = () => {
      thumb.innerHTML = `
        <div class="preview-card__placeholder">
          ${placeholderSVG()}
          <span>No preview available</span>
        </div>`;
    };

    const overlay = document.createElement("div");
    overlay.className = "preview-card__zoom";
    overlay.innerHTML = zoomIconSVG();

    thumb.appendChild(img);
    thumb.appendChild(overlay);
  } else {
    thumb.innerHTML = `
      <div class="preview-card__placeholder">
        ${placeholderSVG()}
        <span>No preview available</span>
      </div>`;
  }

  // Click thumbnail → open modal
  thumb.addEventListener("click", () => openModal(sim));
  thumb.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(sim);
    }
  });

  // Body
  const body = document.createElement("div");
  body.className = "preview-card__body";

  const meta = document.createElement("div");
  meta.className = "preview-card__meta";

  const badge = document.createElement("span");
  badge.className = `badge ${sim.badge.cls}`;
  badge.textContent = sim.badge.text;
  meta.appendChild(badge);

  const title = document.createElement("h3");
  title.className = "preview-card__title";
  title.textContent = sim.title;

  const desc = document.createElement("p");
  desc.className = "preview-card__desc";
  desc.textContent = sim.desc;

  const footer = document.createElement("div");
  footer.className = "preview-card__footer";

 

  body.appendChild(meta);
  body.appendChild(title);
  body.appendChild(desc);
  body.appendChild(footer);

  card.appendChild(thumb);
  card.appendChild(body);
   
  return card;
}

/* ═══════════════════════════════════════════════════════════
   RENDER
═══════════════════════════════════════════════════════════ */

/**
 * Renders filtered cards into the grid, or shows empty state.
 */
function renderGallery() {
  const grid  = document.getElementById("preview-grid");
  const count = document.getElementById("gallery-count");
  if (!grid) return;

  const sims = getFiltered();

  // Update count label
  if (count) {
    count.textContent =
      sims.length === 0
        ? "No simulations found"
        : `Showing ${sims.length} of ${SIMULATIONS.length} simulation${sims.length !== 1 ? "s" : ""}`;
  }

  // Clear existing cards (preserve empty-state if present)
  grid.innerHTML = "";

  if (sims.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty card">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>No simulations available for this filter.</p>
      </div>`;
    return;
  }

  // Build and append cards with staggered reveal delay
  const fragment = document.createDocumentFragment();
  sims.forEach((sim, i) => {
    const card = buildCard(sim);
    // Stagger first 6 cards; rest appear together
    const delayClass =
      i === 0 ? "" :
      i === 1 ? "reveal-delay-1" :
      i === 2 ? "reveal-delay-2" : "reveal-delay-3";
    if (delayClass) card.classList.add(delayClass);
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);

  // Trigger reveal animations
  requestAnimationFrame(() => observeReveal());
}

/* ═══════════════════════════════════════════════════════════
   REVEAL ANIMATION OBSERVER
═══════════════════════════════════════════════════════════ */

let _revealObserver = null;

function observeReveal() {
  const revealEls = document.querySelectorAll(".reveal:not(.visible)");
  if (!revealEls.length) return;

  if ("IntersectionObserver" in window) {
    if (_revealObserver) {
      revealEls.forEach((el) => _revealObserver.observe(el));
    } else {
      _revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              _revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach((el) => _revealObserver.observe(el));
    }
  } else {
    // Fallback: immediately show all
    revealEls.forEach((el) => el.classList.add("visible"));
  }
}

/* ═══════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════ */

let _lastFocused = null;

function openModal(sim) {
  const overlay  = document.getElementById("modal-overlay");
  const img      = document.getElementById("modal-img");
  const titleEl  = document.getElementById("modal-title-text");
  const descEl   = document.getElementById("modal-desc");
  

  if (!overlay) return;

  _lastFocused = document.activeElement;

  img.src      = sim.screenshot || "";
  img.alt      = `Screenshot: ${sim.title}`;
  titleEl.textContent = sim.title;
  descEl.textContent  = sim.desc;
  

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  // Focus close button for accessibility
  const closeBtn = document.getElementById("modal-close");
  if (closeBtn) {
    requestAnimationFrame(() => closeBtn.focus());
  }
}

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
  if (_lastFocused) {
    _lastFocused.focus();
    _lastFocused = null;
  }
}

/* ═══════════════════════════════════════════════════════════
   EVENT BINDING
═══════════════════════════════════════════════════════════ */

function bindEvents() {
  // Filter buttons
  const filterBar = document.getElementById("filter-bar");
  if (filterBar) {
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      activeCategory = btn.dataset.cat;

      // Update active class
      filterBar.querySelectorAll("[data-cat]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      renderGallery();
    });
  }

  // Search input — debounced
  const searchEl = document.getElementById("gallery-search");
  if (searchEl) {
    let _debounce = null;
    searchEl.addEventListener("input", () => {
      clearTimeout(_debounce);
      _debounce = setTimeout(() => {
        searchQuery = searchEl.value;
        renderGallery();
      }, 220);
    });
  }

  // Modal close button
  const closeBtn = document.getElementById("modal-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Modal overlay background click
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Keyboard: Escape closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */

function init() {
  bindEvents();
  renderGallery();

  // Trigger reveal for static elements (hero, filter bar)
  requestAnimationFrame(() => observeReveal());
}

// Wait for DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
