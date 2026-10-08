'use client';

import {useLayoutEffect} from 'react';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** One frame scheduler for scroll depth and pointer response. Never captures wheel/touch scrolling. */
export function useSiteMotion(route: string) {
  useLayoutEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const header = document.querySelector<HTMLElement>('.site-header');
    const track = document.querySelector<HTMLElement>('.hero-track');
    const worldHero = document.querySelector<HTMLElement>('[data-world-hero]');
    const logoSlot = header?.querySelector<HTMLElement>('.wordmark-slot');
    const wordmark = header?.querySelector<HTMLElement>('.wordmark');
    const heroMark = track?.querySelector<HTMLElement>('.hero-brand-space');
    const root = document.documentElement;
    const observed = new Set<HTMLElement>();
    const depthNodes = new Set<HTMLElement>();
    const activeDepth = new Set<HTMLElement>();
    const touched = new Set<HTMLElement>();
    let frame = 0;
    let scanFrame = 0;
    let y = window.scrollY;
    let targetY = y;
    let pointer: HTMLElement | null = null;
    let pointerBox: DOMRect | null = null;
    let px = 0, py = 0, tx = 0, ty = 0;

    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        (entry.target as HTMLElement).dataset.revealed = 'true';
        reveal.unobserve(entry.target);
      }
    }, {threshold: 0.06, rootMargin: '0px 0px -28px 0px'});
    const depthObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const node = entry.target as HTMLElement;
        if (entry.isIntersecting) activeDepth.add(node);
        else activeDepth.delete(node);
      }
      schedule();
    }, {rootMargin: '180px'});

    function scan() {
      scanFrame = 0;
      for (const node of observed) if (!node.isConnected) {observed.delete(node); reveal.unobserve(node);}
      for (const node of depthNodes) if (!node.isConnected) {depthNodes.delete(node); activeDepth.delete(node); depthObserver.unobserve(node);}
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(node => {
        if (observed.has(node)) return;
        observed.add(node);
        const box = node.getBoundingClientRect();
        // Content already above the viewport must stay available on history restoration.
        node.dataset.revealed = reduced.matches || box.bottom < 0 ? 'true' : 'false';
        reveal.observe(node);
      });
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach(node => {
        if (depthNodes.has(node)) return;
        depthNodes.add(node);
        depthObserver.observe(node);
      });
      schedule();
    }
    function queueScan() {if (!scanFrame) scanFrame = requestAnimationFrame(scan);}

    function resetPointer() {
      if (pointer) {
        pointer.removeAttribute('data-pointer-active');
        for (const property of ['--pointer-x', '--pointer-y', '--tilt-x', '--tilt-y', '--pointer-u', '--pointer-v']) pointer.style.removeProperty(property);
      }
      pointer = null;
      pointerBox = null;
      px = py = tx = ty = 0;
    }
    function pointerMove(event: PointerEvent) {
      if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
      const element = event.target instanceof Element ? event.target : null;
      const next = element?.closest<HTMLElement>('[data-magnet], [data-product-focus], [data-motion-card], [data-scene]') ?? null;
      if (next !== pointer) {
        resetPointer();
        pointer = next;
        pointerBox = next?.getBoundingClientRect() ?? null;
        if (pointer) {touched.add(pointer); pointer.dataset.pointerActive = 'true';}
      }
      if (!pointer || !pointerBox) return;
      tx = clamp((event.clientX - pointerBox.left) / pointerBox.width, 0, 1) * 2 - 1;
      ty = clamp((event.clientY - pointerBox.top) / pointerBox.height, 0, 1) * 2 - 1;
      schedule();
    }

    function render() {
      frame = 0;
      if (document.hidden) return;
      const moving = !reduced.matches;
      y = moving ? y + (targetY - y) * .16 : targetY;
      if (Math.abs(targetY - y) < .15) y = targetY;
      const viewport = window.innerHeight;
      const maxScroll = Math.max(1, root.scrollHeight - viewport);
      header?.style.setProperty('--page-progress', String(clamp(targetY / maxScroll)));
      if (header) header.dataset.surface = worldHero ? (worldHero.getBoundingClientRect().bottom <= header.offsetHeight + 20 ? 'paper' : 'image') : (!track || targetY > 48 ? 'paper' : 'image');

      if (track) {
        const stage = track.querySelector<HTMLElement>('.immersive-hero');
        const rect = track.getBoundingClientRect();
        const travel = Math.max(1, track.offsetHeight - (stage?.offsetHeight ?? viewport));
        const progress = moving ? clamp((y - (rect.top + targetY)) / travel) : 0;
        track.style.setProperty('--hero-progress', String(progress));
        track.style.setProperty('--hero-inset', `${progress * (fine.matches ? 26 : 12)}px`);
        track.style.setProperty('--hero-travel', `${progress * (fine.matches ? 88 : 38)}px`);
        track.style.setProperty('--hero-scale', String(1.045 + progress * .045));
        track.style.setProperty('--hero-copy-y', `${progress * -86}px`);
        track.style.setProperty('--hero-copy-opacity', String(clamp(1 - progress * 1.65)));

        if (logoSlot && wordmark && heroMark && header) {
          if (moving) {
            // Move the one header wordmark into the reserved hero space, then back home.
            const destination = logoSlot.getBoundingClientRect();
            const origin = heroMark.getBoundingClientRect();
            const flight = clamp((y - (rect.top + targetY)) / Math.max(240, travel * .9));
            const ease = flight * flight * (3 - 2 * flight);
            const scale = 1 + (origin.width / Math.max(1, destination.width) - 1) * (1 - ease);
            const dx = (origin.left - destination.left) * (1 - ease);
            const dy = (origin.top - destination.top) * (1 - ease);
            wordmark.style.transform = `translate3d(${dx}px,${dy}px,0) scale(${scale})`;
            // The same mask is dark over the light header and white over photography.
            const boundary = header.dataset.surface === 'paper'
              ? clamp((header.getBoundingClientRect().bottom - destination.top - dy) / scale, 0, destination.height)
              : 0;
            wordmark.style.setProperty('--logo-ink-boundary', `${boundary}px`);
            header.dataset.logoAttached = 'true';
          } else {
            header.removeAttribute('data-logo-attached');
            wordmark.style.removeProperty('transform');
            wordmark.style.removeProperty('--logo-ink-boundary');
          }
        }
      }

      // Read every frame geometry before writing any of the depth transforms.
      const positions: Array<[HTMLElement, number]> = [];
      if (moving) for (const node of activeDepth) {
        if (!node.isConnected || node.closest('[inert]')) continue;
        const box = node.getBoundingClientRect();
        const relativeTop = box.top + targetY - y;
        const progress = clamp((viewport / 2 - relativeTop - box.height / 2) / ((viewport + box.height) / 2), -1, 1);
        const strength = Number(node.dataset.parallax) || 24;
        positions.push([node, progress * strength * (fine.matches ? 1 : .55)]);
      }
      for (const [node, offset] of positions) node.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
      if (pointer && moving) {
        px += (tx - px) * .18;
        py += (ty - py) * .18;
        pointer.style.setProperty('--pointer-x', `${(px * 12).toFixed(2)}px`);
        pointer.style.setProperty('--pointer-y', `${(py * 10).toFixed(2)}px`);
        pointer.style.setProperty('--tilt-x', `${(-py * 2).toFixed(2)}deg`);
        pointer.style.setProperty('--tilt-y', `${(px * 2).toFixed(2)}deg`);
        pointer.style.setProperty('--pointer-u', `${((px + 1) * 50).toFixed(2)}%`);
        pointer.style.setProperty('--pointer-v', `${((py + 1) * 50).toFixed(2)}%`);
      }
      if (Math.abs(targetY - y) > .15 || (pointer && (Math.abs(tx - px) > .002 || Math.abs(ty - py) > .002))) schedule();
    }
    function schedule() {if (!frame && !document.hidden) frame = requestAnimationFrame(render);}
    function scroll() {targetY = window.scrollY; resetPointer(); schedule();}
    function resize() {targetY = window.scrollY; resetPointer(); queueScan();}
    function preferences() {
      root.dataset.motion = reduced.matches ? 'reduced' : 'enabled';
      if (reduced.matches) {
        observed.forEach(node => {node.dataset.revealed = 'true';});
        depthNodes.forEach(node => node.style.removeProperty('--parallax-y'));
      }
      resetPointer();
      schedule();
    }
    const mutations = new MutationObserver(queueScan);
    const main = document.getElementById('main');
    if (main) mutations.observe(main, {childList: true, subtree: true});
    window.addEventListener('scroll', scroll, {passive: true});
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', pointerMove, {passive: true});
    document.addEventListener('pointerleave', resetPointer);
    window.addEventListener('blur', resetPointer);
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', preferences);
    fine.addEventListener('change', preferences);
    preferences();
    scan();
    cancelAnimationFrame(frame);
    render();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scanFrame);
      mutations.disconnect();
      reveal.disconnect();
      depthObserver.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', pointerMove);
      document.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('blur', resetPointer);
      document.removeEventListener('visibilitychange', schedule);
      reduced.removeEventListener('change', preferences);
      fine.removeEventListener('change', preferences);
      resetPointer();
      root.removeAttribute('data-motion');
      header?.removeAttribute('data-logo-attached');
      wordmark?.style.removeProperty('transform');
      wordmark?.style.removeProperty('--logo-ink-boundary');
      observed.forEach(node => node.removeAttribute('data-revealed'));
      depthNodes.forEach(node => node.style.removeProperty('--parallax-y'));
      touched.clear();
    };
  }, [route]);
}

export function RevealHeading({lines, className = '', id}: {lines: string[]; className?: string; id?: string}) {
  return <h2 id={id} className={`motion-heading ${className}`} data-reveal="lines">{lines.map((line, index) => <span className="heading-line" key={line}><span style={{transitionDelay: `${index * 90}ms`}}>{line}</span></span>)}</h2>;
}
