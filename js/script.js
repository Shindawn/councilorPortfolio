/**
 * Hon. Engr. Charlon Gonzales Caadlawon — Official Civic Portal Interactions
 * Sangguniang Bayan | Municipality of Bagamanoc, Catanduanes
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initLanguageToggle();
  initLegislationTable();
  initAssistanceModal();
  initFramerAnimations();
  initHorizontalPresentation();
  initTypingCard();
});

/* ==========================================================================
   Theme Toggle (GitHub Light / Dark Mode)
   ========================================================================== */
function initThemeToggle() {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (!themeBtn) return;

  const moonIcon = themeBtn.querySelector('.theme-icon-moon');
  const sunIcon = themeBtn.querySelector('.theme-icon-sun');

  function updateIcons(isDark) {
    if (moonIcon && sunIcon) {
      moonIcon.style.display = isDark ? 'none' : 'block';
      sunIcon.style.display = isDark ? 'block' : 'none';
    }
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    themeBtn.setAttribute('title', label);
    themeBtn.setAttribute('aria-label', label);
  }

  // Sync icons on page load
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  updateIcons(isDark);

  themeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('civic-theme', newTheme);
    updateIcons(newTheme === 'dark');
  });
}

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

    // Quick keyboard shortcut '/' to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) {
          const modal = document.getElementById('assistanceModal');
          if (modal && modal.classList.contains('open')) return;

          e.preventDefault();
          const legislationPanel = document.getElementById('legislation');
          if (legislationPanel) {
            const viewport = document.getElementById('horizontalViewport');
            if (viewport && window.innerWidth > 900) {
              viewport.scrollTo({ left: legislationPanel.offsetLeft, behavior: 'smooth' });
            } else {
              legislationPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
          searchInput.focus();
          searchInput.select();
        }
      }
    });
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

/* ==========================================================================
   Framer Motion-Style Scroll Reveals & Micro-Interactions
   ========================================================================== */
function initFramerAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Target key structural elements for scroll reveals
  const targetSelectors = [
    '.constituent-header',
    '.assistance-step-card',
    '.constituent-office-sidebar',
    '.legislation-header',
    '.table-filter-controls',
    '.gov-table-container',
    '.committees-header',
    '.committee-card-clean',
    '.bio-layout',
    '.speeches-header',
    '.speech-card-clean',
    '.contact-header',
    '.contact-card-clean'
  ];

  const targets = document.querySelectorAll(targetSelectors.join(', '));
  targets.forEach(el => el.classList.add('fm-reveal'));

  // Stagger delays for grid children (assistance steps, committees, speeches, contacts)
  const gridContainers = document.querySelectorAll(
    '.assistance-steps-grid, .committees-grid, .speeches-list, .contact-cards-grid'
  );

  gridContainers.forEach(container => {
    const children = Array.from(container.children);
    children.forEach((child, index) => {
      child.style.setProperty('--fm-delay', `${index * 90}ms`);
    });
  });

  // Spring-feel IntersectionObserver
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fm-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  targets.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   Horizontal Website Presentation Controller (Option B)
   ========================================================================== */
function initHorizontalPresentation() {
  const viewport = document.getElementById('horizontalViewport');
  const track = document.getElementById('horizontalTrack');
  const progressFill = document.getElementById('horizontalProgressFill');
  const prevBtn = document.getElementById('prevPanelBtn');
  const nextBtn = document.getElementById('nextPanelBtn');
  const activePanelNum = document.getElementById('activePanelNum');
  const totalPanelsNum = document.getElementById('totalPanelsNum');
  const panels = Array.from(document.querySelectorAll('.presentation-panel'));
  const navLinks = document.querySelectorAll('.nav-item-link, .mobile-nav-list a');

  if (!viewport || !panels.length) return;

  const totalPanels = panels.length;
  if (totalPanelsNum) {
    totalPanelsNum.textContent = String(totalPanels).padStart(2, '0');
  }

  let currentIndex = 0;

  function isDesktop() {
    return window.innerWidth > 900;
  }

  // Helper to scroll to a panel index
  function goToPanel(index, smooth = true) {
    if (index < 0) index = 0;
    if (index >= totalPanels) index = totalPanels - 1;

    const targetPanel = panels[index];
    if (!targetPanel) return;

    if (isDesktop()) {
      viewport.scrollTo({
        left: targetPanel.offsetLeft,
        behavior: smooth ? 'smooth' : 'auto'
      });
    } else {
      targetPanel.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      });
    }
  }

  // Update Progress & Counter based on scroll position
  function updateState() {
    if (isDesktop()) {
      const scrollLeft = viewport.scrollLeft;
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;

      if (progressFill) {
        progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }

      // Determine active panel based on center offset
      const viewCenter = scrollLeft + viewport.clientWidth / 2;
      let activeIndex = 0;
      let minDistance = Infinity;

      panels.forEach((panel, idx) => {
        const panelCenter = panel.offsetLeft + panel.offsetWidth / 2;
        const distance = Math.abs(viewCenter - panelCenter);
        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = idx;
        }
      });

      currentIndex = activeIndex;

      if (activePanelNum) {
        activePanelNum.textContent = String(currentIndex + 1).padStart(2, '0');
      }

      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === totalPanels - 1;

      // Sync active state on navbar links
      const currentPanelId = panels[currentIndex].getAttribute('id');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentPanelId}`) {
          link.classList.add('active');
        } else if (href && href.startsWith('#')) {
          link.classList.remove('active');
        }
      });
    }
  }

  // Wheel listener: map deltaY to deltaX on desktop when not scrolling a vertically overflowed child
  viewport.addEventListener('wheel', (e) => {
    if (!isDesktop()) return;

    // Check if user is scrolling inside an element with vertical scrollable overflow
    let target = e.target;
    let hasVerticalScroll = false;

    while (target && target !== viewport) {
      if (target.classList && target.classList.contains('presentation-panel')) {
        // Panel itself may have vertical scroll if content overflows height
        if (target.scrollHeight > target.clientHeight) {
          const atTop = target.scrollTop <= 0 && e.deltaY < 0;
          const atBottom = Math.ceil(target.scrollTop + target.clientHeight) >= target.scrollHeight && e.deltaY > 0;
          if (!atTop && !atBottom) {
            hasVerticalScroll = true;
            break;
          }
        }
      } else if (target.scrollHeight > target.clientHeight && target.clientHeight > 0) {
        const style = window.getComputedStyle(target);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          const atTop = target.scrollTop <= 0 && e.deltaY < 0;
          const atBottom = Math.ceil(target.scrollTop + target.clientHeight) >= target.scrollHeight && e.deltaY > 0;
          if (!atTop && !atBottom) {
            hasVerticalScroll = true;
            break;
          }
        }
      }
      target = target.parentElement;
    }

    if (!hasVerticalScroll) {
      // Translate deltaY to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        viewport.scrollLeft += e.deltaY;
      }
    }
  }, { passive: false });

  viewport.addEventListener('scroll', () => {
    requestAnimationFrame(updateState);
  }, { passive: true });

  // Floating Prev / Next Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToPanel(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToPanel(currentIndex + 1);
    });
  }

  // Keyboard navigation (ArrowLeft / ArrowRight)
  document.addEventListener('keydown', (e) => {
    if (!isDesktop()) return;

    // Avoid hijacking when inside inputs, textareas, or open modal
    const activeEl = document.activeElement;
    if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) {
      return;
    }
    const modal = document.getElementById('assistanceModal');
    if (modal && modal.classList.contains('open')) {
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      goToPanel(currentIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goToPanel(currentIndex - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToPanel(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToPanel(totalPanels - 1);
    }
  });

  // Intercept anchor links (e.g., href="#legislation", href="#committees")
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').substring(1);
      if (!targetId) return;

      const targetPanelIndex = panels.findIndex(p => p.id === targetId);
      if (targetPanelIndex !== -1) {
        e.preventDefault();
        goToPanel(targetPanelIndex);
      }
    });
  });

  // Initial calculation
  window.addEventListener('resize', updateState);
  updateState();
}

/* ==========================================================================
   Typing Card — Typewriter Effect for Hero Profile Card
   ========================================================================== */
function initTypingCard() {
  // Sequence: [elementId, text, speed in ms per char]
  const sequence = [
    { id: 'type-name',      text: 'Hon. Charlon G. Caadlawon',                    speed: 55 },
    { id: 'type-role',      text: 'Municipal Councilor \u2022 Bagamanoc, Catanduanes', speed: 30 },
    { id: 'type-mandate',   text: 'Rank 1 SB Councilor (4,321 votes)',             speed: 35 },
    { id: 'type-committee', text: 'Ways & Means \u2022 Education \u2022 Tourism',           speed: 40 },
  ];

  let started = false;

  function typeElement(el, text, speed) {
    return new Promise(resolve => {
      el.textContent = '';
      el.classList.add('typing-active');
      let i = 0;
      const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          el.classList.remove('typing-active');
          resolve();
        }
      }, speed);
    });
  }

  async function runSequence() {
    await new Promise(r => setTimeout(r, 300));
    for (const item of sequence) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      await typeElement(el, item.text, item.speed);
      await new Promise(r => setTimeout(r, 180));
    }
  }

  const card = document.querySelector('.hero-profile-card');
  if (!card) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        observer.disconnect();
        runSequence();
      }
    });
  }, { threshold: 0.4 });

  observer.observe(card);
}
