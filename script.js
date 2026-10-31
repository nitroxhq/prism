// Prism holding page — a single quiet trick:
// the light refracted through the page follows the pointer.
(function () {
  const sheen = document.querySelector('.sheen');
  if (!sheen) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  // Only real pointers get the sheen; a touch tap shouldn't leave a light stuck on screen.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let frame = null;

  function loop() {
    // ease toward the pointer so the light trails instead of snapping
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    sheen.style.setProperty('--sheen-x', currentX + 'px');
    sheen.style.setProperty('--sheen-y', currentY + 'px');

    const settled = Math.abs(targetX - currentX) < 0.4 && Math.abs(targetY - currentY) < 0.4;
    frame = settled ? null : requestAnimationFrame(loop);
  }

  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;

    if (!sheen.classList.contains('is-live')) {
      currentX = targetX;
      currentY = targetY;
      sheen.classList.add('is-live');
    }

    if (frame === null) frame = requestAnimationFrame(loop);
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    sheen.classList.remove('is-live');
  });
})();
