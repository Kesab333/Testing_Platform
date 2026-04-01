(function () {
  const TOKEN_KEY = "physicx_jwt";
  const EMAIL_KEY = "physicx_user_email";

  function currentScriptPrefix() {
    const script = document.currentScript;
    const rawSrc = script ? script.getAttribute("src") || "" : "";
    return rawSrc.replace(/js\/nav\.js(?:\?.*)?$/, "");
  }

  function createAnchor(className, href, label) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = label;
    return link;
  }

  function createMobileItem(node) {
    const item = document.createElement("li");
    item.className = "nav-mobile-auth";
    item.appendChild(node);
    return item;
  }

  function addAuthActions() {
    const navInner = document.querySelector(".nav-inner");
    const navLinks = document.getElementById("nav-links");
    if (!navInner || !navLinks) return;

    navInner.querySelectorAll(".nav-actions").forEach((node) => node.remove());
    navLinks.querySelectorAll(".nav-mobile-auth").forEach((node) => node.remove());

    const prefix = currentScriptPrefix();
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const storedEmail = localStorage.getItem(EMAIL_KEY) || "";
    const navActions = document.createElement("div");
    navActions.className = "nav-actions";

    if (token) {
      const chip = document.createElement("span");
      chip.className = "nav-auth-chip";
      chip.textContent = storedEmail || "Authenticated";

      const dashboardLink = createAnchor("nav-auth-link", `${prefix}dashboard.html`, "Dashboard");
      const logoutButton = document.createElement("button");
      logoutButton.type = "button";
      logoutButton.className = "nav-auth-button";
      logoutButton.textContent = "Logout";
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        window.location.href = `${prefix}login.html`;
      });

      navActions.append(chip, dashboardLink, logoutButton);

      navLinks.append(
        createMobileItem(createAnchor("", `${prefix}dashboard.html`, "Dashboard")),
        createMobileItem((() => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = "Logout";
          button.addEventListener("click", () => {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(EMAIL_KEY);
            window.location.href = `${prefix}login.html`;
          });
          return button;
        })())
      );
    } else {
      navActions.append(
        createAnchor("nav-auth-link", `${prefix}login.html`, "Login"),
        createAnchor("nav-auth-button", `${prefix}register.html`, "Start Free Trial")
      );

      navLinks.append(
        createMobileItem(createAnchor("", `${prefix}login.html`, "Login")),
        createMobileItem(createAnchor("", `${prefix}register.html`, "Start Free Trial"))
      );
    }

    const hamburger = document.getElementById("nav-hamburger");
    navInner.insertBefore(navActions, hamburger || null);
  }

  function highlightActiveLink() {
    const page = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach((anchor) => {
      const normalized = (anchor.getAttribute("href") || "").split("#")[0].split("/").pop();
      if (normalized && normalized === page) {
        anchor.classList.add("active");
      }
    });
  }

  function bindNavigation() {
    const nav = document.querySelector(".site-nav");
    if (nav) {
      const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    const hamburger = document.getElementById("nav-hamburger");
    const navLinks = document.getElementById("nav-links");
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", String(open));
      });

      navLinks.querySelectorAll("a, button").forEach((node) => {
        node.addEventListener("click", () => navLinks.classList.remove("open"));
      });

      document.addEventListener("click", (event) => {
        if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
          navLinks.classList.remove("open");
        }
      });
    }
  }

  function bindReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    addAuthActions();
    highlightActiveLink();
    bindNavigation();
    bindReveal();
  });
})();
