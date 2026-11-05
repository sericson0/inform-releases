(() => {
  const form = document.querySelector('[data-demo-request]');
  if (!form) return;
  const interest = form.querySelector('[data-inquiry-interest]');
  const focus = form.querySelector('[name="focus"]');
  const agenda = document.querySelector('[data-inquiry-agenda]');
  const syncInterest = () => {
    if (!form.querySelector('[data-inquiry-form-title]')) return;
    const platform = interest.value === 'platform';
    form.querySelector('[data-inquiry-form-title]').textContent = platform ? 'Discuss a platform integration' : 'Request a coaching demo';
    form.querySelector('[data-inquiry-submit]').textContent = 'Request a call';
    focus.placeholder = platform ? 'Tell us about your platform and the tools you need.' : 'Tell us about your coaching and what you’d like to see.';
    const lines = platform
      ? ['Discuss your existing dashboard and user workflow.', 'Explore the analysis tools and customisation you need.', 'Talk through integration scope and commercial terms.']
      : ['Record and review a movement clip.', 'Create an explanation a client can revisit.', 'Discuss how video reviews fit your coaching offer.'];
    agenda?.replaceChildren(...lines.map(text => { const item = document.createElement('li'); item.textContent = text; return item; }));
  };
  interest.addEventListener('change', syncInterest);
  document.querySelectorAll('[data-inquiry-path]').forEach(link => link.addEventListener('click', () => {
    interest.value = link.dataset.inquiryPath;
    syncInterest();
  }));
  syncInterest();
  let sending = false;
  let receipt;
  let lastPayload;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = new FormData(form);
    const value = name => String(data.get(name) || '').trim();
    const status = form.querySelector('[data-demo-request-status]');
    const button = form.querySelector('[data-inquiry-submit]');
    const fields = [...form.querySelectorAll('input, textarea, select, button')];
    sending = true;
    fields.forEach(field => { field.disabled = true; });
    button.textContent = 'Sending…';
    status.textContent = '';
    status.hidden = false;
    try {
      const payload = Object.fromEntries(['name', 'email', 'business', 'focus', 'interest', 'website'].map(name => [name, value(name)]));
      const fingerprint = JSON.stringify(payload);
      if (fingerprint !== lastPayload) { receipt = undefined; lastPayload = fingerprint; }
      if (!receipt) {
        const prepared = await fetch('https://inform-email-updates.email-updates.workers.dev/business-inquiry', {
          method: 'POST', headers: {'Content-Type': 'application/json'}, signal: AbortSignal.timeout(20000),
          body: JSON.stringify({...payload, prepare: true}),
        });
        if (!prepared.ok) throw new Error('Could not prepare sending. Please try again.');
        receipt = (await prepared.json()).receipt;
        if (!receipt) throw new Error('Could not prepare sending. Please try again.');
      }
      const response = await fetch('https://inform-email-updates.email-updates.workers.dev/business-inquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({...payload, receipt}),
      });
      if (response.status === 400) receipt = undefined;
      if (!response.ok) throw new Error(response.status === 429 ? 'Please wait a minute before trying again. Your message is still here.' : 'Could not confirm sending. Your message is still here; please try again.');
      const result = await response.json();
      if (result.status !== 'sent') throw new Error('Could not confirm sending. Please try again.');
      const heading = document.createElement('h3');
      heading.textContent = 'Your inquiry has been sent';
      const detail = document.createElement('p');
      detail.textContent = 'We will get back to you within 2–3 business days.';
      form.replaceChildren(heading, detail);
      form.setAttribute('tabindex', '-1');
      form.focus();
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' || error.name === 'TypeError'
        ? 'Could not confirm sending. Your message is still here; please try again.'
        : error.message;
      fields.forEach(field => { field.disabled = false; });
      button.textContent = 'Request a call';
      sending = false;
    }
  });
})();
