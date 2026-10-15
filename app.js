'use strict';
document.documentElement.classList.add('js');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const time=document.querySelector('[data-clock]');
function updateTime(){if(time)time.textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Yerevan'})}
updateTime();setInterval(updateTime,60000);
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
if(menu&&nav){menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Закрыть ×':'Меню +'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Меню +'}));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Меню +';menu.focus()}})}
document.querySelectorAll('[data-open-brief]').forEach(button=>button.addEventListener('click',()=>document.querySelector('#brief').showModal()));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close')?.addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}})});
document.querySelector('#brief-form')?.addEventListener('submit',event=>{event.preventDefault();const form=new FormData(event.currentTarget);const brief=['БРИФ НА ДИЗАЙН','',`Имя: ${form.get('name')}`,`Контакт: ${form.get('contact')}`,'',`О проекте: ${form.get('project')}`].join('\n');const url=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('.form-status').textContent='Бриф сохранён в файл. Его можно приложить к сообщению.'});
document.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{const dialog=document.querySelector('#lightbox');const source=button.querySelector('img');const target=dialog.querySelector('img');target.src=source.src;target.alt=source.alt;dialog.showModal()}));
if(!reducedMotion){document.querySelectorAll('[data-autoplay]').forEach(video=>{const videoObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)video.play().catch(()=>{});else video.pause()}),{threshold:.25});videoObserver.observe(video)})}

// Text is retained as a real h1. Canvas is a progressive, decorative enhancement.
(() => {
  const hero = document.querySelector('.hero');
  const heading = document.querySelector('.particle-heading');
  const canvas = heading?.querySelector('canvas');
  const context = canvas?.getContext('2d');
  if (!hero || !heading || !context) return;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = ['#ed572d', '#ed572d', '#f06435', '#e64d26', '#ed572d', '#000000', '#388fbd'];
  let dots = [], pointer = null, frameId = 0, previousTime = 0;
  let width = 0, height = 0, dotSize = 2.5, visible = true;
  let resizeId = 0;

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    previousTime = 0;
  }
  function canAnimate() {
    return !motionPreference.matches && innerWidth > 650 && visible && !document.hidden;
  }
  function requestFrame() {
    if (!frameId && canAnimate()) frameId = requestAnimationFrame(render);
  }
  function paint() {
    context.clearRect(0, 0, width, height);
    for (const dot of dots) {
      context.fillStyle = dot.color;
      context.fillRect(dot.x, dot.y, dotSize, dotSize);
    }
  }
  function build() {
    stop();
    if (motionPreference.matches || innerWidth <= 650) {
      heading.classList.remove('particles-ready');
      return;
    }
    // Measure the canvas while it is present, even on the first build.
    const padding = innerWidth <= 650 ? 25 : 45;
    const box = heading.getBoundingClientRect();
    width = Math.ceil(box.width + padding * 2);
    height = Math.ceil(box.height + padding * 2);
    if (!width || !height) return;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const mask = document.createElement('canvas');
    mask.width = width;
    mask.height = height;
    const ink = mask.getContext('2d', {willReadFrequently: true});
    if (!ink) return;
    ink.fillStyle = '#000';
    ink.textAlign = 'center';
    ink.textBaseline = 'alphabetic';
    for (const line of heading.querySelectorAll('h1 span')) {
      const rect = line.getBoundingClientRect();
      const style = getComputedStyle(line);
      ink.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const metrics = ink.measureText(line.textContent);
      const baseline = rect.top - box.top + padding + (rect.height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
      ink.fillText(line.textContent, width / 2, baseline);
    }
    const pixels = ink.getImageData(0, 0, width, height).data;
    const step = width < 650 ? 2 : 3;
    dotSize = step * .83;
    dots = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (pixels[(y * width + x) * 4 + 3] < 140) continue;
        const angle = Math.random() * Math.PI * 2;
        const scatter = 8 + Math.random() * 28;
        dots.push({homeX:x, homeY:y, x:x + Math.cos(angle)*scatter,
          y:y + Math.sin(angle)*scatter, vx:0, vy:0,
          color:palette[Math.floor(Math.random()*palette.length)]});
      }
    }
    pointer = null;
    heading.classList.add('particles-ready');
    paint();
    requestFrame();
  }
  function render(timestamp) {
    frameId = 0;
    if (!canAnimate()) return;
    const delta = previousTime ? Math.min((timestamp - previousTime) / 16.667, 2) : 1;
    previousTime = timestamp;
    const radius = Math.min(105, width * .17);
    let energy = 0;
    for (const dot of dots) {
      let ax = (dot.homeX - dot.x) * .035;
      let ay = (dot.homeY - dot.y) * .035;
      if (pointer) {
        const dx = dot.x - pointer.x, dy = dot.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < radius) {
          const force = Math.pow(1 - distance / radius, 2) * 9;
          ax += (distance ? dx / distance : 1) * force;
          ay += (distance ? dy / distance : 0) * force;
        }
      }
      const drag = Math.pow(.82, delta);
      dot.vx = (dot.vx + ax * delta) * drag;
      dot.vy = (dot.vy + ay * delta) * drag;
      dot.x += dot.vx * delta;
      dot.y += dot.vy * delta;
      energy += Math.abs(dot.vx) + Math.abs(dot.vy);
    }
    paint();
    if (pointer || energy > dots.length * .007) requestFrame();
    else {
      dots.forEach(dot => {dot.x=dot.homeX;dot.y=dot.homeY;dot.vx=dot.vy=0;});
      paint();
      previousTime = 0;
    }
  }
  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !canAnimate()) return;
    const bounds = canvas.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      pointer = null;
    } else pointer = {x:event.clientX-bounds.left, y:event.clientY-bounds.top};
    requestFrame();
  }, {passive:true});
  hero.addEventListener('pointerleave', () => {pointer=null;requestFrame();});
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    hero.classList.toggle('hero-offscreen', !visible);
    if (visible) requestFrame(); else {pointer=null;stop();}
  }, {threshold:0}).observe(hero);
  document.addEventListener('visibilitychange', () => {
    hero.classList.toggle('hero-offscreen', document.hidden || !visible);
    if (document.hidden) stop(); else requestFrame();
  });
  motionPreference.addEventListener('change', build);
  new ResizeObserver(() => {clearTimeout(resizeId);resizeId=setTimeout(build,100);}).observe(heading);
  document.fonts.ready.then(build);
})();


// Looping carousel: one selected project, smaller neighbours and drag-to-snap.
(() => {
  const root = document.querySelector('.work-carousel');
  if (!root) return;
  const slider = root.querySelector('.work-slider');
  const track = root.querySelector('.work-track');
  const originals = [...track.children];
  const count = originals.length;
  const indicators = [...root.querySelectorAll('.work-dots button')];
  const announcement = root.querySelector('.work-announcement');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (count < 2) return;
  const before = document.createDocumentFragment(), after = document.createDocumentFragment();
  originals.forEach(slide => {before.append(slide.cloneNode(true));after.append(slide.cloneNode(true));});
  track.prepend(before);track.append(after);
  const slides = [...track.children];
  let suppressClick = false;
  let current = count, offset = 0, gesture = null, busy = false, settleTimer = 0;
  function metrics() {
    const width = slides[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
    return {width, stride:width + gap};
  }
  function offsetFor(index) {
    const {width,stride} = metrics();
    return slider.clientWidth / 2 - index * stride - width / 2;
  }
  function moveTrack(x, animate) {
    offset = x;
    track.style.transition = animate && !motion.matches ? 'transform .72s cubic-bezier(.22,.9,.24,1)' : 'none';
    track.style.transform = `translate3d(${x}px,0,0)`;
  }
  function render(animate = false) {
    slides.forEach((slide,index) => {
      const active = index === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.querySelector('.work-open').tabIndex = active ? 0 : -1;
    });
    const selected = current % count;
    indicators.forEach((button,index) => {
      if (index === selected) button.setAttribute('aria-current','true');
      else button.removeAttribute('aria-current');
    });
    root.dataset.activeProject = slides[current].dataset.project;
    moveTrack(offsetFor(current), animate);
  }
  function settle() {
    clearTimeout(settleTimer);
    if (current < count) current += count;
    else if (current >= count * 2) current -= count;
    busy = false;
    render(false);
  }
  function go(index) {
    if (busy || index === current) return;
    current = Math.max(0,Math.min(slides.length - 1,index));
    busy = !motion.matches;
    render(true);
    announcement.textContent = `${slides[current].getAttribute('aria-label')}, ${current % count + 1} из ${count}`;
    if (motion.matches) settle();
    else settleTimer = setTimeout(settle, 760);
  }
  root.querySelector('[data-work-prev]').addEventListener('click', () => go(current - 1));
  root.querySelector('[data-work-next]').addEventListener('click', () => go(current + 1));
  indicators.forEach((button,index) => button.addEventListener('click', () => go(count + index)));
  track.addEventListener('transitionend', event => {if (event.target === track && event.propertyName === 'transform') settle();});
  slider.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();go(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  slider.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || busy) return;
    suppressClick = false;
    gesture = {id:event.pointerId, x:event.clientX, y:event.clientY, start:offset, dx:0, dragged:false, slide:slides.indexOf(event.target.closest('.work-slide'))};
    slider.classList.add('is-dragging');
  });
  slider.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.dragged && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) gesture.dragged = true;
    if (gesture.dragged) {
      slider.setPointerCapture(event.pointerId);
      gesture.dx = dx;
      const limit = metrics().stride;
      moveTrack(gesture.start + Math.max(-limit,Math.min(limit,dx)), false);
    }
  });
  function finish(event, cancelled = false) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const completed = gesture;gesture = null;
    suppressClick = completed.dragged;
    slider.classList.remove('is-dragging');
    if (slider.hasPointerCapture(event.pointerId)) slider.releasePointerCapture(event.pointerId);
    if (!cancelled && completed.dragged && Math.abs(completed.dx) > metrics().width * .1) {
      go(current + (completed.dx < 0 ? 1 : -1));

    } else render(true);
  }
  slider.addEventListener('pointerup', event => finish(event));
  slider.addEventListener('pointercancel', event => finish(event,true));
  slider.addEventListener('click', event => {
    if (suppressClick) {event.preventDefault();event.stopPropagation();suppressClick=false;}
  }, true);
  slider.addEventListener('dragstart', event => event.preventDefault());
  new ResizeObserver(() => {gesture=null;slider.classList.remove('is-dragging');settle();}).observe(slider);
  root.classList.add('carousel-ready');
  render(false);
})();
