(() => {
  document.querySelectorAll('[data-coaching-workflow]').forEach(workflow => {
    const buttons = [...workflow.querySelectorAll('[data-workflow-step]')];
    const panels = [...workflow.querySelectorAll('[data-workflow-panel]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      const selected = button.dataset.workflowStep;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      panels.forEach(panel => { panel.hidden = panel.dataset.workflowPanel !== selected; });
    }));
    const requested = new URLSearchParams(window.location.search).get('step');
    const initialStep = buttons.find(button => button.dataset.workflowStep === requested);
    if (initialStep) initialStep.click();
  });
  const form = document.querySelector('[data-demo-request]');
  if (!form) return;
  const interest = form.querySelector('[data-inquiry-interest]');
  const focus = form.querySelector('[name="focus"]');
  const agenda = document.querySelector('[data-inquiry-agenda]');
  const syncInterest = () => {
    const platform = interest.value === 'platform';
    form.querySelector('[data-inquiry-form-title]').textContent = platform ? 'Discuss a platform integration' : 'Request a coaching demo';
    form.querySelector('[data-inquiry-submit]').textContent = platform ? 'Prepare integration email' : 'Prepare demo email';
    focus.placeholder = platform ? 'Tell us about your platform and the tools you need.' : 'Tell us about your coaching and what you’d like to see.';
    const lines = platform
      ? ['Discuss your existing dashboard and user workflow.', 'Explore the analysis tools and customisation you need.', 'Talk through integration scope and commercial terms.']
      : ['Record and review a movement clip.', 'Create an explanation a client can revisit.', 'Discuss how video reviews fit your coaching offer.'];
    agenda.replaceChildren(...lines.map(text => { const item = document.createElement('li'); item.textContent = text; return item; }));
  };
  interest.addEventListener('change', syncInterest);
  document.querySelectorAll('[data-inquiry-path]').forEach(link => link.addEventListener('click', () => {
    interest.value = link.dataset.inquiryPath;
    syncInterest();
  }));
  syncInterest();
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = name => String(data.get(name) || '').trim();
    const platform = value('interest') === 'platform';
    const subject = platform ? 'INFORM platform integration enquiry' : 'INFORM coaching demo request';
    const purpose = platform ? "I'd like to discuss integrating INFORM technology into our platform." : "I'd like to arrange an INFORM coaching demo.";
    const body = `Hi Sean,\n\n${purpose}\n\nName: ${value('name')}\nEmail: ${value('email')}\nBusiness or platform: ${value('business')}\n\nWhat I'd like to explore:\n${value('focus')}\n\nPlease let me know a suitable time to talk.\n`;
    window.location.href = 'mailto:INFORMMotionAnalysis@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    const status = form.querySelector('[data-demo-request-status]');
    status.textContent = 'Send the draft from your email app. We’ll reply to arrange a meeting.';
    status.hidden = false;
  });
})();
