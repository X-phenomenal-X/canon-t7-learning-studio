(()=>{
  if(window.T7Icons)return;
  const NS='http://www.w3.org/2000/svg';
  const $=s=>document.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

  /* Duotone icon family. Each glyph is drawn as a soft mass (F) plus, where the
     subject needs emphasis, a stronger plate (S), with the 1.8px stroke line on
     top. The presentation attributes beat the fill:none that .t7-icon inherits
     down, so this needs no CSS. Keep the grid 24x24 and content inside 1..23. */
  const F='fill="currentColor" stroke="none" opacity=".16"';
  const S='fill="currentColor" stroke="none" opacity=".38"';

  const symbols={
    home:`<path ${F} d="M12 3.1 21.4 11v8.4a2 2 0 0 1-2 2H4.6a2 2 0 0 1-2-2V11L12 3.1Z"/><path d="M2.6 11.3 12 3.3l9.4 8"/><path d="M4.9 10.1v9.3A2 2 0 0 0 6.9 21.4h10.2a2 2 0 0 0 2-2v-9.3"/><path ${S} d="M9.6 21.4v-5.1a2.4 2.4 0 0 1 4.8 0v5.1Z"/><path d="M9.6 21.4v-5.1a2.4 2.4 0 0 1 4.8 0v5.1"/>`,
    shoot:`<path ${F} d="M3.6 7.7h3.1L8.1 5.6h7.8l1.4 2.1h3.1a1.9 1.9 0 0 1 1.9 1.9v8.6a1.9 1.9 0 0 1-1.9 1.9H3.6a1.9 1.9 0 0 1-1.9-1.9V9.6a1.9 1.9 0 0 1 1.9-1.9Z"/><path d="M3.6 7.7h3.1L8.1 5.6h7.8l1.4 2.1h3.1a1.9 1.9 0 0 1 1.9 1.9v8.6a1.9 1.9 0 0 1-1.9 1.9H3.6a1.9 1.9 0 0 1-1.9-1.9V9.6a1.9 1.9 0 0 1 1.9-1.9Z"/><circle ${S} cx="12" cy="13.9" r="3.9"/><circle cx="12" cy="13.9" r="3.9"/><circle cx="12" cy="13.9" r="1.4"/><path d="M19.1 10.6h.01"/>`,
    review:`<path ${F} d="M5.8 4.4h12.4a3.2 3.2 0 0 1 3.2 3.2v9a3.2 3.2 0 0 1-3.2 3.2H5.8a3.2 3.2 0 0 1-3.2-3.2v-9a3.2 3.2 0 0 1 3.2-3.2Z"/><rect x="2.6" y="4.4" width="18.8" height="15.2" rx="3.2"/><path ${S} d="M5.6 19.6 10 13.4l2.9 2.8 2.3-2.2 3.4 5.6Z"/><path d="M5.6 19.6 10 13.4l2.9 2.8 2.3-2.2 3.4 5.6"/><circle ${S} cx="16.4" cy="8.5" r="1.8"/><circle cx="16.4" cy="8.5" r="1.8"/>`,
    learn:`<path ${F} d="M12 3.3 22.2 8.6 12 13.9 1.8 8.6 12 3.3Z"/><path d="M12 3.3 22.2 8.6 12 13.9 1.8 8.6 12 3.3Z"/><path ${S} d="M6.4 10.8 12 13.9l5.6-3.1v5c0 1.9-2.5 3.4-5.6 3.4s-5.6-1.5-5.6-3.4v-5Z"/><path d="M6.4 10.8v5c0 1.9 2.5 3.4 5.6 3.4s5.6-1.5 5.6-3.4v-5"/><path d="M20.6 9.4v5.4"/><circle ${S} cx="20.6" cy="16" r="1.2"/><circle cx="20.6" cy="16" r="1.2"/>`,
    library:`<path ${F} d="M4.4 6.4h11.2a2 2 0 0 1 2 2v9.2a2 2 0 0 1-2 2H4.4a2 2 0 0 1-2-2V8.4a2 2 0 0 1 2-2Z"/><rect x="2.4" y="6.4" width="15.2" height="13.2" rx="2"/><path ${S} d="M4.2 19.6 7.8 14.6l2.6 2.5 2.1-2 3.1 4.5Z"/><path d="M4.2 19.6 7.8 14.6l2.6 2.5 2.1-2 3.1 4.5"/><circle ${S} cx="6.9" cy="10.2" r="1.4"/><path d="M19.6 8.6a2 2 0 0 1 2 2v7.8a3.2 3.2 0 0 1-3.2 3.2H7.7"/>`,
    camera:`<path ${S} d="M9.6 2.6h4.8l1 2H8.6Z"/><path d="M8.6 4.6 9.6 2.6h4.8l1 2"/><path ${F} d="M3.4 4.6h17.2a1.9 1.9 0 0 1 1.9 1.9v11.6a1.9 1.9 0 0 1-1.9 1.9H3.4a1.9 1.9 0 0 1-1.9-1.9V6.5a1.9 1.9 0 0 1 1.9-1.9Z"/><rect x="1.5" y="4.6" width="21" height="15.4" rx="1.9"/><rect ${S} x="4" y="7.4" width="9.4" height="9.6" rx="1.4"/><rect x="4" y="7.4" width="9.4" height="9.6" rx="1.4"/><circle ${S} cx="17.8" cy="10.4" r="2.7"/><circle cx="17.8" cy="10.4" r="2.7"/><path d="M17.8 15.2h.01M17.8 17.4h.01"/>`,
    aperture:`<path ${F} fill-rule="evenodd" d="M2.8 12a9.2 9.2 0 1 0 18.4 0 9.2 9.2 0 1 0-18.4 0Zm9.2-4.2L15.6 9.9v4.2L12 16.2 8.4 14.1V9.9Z"/><circle cx="12" cy="12" r="9.2"/><path d="M12 7.8 15.6 9.9v4.2L12 16.2 8.4 14.1V9.9Z"/><path d="M12 7.8 4 7.4M8.4 9.9 4 16.6M8.4 14.1 12 21.2M12 16.2 20 16.6M15.6 14.1 20 7.4M15.6 9.9 12 2.8"/>`,
    lens:`<circle ${F} cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="9"/><circle ${S} cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="4.6"/><path d="M8.9 9.1a4.6 4.6 0 0 1 2.3-1.3"/><path d="M12 3v1.9M12 19.1V21M3 12h1.9M19.1 12H21"/>`,
    shutter:`<path ${S} d="M10.4 1.6h3.2v2.4h-3.2Z"/><path d="M10.4 1.6h3.2M12 1.7v2.2"/><circle ${F} cx="12" cy="12.4" r="8.6"/><circle cx="12" cy="12.4" r="8.6"/><path d="M12 7.8v4.8l3.2 2"/><path d="m18.8 5.4 1.4-1.4"/>`,
    iso:`<rect ${F} x="4.4" y="4.4" width="15.2" height="15.2" rx="3"/><rect x="4.4" y="4.4" width="15.2" height="15.2" rx="3"/><rect ${S} x="8.6" y="8.6" width="6.8" height="6.8" rx="1.6"/><rect x="8.6" y="8.6" width="6.8" height="6.8" rx="1.6"/><path d="M8.8 2.4v2M12 2.4v2M15.2 2.4v2M8.8 19.6v2M12 19.6v2M15.2 19.6v2M2.4 8.8h2M2.4 12h2M2.4 15.2h2M19.6 8.8h2M19.6 12h2M19.6 15.2h2"/>`,
    focus:`<circle ${F} cx="12" cy="12" r="3.9"/><circle cx="12" cy="12" r="3.9"/><circle ${S} cx="12" cy="12" r="1.3"/><path d="M8.4 2.6H5A2.4 2.4 0 0 0 2.6 5v3.4M15.6 2.6H19A2.4 2.4 0 0 1 21.4 5v3.4M21.4 15.6V19a2.4 2.4 0 0 1-2.4 2.4h-3.4M8.4 21.4H5A2.4 2.4 0 0 1 2.6 19v-3.4"/>`,
    drive:`<path d="M9.8 1.6h9.2a2.4 2.4 0 0 1 2.4 2.4v9.2"/><path d="M6.6 4.2h9.8a2.4 2.4 0 0 1 2.4 2.4v9.8"/><path ${F} d="M4.4 6.8h9.8a2.4 2.4 0 0 1 2.4 2.4v9.8a2.4 2.4 0 0 1-2.4 2.4H4.4A2.4 2.4 0 0 1 2 19V9.2a2.4 2.4 0 0 1 2.4-2.4Z"/><rect x="2" y="6.8" width="14.6" height="14.6" rx="2.4"/><circle ${S} cx="9.3" cy="14.1" r="3.2"/><circle cx="9.3" cy="14.1" r="3.2"/>`,
    exposure:`<path ${S} d="M12 2.8a9.2 9.2 0 0 0 0 18.4Z"/><path ${F} d="M12 2.8a9.2 9.2 0 0 1 0 18.4Z"/><circle cx="12" cy="12" r="9.2"/><path d="M12 2.8v18.4"/>`,
    wb:`<circle ${S} cx="9.2" cy="12" r="6.6"/><circle ${F} cx="14.8" cy="12" r="6.6"/><circle cx="9.2" cy="12" r="6.6"/><circle cx="14.8" cy="12" r="6.6"/>`,
    portrait:`<path ${F} d="M12 13.4c3.9 0 6.6 2.6 7.4 7.2a.9.9 0 0 1-.9 1.1H5.5a.9.9 0 0 1-.9-1.1c.8-4.6 3.5-7.2 7.4-7.2Z"/><path d="M4.6 21.1c.8-4.6 3.5-7.2 7.4-7.2s6.6 2.6 7.4 7.2"/><circle ${S} cx="12" cy="7.4" r="3.8"/><circle cx="12" cy="7.4" r="3.8"/>`,
    product:`<path ${F} d="m12 2.6 8.6 4.3v9.8L12 21l-8.6-4.3V6.9L12 2.6Z"/><path ${S} d="m12 11.2 8.6-4.3v9.8L12 21Z"/><path d="m12 2.6 8.6 4.3L12 11.2 3.4 6.9 12 2.6Z"/><path d="M3.4 6.9v9.8L12 21l8.6-4.3V6.9"/><path d="M12 11.2V21"/>`,
    landscape:`<circle ${S} cx="18" cy="6.2" r="2.7"/><circle cx="18" cy="6.2" r="2.7"/><path ${F} d="M1.4 19.9 8.6 8.4l7.2 11.5Z"/><path ${S} d="M10.2 19.9 16.2 12.2l6.4 7.7Z"/><path d="M1.4 19.9 8.6 8.4l4.1 6.5"/><path d="M10.2 19.9 16.2 12.2l6.4 7.7"/><path d="M1.2 19.9h21.6"/>`,
    action:`<path ${F} d="M2.6 6.6h4.4a1.3 1.3 0 0 1 0 2.6H2.6a1.3 1.3 0 0 1 0-2.6ZM1.6 11h5.2a1.3 1.3 0 0 1 0 2.6H1.6a1.3 1.3 0 0 1 0-2.6ZM3 15.4h3.6a1.3 1.3 0 0 1 0 2.6H3a1.3 1.3 0 0 1 0-2.6Z"/><circle ${S} cx="16.6" cy="4.9" r="2.3"/><circle cx="16.6" cy="4.9" r="2.3"/><path d="M15.4 8.2 12.4 13"/><path d="m15 9.8 4.2 1.6M13.9 11.6 10.5 10.2"/><path d="m12.4 13 2.2 3.8-1.4 4.6M12.4 13 9 15.4l.6 4.6"/>`,
    indoor:`<path d="M12 1.2v2.4"/><path ${S} d="M8.4 3.6h7.2l2.8 5.6H5.6Z"/><path d="M5.6 9.2 8.4 3.6h7.2l2.8 5.6Z"/><path ${F} d="M8.4 11.6h7.2l3.2 7.4H5.2Z"/><path d="M8.4 11.6 5.2 19h13.6l-3.2-7.4"/><path d="M9.6 21.6h4.8"/>`,
    night:`<path ${S} d="M20.4 15.4A8.6 8.6 0 0 1 9 4a9 9 0 1 0 11.4 11.4Z"/><path d="M20.4 15.4A8.6 8.6 0 0 1 9 4a9 9 0 1 0 11.4 11.4Z"/><path ${S} d="m17.3 3.2.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/><path d="m17.3 3.2.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/><circle ${S} cx="21.3" cy="9.9" r=".9"/>`,
    monitor:`<path ${F} d="M3.4 3.6h17.2a1.9 1.9 0 0 1 1.9 1.9v9.4a1.9 1.9 0 0 1-1.9 1.9H3.4a1.9 1.9 0 0 1-1.9-1.9V5.5a1.9 1.9 0 0 1 1.9-1.9Z"/><rect x="1.5" y="3.6" width="21" height="13.2" rx="1.9"/><path ${S} d="M4.6 16.8 8.6 11.6l2.6 2.6 2.6-3.2 4.2 5.8Z"/><path d="M4.6 16.8 8.6 11.6l2.6 2.6 2.6-3.2 4.2 5.8"/><path d="M8.6 21.4h6.8M12 16.8v4.6"/>`,
    window:`<path ${F} d="M4.8 2.6h14.4a1.6 1.6 0 0 1 1.6 1.6v15.6a1.6 1.6 0 0 1-1.6 1.6H4.8a1.6 1.6 0 0 1-1.6-1.6V4.2a1.6 1.6 0 0 1 1.6-1.6Z"/><rect x="3.2" y="2.6" width="17.6" height="18.8" rx="1.6"/><path d="M12 2.6v18.8M3.2 12h17.6"/><circle ${S} cx="16.4" cy="7.3" r="2"/><circle cx="16.4" cy="7.3" r="2"/>`,
    car:`<path ${F} d="M3.2 16.4v-3.2l1.9-4.9a2 2 0 0 1 1.9-1.3h10a2 2 0 0 1 1.9 1.3l1.9 4.9v3.2a1.4 1.4 0 0 1-1.4 1.4H4.6a1.4 1.4 0 0 1-1.4-1.4Z"/><path d="M3.2 16.4v-3.2l1.9-4.9a2 2 0 0 1 1.9-1.3h10a2 2 0 0 1 1.9 1.3l1.9 4.9v3.2a1.4 1.4 0 0 1-1.4 1.4H4.6a1.4 1.4 0 0 1-1.4-1.4Z"/><path ${S} d="M6.4 12.4 7.8 8.6h8.4l1.4 3.8Z"/><path d="M3.2 13.2h17.6"/><circle ${S} cx="7.4" cy="17.8" r="2"/><circle cx="7.4" cy="17.8" r="2"/><circle ${S} cx="16.6" cy="17.8" r="2"/><circle cx="16.6" cy="17.8" r="2"/>`,
    sun:`<circle ${S} cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="4.6"/><path d="M12 1.6v2.6M12 19.8v2.6M1.6 12h2.6M19.8 12h2.6M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M19.4 4.6l-1.8 1.8M6.4 17.6l-1.8 1.8"/>`,
    cloud:`<circle ${S} cx="17.4" cy="6.6" r="2.8"/><circle cx="17.4" cy="6.6" r="2.8"/><path d="M17.4 1.6v1.4M22.4 6.6H21M21 3l-1 1M21 10.2l-1-1"/><path ${F} d="M7 19.8h10.4a4.1 4.1 0 0 0 .5-8.2A6.3 6.3 0 0 0 6.2 13.4 3.3 3.3 0 0 0 7 19.8Z"/><path d="M7 19.8h10.4a4.1 4.1 0 0 0 .5-8.2A6.3 6.3 0 0 0 6.2 13.4 3.3 3.3 0 0 0 7 19.8Z"/>`,
    sunset:`<path ${S} d="M6.2 15.4a5.8 5.8 0 0 1 11.6 0Z"/><path d="M6.2 15.4a5.8 5.8 0 0 1 11.6 0"/><path d="M12 3.4v2.4M4.4 7.2l1.7 1.7M19.6 7.2l-1.7 1.7M1.8 12.4h2.4M19.8 12.4h2.4"/><path d="M1.8 15.4h20.4M4.6 18.6h14.8M7.4 21.6h9.2"/>`,
    location:`<path ${F} d="M12 2.2a7.8 7.8 0 0 1 7.8 7.8c0 5.4-7.8 11.8-7.8 11.8S4.2 15.4 4.2 10A7.8 7.8 0 0 1 12 2.2Z"/><path d="M19.8 10c0 5.4-7.8 11.8-7.8 11.8S4.2 15.4 4.2 10a7.8 7.8 0 0 1 15.6 0Z"/><circle ${S} cx="12" cy="9.8" r="2.7"/><circle cx="12" cy="9.8" r="2.7"/>`,
    search:`<circle ${F} cx="10.8" cy="10.8" r="7"/><circle cx="10.8" cy="10.8" r="7"/><path d="M7.6 10.8a3.2 3.2 0 0 1 3.2-3.2"/><path d="m15.9 15.9 4.7 4.7"/>`,
    compass:`<circle ${F} cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="9.2"/><path ${S} d="M16.2 7.8 13.7 13.7 10.3 10.3Z"/><path d="M16.2 7.8 13.7 13.7 7.8 16.2 10.3 10.3Z"/><circle ${S} cx="12" cy="12" r="1"/>`,
    edit:`<path ${F} d="M16.2 3.2a2.4 2.4 0 0 1 3.4 3.4L8.4 17.8l-4.4 1 1-4.4L16.2 3.2Z"/><path d="M16.2 3.2a2.4 2.4 0 0 1 3.4 3.4L8.4 17.8l-4.4 1 1-4.4L16.2 3.2Z"/><path ${S} d="m5 14.4 4.4 4.4-5.4 1 1-5.4Z"/><path d="m14.2 5.2 4.4 4.4"/><path d="M12.6 21.4h8.8"/>`,
    sliders:`<path ${F} d="M2.6 4.8h18.8a1.2 1.2 0 0 1 0 2.4H2.6a1.2 1.2 0 0 1 0-2.4ZM2.6 10.8h18.8a1.2 1.2 0 0 1 0 2.4H2.6a1.2 1.2 0 0 1 0-2.4ZM2.6 16.8h18.8a1.2 1.2 0 0 1 0 2.4H2.6a1.2 1.2 0 0 1 0-2.4Z"/><path d="M2.8 6h18.4M2.8 12h18.4M2.8 18h18.4"/><circle ${S} cx="16.4" cy="6" r="2.6"/><circle cx="16.4" cy="6" r="2.6"/><circle ${S} cx="8.4" cy="12" r="2.6"/><circle cx="8.4" cy="12" r="2.6"/><circle ${S} cx="13.6" cy="18" r="2.6"/><circle cx="13.6" cy="18" r="2.6"/>`,
    wand:`<path d="M3.2 20.8 12.8 11.2"/><path ${S} d="m16.2 2.4 1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1Z"/><path d="m16.2 2.4 1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1Z"/><path ${S} d="m20.6 12.4.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/><path ${S} d="m6.6 3.6.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6Z"/>`,
    compare:`<path ${S} d="M12.6 4.4h8a1.8 1.8 0 0 1 1.8 1.8v11.6a1.8 1.8 0 0 1-1.8 1.8h-8Z"/><rect x="1.6" y="4.4" width="20.8" height="15.2" rx="1.8"/><path d="M12 4.4v4.9M12 14.7v4.9"/><circle ${S} cx="12" cy="12" r="2.7"/><circle cx="12" cy="12" r="2.7"/>`,
    download:`<path ${F} d="M3.4 14.6h17.2V20a1.4 1.4 0 0 1-1.4 1.4H4.8A1.4 1.4 0 0 1 3.4 20Z"/><path d="M3.4 14.6V20a1.4 1.4 0 0 0 1.4 1.4h14.4A1.4 1.4 0 0 0 20.6 20v-5.4"/><path ${S} d="M10.2 2.6h3.6v6.6h3.4L12 15.4 6.8 9.2h3.4Z"/><path d="M10.2 2.6h3.6v6.6h3.4L12 15.4 6.8 9.2h3.4Z"/>`,
    upload:`<path ${F} d="M3.4 14.6h17.2V20a1.4 1.4 0 0 1-1.4 1.4H4.8A1.4 1.4 0 0 1 3.4 20Z"/><path d="M3.4 14.6V20a1.4 1.4 0 0 0 1.4 1.4h14.4A1.4 1.4 0 0 0 20.6 20v-5.4"/><path ${S} d="M12 2.2 17.2 8.4h-3.4V15h-3.6V8.4H6.8Z"/><path d="M12 2.2 17.2 8.4h-3.4V15h-3.6V8.4H6.8Z"/>`,
    crop:`<path ${F} d="M6.4 6.4h11.2v11.2H6.4Z"/><path d="M6.4 1.8v15.8a2 2 0 0 0 2 2h13.8"/><path d="M1.8 6.4h15.8a2 2 0 0 1 2 2v13.8"/>`,
    rotate:`<path ${F} d="M7.2 11.6h9.6a1.7 1.7 0 0 1 1.7 1.7v5.9a1.7 1.7 0 0 1-1.7 1.7H7.2a1.7 1.7 0 0 1-1.7-1.7v-5.9a1.7 1.7 0 0 1 1.7-1.7Z"/><rect x="5.5" y="11.6" width="13" height="9.3" rx="1.7"/><path ${S} d="M6.4 20.9 9.6 16.6l2.2 2.1 1.8-1.7 3.6 3.9Z"/><path d="M4.4 8.4A8.6 8.6 0 0 1 19.3 6.6"/><path d="M19.4 2.2 19.8 7l-4.8.5"/>`,
    palette:`<path ${F} d="M12 3a9 9 0 0 0 0 18h1.2a2 2 0 0 0 1.5-3.3 2 2 0 0 1 1.5-3.3H18A3 3 0 0 0 21 11c0-4.4-4-8-9-8Z"/><path d="M12 3a9 9 0 0 0 0 18h1.2a2 2 0 0 0 1.5-3.3 2 2 0 0 1 1.5-3.3H18A3 3 0 0 0 21 11c0-4.4-4-8-9-8Z"/><circle ${S} cx="7.5" cy="10.2" r="1.3"/><circle ${S} cx="10.2" cy="6.5" r="1.3"/><circle ${S} cx="15" cy="7.1" r="1.3"/><circle ${S} cx="6.9" cy="14.8" r="1.3"/>`,
    sparkles:`<path ${S} d="m12 2.6 1.3 3.5 3.5 1.3-3.5 1.3L12 12.2 10.7 8.7 7.2 7.4l3.5-1.3ZM18.6 13l.8 2.3 2.3.8-2.3.8-.8 2.3-.8-2.3-2.3-.8 2.3-.8ZM5 14l.7 1.9 1.9.7-1.9.7L5 19.2l-.7-1.9-1.9-.7 1.9-.7Z"/><path d="m12 2.6 1.3 3.5 3.5 1.3-3.5 1.3L12 12.2 10.7 8.7 7.2 7.4l3.5-1.3ZM18.6 13l.8 2.3 2.3.8-2.3.8-.8 2.3-.8-2.3-2.3-.8 2.3-.8ZM5 14l.7 1.9 1.9.7-1.9.7L5 19.2l-.7-1.9-1.9-.7 1.9-.7Z"/>`,
    target:`<circle ${F} cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="5.2"/><circle ${S} cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><path d="M12 .8v2.4M12 20.8v2.4M.8 12h2.4M20.8 12h2.4"/>`,
    gauge:`<path ${F} d="M2.8 17.6a9.2 9.2 0 0 1 18.4 0h-4.4a4.8 4.8 0 0 0-9.6 0Z"/><path d="M2.8 17.6a9.2 9.2 0 0 1 18.4 0"/><path d="M7.2 17.6a4.8 4.8 0 0 1 9.6 0"/><path d="m11.8 17.2 5.4-6.2"/><circle ${S} cx="12" cy="17.6" r="1.8"/><circle cx="12" cy="17.6" r="1.8"/><path d="M2.8 20.4h18.4"/>`,
    guide:`<path ${F} d="M4.8 4.4h14.4a2.4 2.4 0 0 1 2.4 2.4v10.4a2.4 2.4 0 0 1-2.4 2.4H4.8a2.4 2.4 0 0 1-2.4-2.4V6.8a2.4 2.4 0 0 1 2.4-2.4Z"/><rect x="2.4" y="4.4" width="19.2" height="15.2" rx="2.4"/><rect ${S} x="8.8" y="9.5" width="6.4" height="5" rx="1"/><path d="M8.8 4.4v15.2M15.2 4.4v15.2M2.4 9.5h19.2M2.4 14.5h19.2"/>`,
    check:`<path d="m4.2 12.4 5.2 5.2L19.8 6.4"/>`,
    checkCircle:`<circle ${S} cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="9.2"/><path d="m7.8 12.2 2.9 2.9 5.9-6.2"/>`,
    arrow:`<path ${S} d="m15.2 7.2 5 4.8-5 4.8Z"/><path d="M3.2 12h12.6"/><path d="m15.2 7.2 5 4.8-5 4.8"/>`,
    chevron:`<path d="m9 4.6 7.4 7.4L9 19.4"/>`,
    back:`<path ${S} d="M8.8 7.2 3.8 12l5 4.8Z"/><path d="M20.8 12H8.2"/><path d="M8.8 7.2 3.8 12l5 4.8"/>`,
    plus:`<path d="M12 4.4v15.2M4.4 12h15.2"/>`,
    minus:`<path d="M4.4 12h15.2"/>`,
    close:`<path d="M5.8 5.8 18.2 18.2M18.2 5.8 5.8 18.2"/>`,
    trash:`<path ${F} d="M5.6 7.4h12.8l-1 12.6a1.8 1.8 0 0 1-1.8 1.6H8.4a1.8 1.8 0 0 1-1.8-1.6Z"/><path d="M3.4 7.4h17.2"/><path d="M9.4 7.4V4.6a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4v2.8"/><path d="m5.6 7.4 1 12.6a1.8 1.8 0 0 0 1.8 1.6h7.2a1.8 1.8 0 0 0 1.8-1.6l1-12.6"/><path d="M10.2 11.4v6M13.8 11.4v6"/>`,
    refresh:`<path ${S} d="M20.6 5.2v6h-6Z"/><path ${S} d="M3.4 18.8v-6h6Z"/><path d="M20.6 5.2v6h-6"/><path d="M3.4 18.8v-6h6"/><path d="M18.6 8.8A7.4 7.4 0 0 0 5.8 6L3.6 11M5.4 15.2A7.4 7.4 0 0 0 18.2 18l2.2-5"/>`,
    settings:`<path ${F} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/><circle ${S} cx="12" cy="12" r="3.1"/><circle cx="12" cy="12" r="3.1"/>`,
    info:`<circle ${F} cx="12" cy="12" r="9.2"/><circle cx="12" cy="12" r="9.2"/><path d="M12 11.2v5.6"/><circle ${S} cx="12" cy="7.6" r="1.2"/><circle cx="12" cy="7.6" r="1.2"/>`,
    lock:`<path ${F} d="M5.4 10.4h13.2a1.9 1.9 0 0 1 1.9 1.9v7.4a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9v-7.4a1.9 1.9 0 0 1 1.9-1.9Z"/><rect x="3.5" y="10.4" width="17" height="11.2" rx="1.9"/><path d="M7.8 10.4V7.2a4.2 4.2 0 0 1 8.4 0v3.2"/><circle ${S} cx="12" cy="15" r="1.5"/><circle cx="12" cy="15" r="1.5"/><path d="M12 16.5v2.3"/>`,
    folder:`<path ${F} d="M2.6 6.2a1.6 1.6 0 0 1 1.6-1.6h5l2.2 2.4h8.4a1.6 1.6 0 0 1 1.6 1.6v9.8a1.8 1.8 0 0 1-1.8 1.8H4.4a1.8 1.8 0 0 1-1.8-1.8Z"/><path d="M2.6 6.2a1.6 1.6 0 0 1 1.6-1.6h5l2.2 2.4h8.4a1.6 1.6 0 0 1 1.6 1.6v9.8a1.8 1.8 0 0 1-1.8 1.8H4.4a1.8 1.8 0 0 1-1.8-1.8Z"/><path ${S} d="M2.6 11h18.8v7.4a1.8 1.8 0 0 1-1.8 1.8H4.4a1.8 1.8 0 0 1-1.8-1.8Z"/><path d="M2.6 11h18.8"/>`,
    history:`<circle ${F} cx="12" cy="12" r="9"/><path d="M3.1 13A9 9 0 1 0 6 5.3L3 8"/><path d="M3 3v5h5"/><path d="M12 7.4v4.9l3.3 2"/><circle ${S} cx="12" cy="12" r="1.1"/>`,
    menu:`<path ${F} d="M3.4 5.4h17.2a1.3 1.3 0 0 1 0 2.6H3.4a1.3 1.3 0 0 1 0-2.6ZM3.4 10.7h17.2a1.3 1.3 0 0 1 0 2.6H3.4a1.3 1.3 0 0 1 0-2.6ZM3.4 16h11.6a1.3 1.3 0 0 1 0 2.6H3.4a1.3 1.3 0 0 1 0-2.6Z"/><path d="M3.6 6.7h16.8M3.6 12h16.8M3.6 17.3h11.2"/>`,
    bolt:`<path ${S} d="M13.4 1.8 4.6 14.2h6.2l-1 8 8.8-12.6h-6.2Z"/><path d="M13.4 1.8 4.6 14.2h6.2l-1 8 8.8-12.6h-6.2Z"/>`,
    eye:`<path ${F} d="M12 5.4c6 0 9.6 6.6 9.6 6.6s-3.6 6.6-9.6 6.6S2.4 12 2.4 12 6 5.4 12 5.4Z"/><path d="M2.4 12S6 5.4 12 5.4 21.6 12 21.6 12s-3.6 6.6-9.6 6.6S2.4 12 2.4 12Z"/><circle ${S} cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="3.2"/><circle ${S} cx="13.5" cy="10.6" r=".8"/>`,
    grid:`<rect ${F} x="3" y="3" width="8" height="8" rx="1.8"/><rect ${F} x="13" y="3" width="8" height="8" rx="1.8"/><rect ${F} x="3" y="13" width="8" height="8" rx="1.8"/><rect ${S} x="13" y="13" width="8" height="8" rx="1.8"/><rect x="3" y="3" width="8" height="8" rx="1.8"/><rect x="13" y="3" width="8" height="8" rx="1.8"/><rect x="3" y="13" width="8" height="8" rx="1.8"/><rect x="13" y="13" width="8" height="8" rx="1.8"/>`,
    layers:`<path ${S} d="m12 2.6 9.4 5.2-9.4 5.2L2.6 7.8Z"/><path d="m12 2.6 9.4 5.2-9.4 5.2L2.6 7.8Z"/><path d="m2.6 12.2 9.4 5.2 9.4-5.2"/><path d="m2.6 16.4 9.4 5.2 9.4-5.2"/>`
  };

  function installSprite(){
    if($('#t7IconSprite'))return;
    const svg=document.createElementNS(NS,'svg');svg.id='t7IconSprite';svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    const defs=document.createElementNS(NS,'defs');
    Object.entries(symbols).forEach(([name,body])=>{const sym=document.createElementNS(NS,'symbol');sym.id=`t7i-${name}`;sym.setAttribute('viewBox','0 0 24 24');sym.innerHTML=body;defs.appendChild(sym)});
    svg.appendChild(defs);document.body.prepend(svg);
  }
  function icon(name,cls=''){
    if(!symbols[name])name='sparkles';
    const svg=document.createElementNS(NS,'svg');svg.classList.add('t7-icon');if(cls)cls.split(' ').forEach(c=>c&&svg.classList.add(c));svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    const use=document.createElementNS(NS,'use');use.setAttribute('href',`#t7i-${name}`);svg.appendChild(use);return svg;
  }
  function cleanText(el){return String(el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
  function add(el,name,where='prepend',cls=''){
    if(!el||!symbols[name]||el.dataset.t7Iconized==='1')return;
    /* Some components place their own glyph (the photo viewer's actions, the
       phone-reference card). Without this the auto-decorator prepends a second
       one and the button shows two icons, which breaks the one-icon-per-element
       rule. Only guards the leading slot; a deliberate trailing icon still works. */
    if(where!=='append'&&el.querySelector(':scope > svg,:scope > [class*="-icon"]')){el.dataset.t7Iconized='1';el.classList.add('t7-has-icon');return}
    const i=icon(name,cls);where==='append'?el.appendChild(i):el.prepend(i);el.dataset.t7Iconized='1';el.classList.add('t7-has-icon');return i;
  }
  function addHeading(host,name){
    if(!host||host.querySelector(':scope > .t7-heading-icon'))return;
    const badge=document.createElement('span');badge.className='t7-heading-icon';badge.appendChild(icon(name));host.prepend(badge);host.classList.add('t7-heading-with-icon');
  }

  const routeIcons={home:'home',shoot:'shoot',review:'review',learn:'learn',library:'library',camera:'camera',simulator:'gauge',conditions:'sun',practice:'target',edit:'sliders',visuals:'guide'};
  const subjectIcons={portrait:'portrait',product:'product',landscape:'landscape',action:'action',indoor:'indoor',night:'night'};
  const sceneIcons={tvDark:'monitor',brightWindow:'window',blackCarSun:'car',indoorProduct:'product',movingCar:'car',nightHandheld:'night'};
  const labelIcons={
    'mode':'settings','lens':'lens','iso':'iso','af':'focus','autofocus':'focus','af mode':'focus','af point':'focus','drive':'drive','exposure':'exposure','shutter':'shutter','shutter speed':'shutter','aperture':'aperture','focal length':'lens','focus / detail':'focus','focus/detail':'focus','contrast':'sliders','tone range':'sun','highlights':'sun','shadows':'night','white balance':'wb','light':'sun','color':'palette','colour':'palette','crop':'crop','detail':'sparkles','camera':'camera','reshoot':'refresh','reviewed':'review','learning':'learn','recent session':'history','actual camera settings':'camera','technical trend':'gauge','skills':'target','full library':'folder'
  };
  function iconForText(text){
    const t=String(text||'').toLowerCase().trim();
    if(!t)return null;
    const entries=[
      [/^home$/, 'home'],[/^shoot$|start shooting|guided shoot|start a shoot|open guided shoot|try guided shoot/,'shoot'],[/review|analy[sz]e photo|strongest photo/,'review'],[/learn|lesson|skill/,'learn'],[/library|archive|history/,'library'],[/camera control|your camera|rebel t7|camera$/,'camera'],[/simulator|exposure simulator/,'gauge'],[/condition|golden hour|sunrise|sunset|weather|light/,'sun'],[/practice|challenge|drill/,'target'],[/edit|editor/,'sliders'],[/visual|guide|viewfinder|frame/,'guide'],[/portrait|person|people/,'portrait'],[/product|tech/,'product'],[/landscape|building/,'landscape'],[/action|movement|moving/,'action'],[/indoor|room/,'indoor'],[/night|low light/,'night'],[/tv|screen|monitor/,'monitor'],[/window/,'window'],[/car|vehicle/,'car'],[/upload|choose photo|open photo/,'upload'],[/export|download/,'download'],[/auto fix|smart start|auto/,'wand'],[/compare|before \/ after|split/,'compare'],[/crop/,'crop'],[/rotate/,'rotate'],[/reset|start over/,'refresh'],[/apply suggested edit|apply auto|apply/,'wand'],[/continue|next|resume|open|try on your t7|try focal|start$/,'arrow'],[/previous|back/,'back'],[/complete|learned|finish|done|mark/,'checkCircle'],[/cancel|clear|close/,'close'],[/delete|trash/,'trash'],[/search|check conditions/,'search'],[/use my location|location/,'location'],[/settings|setup|controls/,'settings'],[/focus|af point|autofocus/,'focus'],[/iso/,'iso'],[/aperture|f\//,'aperture'],[/shutter|1\//,'shutter'],[/lens|mm/,'lens'],[/exposure|ev/,'exposure'],[/white balance|wb/,'wb'],[/quick/,'bolt'],[/color|colour|warmth|saturation/,'palette'],[/detail|sharpness/,'sparkles'],[/grid|contact sheet/,'grid'],[/local|private/,'lock'],[/info|about/,'info']
    ];
    for(const [re,name] of entries)if(re.test(t))return name;
    return null;
  }

  function decorateNavigation(root=document){
    $$('.desktop-nav a,.mobile-dock a',root).forEach(a=>{const route=(a.getAttribute('href')||'').replace('#','');add(a,routeIcons[route]||'chevron')});
  }
  function decorateSubjects(root=document){
    $$('[data-subject]',root).forEach(el=>add(el,subjectIcons[el.dataset.subject]||iconForText(cleanText(el))||'shoot'));
    $$('[data-shot]',root).forEach(el=>add(el,subjectIcons[el.dataset.shot]||iconForText(cleanText(el))||'shoot'));
    $$('[data-scene]',root).forEach(el=>add(el,sceneIcons[el.dataset.scene]||iconForText(cleanText(el))||'sparkles'));
  }
  function decorateButtons(root=document){
    $$('a.button,button,.ev2-tool-btn,.ev2-tab,.ev2-crop,.library-mini,.cv3-tab,.cv3-control-chip,.home-v2-utility',root).forEach(el=>{
      if(el.closest('#t7IconSprite')||el.classList.contains('cv3-hotspot')||el.classList.contains('hotspot')||el.matches('[data-subject],[data-shot],[data-scene]'))return;
      const text=cleanText(el),name=iconForText(text);if(name)add(el,name);
    });
  }
  function decorateDataCards(root=document){
    $$('.review-metric,.review-exif-values>div,.rv2-setting-row>div,.library-stat,.library-skill,.home-v2-session-stat,.shoot-focus-support>div,.shoot-focus-full-grid>div,.cv3-ref,.exif-card,.weather-grid>div,.golden-grid>div',root).forEach(card=>{
      if(card.querySelector(':scope > .t7-card-icon'))return;
      const label=cleanText(card.querySelector('small,label')||card).split('•')[0].trim(),name=labelIcons[label]||iconForText(label);if(!name)return;
      const i=icon(name,'t7-card-icon');card.prepend(i);card.classList.add('t7-icon-card');
    });
  }
  function decorateMajorCards(root=document){
    const defs=[
      ['.home-v2-next','target'],['.home-v2-recent','history'],['.home-v2-light','sun'],['.home-v2-learning','learn'],
      ['.review-exif-audit','camera'],['.review-next','arrow'],['.reshoot-flow','refresh'],['.library-reshoot','refresh'],['.library-list-card','grid'],
      ['.lv2-challenge','target'],['.lv2-t7','camera'],['.ev2-auto-card','wand'],['.conditions-v2','sun'],['.cv3-tour','target'],['.cv3-reference','settings']
    ];
    defs.forEach(([sel,name])=>$$(`${sel}`,root).forEach(el=>{if(el.querySelector(':scope > .t7-corner-icon'))return;const b=document.createElement('span');b.className='t7-corner-icon';b.appendChild(icon(name));el.prepend(b)}));
  }
  function decorateHeadings(root=document){
    const defs=[
      ['#home .home-v2-hero-copy','shoot'],['#shoot .shoot-flow-head>div','#shoot'],['#review .rv2-head>div','review'],['#learn .learn-v2-head>div','learn'],['#library .library-hero>div','library'],['#conditions .cv2-hero>div','sun'],['#camera .cv3-hero>div','camera'],['#edit .section-head>div','sliders'],['#simulator .section-head>div','gauge'],['#practice .section-head>div','target'],['#visuals .section-head>div','guide']
    ];
    defs.forEach(([sel,name])=>{const host=$(sel);if(host)addHeading(host,name==='#shoot'?'shoot':name)});
    // fallback section heads
    $$('.section-head>div',root).forEach(host=>{if(host.querySelector(':scope > .t7-heading-icon'))return;const h=host.querySelector('h1,h2,h3'),name=iconForText(cleanText(h));if(name)addHeading(host,name)});
  }
  function decorateSpecial(root=document){
    // Editor tabs get fixed semantics rather than text heuristics.
    const editorTabs={quick:'bolt',light:'sun',color:'palette',crop:'crop',detail:'sparkles'};
    $$('.ev2-tab',root).forEach(el=>{const k=el.dataset.ev2Tab; if(k&&editorTabs[k]&&!el.dataset.t7Iconized)add(el,editorTabs[k])});
    // Camera views and key physical controls.
    $$('.cv3-tab',root).forEach(el=>{const t=cleanText(el);if(t.includes('back'))add(el,'back');else if(t.includes('top'))add(el,'camera');else if(t.includes('lens'))add(el,'lens')});
    $$('.cv3-control-chip',root).forEach(el=>{const t=cleanText(el);let n=iconForText(t);if(t.includes('mode dial'))n='settings';if(t.includes('main dial'))n='sliders';if(t.includes('quick control'))n='bolt';if(t.includes('av ±'))n='exposure';if(t.includes('live view'))n='eye';if(t.includes('drive'))n='drive';if(t.includes('white balance'))n='wb';if(t.includes('stabilizer'))n='focus';if(n)add(el,n)});
    // Library archive summary.
    $$('.qa-library-archive>summary',root).forEach(el=>add(el,'folder'));
    // Review scene badge and privacy/status pills.
    $$('.review-scene-context,.review-badge,.library-local,.privacy-badge',root).forEach(el=>{if(!el.querySelector(':scope > .t7-status-icon')){const i=icon(cleanText(el).includes('scene')?'sparkles':'lock','t7-status-icon');el.prepend(i)}});
    // Progress / done markers.
    $$('.task input:checked',root).forEach(input=>input.closest('.task')?.classList.add('t7-task-done'));
  }
  function decorate(root=document){
    installSprite();decorateNavigation(root);decorateSubjects(root);decorateButtons(root);decorateDataCards(root);decorateMajorCards(root);decorateHeadings(root);decorateSpecial(root);
  }

  installSprite();decorate();
  let queued=false;
  const observer=new MutationObserver(muts=>{
    let relevant=false;for(const m of muts){if(m.addedNodes.length||m.type==='characterData'){relevant=true;break}}
    if(!relevant||queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()});
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('t7-route-changed',()=>setTimeout(()=>decorate(),0));
  window.addEventListener('t7-history-updated',()=>setTimeout(()=>decorate(),30));
  window.addEventListener('t7-review-updated',()=>setTimeout(()=>decorate(),30));
  window.T7Icons={icon,add,decorate,version:'1.0.0'};
})();