/* Respect motion preferences and pause the hero preview when it leaves view.
   An external play button stays outside the crop; native controls remain without JavaScript. */
(() => {
  const video = document.querySelector('[data-motion-preview]');
  if (!video) return;
  const toggle = document.querySelector("[data-hero-toggle]");
  if (toggle) {
    video.controls = false;
    toggle.hidden = false;
    const updateToggle = () => {
      toggle.textContent = video.paused ? "Play preview" : "Pause preview";
      toggle.setAttribute("aria-label", video.paused ? "Play InForm video preview" : "Pause InForm video preview");
    };
    toggle.addEventListener("click", () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });
    video.addEventListener("play", updateToggle);
    video.addEventListener("pause", updateToggle);
    updateToggle();
  }
  if (!("IntersectionObserver" in window)) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let userPaused = false;
  let programmaticPause = false;
  const sync = () => {
    if (visible && !document.hidden && !motion.matches && !userPaused) {
      video.play().catch(() => {});
    } else if (!video.paused) {
      programmaticPause = true;
      video.pause();
    }
  };
  video.addEventListener('pause', () => {
    if (programmaticPause) programmaticPause = false;
    else userPaused = true;
  });
  video.addEventListener('play', () => { userPaused = false; });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { threshold: 0.2 }).observe(video);
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
})();
