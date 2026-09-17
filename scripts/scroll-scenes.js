(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const roomy = matchMedia("(min-width: 901px) and (min-height: 650px)");
  const cards = [...document.querySelectorAll(".work-track .project-card")];
  const track = document.querySelector(".work-track");
  const stages = [...document.querySelectorAll(".process-scene")];
  const statementLines = [
    ...document.querySelectorAll(".about-statement > span"),
  ];
  const hero = document.querySelector(".hero");
  const contact = document.querySelector(".contact-section");
  const contactTitle = document.querySelector(".contact-hero");
  const clamp = (value) => Math.max(0, Math.min(1, value));
  let frame = 0;
  let motion = false;
  let pinned = false;

  function render() {
    frame = 0;
    if (!motion || document.hidden) return;
    const height = innerHeight;
    // Batch geometry reads before writes; native scrolling remains untouched.
    const cardRects = cards.map((card) => card.getBoundingClientRect());
    const stageRects = stages.map((stage) => stage.getBoundingClientRect());
    const lineRects = statementLines.map((line) =>
      line.getBoundingClientRect(),
    );
    const heroRect = hero.getBoundingClientRect();
    const contactRect = contactTitle.getBoundingClientRect();
    cards.forEach((card, i) => {
      const next = cardRects[i + 1];
      const overlap =
        pinned && next
          ? clamp((height * 0.72 - next.top) / (height * 0.72 - 90))
          : 0;
      const link = card.querySelector(".project-link");
      link.style.setProperty("--stack-scale", 1 - overlap * 0.065);
      link.style.setProperty(
        "--stack-rotate",
        `${overlap * (i % 2 ? 0.7 : -0.7)}deg`,
      );
      link.style.setProperty("--stack-light", 1 - overlap * 0.16);
      card.style.setProperty(
        "--image-scale",
        1.035 -
          clamp((height * 0.7 - cardRects[i].top) / (height * 0.5)) * 0.035,
      );
    });
    statementLines.forEach((line, i) =>
      line.style.setProperty(
        "--line-fill",
        clamp((height * 0.68 - lineRects[i].top) / (height * 0.43)),
      ),
    );
    stages.forEach((stage, i) =>
      stage.style.setProperty(
        "--step-fill",
        clamp((height * 0.68 - stageRects[i].top) / (height * 0.43)),
      ),
    );
    hero.style.setProperty(
      "--hero-drift",
      clamp(-heroRect.top / heroRect.height),
    );
    contact.style.setProperty(
      "--contact-progress",
      clamp((height * 0.68 - contactRect.top) / (height * 0.43)),
    );
  }
  function schedule() {
    if (motion && !frame) frame = requestAnimationFrame(render);
  }
  function configure() {
    motion = !reduced.matches;
    pinned = motion && roomy.matches;
    root.classList.toggle("scroll-motion", motion);
    root.classList.toggle("scroll-scenes", pinned);
    if (!motion) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    cards.forEach((card) => {
      card.querySelector(".project-link").style.removeProperty("--stack-scale");
      card
        .querySelector(".project-link")
        .style.removeProperty("--stack-rotate");
      card.querySelector(".project-link").style.removeProperty("--stack-light");
    });
    schedule();
  }
  // Keyboard focus on a covered card brings its natural position back into view.
  cards.forEach((card, index) =>
    card.addEventListener("focusin", (event) => {
      if (!pinned || !event.target.matches(":focus-visible")) return;
      const gap = parseFloat(getComputedStyle(track).rowGap) || 0;
      const before = cards
        .slice(0, index)
        .reduce((sum, item) => sum + item.offsetHeight + gap, 0);
      const target =
        scrollY +
        track.getBoundingClientRect().top +
        before -
        (30 + index * 10);
      window.scrollTo({ top: target, behavior: "smooth" });
    }),
  );
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pageshow", configure);
  document.addEventListener("visibilitychange", schedule);
  document.addEventListener("portfolio:intro-ready", schedule);
  reduced.addEventListener("change", configure);
  roomy.addEventListener("change", configure);
  document.fonts?.ready.then(schedule);
  configure();
})();
