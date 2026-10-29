/* Each controller owns one interaction; GSAP only owns inner reveal layers. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 1024px)');
  const gs = window.gsap;
  const hasMotion = !!(gs && window.ScrollTrigger);
  let roomController, heroController, smoother = null, menuOpen = false;
  const animations = new Map();

  if (hasMotion) {
    gs.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }
  function setupSmoothScroll() {
    if (!hasMotion || !window.ScrollSmoother) return;
    gs.registerPlugin(ScrollSmoother);
    gs.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: .9, smoothTouch: .1, effects: false, onFocusIn: (_, event) => event.target.matches('section, #brand') || event.target.closest('.slide-menu') ? false : undefined });
      if (menuOpen || document.body.getAttribute('aria-busy') === 'true') smoother.paused(true);
      return () => {
        const position = smoother.scrollTop();
        smoother.kill(); smoother = null; window.scrollTo(0, position);
      };
    });
  }
  function navigateTo(hash, focus = false, animate = true) {
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    if (location.hash !== hash) history.pushState(null, '', hash);
    if (focus) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    if (smoother) smoother.scrollTo(Math.max(0, smoother.offset(target, `top ${$('header').offsetHeight + 20}px`)), animate);
    else target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.hash.length < 2 || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigateTo(link.hash, event.detail === 0);
  });
  addEventListener('popstate', () => {
    if (location.hash) navigateTo(location.hash);
    else if (smoother) smoother.scrollTo(0, true);
    else window.scrollTo(0, 0);
  });

  function finishAnimation(key) {
    const animation = animations.get(key);
    if (animation) { animation.progress(1).kill(); animations.delete(key); }
  }
  function ink(element) {
    if (!element) return null;
    if (element.firstElementChild?.classList.contains('entry-ink')) return element.firstElementChild;
    const span = document.createElement('span');
    span.className = 'entry-ink';
    span.append(...element.childNodes);
    element.append(span); element.classList.add('entry-mask');
    return span;
  }
  function lines(timeline, elements, at = 0, stagger = .1) {
    const targets = elements.filter(Boolean).map(ink);
    timeline.fromTo(targets, { yPercent: 110 }, { yPercent: 0, duration: .85, stagger, ease: 'power3.out', clearProps: 'transform' }, at);
  }
  function openImages(timeline, elements, at = 0) {
    timeline.fromTo(elements, { clipPath: 'inset(8% 0 92% 0)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: .85, stagger: .08,
      ease: 'power2.inOut', clearProps: 'clipPath',
    }, at);
  }
  function revealRoom(panel) {
    finishAnimation('rooms');
    if (!gs || reduced.matches) return;
    const cards = $$('.part', panel);
    const tl = gs.timeline(); animations.set('rooms', tl);
    openImages(tl, cards, 0);
    tl.fromTo($$('.img-text > *', panel), { y: 18, opacity: 0 }, {
      y: 0, opacity: 1, duration: .5, stagger: .05, clearProps: 'transform,opacity',
    }, .3);
  }

  function setupRooms() {
    const root = $('.section_2');
    const tabs = $$('.room-tab', root), panels = $$('.box-1__main > ul > li', root);
    let selected = -1, tabSwiper = null;
    const roomSwipers = new Map();
    const tabList = $('.tab-wrapper .swiper-wrapper', root);
    tabList.setAttribute('role', 'tablist'); tabList.setAttribute('aria-label', '객실 종류');
    tabs.forEach((tab, index) => {
      tab.dataset.roomIndex = index; tab.id = `room-tab-${index}`; tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `room-panel-${index}`);
      panels[index].id = `room-panel-${index}`;
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
    });
    // Wrap once. Responsive changes destroy Swiper instances, never room content.
    $$('.part-wrap', root).forEach((wrap) => {
      wrap.classList.add('room-swiper');
      const track = document.createElement('div'); track.className = 'swiper-wrapper';
      track.append(...wrap.children); wrap.append(track);
      const counter = document.createElement('p'); counter.className = 'room-counter'; counter.setAttribute('aria-hidden', 'true');
      counter.textContent = `01 / ${String(track.children.length).padStart(2, '0')}`; wrap.after(counter);
      $$('.part', track).forEach((card, index) => {
        card.classList.add('swiper-slide'); card.tabIndex = 0;
        card.setAttribute('role', 'button'); card.setAttribute('aria-expanded', 'false');
        card.setAttribute('aria-label', `${$('.img-text', card).innerText.trim().replace(/\s+/g, ' ')} 객실 설명`);
        const toggle = () => {
          const open = !card.classList.contains('is-expanded');
          $$('.part.is-expanded', root).forEach((other) => { other.classList.remove('is-expanded'); other.setAttribute('aria-expanded', 'false'); });
          card.classList.toggle('is-expanded', open); card.setAttribute('aria-expanded', String(open));
        };
        card.addEventListener('click', toggle);
        card.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
          if (event.key === 'Escape') { card.classList.remove('is-expanded'); card.setAttribute('aria-expanded', 'false'); }
        });
        card.addEventListener('focus', () => roomSwipers.get(wrap)?.slideTo(index));
      });
    });
    function sizeCaptions() {
      const panel = panels[selected];
      if (!panel) return;
      const wrap = $('.part-wrap', panel), track = $('.swiper-wrapper', wrap);
      const count = track.children.length, gap = mobile.matches ? 0 : 20;
      const available = track.clientWidth - gap * (count - 1);
      const expanded = mobile.matches || count === 1 ? track.clientWidth : available * 2 / (count + 1);
      wrap.style.setProperty('--caption-width', `${Math.max(180, Math.min(600, expanded - 48))}px`);
    }
    new ResizeObserver(sizeCaptions).observe(root);
    function select(index, animate = true, sync = true) {
      index = (index + tabs.length) % tabs.length;
      if (index === selected) {
        if (sync && tabSwiper) tabSwiper.slideToLoop(index);
        return;
      }
      finishAnimation('rooms'); selected = index;
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
        tab.parentElement.classList.toggle('active', active);
        panels[i].hidden = !active; panels[i].classList.toggle('active', active);
      });
      if (sync && tabSwiper && tabSwiper.realIndex !== index) tabSwiper.slideToLoop(index);
      sizeCaptions();
      if (smoother) requestAnimationFrame(() => ScrollTrigger.refresh());
      roomSwipers.get($('.part-wrap', panels[index]))?.update();
      if (animate && root.dataset.entry === 'entered') revealRoom(panels[index]);
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', (event) => {
        let next;
        if (event.key === 'ArrowRight') next = index + 1;
        else if (event.key === 'ArrowLeft') next = index - 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault(); select(next); tabs[selected].focus();
      });
    });
    $('.btn-prev', root).addEventListener('click', () => select(selected - 1));
    $('.btn-next', root).addEventListener('click', () => select(selected + 1));
    select(0, false);
    if (window.Swiper) {
      tabSwiper = new Swiper($('.tab-wrapper', root), {
        slidesPerView: 1, centeredSlides: true, loop: true, spaceBetween: 12, a11y: { enabled: false },
        breakpoints: { 769: { slidesPerView: 3, spaceBetween: 30 } },
        on: { slideChange() { select(this.realIndex, true, false); } },
      });
    }
    function responsiveRooms() {
      finishAnimation('rooms');
      $$('.part-wrap', root).forEach((wrap) => {
        if (mobile.matches && window.Swiper && !roomSwipers.has(wrap)) {
          wrap.classList.add('swiper');
          const updateCount = function () {
            wrap.nextElementSibling.textContent = `${String(this.activeIndex + 1).padStart(2, '0')} / ${String($$('.part', wrap).length).padStart(2, '0')}`;
          };
          roomSwipers.set(wrap, new Swiper(wrap, {
            slidesPerView: 1, spaceBetween: 16, watchOverflow: true, a11y: { enabled: false },
            breakpoints: { 600: { slidesPerView: $$('.part', wrap).length > 1 ? 1.35 : 1, spaceBetween: 20 } },
            on: { init: updateCount, slideChange: updateCount },
          }));
        } else if (!mobile.matches && roomSwipers.has(wrap)) {
          roomSwipers.get(wrap).destroy(true, true); roomSwipers.delete(wrap); wrap.classList.remove('swiper');
        }
      });
      sizeCaptions();
    }
    mobile.addEventListener('change', responsiveRooms); responsiveRooms();
    return { select, activePanel: () => panels[selected] };
  }

  function setupHero() {
    const root = $('.section_1');
    const slides = $$('.slide', root), progress = $('.progress', root), play = $('.hero-playback', root);
    let selected = 0, ready = false, userPaused = false, heroVisible = true, cycle = null, fallbackTimer = null;
    const duration = 6;
    function animateSlide(slide) {
      finishAnimation('hero');
      if (!gs || reduced.matches) return;
      const tl = gs.timeline(); animations.set('hero', tl);
      tl.fromTo($('img', slide), { scale: 1.045 }, { scale: 1, duration: 1.5, ease: 'power2.out', clearProps: 'transform' }, 0);
      lines(tl, [$('h1, h2', slide)], .12);
      tl.fromTo($('.title-1', slide), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .65, clearProps: 'transform,opacity' }, .34);
    }
    function suspended() { return !ready || userPaused || reduced.matches || menuOpen || document.hidden || !heroVisible; }
    function refreshPlayback() {
      const paused = suspended();
      cycle?.paused(paused);
      if (!gs) {
        clearTimeout(fallbackTimer);
        if (!paused) fallbackTimer = setTimeout(() => show(selected + 1), duration * 1000);
      }
      play.disabled = reduced.matches;
      play.setAttribute('aria-pressed', String(userPaused || reduced.matches));
      play.setAttribute('aria-label', userPaused ? '자동 슬라이드 재생' : '자동 슬라이드 일시정지');
      play.textContent = userPaused || reduced.matches ? '▶' : 'Ⅱ';
    }
    function restartCycle() {
      cycle?.kill(); clearTimeout(fallbackTimer);
      if (gs) {
        gs.set(progress, { scaleX: 0 });
        cycle = gs.to(progress, { scaleX: 1, duration, ease: 'none', paused: true, onComplete: () => show(selected + 1) });
      }
      refreshPlayback();
    }
    function show(index, animate = true) {
      selected = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === selected);
        slide.setAttribute('aria-hidden', String(i !== selected));
      });
      $('.current', root).textContent = String(selected + 1).padStart(2, '0');
      $('.total', root).textContent = String(slides.length).padStart(2, '0');
      if (animate) animateSlide(slides[selected]);
      restartCycle();
    }
    $('.swiper-button-prev', root).addEventListener('click', () => show(selected - 1));
    $('.swiper-button-next', root).addEventListener('click', () => show(selected + 1));
    play.addEventListener('click', () => { userPaused = !userPaused; refreshPlayback(); });
    document.addEventListener('visibilitychange', refreshPlayback);
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; refreshPlayback(); }).observe(root);
    reduced.addEventListener('change', () => { if (reduced.matches) finishAnimation('hero'); refreshPlayback(); });
    show(0, false);
    return { start() { ready = true; animateSlide(slides[selected]); restartCycle(); }, refreshPlayback };
  }

  function setupMenu() {
    const menu = $('.slide-menu'), header = $('header'), trigger = $('.sidebar_menu-box'), close = $('.close-btn');
    const right = $('.right-box'), main = $('main'), footer = $('footer');
    const categories = {
      brand: [['브랜드 소개', '#brand'], ['아이덴티티', '#brand']],
      room: ['디럭스','프리미어','오션 스위트','패밀리 스위트','프리미어 스위트','로얄 스위트'].map((name,index) => [name,'#sec2',index]),
      facility: [['메인 풀','#sec3'],['프라이빗 룸','#sec3'],['카페','#sec3'],['편의점','#sec3']],
      event: [['프로모션','#sec4'],['이벤트 안내','#sec4']],
      location: [['지도 보기','#sec5'],['교통 안내','#sec5']],
    };
    function preview(link) {
      $('.side-img-box img').src = link.dataset.img;
      right.dataset.heading = link.textContent;
      $$('.menu-preview').forEach(button => {
        const active = button.previousElementSibling === link;
        button.setAttribute('aria-pressed', String(active)); button.textContent = active ? '−' : '+';
      });
      const fragment = document.createDocumentFragment();
      (categories[link.dataset.box] || []).forEach(([name, href, room]) => {
        const li = document.createElement('li'), a = document.createElement('a');
        a.textContent = name; a.href = href;
        if (room !== undefined) a.dataset.room = room;
        li.append(a); fragment.append(li);
      });
      right.replaceChildren(fragment);
    }
    let closeTimer = null, afterClose = null;
    function finishClose() {
      if (!menu.classList.contains('closing')) return;
      clearTimeout(closeTimer); menu.classList.remove('closing');
      menuOpen = false; document.body.classList.remove('menu-open');
      main.inert = false; footer.inert = false;
      if (smoother) { const position = smoother.scrollTop(); smoother.paused(false).scrollTop(position); }
      heroController?.refreshPlayback();
      const next = afterClose; afterClose = null; next?.();
    }
    function setOpen(open, restoreFocus = false, next = null) {
      clearTimeout(closeTimer); afterClose = next;
      trigger.setAttribute('aria-expanded', String(open));
      if (open) {
        menuOpen = true; menu.inert = false;
        menu.classList.remove('closing'); menu.classList.add('active');
        document.body.classList.add('menu-open'); main.inert = true; footer.inert = true;
        smoother?.paused(true); header.classList.remove('nav-up');
        preview($('.menu-links a')); close.focus({ preventScroll: true });
      } else {
        if (restoreFocus) trigger.focus({ preventScroll: true });
        else if (menu.contains(document.activeElement)) document.activeElement.blur();
        menu.inert = true; menu.classList.add('closing'); menu.classList.remove('active');
        if (reduced.matches) finishClose();
        else closeTimer = setTimeout(finishClose, 650);
      }
      heroController?.refreshPlayback();
    }
    menu.addEventListener('transitionend', event => {
      if (event.target === menu && event.propertyName === 'clip-path') finishClose();
    });
    trigger.addEventListener('click', () => setOpen(true)); close.addEventListener('click', () => setOpen(false, true));
    right.id = 'site-menu-details';
    $$('.menu-links a').forEach((link) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'menu-preview';
      button.textContent = '+'; button.setAttribute('aria-label', `${link.textContent} 하위 메뉴 보기`);
      button.setAttribute('aria-controls', right.id); button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => preview(link)); link.after(button);
      link.addEventListener('pointerenter', () => { if (matchMedia('(min-width: 600px) and (hover: hover)').matches) preview(link); }); link.addEventListener('focus', () => preview(link));
    });
    menu.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      event.preventDefault(); event.stopPropagation();
      if (link.dataset.room !== undefined) roomController.select(Number(link.dataset.room));
      setOpen(false, false, () => navigateTo(link.hash, true));
    });
    document.addEventListener('keydown', (event) => {
      if (!menuOpen) return;
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
      if (event.key === 'Tab') {
        const links = $$('button, a[href]', menu).filter(el => el.getClientRects().length);
        const first = links[0], last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    let last = scrollY, scheduled = false;
    function updateHeader() {
      const y = Math.max(0, scrollY), diff = y - last; scheduled = false;
      if (menuOpen || header.querySelector(':focus-visible') || y <= header.offsetHeight) header.classList.remove('nav-up');
      else if (Math.abs(diff) > 5) header.classList.toggle('nav-up', diff > 0);
      if (Math.abs(diff) > 5 || y === 0) last = y;
    }
    addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateHeader); } }, { passive: true });
    header.addEventListener('focusin', () => header.classList.remove('nav-up'));
  }

  function setupCarousels() {
    if (!window.Swiper) return;
    new Swiper($('.facility-swiper'), {
      slidesPerView: 1, loop: true,
      a11y: { nextSlideMessage: '다음 편의시설', prevSlideMessage: '이전 편의시설', paginationBulletMessage: '{{index}}번 편의시설' },
      pagination: { el: $('.section_3 .swiper-pagination'), clickable: true },
      navigation: { nextEl: $('.section_3 .swiper-button-next'), prevEl: $('.section_3 .swiper-button-prev') },
      on: { slideChangeTransitionStart() {
        if ($('.section_3').dataset.entry !== 'entered') return;
        const slide = this.slides[this.activeIndex]; finishAnimation('facility');
        if (!gs || reduced.matches || !slide) return;
        const tl = gs.timeline(); animations.set('facility', tl);
        lines(tl, $$('h2, p', slide), .08);
      } },
    });
    new Swiper($('.event-swiper'), {
      slidesPerView: 1, spaceBetween: 16, watchOverflow: true,
      a11y: { nextSlideMessage: '다음 이벤트', prevSlideMessage: '이전 이벤트' },
      breakpoints: { 600: { slidesPerView: 2, spaceBetween: 20 }, 1200: { slidesPerView: 3, spaceBetween: 30 } },
      pagination: { el: $('.event-pagination'), clickable: true, type: 'fraction' },
      navigation: { nextEl: $('.event-button-next'), prevEl: $('.event-button-prev') },
    });
  }

  function setupEntrances() {
    if (!hasMotion) return;
    gs.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      const groups = [];
      function group(root, build, targets) {
        if (!root || root.dataset.entry === 'entered') return;
        if (root.getBoundingClientRect().bottom < 0) { root.dataset.entry = 'entered'; return; }
        const tl = gs.timeline({ paused: true, onComplete: () => { root.dataset.entry = 'entered'; } });
        build(tl); root.dataset.entry = 'ready';
        const finish = () => { tl.progress(1).pause(); root.dataset.entry = 'entered'; };
        const trigger = ScrollTrigger.create({ trigger: root, start: 'top 82%', once: true, onEnter: () => { root.dataset.entry = 'entering'; tl.play(); } });
        root.addEventListener('focusin', finish);
        groups.push(() => { trigger.kill(); tl.kill(); root.removeEventListener('focusin', finish); gs.set(targets, { clearProps: 'opacity,transform,clipPath' }); });
      }
      $$('.divider-1, .divider-2').forEach(root => {
        const texts = $$('p', root); group(root, tl => lines(tl, texts), texts);
      });
      const rooms = $('.section_2'), roomCards = $$('.part', roomController.activePanel());
      group(rooms, tl => {
        lines(tl, [$('.room-heading')]);
        tl.fromTo($('.box-1__head'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .55, clearProps: 'transform,opacity' }, .12);
        openImages(tl, roomCards, .24);
      }, [$('.box-1__head'), ...roomCards]);
      const facility = $('.section_3');
      group(facility, tl => { openImages(tl, [$('.facility-swiper')]); lines(tl, $$('h2, p', $('.facility-swiper .swiper-slide-active')), .2); }, [$('.facility-swiper')]);
      const event = $('.section_4'), eventText = $$('.event-text-box > *');
      group(event, tl => {
        lines(tl, eventText, 0, .1); openImages(tl, $$('.event-swiper img'), .25);
      }, [...eventText, ...$$('.event-swiper img')]);
      const location = $('.section_5'), locationText = $$('.text-box > *', location);
      group(location, tl => { lines(tl, locationText, 0, .13); openImages(tl, [$('.img-box', location)], .25); }, [...locationText, $('.img-box', location)]);
      return () => groups.forEach(destroy => destroy());
    });
  }

  function setupFooterCover() {
    if (!hasMotion) return;
    gs.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      const previous = $('#sec5'), footer = $('footer');
      const pin = ScrollTrigger.create({
        trigger: previous, start: () => previous.offsetHeight < innerHeight ? 'top top' : 'bottom bottom',
        end: () => `+=${footer.offsetHeight}`,
        pin: previous, pinSpacing: false, invalidateOnRefresh: true,
      });
      return () => pin.kill();
    });
  }

  async function start() {
    const loading = $('.loading'), startedAt = performance.now();
    document.body.setAttribute('aria-busy', 'true');
    document.documentElement.classList.add('page-loading');
    const stopScroll = event => event.preventDefault();
    const stopKeys = event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) event.preventDefault();
    };
    document.addEventListener('wheel', stopScroll, { passive: false });
    document.addEventListener('touchmove', stopScroll, { passive: false });
    document.addEventListener('keydown', stopKeys);
    const background = $$('header, main, footer'); background.forEach(node => { node.inert = true; });
    try {
      roomController = setupRooms(); heroController = setupHero(); setupMenu(); setupCarousels();
      const image = $('.section_1 .slide img');
      const ready = Promise.all([document.fonts?.ready, image.decode?.().catch(() => {})]);
      let guard;
      await Promise.race([ready, new Promise(resolve => { guard = setTimeout(resolve, 5000); })]); clearTimeout(guard);
      setupSmoothScroll(); setupEntrances(); setupFooterCover();
    } catch (error) { console.error('스타스케이프 초기화:', error); }
    finally {
      // Finish layout under the opaque loader, before starting its exit.
      document.documentElement.classList.remove('page-loading');
      if (hasMotion) ScrollTrigger.refresh();
      let finished = false, exitGuard;
      const finish = () => {
        if (finished) return;
        finished = true; clearTimeout(exitGuard);
        loading?.remove(); background.forEach(node => { node.inert = false; });
        document.removeEventListener('wheel', stopScroll);
        document.removeEventListener('touchmove', stopScroll);
        document.removeEventListener('keydown', stopKeys);
        document.body.setAttribute('aria-busy', 'false');
        if (smoother) { const position = smoother.scrollTop(); smoother.paused(false).scrollTop(position); }
        heroController?.start();
        if (location.hash.length > 1) navigateTo(location.hash, false, false);
      };
      const delay = Math.max(0, .9 - (performance.now() - startedAt) / 1000);
      if (gs && loading) {
        exitGuard = setTimeout(finish, (delay + .8) * 1000);
        gs.to(loading, { opacity: 0, delay, duration: reduced.matches ? 0 : .55, ease: 'power1.inOut', onComplete: finish });
      } else exitGuard = setTimeout(finish, delay * 1000);
    }
  }
  reduced.addEventListener('change', () => { if (reduced.matches) [...animations.keys()].forEach(finishAnimation); });
  start();
})();
