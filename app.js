/* ============================================
   TPAE Study Guide - Application Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const app = new StudyGuideApp();
  app.init();
});

class StudyGuideApp {
  constructor() {
    this.currentUnit = 'hero';
    this.completedUnits = JSON.parse(localStorage.getItem('tpae-completed') || '{}');
    this.completedLessons = JSON.parse(localStorage.getItem('tpae-lessons') || '{}');
    this.totalUnits = 0;
    this.totalLessons = 0;
    
    // Study preference states
    this.currentTheme = localStorage.getItem('tpae-theme') || 'dark';
    this.fontSizeScale = parseInt(localStorage.getItem('tpae-font-scale') || '17');
    this.focusMode = localStorage.getItem('tpae-focus-mode') === 'true';
  }

  init() {
    this.cacheElements();
    this.countItems();
    this.bindEvents();
    this.updateProgress();
    this.restoreState();
  }

  cacheElements() {
    this.sidebar = document.querySelector('.sidebar');
    this.overlay = document.querySelector('.sidebar-overlay');
    this.searchInput = document.querySelector('.search-input');
    this.progressFill = document.querySelector('.progress-fill');
    this.progressText = document.querySelector('.progress-text');
    this.unitSections = document.querySelectorAll('.unit-section');
    this.navUnitBtns = document.querySelectorAll('.nav-unit-btn');
    this.navLessonBtns = document.querySelectorAll('.nav-lesson-btn');
    this.lessonCards = document.querySelectorAll('.lesson-card');
    this.heroSection = document.querySelector('.hero-section');
    this.contentBody = document.querySelector('.content-body');
    this.breadcrumbText = document.querySelector('.breadcrumb-text');
    this.sidebarToggle = document.getElementById('sidebarToggle');
    
    // Study control elements
    this.btnThemeLight = document.getElementById('btnThemeLight');
    this.btnThemeSepia = document.getElementById('btnThemeSepia');
    this.btnThemeDark = document.getElementById('btnThemeDark');
    this.btnFontDecrease = document.getElementById('btnFontDecrease');
    this.btnFontIncrease = document.getElementById('btnFontIncrease');
    this.btnFocusMode = document.getElementById('btnFocusMode');
  }

  countItems() {
    this.totalUnits = this.unitSections.length;
    this.totalLessons = this.lessonCards.length;
    
    // Update stats in hero
    const unitCount = document.getElementById('stat-units');
    const lessonCount = document.getElementById('stat-lessons');
    if (unitCount) unitCount.textContent = this.totalUnits;
    if (lessonCount) lessonCount.textContent = this.totalLessons;
  }

  bindEvents() {
    // Nav unit buttons
    this.navUnitBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const unitId = btn.dataset.unit;
        this.navigateToUnit(unitId);
      });
    });

    // Nav lesson buttons
    this.navLessonBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lessonId = btn.dataset.lesson;
        const unitId = btn.dataset.unit;
        this.navigateToUnit(unitId);
        setTimeout(() => {
          this.scrollToLesson(lessonId);
          this.expandLesson(lessonId);
        }, 100);
        this.closeMobileMenu();
      });
    });

    // Lesson toggles
    this.lessonCards.forEach(card => {
      const header = card.querySelector('.lesson-header');
      header.addEventListener('click', () => {
        card.classList.toggle('expanded');
      });
    });

    // Mark as read buttons
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const unitId = btn.dataset.unit;
        this.toggleUnitComplete(unitId);
      });
    });

    // Search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Mobile menu
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => this.toggleMobileMenu());
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeMobileMenu());
    }

    // Hero navigation link
    document.querySelector('.nav-home-btn')?.addEventListener('click', () => {
      this.showHero();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMobileMenu();
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        this.searchInput?.focus();
      }
    });

    // Sidebar collapse toggle
    if (this.sidebarToggle) {
      this.sidebarToggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    // Study theme selectors
    this.btnThemeLight?.addEventListener('click', () => this.setTheme('light'));
    this.btnThemeSepia?.addEventListener('click', () => this.setTheme('sepia'));
    this.btnThemeDark?.addEventListener('click', () => this.setTheme('dark'));

    // Font scaling buttons
    this.btnFontDecrease?.addEventListener('click', () => this.setFontSize(this.fontSizeScale - 1));
    this.btnFontIncrease?.addEventListener('click', () => this.setFontSize(this.fontSizeScale + 1));

    // Focus mode toggle
    this.btnFocusMode?.addEventListener('click', () => this.setFocusMode(!this.focusMode));
  }

  navigateToUnit(unitId) {
    this.currentUnit = unitId;
    
    // Hide hero, show content
    if (this.heroSection) this.heroSection.style.display = 'none';
    if (this.contentBody) this.contentBody.style.display = 'block';
    
    // Switch active section
    this.unitSections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(unitId);
    if (target) target.classList.add('active');
    
    // Update nav
    this.navUnitBtns.forEach(b => {
      b.classList.remove('active');
      const lessons = b.nextElementSibling;
      if (lessons && lessons.classList.contains('nav-lessons')) {
        lessons.classList.remove('expanded');
      }
    });
    
    const activeBtn = document.querySelector(`.nav-unit-btn[data-unit="${unitId}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      const lessons = activeBtn.nextElementSibling;
      if (lessons && lessons.classList.contains('nav-lessons')) {
        lessons.classList.add('expanded');
      }
    }

    // Update breadcrumb
    if (this.breadcrumbText) {
      const unitTitle = activeBtn?.querySelector('.unit-label')?.textContent || '';
      this.breadcrumbText.textContent = unitTitle;
    }

    // Save state
    localStorage.setItem('tpae-current', unitId);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close mobile menu
    this.closeMobileMenu();
  }

  showHero() {
    this.currentUnit = 'hero';
    if (this.heroSection) this.heroSection.style.display = '';
    if (this.contentBody) this.contentBody.style.display = 'none';
    
    this.navUnitBtns.forEach(b => {
      b.classList.remove('active');
      const lessons = b.nextElementSibling;
      if (lessons && lessons.classList.contains('nav-lessons')) {
        lessons.classList.remove('expanded');
      }
    });
    
    if (this.breadcrumbText) this.breadcrumbText.textContent = 'الصفحة الرئيسية';
    localStorage.setItem('tpae-current', 'hero');
    this.closeMobileMenu();
  }

  scrollToLesson(lessonId) {
    const el = document.getElementById(lessonId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  expandLesson(lessonId) {
    const card = document.getElementById(lessonId);
    if (card && !card.classList.contains('expanded')) {
      card.classList.add('expanded');
    }
  }

  toggleUnitComplete(unitId) {
    if (this.completedUnits[unitId]) {
      delete this.completedUnits[unitId];
    } else {
      this.completedUnits[unitId] = true;
    }
    localStorage.setItem('tpae-completed', JSON.stringify(this.completedUnits));
    this.updateProgress();
    this.updateMarkReadBtn(unitId);
    this.updateNavCheck(unitId);
  }

  updateProgress() {
    const completed = Object.keys(this.completedUnits).length;
    const total = this.totalUnits || 1;
    const pct = Math.round((completed / total) * 100);
    
    if (this.progressFill) this.progressFill.style.width = pct + '%';
    if (this.progressText) this.progressText.textContent = pct + '%';

    // Update stat
    const completedStat = document.getElementById('stat-completed');
    if (completedStat) completedStat.textContent = completed;
  }

  updateMarkReadBtn(unitId) {
    const btn = document.querySelector(`.mark-read-btn[data-unit="${unitId}"]`);
    if (!btn) return;
    
    if (this.completedUnits[unitId]) {
      btn.classList.add('completed');
      btn.innerHTML = '✓ تم الانتهاء';
    } else {
      btn.classList.remove('completed');
      btn.innerHTML = '📖 تمييز كمقروء';
    }
  }

  updateNavCheck(unitId) {
    const btn = document.querySelector(`.nav-unit-btn[data-unit="${unitId}"]`);
    if (!btn) return;
    const check = btn.querySelector('.nav-unit-check');
    if (!check) return;
    
    if (this.completedUnits[unitId]) {
      check.classList.add('completed');
      check.innerHTML = '✓';
    } else {
      check.classList.remove('completed');
      check.innerHTML = '';
    }
  }

  handleSearch(query) {
    if (!query || query.length < 2) {
      // Reset - show all lessons
      this.lessonCards.forEach(card => {
        card.style.display = '';
      });
      this.unitSections.forEach(section => {
        const header = section.querySelector('.unit-header');
        if (header) header.style.display = '';
      });
      return;
    }

    const q = query.toLowerCase();
    let hasResults = false;

    // Show content body if searching
    if (this.heroSection) this.heroSection.style.display = 'none';
    if (this.contentBody) this.contentBody.style.display = 'block';
    
    // Show all units for searching
    this.unitSections.forEach(section => {
      section.classList.add('active');
    });

    // Filter lessons
    this.lessonCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(q)) {
        card.style.display = '';
        card.classList.add('expanded');
        hasResults = true;
      } else {
        card.style.display = 'none';
      }
    });

    // Hide empty units
    this.unitSections.forEach(section => {
      const visibleLessons = section.querySelectorAll('.lesson-card:not([style*="display: none"])');
      if (visibleLessons.length === 0) {
        section.classList.remove('active');
      }
    });
  }

  toggleMobileMenu() {
    this.sidebar?.classList.toggle('open');
    this.overlay?.classList.toggle('active');
    document.body.style.overflow = this.sidebar?.classList.contains('open') ? 'hidden' : '';
  }

  closeMobileMenu() {
    this.sidebar?.classList.remove('open');
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleSidebar() {
    const isCollapsed = this.sidebar.classList.toggle('collapsed');
    localStorage.setItem('tpae-sidebar-collapsed', isCollapsed ? 'true' : 'false');
    this.updateSidebarToggleButton(isCollapsed);
  }

  updateSidebarToggleButton(isCollapsed) {
    if (this.sidebarToggle) {
      // In RTL, collapsed arrow points left (❮) to expand, expanded arrow points right (❯) to collapse
      this.sidebarToggle.textContent = isCollapsed ? '❮' : '❯';
    }
  }

  restoreState() {
    const saved = localStorage.getItem('tpae-current');
    
    // Restore sidebar collapse state
    const sidebarCollapsed = localStorage.getItem('tpae-sidebar-collapsed') === 'true';
    if (sidebarCollapsed) {
      this.sidebar.classList.add('collapsed');
      this.updateSidebarToggleButton(true);
    } else {
      this.sidebar.classList.remove('collapsed');
      this.updateSidebarToggleButton(false);
    }

    // Restore completed states
    Object.keys(this.completedUnits).forEach(uid => {
      this.updateMarkReadBtn(uid);
      this.updateNavCheck(uid);
    });

    // Restore theme, font scale, and focus mode
    this.setTheme(this.currentTheme);
    this.setFontSize(this.fontSizeScale);
    this.setFocusMode(this.focusMode);

    if (saved && saved !== 'hero') {
      this.navigateToUnit(saved);
    } else {
      this.showHero();
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('tpae-theme', theme);
    
    // Clean classes
    document.body.classList.remove('theme-light', 'theme-sepia');
    
    // Add theme class
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else if (theme === 'sepia') {
      document.body.classList.add('theme-sepia');
    }
    
    // Update active button state in UI
    this.btnThemeLight?.classList.toggle('active', theme === 'light');
    this.btnThemeSepia?.classList.toggle('active', theme === 'sepia');
    this.btnThemeDark?.classList.toggle('active', theme === 'dark');
  }

  setFontSize(size) {
    const clampedSize = Math.max(14, Math.min(24, size));
    this.fontSizeScale = clampedSize;
    localStorage.setItem('tpae-font-scale', clampedSize);
    
    document.documentElement.style.setProperty('--font-base-size', clampedSize + 'px');
  }

  setFocusMode(active) {
    this.focusMode = active;
    localStorage.setItem('tpae-focus-mode', active);
    
    document.body.classList.toggle('focus-mode', active);
  }
}
