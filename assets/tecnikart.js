/* A real source link without JavaScript; a player is loaded only after a click. */
(() => {
 const load = document.querySelector('[data-video-load]');
 if (load) {
  load.addEventListener('click', event => {
   if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
   event.preventDefault();
   const frame = document.createElement('iframe');
   frame.className = 'tk-player';
   frame.title = 'Défi Moteurs: karting in Mauritius — Bill Ghanty organiser interview';
   frame.src = 'https://www.youtube-nocookie.com/embed/FtYQP7qFMxY?start=253&autoplay=0&rel=0';
   frame.allow = 'encrypted-media; picture-in-picture; fullscreen';
   frame.referrerPolicy = 'strict-origin-when-cross-origin';
   frame.allowFullscreen = true;
   load.replaceWith(frame);
   frame.tabIndex = 0;
   frame.focus();
  });
 }
 const links = [...document.querySelectorAll('.tk-contents a')];
 const sections = links.map(a => document.querySelector(a.hash)).filter(Boolean);
 if (!sections.length) return;
 let scheduled = false;
 const update = () => {
  scheduled = false;
  let current = sections[0].id;
  for (const section of sections) if (section.getBoundingClientRect().top < innerHeight * .35) current = section.id;
  links.forEach(a => {
   if (a.hash === '#' + current) a.setAttribute('aria-current', 'location');
   else a.removeAttribute('aria-current');
  });
 };
 addEventListener('scroll', () => {
  if (!scheduled) {scheduled = true;requestAnimationFrame(update);}
 }, {passive:true});
 addEventListener('resize', update);
 update();
})();
