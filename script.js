/**
 * Hon. Engr. Charlon Gonzales Caadlawon — Official Civic Portal Interactions
 * Sangguniang Bayan | Municipality of Bagamanoc, Catanduanes
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLanguageToggle();
  initLegislationTable();
  initAssistanceModal();
});

/* ==========================================================================
   Navigation & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const mobileToggle = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-item-link, .mobile-nav-list a');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', !isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section tracking
  const sections = document.querySelectorAll('section[id]');
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
  }, { rootMargin: '-70px 0px -50% 0px', threshold: 0.1 });

  sections.forEach(sec => observer.observe(sec));
}

/* ==========================================================================
   Bilingual (English / Filipino) Toggle
   ========================================================================== */
let currentLang = 'en';

function initLanguageToggle() {
  const langButtons = document.querySelectorAll('.lang-btn');

  langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      currentLang = currentLang === 'en' ? 'tl' : 'en';
      applyLanguage(currentLang);
    });
  });
}

function applyLanguage(lang) {
  const elements = document.querySelectorAll('[data-en][data-tl]');
  elements.forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.innerHTML = text;
      }
    }
  });

  const langLabels = document.querySelectorAll('.current-lang-code');
  langLabels.forEach(l => {
    l.textContent = lang === 'en' ? 'EN | TL' : 'TL | EN';
  });

  document.documentElement.lang = lang === 'en' ? 'en' : 'fil';
}

/* ==========================================================================
   Legislative Table Filtering & Search
   ========================================================================== */
function initLegislationTable() {
  const filterPills = document.querySelectorAll('.table-pill-btn');
  const searchInput = document.querySelector('.table-search-input');
  const tableRows = document.querySelectorAll('.gov-table tbody tr');

  if (!tableRows.length) return;

  function filterTable() {
    const activePill = document.querySelector('.table-pill-btn.active');
    const selectedCategory = activePill ? activePill.getAttribute('data-filter') : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let visibleCount = 0;

    tableRows.forEach(row => {
      const rowCategory = row.getAttribute('data-category') || '';
      const rowType = row.getAttribute('data-type') || '';
      const rowText = row.innerText.toLowerCase();

      const matchesCategory = selectedCategory === 'all' || 
                              rowCategory.includes(selectedCategory) || 
                              rowType === selectedCategory;

      const matchesSearch = !searchQuery || rowText.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    const noResultsRow = document.getElementById('tableNoResultsRow');
    if (noResultsRow) {
      noResultsRow.style.display = visibleCount === 0 ? '' : 'none';
    }
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filterTable();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterTable);
  }
}

/* ==========================================================================
   Assistance Modal Dialog
   ========================================================================== */
function initAssistanceModal() {
  const modal = document.getElementById('assistanceModal');
  const openButtons = document.querySelectorAll('[data-open-modal="assistanceModal"]');
  const closeButtons = document.querySelectorAll('[data-close-modal="assistanceModal"]');
  const form = document.getElementById('assistanceQuickForm');

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

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('govName').value.trim();
      const barangay = document.getElementById('govBarangay').value;
      const type = document.getElementById('govCategory').value;
      const details = document.getElementById('govDetails').value.trim();

      const subject = encodeURIComponent(`Constituent Assistance: [${type}] - ${name} (${barangay})`);
      const body = encodeURIComponent(
        `Dear Office of Hon. Engr. Charlon G. Caadlawon,\n\n` +
        `I am officially requesting constituent coordination / assistance:\n\n` +
        `Name: ${name}\n` +
        `Barangay: ${barangay}, Bagamanoc, Catanduanes\n` +
        `Concern / Category: ${type}\n\n` +
        `Description of Request:\n${details}\n\n` +
        `Submitted via Official Councilor Caadlawon Public Service Portal.`
      );

      window.location.href = `mailto:Charlongc.02@gmail.com?subject=${subject}&body=${body}`;
      closeModal();
      alert('Your email client is opening with your formatted request addressed to Hon. Caadlawon\'s official office.');
    });
  }
}
