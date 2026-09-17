(() => {
  "use strict";
  const root = document.documentElement;
  const screen = document.querySelector(".intro-screen");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!root.classList.contains("intro-pending") || reduced.matches) {
    root.classList.remove("intro-pending");
    root.classList.add("hero-enter");
    screen?.remove();
    document.dispatchEvent(new Event("portfolio:intro-ready"));
    return;
  }

  const skip = screen.querySelector(".intro-skip");
  const skipLink = document.querySelector(".skip-link");
  const previousRestoration = history.scrollRestoration;
  const pageRegions = [
    document.querySelector(".site-header"),
    document.querySelector("main"),
  ];
  let done = false;
  let holdTimer;
  let exitTimer;
  history.scrollRestoration = "manual";
  pageRegions.forEach((region) => {
    region.inert = true;
    region.setAttribute("data-intro-inert", "");
  });
  skipLink.setAttribute("tabindex", "-1");
  window.scrollTo(0, 0);
  skip.focus({ preventScroll: true });

  function cleanUp() {
    clearTimeout(holdTimer);
    clearTimeout(exitTimer);
    history.scrollRestoration = previousRestoration;
    pageRegions.forEach((region) => {
      region.inert = false;
      region.removeAttribute("data-intro-inert");
    });
    skipLink.removeAttribute("tabindex");
    document.removeEventListener("keydown", onKeydown);
    window.removeEventListener("hashchange", finish);
    reduced.removeEventListener("change", onMotionChange);
  }
  function finish() {
    if (done) return;
    done = true;
    const moveFocus = screen.contains(document.activeElement);
    cleanUp();
    root.classList.remove("intro-pending", "intro-leaving");
    root.classList.add("hero-enter");
    screen.remove();
    if (moveFocus && (!location.hash || location.hash === "#home"))
      document.getElementById("hero-title").focus({ preventScroll: true });
    document.dispatchEvent(new Event("portfolio:intro-ready"));
  }
  function onKeydown(event) {
    if (event.key === "Escape") finish();
    if (event.key === "Tab") {
      event.preventDefault();
      skip.focus({ preventScroll: true });
    }
  }
  function onMotionChange() {
    if (reduced.matches) finish();
  }
  skip.addEventListener("click", finish);
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("hashchange", finish);
  reduced.addEventListener("change", onMotionChange);
  screen.addEventListener("animationend", (event) => {
    if (
      event.target === screen.querySelector(".intro-panels span:last-child") &&
      event.animationName === "intro-panel-away"
    )
      finish();
  });
  // The emergency head-script fallback also restores all interaction and focus.
  document.addEventListener(
    "portfolio:intro-ready",
    () => {
      if (!done) {
        done = true;
        cleanUp();
        document.getElementById("hero-title").focus({ preventScroll: true });
      }
    },
    { once: true },
  );

  Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 250)),
  ]).then(() => {
    if (done) return;
    holdTimer = setTimeout(() => {
      if (done) return;
      root.classList.add("intro-leaving");
      // A bounded fallback covers browsers that don't dispatch animationend.
      exitTimer = setTimeout(finish, 1450);
    }, 650);
  });
})();
