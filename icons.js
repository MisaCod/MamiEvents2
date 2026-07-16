/* ============================================================
   MAMI EVENTS — Set de iconos SVG (estilo línea, hereda color)
   Uso: MAMI_ICONS.lock, MAMI_ICONS.download, etc.
   ============================================================ */

'use strict';

window.MAMI_ICONS = (function () {
  function svg(inner, viewBox) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (viewBox || '0 0 24 24') +
      '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      inner + '</svg>';
  }

  return {
    lock:     svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    unlock:   svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.9"/>'),
    arrow:    svg('<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>'),
    download: svg('<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>'),
    check:    svg('<path d="M4.5 12.5l5 5 10-11"/>'),
    x:        svg('<path d="M6 6l12 12"/><path d="M18 6L6 18"/>'),
    warn:     svg('<path d="M12 3L2.5 20h19L12 3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r="0.4" fill="currentColor"/>'),
    sparkle:  svg('<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/>'),
    party:    svg('<path d="M6.5 10.5L3 21l10.5-3.5"/><path d="M6.5 10.5c2 .5 6 3 7 7"/><path d="M12 7.5c.5-2 2.5-3.5 4.5-3"/><path d="M15 11c1.5-.5 3.5 0 4.5 1.5"/><circle cx="12" cy="4" r="0.5" fill="currentColor"/><circle cx="19" cy="7.5" r="0.5" fill="currentColor"/><circle cx="20.5" cy="16.5" r="0.5" fill="currentColor"/>'),
    trash:    svg('<path d="M4 7h16"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/><path d="M6.5 7l1 13h9l1-13"/><path d="M10 11v5.5"/><path d="M14 11v5.5"/>'),
    pencil:   svg('<path d="M4 20l.9-3.8L16.4 4.7a1.8 1.8 0 0 1 2.6 0l.3.3a1.8 1.8 0 0 1 0 2.6L7.8 19.1 4 20z"/><path d="M14.5 6.5l3 3"/>'),
    eye:      svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff:   svg('<path d="M4 4l16 16"/><path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.5 17.5 0 0 1-3 3.8M6.2 6.9A17 17 0 0 0 2.5 12S6 18.5 12 18.5a9.3 9.3 0 0 0 4.3-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
    share:    svg('<path d="M10 13.5a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4"/><path d="M14 10.5a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4"/>'),
    upload:   svg('<path d="M12 15V4"/><path d="M7 8l5-5 5 5"/><path d="M5 20h14"/>'),
    image:    svg('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M3.5 17l5-5 4 4 3-3 5 4.5"/>'),
    chart:    svg('<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M22 20H2"/>'),
    users:    svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.6"/><path d="M17.5 14.5a6.5 6.5 0 0 1 4 5.5"/>'),
    globe:    svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18z"/>'),
    logout:   svg('<path d="M14 4h-8a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h8"/><path d="M10 12h10.5"/><path d="M17 8.5l3.5 3.5-3.5 3.5"/>'),
    folder:   svg('<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.5l2 2.5H19a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18v-11.5z"/>'),
    phone:    svg('<path d="M5 4h4l1.5 4.5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2L20 15v4a1.5 1.5 0 0 1-1.7 1.5C10.5 19.5 4.5 13.5 3.5 5.7A1.5 1.5 0 0 1 5 4z"/>'),
    link:     svg('<path d="M10 13.5a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4"/><path d="M14 10.5a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4"/>'),
    calendar: svg('<rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16"/><path d="M8.5 3.5v4"/><path d="M15.5 3.5v4"/>'),
    building: svg('<rect x="5" y="4" width="14" height="16.5" rx="1"/><path d="M9 8h1.5M13.5 8H15M9 11.5h1.5M13.5 11.5H15M9 15h1.5M13.5 15H15"/><path d="M11 20.5v-3h2v3"/>'),
    inbox:    svg('<path d="M3.5 13.5V7A1.5 1.5 0 0 1 5 5.5h14A1.5 1.5 0 0 1 20.5 7v6.5"/><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18v-4.5z"/>'),
    clock:    svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
    search:   svg('<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8L21 21"/>')
  };
})();
