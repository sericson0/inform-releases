(() => {
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('main-navigation');
  if (!toggle || !navigation) return;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      if (navigation.contains(document.activeElement)) toggle.focus();
      setOpen(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('header')) setOpen(false);
  });
  window.matchMedia('(max-width: 800px)').addEventListener('change', () => setOpen(false));
})();
