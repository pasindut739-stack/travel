document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('primaryMenu');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('section[id]')];
  const backToTop = document.getElementById('backToTop');

  // Sticky header and back-to-top visibility
  const updateChrome = () => {
    const scrolled = window.scrollY > 30;
    header.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('visible', window.scrollY > 700);
  };
  updateChrome();
  window.addEventListener('scroll', updateChrome, { passive: true });

  // Mobile hamburger menu
  const closeMenu = () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  // Smooth scrolling for all internal anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const href = anchor.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', href);
    });
  });

  // Active navigation link while scrolling
  const activateLink = id => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) activateLink(entry.target.id);
    });
  }, { rootMargin: '-42% 0px -50% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));

  // Scroll reveal animations
  const revealItems = [...document.querySelectorAll('.reveal')];
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
    revealObserver.observe(item);
  });

  // Destination filtering
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  const destinationCards = [...document.querySelectorAll('.destination-card')];
  const filterResult = document.getElementById('filterResult');
  const filterLabels = {
    nature: 'Nature',
    beach: 'Beaches',
    adventure: 'Adventure',
    culture: 'Culture',
    food: 'Food',
    wildlife: 'Wildlife'
  };

  const applyFilter = filter => {
    let visibleCount = 0;
    destinationCards.forEach(card => {
      const categories = card.dataset.categories.split(' ');
      const shouldShow = categories.includes(filter);
      card.classList.toggle('hidden', !shouldShow);
      if (shouldShow) {
        visibleCount += 1;
        card.classList.remove('in-view');
        requestAnimationFrame(() => card.classList.add('in-view'));
      }
    });
    filterResult.innerHTML = `Showing <strong>${visibleCount}</strong> destination${visibleCount === 1 ? '' : 's'} that match <strong>${filterLabels[filter]}</strong>.`;
  };

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      applyFilter(button.dataset.filter);
      document.getElementById('destinations').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Gallery lightbox
  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;

  const setLightboxImage = index => {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentIndex];
    const img = item.querySelector('img');
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = item.dataset.caption || img.alt;
  };

  const openLightbox = index => {
    setLightboxImage(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => setLightboxImage(currentIndex - 1));
  lightboxNext.addEventListener('click', () => setLightboxImage(currentIndex + 1));
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') setLightboxImage(currentIndex - 1);
    if (event.key === 'ArrowRight') setLightboxImage(currentIndex + 1);
  });

  // Back-to-top button
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Contact form validation
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    destination: document.getElementById('destination'),
    message: document.getElementById('message')
  };

  const setFieldState = (input, message = '') => {
    const group = input.closest('.form-group');
    const error = group.querySelector('.error-message');
    group.classList.toggle('invalid', Boolean(message));
    error.textContent = message;
  };

  const validateField = input => {
    const value = input.value.trim();
    if (input === fields.name && value.length < 2) {
      setFieldState(input, 'Please enter your name.');
      return false;
    }
    if (input === fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldState(input, 'Please enter a valid email address.');
      return false;
    }
    if (input === fields.destination && !value) {
      setFieldState(input, 'Please choose a destination.');
      return false;
    }
    if (input === fields.message && value.length < 10) {
      setFieldState(input, 'Please write a message of at least 10 characters.');
      return false;
    }
    setFieldState(input);
    return true;
  };

  Object.values(fields).forEach(input => {
    input.addEventListener('input', () => validateField(input));
    input.addEventListener('blur', () => validateField(input));
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const isValid = Object.values(fields).every(validateField);
    if (!isValid) {
      formStatus.textContent = 'Please fix the highlighted fields and try again.';
      formStatus.style.color = '#b43d38';
      return;
    }

    const submitButton = form.querySelector('.submit-btn');
    submitButton.disabled = true;
    submitButton.innerHTML = 'Sending... <i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>';

    setTimeout(() => {
      formStatus.textContent = 'Thank you! Your Sri Lankan adventure request has been sent.';
      formStatus.style.color = 'var(--green)';
      submitButton.disabled = false;
      submitButton.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
      form.reset();
      Object.values(fields).forEach(input => setFieldState(input));
    }, 850);
  });

  // Button micro-interaction
  document.querySelectorAll('.btn, .filter-btn').forEach(button => {
    button.addEventListener('pointerdown', () => button.classList.add('pressed'));
    ['pointerup', 'pointerleave', 'blur'].forEach(type => {
      button.addEventListener(type, () => button.classList.remove('pressed'));
    });
  });
});