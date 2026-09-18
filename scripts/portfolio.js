(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let motionEnabled = !reducedMotion.matches;
  root.classList.add("js-enabled");
  function syncMotionPreference() {
    motionEnabled = !reducedMotion.matches;
    root.classList.toggle("motion-off", !motionEnabled);
    root.classList.toggle("js-motion", motionEnabled);
    if (!motionEnabled)
      document.getAnimations().forEach((animation) => animation.cancel());
  }
  syncMotionPreference();
  reducedMotion.addEventListener("change", syncMotionPreference);

  // Start inside the lower-middle viewport, not at the bottom edge. Re-arm
  // only after an element has left below the screen so returning feels natural.
  const reveals = [...document.querySelectorAll(".reveal")];
  let revealFrame = 0;
  function updateReveals() {
    revealFrame = 0;
    if (root.classList.contains("intro-pending")) return;
    const height = window.innerHeight;
    const atEnd =
      window.scrollY + height >= document.documentElement.scrollHeight - 4;
    const bounds = reveals.map((element) => element.getBoundingClientRect());
    reveals.forEach((element, i) => {
      const rect = bounds[i];
      if (
        !motionEnabled ||
        rect.top <= height * 0.68 ||
        (atEnd && rect.top < height)
      ) {
        element.classList.add("is-visible");
      } else if (rect.top > height + 40) {
        element.classList.remove("is-visible");
      }
    });
  }
  function queueReveals() {
    if (!revealFrame) revealFrame = requestAnimationFrame(updateReveals);
  }
  window.addEventListener("scroll", queueReveals, { passive: true });
  window.addEventListener("resize", queueReveals, { passive: true });
  window.addEventListener("pageshow", queueReveals);
  document.addEventListener("portfolio:intro-ready", queueReveals);
  reducedMotion.addEventListener("change", queueReveals);
  document.addEventListener("focusin", (event) =>
    event.target.closest(".reveal")?.classList.add("is-visible"),
  );
  document.fonts?.ready.then(queueReveals);
  queueReveals();

  // The mobile menu stays out of the keyboard order while closed.
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-nav");
  const header = document.querySelector(".site-header");
  const main = document.querySelector("main");
  const skipLink = document.querySelector(".skip-link");
  let menuScrollY = 0;
  let menuExitTimer;
  function closeMenu(returnFocus = false) {
    if (!menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.inert = true;
    main.inert = false;
    skipLink.inert = false;
    root.classList.remove("nav-open");
    root.style.removeProperty("--nav-scroll-top");
    const scrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, menuScrollY);
    root.style.scrollBehavior = scrollBehavior;
    clearTimeout(menuExitTimer);
    menuExitTimer = setTimeout(() => root.classList.remove("nav-active"),
      reducedMotion.matches ? 0 : 600);
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener("click", () => {
    if (menu.classList.contains("is-open")) return closeMenu(true);
    clearTimeout(menuExitTimer);
    menuScrollY = scrollY;
    root.style.setProperty("--nav-scroll-top", `${-menuScrollY}px`);
    root.classList.add("nav-active", "nav-open");
    main.inert = true;
    skipLink.inert = true;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close navigation");
    menu.classList.add("is-open");
    menu.inert = false;
  });
  header
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", (event) => {
      if (!menu.classList.contains("is-open")) return;
      const hash = link.getAttribute("href");
      const target = hash?.startsWith("#") && document.querySelector(hash);
      if (!target) return closeMenu(true);
      // Closing makes the menu inert; navigate explicitly so Safari does not
      // cancel the link's default action when its ancestor becomes inert.
      event.preventDefault();
      closeMenu();
      if (location.hash !== hash) history.pushState(null, "", hash);
      target.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth" });
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });
    }));
  document.addEventListener("keydown", (event) => {
    if (!menu.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
    }
    if (event.key === "Tab") {
      const controls = [...header.querySelectorAll("a, button")]
        .filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  document.addEventListener("focusin", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  window
    .matchMedia("(min-width: 601px)")
    .addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });

  document.getElementById("year").textContent = new Date().getFullYear();

  const copyButton = document.querySelector(".copy-email");
  const copyStatus = document.querySelector(".copy-status");
  let copyTimeout;
  copyButton.addEventListener("click", async () => {
    clearTimeout(copyTimeout);
    try {
      await navigator.clipboard.writeText("wisdomosara@gmail.com");
      copyStatus.textContent = "EMAIL COPIED. SAY HELLO!";
    } catch {
      copyStatus.textContent = "SELECT THE EMAIL ADDRESS TO COPY IT.";
    }
    copyTimeout = setTimeout(() => {
      copyStatus.textContent = "";
    }, 4500);
  });

  const projects = {
    haven: {
      title: "Properties Haven",
      category: "PROPERTY PLATFORM",
      image: "projects/properties-haven.jpg",
      alt: "Properties Haven hero with a Nigerian property search over a waterfront skyline",
      description:
        "Property discovery across Nigeria, with natural-language search.",
      technologies: ["Next.js", "Tailwind CSS", "Express", "MongoDB", "PostHog", "AI automations"],
      url: "https://www.propertieshaven.com/",
    },
    parallel: {
      title: "Parallel",
      category: "CAREERS PLATFORM",
      image: "projects/parallel.jpg",
      alt: "Parallel hero with Find your life’s work and job search",
      description: "Helping people find work that fits.",
      technologies: ["Next.js", "Tailwind CSS", "LoopBack.js", "Node.js", "AI automations"],
      url: "https://www.useparallel.com/",
    },
    worlds: {
      title: "Worlds",
      category: "MOBILE APP + WEBSITE",
      image: "projects/worlds.jpg",
      alt: "Worlds hero with microdose humanity and early-access signup",
      description: "An iOS and Android mobile app with real-time calling, built with React Native, Express and MongoDB. The companion website is built with Next.js.",
      note: "Available on the App Store and Google Play.",
      technologies: ["React Native", "Express", "MongoDB", "Real-time calls", "Next.js (website)"],
      url: "https://wrlds.co/",
    },
    growlarge: {
      title: "GrowLarge Digital",
      category: "DIGITAL AGENCY",
      image: "projects/growlarge-digital.jpg",
      alt: "GrowLarge Digital agency hero over an elephant landscape",
      description: "A digital agency spanning brand, web, and marketing.",
      technologies: [],
      url: "https://www.growlargedigital.com/",
    },
    portfolio: {
      title: "Wisdom Osara",
      category: "PERSONAL PORTFOLIO",
      image: "projects/wisdom-osara.jpg?v=full-hero-2",
      alt: "The new Wisdom Osara portfolio hero with his name and full stack developer headline",
      description:
        "My portfolio, built around clean design and considered motion.",
      technologies: ["HTML", "CSS", "JavaScript"],
      url: "https://wisdomosara.com/",
      note: "Preview of the new portfolio redesign.",
    },
    adventure: {
      title: "Global Adventures",
      category: "INTERACTION EXPERIMENT",
      image: "slide.jpg",
      alt: "Global Adventures interactive travel slideshow with a sunset landscape",
      description:
        "An interactive travel slideshow exploring movement and destinations.",
      technologies: ["React", "CSS animation"],
      url: "https://wisdomosara.github.io/slide",
    },
  };

  const dialog = document.querySelector(".project-dialog");
  if (typeof dialog.showModal === "function") {
    document.querySelectorAll("[data-project]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        const project = projects[link.dataset.project];
        if (!project) return;
        event.preventDefault();
        document.getElementById("dialog-title").textContent = project.title;
        document.getElementById("dialog-category").textContent =
          project.category;
        document.getElementById("dialog-description").textContent =
          project.description;
        const screenshot = document.getElementById("dialog-image");
        screenshot.src = "./assets/images/" + project.image;
        screenshot.alt = project.alt;
        document.getElementById("dialog-link").href = project.url;
        const tags = document.getElementById("dialog-tech");
        tags.hidden = project.technologies.length === 0;
        const note = document.getElementById("dialog-note");
        note.textContent = project.note || "";
        note.hidden = !project.note;
        tags.replaceChildren(
          ...project.technologies.map((technology) => {
            const tag = document.createElement("span");
            tag.textContent = technology;
            return tag;
          }),
        );
        document.body.classList.add("modal-open");
        dialog.showModal();
        dialog.scrollTop = 0;
        document.querySelector(".dialog-close").focus({ preventScroll: true });
      });
    });
    document
      .querySelector(".dialog-close")
      .addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      if (
        event.target === dialog &&
        (event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom)
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
    });
  }
})();
