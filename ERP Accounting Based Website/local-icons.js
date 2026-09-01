(() => {
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    'more-horizontal': '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevrons-up-down': '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
    'arrow-right': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
    'arrow-left-right': '<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
    'arrow-down-to-line': '<path d="M12 3v13m-5-5 5 5 5-5M5 21h14"/>',
    'arrow-up-from-line': '<path d="M12 21V8m5 5-5-5-5 5M5 3h14"/>',
    'trending-up': '<path d="m3 17 6-6 4 4 7-7M14 8h6v6"/>',
    'trending-down': '<path d="m3 7 6 6 4-4 7 7M14 16h6v-6"/>',
    'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6"/>',
    'receipt-text': '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2l-3 2-3-2-3 2-3-2zM8 9h8M8 13h6"/>',
    'contact-round': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0M19 8h2M19 12h2"/>',
    'chart-no-axes-combined': '<path d="M3 3v18h18M7 16l4-5 3 3 5-7"/>',
    scale: '<path d="m16 16 3-8 3 8a5 5 0 0 1-6 0M2 16l3-8 3 8a5 5 0 0 1-6 0M5 8h14M12 3v17M8 20h8"/>',
    landmark: '<path d="m3 10 9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18M2 18h20"/>',
    'settings-2': '<path d="M20 7h-9M14 17H4M17 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>',
    'circle-help': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2 1-1.7 1.4-1.7 2.7M12 17h.01"/>',
    'life-buoy': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="m5.6 5.6 4.3 4.3m4.2 4.2 4.3 4.3m0-12.8-4.3 4.3m-4.2 4.2-4.3 4.3"/>',
    'wallet-minimal': '<path d="M4 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1zM4 7h15M16 13h.01"/>',
    sparkles: '<path d="m12 3-1.3 4.7L6 9l4.7 1.3L12 15l1.3-4.7L18 9l-4.7-1.3zM5 16l-.6 2.4L2 19l2.4.6L5 22l.6-2.4L8 19l-2.4-.6z"/>',
    'credit-card': '<rect width="18" height="14" x="3" y="5" rx="2"/><path d="M3 10h18M7 15h2"/>',
    'building-2': '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h20M8 7h2M8 11h2M8 15h2M12 7h2M12 11h2M12 15h2M18 21V9h2v12"/>',
    megaphone: '<path d="m3 11 18-5v12L3 13zM11 16l1 5M3 11v2"/>',
    'briefcase-business': '<rect width="18" height="14" x="3" y="7" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
    'circle-plus': '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    'list-filter': '<path d="M3 5h18M6 12h12M10 19h4"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2"/>',
    save: '<path d="M5 3h12l2 2v16H5zM8 3v6h8V3M8 21v-7h8v7"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
    'layers-3': '<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
    pencil: '<path d="m4 16-1 5 5-1L20 8l-4-4zM14 6l4 4"/>',
    'trash-2': '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
    'file-signature': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM15 2v5h5M8 17c2-4 4 3 6-1 1-2 2-3 3-1"/>'
  };
  window.lucide = {
    createIcons() {
      document.querySelectorAll('[data-lucide]').forEach((element) => {
        const name = element.getAttribute('data-lucide');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.innerHTML = paths[name] || paths.plus;
        [...element.attributes].forEach((attribute) => { if (attribute.name !== 'data-lucide') svg.setAttribute(attribute.name, attribute.value); });
        element.replaceWith(svg);
      });
    }
  };
})();
