// ============================================
// ENHANCED PORTFOLIO JAVASCRIPT
// ============================================

// Utility Functions
const utils = {
  // Debounce function for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  },

  // Smooth scroll to element with easing
  scrollToElement(element, offset = 80, duration = 800) {
    const elementPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = elementPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = this.easeInOutQuart(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function
    this.easeInOutQuart = function(t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t*t*t + b;
      t -= 2;
      return -c/2 * (t*t*t*t - 2) + b;
    };

    requestAnimationFrame(animation);
  },

  // Check if element is in viewport with threshold
  isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const vertInView = (rect.top <= windowHeight * (1 - threshold)) && 
                      ((rect.top + rect.height) >= windowHeight * threshold);
    const horInView = (rect.left <= windowWidth * (1 - threshold)) && 
                     ((rect.left + rect.width) >= windowWidth * threshold);
    
    return vertInView && horInView;
  },

  // Enhanced number animation with easing
  animateNumber(element, target, duration = 2000, suffix = '', prefix = '') {
    const start = 0;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * target);
      
      element.textContent = prefix + current.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = prefix + target.toLocaleString() + suffix;
      }
    }
    
    requestAnimationFrame(updateNumber);
  },

  // Generate unique ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },

  // Format date
  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  // Detect device type
  getDeviceType() {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  },

  // Local storage with error handling
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('LocalStorage not available:', e);
        return false;
      }
    },
    
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
        return defaultValue;
      }
    },
    
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn('Error removing from localStorage:', e);
        return false;
      }
    }
  }
};

// Enhanced Loading Screen Manager
class LoadingManager {
  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingProgress = document.querySelector('.loading-progress');
    this.loadingText = document.querySelector('.loading-text');
    this.progress = 0;
    this.init();
  }

  init() {
    this.simulateLoading();
    
    // Hide loading screen after page load
    window.addEventListener('load', () => {
      this.completeLoading();
    });

    // Fallback timeout
    setTimeout(() => {
      this.completeLoading();
    }, 5000);
  }

  simulateLoading() {
    const steps = [
      { progress: 20, text: 'Loading assets...' },
      { progress: 40, text: 'Initializing AI systems...' },
      { progress: 60, text: 'Preparing experience...' },
      { progress: 80, text: 'Almost ready...' },
      { progress: 100, text: 'Welcome!' }
    ];

    let currentStep = 0;
    
    const updateProgress = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        this.updateProgress(step.progress, step.text);
        currentStep++;
        setTimeout(updateProgress, 300 + Math.random() * 200);
      }
    };

    updateProgress();
  }

  updateProgress(progress, text) {
    this.progress = progress;
    
    if (this.loadingProgress) {
      this.loadingProgress.style.width = `${progress}%`;
    }
    
    if (this.loadingText && text) {
      this.loadingText.textContent = text;
    }
  }

  completeLoading() {
    if (this.loadingScreen && this.progress >= 100) {
      this.loadingScreen.classList.add('hidden');
      document.body.classList.add('loaded');
      
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
        this.triggerEntranceAnimations();
      }, 800);
    }
  }

  triggerEntranceAnimations() {
    // Trigger hero animations
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.classList.add('animate__animated', 'animate__fadeInUp');
    }

    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
    }
  }
}

// Enhanced Theme Manager
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.body = document.body;
    this.currentTheme = utils.storage.get('theme', 'dark');
    this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
    this.init();
  }

  init() {
    // Set initial theme
    this.setTheme(this.currentTheme);
    
    // Listen for system theme changes
    this.systemPreference.addEventListener('change', (e) => {
      if (!utils.storage.get('theme-manual')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });

    // Add event listener
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Keyboard shortcut (Ctrl/Cmd + Shift + T)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  setTheme(theme) {
    this.currentTheme = theme;
    this.body.classList.remove('light-mode', 'dark-mode');
    this.body.classList.add(`${theme}-mode`);
    this.body.setAttribute('data-theme', theme);
    
    this.updateToggleIcon(theme === 'light');
    this.updateMetaThemeColor(theme);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme } 
    }));
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    
    // Save preference
    utils.storage.set('theme', newTheme);
    utils.storage.set('theme-manual', true);

    // Add animation effect
    this.themeToggle.classList.add('animate__animated', 'animate__pulse');
    setTimeout(() => {
      this.themeToggle.classList.remove('animate__animated', 'animate__pulse');
    }, 600);

    // Track theme change
    if (typeof gtag !== 'undefined') {
      gtag('event', 'theme_change', {
        'theme': newTheme,
        'event_category': 'user_preference'
      });
    }
  }

  updateToggleIcon(isLight) {
    const icon = this.themeToggle?.querySelector('i');
    if (icon) {
      icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  updateMetaThemeColor(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0f' : '#ffffff');
    }
  }
}

// Enhanced Navigation Manager
class NavigationManager {
  constructor() {
    this.header = document.getElementById('header');
    this.mobileToggle = document.querySelector('.mobile-menu-toggle');
    this.navMenu = document.getElementById('nav-menu');
    this.navLinks = document.querySelectorAll('.nav-menu a');
    this.lastScrollY = 0;
    this.scrollDirection = 'up';
    this.init();
  }

  init() {
    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Close mobile menu when clicking nav links
    this.navLinks.forEach((link, index) => {
      link.addEventListener('click', (e) => {
        this.closeMobileMenu();
        this.handleNavClick(link, e);
      });

      // Add animation delay for mobile menu
      link.style.setProperty('--i', index);
    });

    // Header scroll effects
    window.addEventListener('scroll', utils.throttle(() => {
      this.handleScroll();
    }, 16));

    // Active nav link highlighting
    window.addEventListener('scroll', utils.debounce(() => {
      this.updateActiveNavLink();
    }, 100));

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar') && this.navMenu?.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.navMenu?.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    const isOpen = this.navMenu.classList.contains('active');
    
    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.navMenu.classList.add('active');
    this.mobileToggle.classList.add('active');
    this.mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    
    // Animate hamburger lines
    this.animateHamburger(true);
  }

  closeMobileMenu() {
    this.navMenu.classList.remove('active');
    this.mobileToggle.classList.remove('active');
    this.mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    
    // Animate hamburger lines
    this.animateHamburger(false);
  }

  animateHamburger(isOpen) {
    const lines = this.mobileToggle.querySelectorAll('.hamburger-line');
    lines.forEach((line, index) => {
      line.style.transform = isOpen ? this.getHamburgerTransform(index) : '';
    });
  }

  getHamburgerTransform(index) {
    const transforms = [
      'rotate(45deg) translate(6px, 6px)',
      'scaleX(0)',
      'rotate(-45deg) translate(6px, -6px)'
    ];
    return transforms[index] || '';
  }

  handleNavClick(link, e) {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        utils.scrollToElement(target);
        
        // Track navigation
        if (typeof gtag !== 'undefined') {
          gtag('event', 'navigation_click', {
            'section': href.substring(1),
            'event_category': 'navigation'
          });
        }
      }
    }
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    
    // Determine scroll direction
    this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
    this.lastScrollY = currentScrollY;

    // Header background and visibility
    if (currentScrollY > 100) {
      this.header.classList.add('scrolled');
      
      // Hide header on scroll down, show on scroll up
      if (this.scrollDirection === 'down' && currentScrollY > 300) {
        this.header.style.transform = 'translateY(-100%)';
      } else {
        this.header.style.transform = 'translateY(0)';
      }
    } else {
      this.header.classList.remove('scrolled');
      this.header.style.transform = 'translateY(0)';
    }
  }

  updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        if (navLink) {
          navLink.classList.add('active');
        }
      }
    });
  }
}

// Enhanced Project Manager
class ProjectManager {
  constructor() {
    this.projects = [
      {
        id: 'pageant-profile',
        title: 'Pageant Profile Design',
        description: 'AI-powered personal branding platform for Miss Universe Thailand contestants, featuring psychological archetype analysis and personalized styling recommendations.',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'AI Integration', 'Psychology'],
        category: 'Performing Arts',
        psychology_aspect: 'Personal archetype development using Carl Jung\'s analytical psychology principles to create authentic personal brands.',
        url: 'https://pigletpeakkung.github.io/Pageant_profile-design/',
        screenshot: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
        featured: true,
        year: '2024'
      },
      {
        id: 'siam-blessing',
        title: 'Siam Blessing',
        description: 'A spiritual wellness platform combining quantum psychology with traditional Thai cultural heritage, featuring meditation guides and consciousness exploration tools.',
        technologies: ['Web Design', 'Cultural Research', 'Symbolism', 'Meditation Tech'],
        category: 'Spirituality',
        psychology_aspect: 'Integration of Carl Jung\'s collective unconscious theory with Thai Buddhist philosophy and quantum consciousness studies.',
        url: 'https://pigletpeakkung.github.io/Siam-Blessing/',
        screenshot: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
        featured: false,
        year: '2024'
      },
      {
        id: 'cozy-light',
        title: 'Cozy Light',
        description: 'Minimalist lifestyle design platform focusing on ambient lighting psychology and emotional balance through environmental design and color therapy.',
        technologies: ['CSS Animations', 'Color Theory', 'UX Psychology', 'Ambient Design'],
        category: 'Wellness',
        psychology_aspect: 'Environmental psychology research applied to mood regulation and circadian rhythm optimization through intelligent lighting design.',
        url: 'https://pigletpeakkung.github.io/Cozy-light/',
        screenshot: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80',
        featured: true,
        year: '2023'
      }
    ];
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.renderProjects();
    this.setupFilters();
    this.setupProjectModal();
  }

  renderProjects() {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) return;

    projectGrid.innerHTML = this.projects.map((project, index) => `
      <div class="project-card" 
           data-category="${project.category}" 
           data-aos="fade-up" 
           data-aos-delay="${index * 100}"
           data-project-id="${project.id}">
        <div class="card-inner">
          <div class="card-front">
            <img src="${project.screenshot}" 
                 alt="${project.title} - ${project.description}" 
                 loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80'">
            <div class="project-overlay">
              <div class="project-year">${project.year}</div>
              ${project.featured ? '<div class="featured-badge">Featured</div>' : ''}
            </div>
          </div>
          <div class="card-back">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <p class="psychology-note">${project.psychology_aspect}</p>
            <div class="project-tech">
              ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-actions">
              <a href="${project.url}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="project-link"
                 onclick="trackProjectView('${project.id}')">
                <i class="fas fa-external-link-alt"></i>
                View Live
              </a>
              <button class="project-details-btn" onclick="projectManager.showProjectDetails('${project.id}')">
                <i class="fas fa-info-circle"></i>
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    this.addProjectStyles();
  }

  setupFilters() {
    const filterContainer = document.querySelector('.project-filters');
    if (!filterContainer) return;

    const categories = ['all', ...new Set(this.projects.map(p => p.category))];
    
    filterContainer.innerHTML = categories.map(category => `
      <button class="filter-btn ${category === 'all' ? 'active' : ''}" 
              data-filter="${category}">
        ${category === 'all' ? 'All Projects' : category}
      </button>
    `).join('');

    // Add filter event listeners
    filterContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        this.filterProjects(e.target.dataset.filter);
        
        // Update active filter button
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => 
          btn.classList.remove('active'));
        e.target.classList.add('active');
      }
    });
  }

  filterProjects(filter) {
    this.currentFilter = filter;
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
      const category = card.dataset.category;
      const shouldShow = filter === 'all' || category === filter;
      
      if (shouldShow) {
        card.style.display = 'block';
        card.style.animation = 'fadeInUp 0.6s ease forwards';
      } else {
        card.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });

    // Track filter usage
    if (typeof gtag !== 'undefined') {
      gtag('event', 'project_filter', {
        'filter_type': filter,
        'event_category': 'engagement'
      });
    }
  }

  setupProjectModal() {
    // Create modal HTML
    const modalHTML = `
      <div id="project-modal" class="project-modal">
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <div class="modal-body">
            <div class="project-image">
              <img id="modal-image" src="" alt="">
            </div>
            <div class="project-info">
              <h2 id="modal-title"></h2>
              <p id="modal-description"></p>
              <div id="modal-psychology" class="psychology-section"></div>
              <div id="modal-tech" class="tech-section"></div>
              <div class="modal-actions">
                <a id="modal-link" href="" target="_blank" rel="noopener noreferrer" class="btn-primary">
                  <i class="fas fa-external-link-alt"></i> View Project
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add modal event listeners
    const modal = document.getElementById('project-modal');
    const closeBtn = modal.querySelector('.modal-close');

    closeBtn.addEventListener('click', () => this.closeProjectModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeProjectModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeProjectModal();
    });
  }

  showProjectDetails(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('project-modal');
    
    // Populate modal content
    document.getElementById('modal-image').src = project.screenshot;
    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-description').textContent = project.description;
    document.getElementById('modal-psychology').innerHTML = `
      <h4>Psychology Aspect</h4>
      <p>${project.psychology_aspect}</p>
    `;
    document.getElementById('modal-tech').innerHTML = `
      <h4>Technologies Used</h4>
      <div class="tech-tags">
        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
      </div>
    `;
    document.getElementById('modal-link').href = project.url;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Track modal view
    if (typeof gtag !== 'undefined') {
      gtag('event', 'project_modal_view', {
        'project_id': projectId,
        'event_category': 'engagement'
      });
    }
  }

  closeProjectModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  addProjectStyles() {
    if (document.getElementById('project-styles')) return;

    const style = document.createElement('style');
    style.id = 'project-styles';
    style.textContent = `
      .project-tech {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 1rem 0;
        justify-content: center;
      }
      
      .tech-tag {
        background: var(--primary-purple);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.8rem;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .tech-tag:hover {
        background: var(--accent-pink);
        transform: translateY(-2px);
      }
      
      .project-overlay {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .project-year {
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
      }
      
      .featured-badge {
        background: var(--secondary-gold);
        color: var(--dark-bg);
        padding: 0.25rem 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
      }
      
      .project-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: auto;
      }
      
      .project-details-btn {
        background: transparent;
        border: 2px solid var(--primary-purple);
        color: var(--primary-purple);
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
      }
      
      .project-details-btn:hover {
        background: var(--primary-purple);
        color: white;
      }
      
      .project-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .project-modal.active {
        opacity: 1;
        visibility: visible;
      }
      
      .modal-content {
        background: var(--dark-secondary);
        border-radius: 1rem;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        margin: 1rem;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      
      .project-modal.active .modal-content {
        transform: scale(1);
      }
      
      .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        z-index: 1;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .modal-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        padding: 2rem;
      }
      
      @media (max-width: 768px) {
        .modal-body {
          grid-template-columns: 1fr;
          padding: 1rem;
        }
      }
      
      .project-image img {
        width: 100%;
        border-radius: 0.5rem;
      }
      
      .psychology-section,
      .tech-section {
        margin: 1rem 0;
      }
      
      .psychology-section h4,
      .tech-section h4 {
        color: var(--secondary-gold);
        margin-bottom: 0.5rem;
      }
      
      .tech-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-30px);
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Continue with the rest of the enhanced classes...
// [The rest of your classes would follow the same enhancement pattern]

// Global instance for external access
let projectManager;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize all managers
    new LoadingManager();
    new ThemeManager();
    new NavigationManager();
    projectManager = new ProjectManager();
    new SkillsChartManager();
    new TestimonialManager();
    new FormHandler();
    new AnimationManager();
    new BackToTopManager();
    new AnalyticsManager();

    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          utils.scrollToElement(target);
        }
      });
    });

    // Enhanced image loading
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('load', function() {
        this.style.opacity = '1';
        this.classList.add('loaded');
      });
      
      img.addEventListener('error', function() {
        this.style.opacity = '0.5';
        this.classList.add('error');
        console.warn('Failed to load image:', this.src);
      });
    });

    // Add intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    console.log('🚀 ThannxAI Portfolio loaded successfully!');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('portfolioLoaded'));
    
  } catch (error) {
    console.error('Error initializing portfolio:', error);
    
    // Track initialization errors
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        'description': `Init error: ${error.message}`,
        'fatal': false
      });
    }
  }
});

// Enhanced error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  
  // Track errors in analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      'description': e.error?.toString() || 'Unknown error',
      'fatal': false,
      'file': e.filename,
      'line': e.lineno
    });
  }
});

// Enhanced performance monitoring
window.addEventListener('load', () => {
  // Measure page load performance
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0];
    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'timing_complete', {
        'name': 'page_load',
        'value': Math.round(loadTime),
        'event_category': 'performance'
      });
    }

    // Log performance metrics
    console.log('Performance Metrics:', {
      'Page Load Time': `${Math.round(loadTime)}ms`,
      'DOM Content Loaded': `${Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)}ms`,
      'First Paint': performance.getEntriesByType('paint')[0]?.startTime || 'N/A'
    });
  }
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Export for external use
window.PortfolioUtils = utils;
