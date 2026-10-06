/* Respect motion preferences and pause the hero preview when it leaves view.
   Native video controls remain available, including without JavaScript. */
(() => {
  const video = document.querySelector('[data-motion-preview]');
  if (!video || !('IntersectionObserver' in window)) return;
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
