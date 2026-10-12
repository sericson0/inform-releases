(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const space = /^\/space(?:\/|\.html|$)/.test(location.pathname);
  const type = space ? (params.get('kind') === 'project' ? 'project' : 'partner') : 'class';
  const validKind = space ? (!params.has('kind') || params.get('kind') === 'project') : !params.has('kind');
  const token = params.get('code') || '';
  const name = (params.get('name') || '').trim().slice(0, 120);
  const get = id => document.getElementById(id);
  const isClass = type === 'class';
  get('invitation-label').textContent = isClass ? 'You’re invited to a class' : 'You’re invited to a shared space';
  get('heading').textContent = name || (isClass ? 'Your class is waiting.' : 'Your shared space is waiting.');
  if (!isClass) {
    get('description').textContent = 'Join your shared space to find videos and work together in InForm.';
    get('manual-instructions').textContent = type === 'project'
      ? 'In InForm, open the shared-space section, choose Join with code and paste this code.'
      : 'In InForm, open Spaces → Join space → Join a shared space and paste this code.';
  }
  const uniqueParams = [...new Set(params.keys())].every(key => params.getAll(key).length === 1);
  if (/^[a-fA-F0-9]{32}$/.test(token) && validKind && uniqueParams) {
    const code = token.toLowerCase();
    const query = new URLSearchParams({ code });
    if (!isClass) query.set('kind', type);
    get('open').href = 'inform-class://join?' + query.toString();
    get('open').hidden = false;
    get('fallback').hidden = false;
    get('code').value = code;
    get('open').addEventListener('click', () => { get('open-help').hidden = false; });
    get('copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        get('copy-status').textContent = 'Invitation code copied.';
      } catch (_) {
        get('code').focus();
        get('code').select();
        get('copy-status').textContent = 'The code is selected. Use your device’s Copy action.';
      }
    });
  } else {
    get('heading').textContent = 'Let’s find your invitation.';
    get('description').textContent = 'You can install InForm below, but you’ll need a complete invitation to join.';
    get('invalid').hidden = false;
  }
  const agent = navigator.userAgent;
  if (/Android/i.test(agent)) {
    get('platform-hint').textContent = 'On Android, choose Google Play.';
  } else if (/iPhone|iPad|iPod/i.test(agent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    get('store-links').prepend(get('app-store'));
    get('platform-hint').textContent = 'On iPhone or iPad, choose the App Store.';
  } else {
    get('platform-hint').textContent = 'Open this invitation on your phone to install InForm.';
  }
})();
