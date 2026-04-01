/**
 * documentation.js
 * PhysicX documentation page — interactive behaviours
 *
 * Features:
 *   - Active sidebar link tracking (IntersectionObserver)
 *   - Smooth-scroll on sidebar link click
 *   - Mobile sidebar toggle
 *   - Live search / filter of documentation sections
 *   - Code block copy-to-clipboard
 *   - Pagination (prev / next section)
 *   - Keyboard shortcut (Cmd/Ctrl + K) to focus search
 */

(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════
     CONSTANTS
  ═══════════════════════════════════════════════════ */

  const SECTIONS_ORDER = [
    "introduction",
    "system-requirements",
    "installation",
    "getting-started",
    "simulations",
    "graph-plotter",
    "scientific-calculator",
    "vector-visualization",
    "troubleshooting",
    "faq",
    "api-reference",
  ];

  /* ═══════════════════════════════════════════════════
     DOM REFERENCES
  ═══════════════════════════════════════════════════ */

  const sidebarLinks   = document.querySelectorAll(".doc-sidebar__link");
  const sidebarToggle  = document.getElementById("sidebar-toggle");
  const sidebarNav     = document.getElementById("sidebar-nav");
  const searchInput    = document.getElementById("doc-search-input");
  const searchResults  = document.getElementById("search-results");
  const docSections    = document.querySelectorAll("[data-doc-section]");
  const copyButtons    = document.querySelectorAll(".doc-code-block__copy");
  const prevBtn        = document.getElementById("doc-prev");
  const nextBtn        = document.getElementById("doc-next");

  let currentSectionIndex = 0;

  /* ═══════════════════════════════════════════════════
     SECTION INDEX (flat text for search)
  ═══════════════════════════════════════════════════ */

  const searchIndex = Array.from(docSections).map((section) => {
    const id       = section.id;
    const titleEl  = section.querySelector(".doc-section__title");
    const bodyEl   = section.querySelector(".doc-section__body");
    const title    = titleEl ? titleEl.textContent.trim() : id;
    const text     = bodyEl  ? bodyEl.textContent.replace(/\s+/g, " ").trim() : "";
    return { id, title, text };
  });

  /* ═══════════════════════════════════════════════════
     ACTIVE SIDEBAR TRACKING (IntersectionObserver)
  ═══════════════════════════════════════════════════ */

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -65% 0px",
    threshold: 0,
  };

  const activateLink = (id) => {
    sidebarLinks.forEach((link) => {
      const active = link.getAttribute("data-section") === id;
      link.classList.toggle("doc-sidebar__link--active", active);
      if (active) {
        currentSectionIndex = SECTIONS_ORDER.indexOf(id);
        updatePagination();
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activateLink(entry.target.id);
      }
    });
  }, observerOptions);

  docSections.forEach((section) => observer.observe(section));

  /* ═══════════════════════════════════════════════════
     SIDEBAR LINK — SMOOTH SCROLL
  ═══════════════════════════════════════════════════ */

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        // Close sidebar on mobile after click
        if (window.innerWidth <= 900) {
          sidebarNav.classList.remove("is-open");
          sidebarToggle.setAttribute("aria-expanded", "false");
        }
      }
    });
  });

  /* ═══════════════════════════════════════════════════
     MOBILE SIDEBAR TOGGLE
  ═══════════════════════════════════════════════════ */

  if (sidebarToggle && sidebarNav) {
    sidebarToggle.addEventListener("click", () => {
      const isOpen = sidebarNav.classList.toggle("is-open");
      sidebarToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /* ═══════════════════════════════════════════════════
     SEARCH
  ═══════════════════════════════════════════════════ */

  // Cmd/Ctrl + K shortcut
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
    if (e.key === "Escape" && searchInput === document.activeElement) {
      searchInput.blur();
      clearSearch();
    }
  });

  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) renderSearchResults(searchInput.value.trim());
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".doc-search")) {
        searchResults.hidden = true;
      }
    });
  }

  function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      clearSearch();
      return;
    }
    renderSearchResults(query);
    filterSections(query);
  }

  function renderSearchResults(query) {
    const matches = searchIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      searchResults.innerHTML = `<div class="doc-search__no-results">No results for "<strong>${escapeHtml(query)}</strong>"</div>`;
    } else {
      searchResults.innerHTML = matches
        .slice(0, 6)
        .map((item) => {
          const excerptIdx = item.text.toLowerCase().indexOf(query);
          let excerpt = "";
          if (excerptIdx !== -1) {
            const start = Math.max(0, excerptIdx - 30);
            excerpt = (start > 0 ? "…" : "") + item.text.slice(start, excerptIdx + query.length + 60) + "…";
          }
          return `
            <a href="#${item.id}" class="doc-search__result-item" data-result="${item.id}">
              <span class="doc-search__result-title">${highlightMatch(item.title, query)}</span>
              ${excerpt ? `<span class="doc-search__result-excerpt">${highlightMatch(escapeHtml(excerpt), query)}</span>` : ""}
            </a>
          `;
        })
        .join("");

      // Attach click handlers
      searchResults.querySelectorAll("[data-result]").forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const id = link.getAttribute("data-result");
          const target = document.getElementById(id);
          if (target) {
            clearSearch();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    }

    searchResults.hidden = false;
  }

  function filterSections(query) {
    docSections.forEach((section) => {
      const item = searchIndex.find((s) => s.id === section.id);
      if (!item) return;
      const match =
        item.title.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query);
      section.classList.toggle("search-hidden", !match);
    });
  }

  function clearSearch() {
    searchResults.hidden = true;
    searchResults.innerHTML = "";
    docSections.forEach((section) => {
      section.classList.remove("search-hidden");
    });
  }

  function highlightMatch(text, query) {
    const escaped = escapeHtml(text);
    const re = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return escaped.replace(re, '<mark style="background:color-mix(in srgb,var(--clr-accent) 25%,transparent);border-radius:2px;padding:0 1px;">$1</mark>');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* ═══════════════════════════════════════════════════
     COPY TO CLIPBOARD
  ═══════════════════════════════════════════════════ */

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const block   = btn.closest(".doc-code-block");
      const codeEl  = block ? block.querySelector("code") : null;
      if (!codeEl) return;

      const text = codeEl.innerText || codeEl.textContent;

      try {
        await navigator.clipboard.writeText(text);
        const original = btn.innerHTML;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied!
        `;
        btn.style.color = "#10b981";
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.color = "";
        }, 2000);
      } catch {
        btn.textContent = "Failed";
        setTimeout(() => (btn.textContent = "Copy"), 1500);
      }
    });
  });

  /* ═══════════════════════════════════════════════════
     PAGINATION
  ═══════════════════════════════════════════════════ */

  function updatePagination() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = currentSectionIndex <= 0;
    nextBtn.disabled = currentSectionIndex >= SECTIONS_ORDER.length - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const idx = Math.max(0, currentSectionIndex - 1);
      scrollToSection(SECTIONS_ORDER[idx]);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const idx = Math.min(SECTIONS_ORDER.length - 1, currentSectionIndex + 1);
      scrollToSection(SECTIONS_ORDER[idx]);
    });
  }

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  updatePagination();

  /* ═══════════════════════════════════════════════════
     REVEAL ANIMATION (lightweight fallback if shared.css
     doesn't cover IntersectionObserver reveal)
  ═══════════════════════════════════════════════════ */

  const revealEls = document.querySelectorAll(".reveal:not(.doc-sidebar)");
  if ("IntersectionObserver" in window && revealEls.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ═══════════════════════════════════════════════════
     HASH NAVIGATION on page load
  ═══════════════════════════════════════════════════ */

  window.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  });

})();
