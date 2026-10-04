/* Every page, project and native disclosure remains available without this file. */
(() => {
  const explorer = document.querySelector('[data-explorer]');
  if (explorer) {
    const index = explorer.querySelector('.project-index');
    const tabs = [...index.querySelectorAll('[data-project]')];
    const panels = [...explorer.querySelectorAll('[data-panel]')];
    const fromHash = () => tabs.find(tab => tab.hash === location.hash);
    index.setAttribute('role', 'tablist');
    index.setAttribute('aria-orientation', 'vertical');
    tabs.forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', tab.hash.slice(1));
    });
    panels.forEach(panel => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', 'choice-' + panel.dataset.panel);
      panel.tabIndex = 0;
    });
    let selected;
    const stage = explorer.querySelector('.project-stage');
    function positionConnection() {
      if (!selected) return;
      const choice = selected.getBoundingClientRect();
      explorer.style.setProperty('--connection-y', (choice.top + choice.height / 2 - stage.getBoundingClientRect().top) + 'px');
    }
    function select(tab, {history = false, animate = false} = {}) {
      selected = tab;
      tabs.forEach(item => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach(panel => {
        const active = panel.dataset.panel === tab.dataset.project;
        panel.hidden = !active;
        panel.classList.toggle('revealed', active && animate);
      });
      positionConnection();
      if (history && location.hash !== tab.hash) window.history.pushState(null, '', tab.hash);
    }
    tabs.forEach((tab, position) => {
      tab.addEventListener('click', event => {
        // Modified clicks retain normal anchor behaviour.
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        select(tab, {history: true, animate: true});
      });
      tab.addEventListener('keydown', event => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        let next;
        if (event.key === 'ArrowDown') next = (position + 1) % tabs.length;
        if (event.key === 'ArrowUp') next = (position + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          tabs.forEach((item, i) => item.tabIndex = i === next ? 0 : -1);
          tabs[next].focus();
        }
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          select(tab, {history: true, animate: true});
        }
      });
    });
    index.addEventListener('focusout', event => {
      if (!index.contains(event.relatedTarget)) tabs.forEach(tab => tab.tabIndex = tab === selected ? 0 : -1);
    });
    window.addEventListener('resize', positionConnection);
    if ('ResizeObserver' in window) new ResizeObserver(positionConnection).observe(index);
    select(fromHash() || tabs[0]);
    explorer.classList.add('explorer-ready');
    const syncHash = () => {
      const tab = fromHash();
      if (!tab) return;
      select(tab);
      requestAnimationFrame(() => document.getElementById('projects').scrollIntoView({behavior: 'instant'}));
    };
    window.addEventListener('popstate', syncHash);
    window.addEventListener('hashchange', syncHash);
    // Project return links open the right preview with the complete index in view.
    if (fromHash()) {
      window.addEventListener('load', () => {
        document.getElementById('projects').scrollIntoView({behavior: 'instant'});
      }, {once: true});
    }
  }

  const contents = document.body.classList.contains('home') ? [...document.querySelectorAll('.rail [data-section]')] : [];
  const sections = contents.map(link => document.getElementById(link.dataset.section)).filter(Boolean);
  if (sections.length) {
    let frame = 0;
    function updateLocation() {
      frame = 0;
      let active;
      for (const section of sections) if (section.getBoundingClientRect().top <= innerHeight * .4) active = section.id;
      if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) active = 'contact';
      contents.forEach(link => {
        if (link.dataset.section === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateLocation); }, {passive: true});
    window.addEventListener('resize', updateLocation);
    updateLocation();
  }

  if (navigator.clipboard && window.isSecureContext) {
    const bio = document.querySelector('.copy-bio');
    if (bio) {
      bio.hidden = false;
      bio.addEventListener('click', async () => {
        const status = document.querySelector('.copy-status');
        try {
          await navigator.clipboard.writeText(document.getElementById('short-bio').innerText.trim());
          status.textContent = 'Short bio copied.';
        } catch { status.textContent = 'You can select and copy the biography below.'; }
      });
    }
    document.querySelectorAll('.copy-link').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', async () => {
        const status = button.parentElement.querySelector('.share-status');
        try {
          await navigator.clipboard.writeText('https://bilalghanty.github.io/');
          status.textContent = 'Website link copied.';
          button.querySelector('span').innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m4 12 5 5 11-11"/></svg>';
        } catch { status.textContent = 'Website: bilalghanty.github.io'; }
      });
    });
  }
})();

/* One optional preference. Scroll-linked effects are handled by the browser. */
(() => {
 const controls=[...document.querySelectorAll('.motion-control')];
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 const supported=CSS.supports('animation-timeline','view()');
 let paused=false;
 try { paused=localStorage.getItem('bilal-motion')==='off'; } catch {}
 function render(){
  const enabled=supported&&!media.matches&&!paused;
  document.documentElement.classList.toggle('motion-off',!enabled);
  controls.forEach(button=>{
   button.hidden=!supported;
   button.disabled=media.matches;
   button.setAttribute('aria-pressed',String(enabled));
   button.querySelector('span').textContent=enabled?'on':'off';
   button.setAttribute('aria-label',media.matches?'Page animations disabled by your device settings':'Page animations');
  });
 }
 controls.forEach(button=>button.addEventListener('click',()=>{
  paused=!paused;
  try {localStorage.setItem('bilal-motion',paused?'off':'on');}catch{}
  render();
 }));
 media.addEventListener('change',render);
 render();
})();

/* Only enhance the narrative when native scroll timelines are available.
   All three steps remain readable in every state; no scroll listener is needed. */
(() => {
  if (!CSS.supports('animation-timeline', 'view()')) return;
  document.querySelectorAll('.connection').forEach(scene => scene.classList.add('story-ready'));
})();

/* Fine pointers get a small additional angle on the selected project sheet.
   Scroll, keyboard navigation and the native project layout stay independent. */
(() => {
 const stage=document.querySelector('.project-stage');
 if(!stage)return;
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let frame=0,amount=0;
 const enabled=()=>fine.matches&&!reduced.matches&&!document.documentElement.classList.contains('motion-off');
 const reset=()=>{amount=0;stage.querySelectorAll('.project-panel').forEach(panel=>panel.style.removeProperty('--pointer-tilt'));};
 const paint=()=>{frame=0;if(!enabled()){reset();return;}const panel=stage.querySelector('.project-panel:not([hidden])');if(panel)panel.style.setProperty('--pointer-tilt',amount+'deg');};
 stage.addEventListener('pointermove',event=>{
  if(!enabled()||event.pointerType==='touch')return;
  const box=stage.getBoundingClientRect();
  const x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;
  amount=Math.max(-2.5,Math.min(2.5,(x-y)*3));
  if(!frame)frame=requestAnimationFrame(paint);
 },{passive:true});
 stage.addEventListener('pointerleave',reset);
 stage.addEventListener('focusin',reset);
 reduced.addEventListener('change',reset);fine.addEventListener('change',reset);
 new MutationObserver(()=>{if(!enabled())reset();}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
})();
