/* Apply the INFORM wordmark style to visible copy, including dynamic forms. */
(() => {
  const excluded = 'script, style, code, pre, textarea, input, select, option, svg, .inform-wordmark, .inline-wordmark, .brand b, .footer-brand b';
  const decorate = (node) => {
    if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue.includes('INFORM')) return;
    const parent = node.parentElement;
    if (!parent || parent.closest(excluded)) return;
    const parts = node.nodeValue.split('INFORM');
    const fragment = document.createDocumentFragment();
    parts.forEach((part, index) => {
      if (index) {
        const wordmark = document.createElement('span');
        wordmark.className = 'inform-wordmark';
        wordmark.textContent = 'INFORM';
        fragment.append(wordmark);
      }
      if (part) fragment.append(document.createTextNode(part));
    });
    node.replaceWith(fragment);
  };
  const scan = (root) => {
    if (root.nodeType === Node.TEXT_NODE) { decorate(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE || root.matches(excluded)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(decorate);
  };
  scan(document.body);
  new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === 'characterData') decorate(record.target);
      else record.addedNodes.forEach(scan);
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
