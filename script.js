/**
 * Hon. Charlon Gonzales Caadlawon — Civic Portfolio Interactions
 * Sangguniang Bayan Member | Municipality of Bagamanoc, Catanduanes
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLanguageToggle();
  initPolicyFilters();
  initGalleryFilters();
  initAssistanceModal();
});

/* ==========================================================================
   Navigation & Header Scroll
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-item a');

  // Sticky Header Shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile Menu Drawer Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', !isOpen);
    });

    // Close drawer when link clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section highlighting with IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    rootMargin: '-80px 0px -40% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else if (link.getAttribute('href').startsWith('#')) {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/* ==========================================================================
   Bilingual (English / Filipino) Content Toggle
   ========================================================================== */
let currentLang = 'en';

function initLanguageToggle() {
  const langToggleButtons = document.querySelectorAll('.lang-toggle-btn');

  langToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'tl' : 'en';
      applyLanguage(currentLang);
    });
  });
}

function applyLanguage(lang) {
  const translatableElements = document.querySelectorAll('[data-en][data-tl]');
  translatableElements.forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.innerHTML = text;
      }
    }
  });

  // Update toggle button labels
  const langLabels = document.querySelectorAll('.current-lang-text');
  langLabels.forEach(label => {
    label.textContent = lang === 'en' ? 'EN | TL' : 'TL | EN';
  });

  document.documentElement.lang = lang === 'en' ? 'en' : 'fil';
}

/* ==========================================================================
   Legislative Filter Tabs
   ========================================================================== */
function initPolicyFilters() {
  const filterTabs = document.querySelectorAll('.policy-filter-bar .filter-tab');
  const policyCards = document.querySelectorAll('.policy-card');

  if (!filterTabs.length) return;

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      policyCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        const type = card.getAttribute('data-type') || '';

        if (filterValue === 'all' || category.includes(filterValue) || type === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   Gallery Filter Tabs
   ========================================================================== */
function initGalleryFilters() {
  const galleryTabs = document.querySelectorAll('.gallery-filter-bar .filter-tab');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!galleryTabs.length) return;

  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      galleryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filterValue === 'all' || cat === filterValue) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   Assistance Request Modal Dialog
   ========================================================================== */
function initAssistanceModal() {
  const modal = document.getElementById('assistanceModal');
  const openButtons = document.querySelectorAll('[data-open-modal="assistanceModal"]');
  const closeButtons = document.querySelectorAll('[data-close-modal="assistanceModal"]');
  const form = document.getElementById('constituentInquiryForm');

  if (!modal) return;

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    });
  });

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Close when clicking outside dialog
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Form submission handler (mailto generator to keep privacy & zero server dependency)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reqName').value.trim();
      const barangay = document.getElementById('reqBarangay').value;
      const service = document.getElementById('reqService').value;
      const details = document.getElementById('reqDetails').value.trim();

      const subject = encodeURIComponent(`Constituent Assistance Request: ${service} - ${name} (${barangay})`);
      const body = encodeURIComponent(
        `Dear Office of Hon. Engr. Charlon G. Caadlawon,\n\n` +
        `I am writing to officially request constituent assistance:\n\n` +
        `Full Name: ${name}\n` +
        `Barangay: ${barangay}, Bagamanoc, Catanduanes\n` +
        `Assistance/Concern Type: ${service}\n\n` +
        `Details of Request:\n${details}\n\n` +
        `Submitted via Councilor Charlon Caadlawon Official Civic Portfolio.`
      );

      // Open email client
      window.location.href = `mailto:Charlongc.02@gmail.com?subject=${subject}&body=${body}`;
      closeModal();
      alert('Your email client is opening with your formatted request addressed to Hon. Caadlawon\'s official office.');
    });
  }
}
