/* Respect motion preferences and pause the hero preview when it leaves view.
   Tap/click the video or use Enter/Space to toggle playback; native controls remain without JavaScript. */
(() => {
  const video = document.querySelector('[data-motion-preview]');
  if (!video) return;
  video.controls = false;
  video.setAttribute("role", "button");
  video.setAttribute("tabindex", "0");
  const updateLabel = () => video.setAttribute("aria-label", video.paused
    ? "Play INFORM video preview" : "Pause INFORM video preview");
  const togglePlayback = () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };
  video.addEventListener("click", togglePlayback);
  video.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      togglePlayback();
    }
  });
  video.addEventListener("play", updateLabel);
  video.addEventListener("pause", updateLabel);
  updateLabel();
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
