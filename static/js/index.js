const copyButton = document.querySelector('#copy-bibtex');
copyButton?.addEventListener('click', async () => {
  const citation = document.querySelector('#bibtex')?.textContent ?? '';
  try {
    await navigator.clipboard.writeText(citation);
    copyButton.textContent = 'Copied';
  } catch (_) {
    copyButton.textContent = 'Select and copy';
  }
  window.setTimeout(() => { copyButton.textContent = 'Copy BibTeX'; }, 1800);
});

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('#nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
}));

const navjevTitle = document.querySelector('.navjev-title');
navjevTitle?.addEventListener('click', () => {
  navjevTitle.classList.remove('is-active');
  window.requestAnimationFrame(() => {
    navjevTitle.classList.add('is-active');
    window.setTimeout(() => navjevTitle.classList.remove('is-active'), 650);
  });
});

const heroCard = document.querySelector('.hero-card');
heroCard?.addEventListener('click', () => {
  heroCard.classList.remove('is-active');
  window.requestAnimationFrame(() => {
    heroCard.classList.add('is-active');
    window.setTimeout(() => heroCard.classList.remove('is-active'), 720);
  });
});

document.querySelectorAll('.metric-row article').forEach((metric) => {
  metric.addEventListener('click', () => {
    metric.classList.remove('is-active');
    window.requestAnimationFrame(() => {
      metric.classList.add('is-active');
      window.setTimeout(() => metric.classList.remove('is-active'), 620);
    });
  });
});

const resultsMarquee = document.querySelector('.results-marquee');
const sourceResults = resultsMarquee?.querySelector('.results-set');
if (resultsMarquee && sourceResults) {
  const duplicateResults = sourceResults.cloneNode(true);
  duplicateResults.setAttribute('aria-hidden', 'true');
  duplicateResults.querySelectorAll('img').forEach((image) => image.setAttribute('loading', 'lazy'));
  resultsMarquee.querySelector('.results-track')?.append(duplicateResults);
}

let resultsPauseUntil = 0;
const moveResults = (direction) => {
  if (!resultsMarquee || !sourceResults) return;
  const cards = [...resultsMarquee.querySelectorAll('.result-card')];
  const nearestCardIndex = () => {
    const viewportCenter = resultsMarquee.scrollLeft + (resultsMarquee.clientWidth / 2);
    return cards.reduce((nearest, card, index) => {
      const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
      const nearestCenter = cards[nearest].offsetLeft + (cards[nearest].offsetWidth / 2);
      return Math.abs(cardCenter - viewportCenter) < Math.abs(nearestCenter - viewportCenter) ? index : nearest;
    }, 0);
  };

  let currentIndex = nearestCardIndex();
  if (direction < 0 && currentIndex === 0) {
    resultsMarquee.scrollLeft += sourceResults.scrollWidth;
    currentIndex = nearestCardIndex();
  } else if (direction > 0 && currentIndex === cards.length - 1) {
    resultsMarquee.scrollLeft -= sourceResults.scrollWidth;
    currentIndex = nearestCardIndex();
  }

  const target = cards[Math.max(0, Math.min(cards.length - 1, currentIndex + direction))];
  if (!target) return;
  resultsPauseUntil = performance.now() + 3200;
  resultsMarquee.scrollTo({
    left: target.offsetLeft - ((resultsMarquee.clientWidth - target.offsetWidth) / 2),
    behavior: 'smooth'
  });
};
document.querySelector('.carousel-previous')?.addEventListener('click', () => moveResults(-1));
document.querySelector('.carousel-next')?.addEventListener('click', () => moveResults(1));

if (resultsMarquee && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let paused = false;
  let inView = false;
  let autoPosition = resultsMarquee.scrollLeft;
  let wasAdvancing = false;
  let previous = performance.now();
  const setPaused = (value) => { paused = value; };
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
  }, { threshold: 0.15 });
  visibilityObserver.observe(resultsMarquee);
  resultsMarquee.addEventListener('focusin', () => setPaused(true));
  resultsMarquee.addEventListener('focusout', () => setPaused(false));
  resultsMarquee.addEventListener('pointerdown', () => setPaused(true));
  resultsMarquee.addEventListener('pointerup', () => setPaused(false));
  resultsMarquee.addEventListener('pointercancel', () => setPaused(false));

  const advance = (now) => {
    if (inView && !paused && now >= resultsPauseUntil) {
      const elapsed = Math.min(now - previous, 40);
      const firstSet = resultsMarquee.querySelector('.results-set');
      if (!wasAdvancing) autoPosition = resultsMarquee.scrollLeft;
      autoPosition += elapsed * 0.022;
      if (firstSet && autoPosition >= firstSet.scrollWidth) {
        autoPosition -= firstSet.scrollWidth;
      }
      resultsMarquee.scrollLeft = autoPosition;
      wasAdvancing = true;
    } else {
      autoPosition = resultsMarquee.scrollLeft;
      wasAdvancing = false;
    }
    previous = now;
    window.requestAnimationFrame(advance);
  };
  window.requestAnimationFrame(advance);
}
