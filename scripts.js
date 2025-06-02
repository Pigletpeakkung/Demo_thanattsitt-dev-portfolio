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

  // Smooth scroll to element
  scrollToElement(element, offset = 80) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Animate number counting
  animateNumber(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  }
};

// Loading Screen Manager
class LoadingManager {
  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.init();
  }

  init() {
    // Hide loading screen after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.hideLoading();
      }, 1500);
    });
  }

  hideLoading() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden');
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
      }, 800);
    }
  }
}

// Theme Manager
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.body = document.body;
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }

  init() {
    // Set initial theme
    if (this.currentTheme === 'light') {
      this.body.classList.add('light-mode');
      this.updateToggleIcon(true);
    }

    // Add event listener
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  toggleTheme() {
    this.body.classList.toggle('light-mode');
    const isLight = this.body.classList.contains('light-mode');
    
    // Save preference
    this.currentTheme = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', this.currentTheme);
    this.updateToggleIcon(isLight);

    // Track theme change
    if (typeof gtag !== 'undefined') {
      gtag('event', 'theme_change', {
        'theme': this.currentTheme,
        'event_category': 'user_preference'
      });
    }
  }

  updateToggleIcon(isLight) {
    const icon = this.themeToggle.querySelector('i');
    if (icon) {
      icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    }
  }
}

// Navigation Manager
class NavigationManager {
  constructor() {
    this.header = document.getElementById('header');
    this.mobileToggle = document.querySelector('.mobile-menu-toggle');
    this.navMenu = document.getElementById('nav-menu');
    this.navLinks = document.querySelectorAll('.nav-menu a');
    this.init();
  }

  init() {
    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Close mobile menu when clicking nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
        this.handleNavClick(link);
      });
    });

    // Header scroll effect
    window.addEventListener('scroll', utils.debounce(() => {
      this.handleScroll();
    }, 10));

    // Active nav link highlighting
    window.addEventListener('scroll', utils.debounce(() => {
      this.updateActiveNavLink();
    }, 100));
  }

  toggleMobileMenu() {
    this.navMenu.classList.toggle('active');
    const isOpen = this.navMenu.classList.contains('active');
    this.mobileToggle.setAttribute('aria-expanded', isOpen);
  }

  closeMobileMenu() {
    this.navMenu.classList.remove('active');
    this.mobileToggle.setAttribute('aria-expanded', 'false');
  }

  handleNavClick(link) {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        utils.scrollToElement(target);
      }
    }
  }

  handleScroll() {
    if (window.scrollY > 100) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
  }

  updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

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

// Project Manager
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
        screenshot: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80'
      },
      {
        id: 'siam-blessing',
        title: 'Siam Blessing',
        description: 'A spiritual wellness platform combining quantum psychology with traditional Thai cultural heritage, featuring meditation guides and consciousness exploration tools.',
        technologies: ['Web Design', 'Cultural Research', 'Symbolism', 'Meditation Tech'],
        category: 'Spirituality',
        psychology_aspect: 'Integration of Carl Jung\'s collective unconscious theory with Thai Buddhist philosophy and quantum consciousness studies.',
        url: 'https://pigletpeakkung.github.io/Siam-Blessing/',
        screenshot: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80'
      },
      {
        id: 'cozy-light',
        title: 'Cozy Light',
        description: 'Minimalist lifestyle design platform focusing on ambient lighting psychology and emotional balance through environmental design and color therapy.',
        technologies: ['CSS Animations', 'Color Theory', 'UX Psychology', 'Ambient Design'],
        category: 'Wellness',
        psychology_aspect: 'Environmental psychology research applied to mood regulation and circadian rhythm optimization through intelligent lighting design.',
        url: 'https://pigletpeakkung.github.io/Cozy-light/',
        screenshot: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80'
      }
    ];
    this.init();
  }

  init() {
    this.renderProjects();
  }

  renderProjects() {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) return;

    projectGrid.innerHTML = this.projects.map(project => `
      <div class="project-card" data-category="${project.category}" data-aos="fade-up">
        <div class="card-inner">
          <div class="card-front">
            <img src="${project.screenshot}" 
                 alt="${project.title} - ${project.description}" 
                 loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80'">
          </div>
          <div class="card-back">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <p class="psychology-note">${project.psychology_aspect}</p>
            <div class="project-tech">
              ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <a href="${project.url}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="project-link"
               onclick="trackProjectView('${project.id}')">
              <i class="fas fa-external-link-alt"></i>
              View Project
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // Add tech tag styles
    const style = document.createElement('style');
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
      }
    `;
    document.head.appendChild(style);
  }
}

// Skills Chart Manager
class SkillsChartManager {
  constructor() {
    this.chartCanvas = document.getElementById('skillsChart');
    this.chart = null;
    this.init();
  }

  init() {
    if (this.chartCanvas && typeof Chart !== 'undefined') {
      this.createChart();
    }
  }

  createChart() {
    const ctx = this.chartCanvas.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          'AI/ML Development',
          'Web Development',
          'Psychology Research',
          'Creative Arts',
          'SEO & Content',
          'Public Speaking'
        ],
        datasets: [{
          label: 'Skill Level',
          data: [85, 90, 80, 95, 88, 92],
          backgroundColor: 'rgba(110, 64, 201, 0.2)',
          borderColor: '#6e40c9',
          borderWidth: 2,
          pointBackgroundColor: '#ffd700',
          pointBorderColor: '#6e40c9',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              display: false
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: '#ffffff',
              font: {
                size: 12,
                weight: '500'
              }
            }
          }
        }
      }
    });
  }
}

// Testimonial Manager
class TestimonialManager {
  constructor() {
    this.testimonials = [
      {
        name: 'Alex Chen',
        role: 'Tech Startup Founder',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
        content: 'ThannxAI transformed our design workflow completely. The AI tools reduced our production time by 40% while significantly improving quality. Thanattsitt\'s unique approach to combining psychology with technology is revolutionary.',
        rating: 5
      },
      {
        name: 'Sarah Kim',
        role: 'Open-Source Maintainer',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
        content: 'Working with Thanattsitt on ThannxAI was a game-changer for our team. Her technical expertise combined with deep psychological insights created solutions we never thought possible. Truly innovative work.',
        rating: 5
      },
      {
        name: 'James Rodriguez',
        role: 'Workshop Participant',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
        content: 'The AI Earning Guide podcast helped me land my first freelance gig! Thanattsitt breaks down complex AI concepts into actionable steps. Her Miss Universe background brings a unique perspective to tech.',
        rating: 5
      },
      {
        name: 'Dr. Maria Santos',
        role: 'Psychology Professor',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
        content: 'Thanattsitt\'s integration of Carl Jung\'s theories with modern AI is groundbreaking. Her research on quantum psychology and consciousness studies opens new possibilities for therapeutic applications.',
        rating: 5
      },
      {
        name: 'Michael Thompson',
        role: 'Fashion Designer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80',
        content: 'The Pageant Profile Design project revolutionized how we approach personal branding in fashion. The psychological archetype analysis provides insights that traditional methods miss completely.',
        rating: 5
      }
    ];
    this.init();
  }

  init() {
    this.renderTestimonials();
  }

  renderTestimonials() {
    const carousel = document.getElementById('testimonial-carousel');
    if (!carousel) return;

    // Duplicate testimonials for seamless loop
    const duplicatedTestimonials = [...this.testimonials, ...this.testimonials];

    carousel.innerHTML = duplicatedTestimonials.map(testimonial => `
      <div class="testimonial-card">
        <div class="testimonial-header">
          <img src="${testimonial.avatar}" 
               alt="${testimonial.name}" 
               class="testimonial-avatar" 
               loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80'">
          <div class="testimonial-info">
            <h4>${testimonial.name}</h4>
            <p>${testimonial.role}</p>
          </div>
        </div>
        <div class="testimonial-content">
          <p>"${testimonial.content}"</p>
          <div class="testimonial-rating">${'★'.repeat(testimonial.rating)}</div>
        </div>
      </div>
    `).join('');
  }
}

// Form Handler
class FormHandler {
  constructor() {
    this.form = document.querySelector('.contact-form');
    this.submitButton = this.form?.querySelector('.submit-button');
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    this.setLoadingState(true);

    try {
      // For Netlify forms, we can submit directly
      const formData = new FormData(this.form);
      
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (response.ok) {
        this.showSuccess();
        this.form.reset();
        
        // Track form submission
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', {
            'event_category': 'contact',
            'event_label': 'contact_form'
          });
        }
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError();
    } finally {
      this.setLoadingState(false);
    }
  }

  validateForm() {
    const inputs = this.form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        this.showFieldError(input, 'This field is required');
        isValid = false;
      } else if (input.type === 'email' && !this.isValidEmail(input.value)) {
        this.showFieldError(input, 'Please enter a valid email address');
        isValid = false;
      } else {
        this.clearFieldError(input);
      }
    });

    return isValid;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFieldError(input, message) {
    this.clearFieldError(input);
    input.style.borderColor = '#ff6b9d';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff6b9d';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    input.parentNode.appendChild(errorDiv);
  }

  clearFieldError(input) {
    input.style.borderColor = '';
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  setLoadingState(loading) {
    if (this.submitButton) {
      this.submitButton.disabled = loading;
      this.submitButton.innerHTML = loading 
        ? '<i class="fas fa-spinner fa-spin"></i> Sending...'
        : '<i class="fas fa-paper-plane"></i> Send Message';
    }
  }

  showSuccess() {
    this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
  }

  showError() {
    this.showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }
}

// Animation Manager
class AnimationManager {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.animateHeroStats();
    this.setupParallaxEffects();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, this.observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
      '.education-card, .testimonial-card, .project-card, .skill-category'
    );
    
    animateElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
      .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  }

  animateHeroStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const heroSection = document.getElementById('hero');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.target);
            utils.animateNumber(stat, target);
          });
          observer.unobserve(entry.target);
        }
      });
    });

    if (heroSection) {
      observer.observe(heroSection);
    }
  }

  setupParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.hero-particles');
    
    window.addEventListener('scroll', utils.debounce(() => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;

      parallaxElements.forEach(element => {
        element.style.transform = `translateY(${rate}px)`;
      });
    }, 10));
  }
}

// Back to Top Manager
class BackToTopManager {
  constructor() {
    this.button = document.getElementById('back-to-top');
    this.init();
  }

  init() {
    if (!this.button) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', utils.debounce(() => {
      if (window.pageYOffset > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }, 100));

    // Scroll to top when clicked
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// Analytics Manager
class AnalyticsManager {
  constructor() {
    this.init();
  }

  init() {
    this.trackPageView();
    this.setupScrollTracking();
    this.setupClickTracking();
  }

  trackPageView() {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }

  setupScrollTracking() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 100];
    const tracked = new Set();

    window.addEventListener('scroll', utils.debounce(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !tracked.has(milestone)) {
            tracked.add(milestone);
            this.trackEvent('scroll_depth', {
              'scroll_percentage': milestone,
              'event_category': 'engagement'
            });
          }
        });
      }
    }, 250));
  }

  setupClickTracking() {
    // Track external links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        this.trackEvent('external_link_click', {
          'link_url': link.href,
          'link_text': link.textContent.trim(),
          'event_category': 'outbound'
        });
      }
    });

    // Track project card interactions
    document.addEventListener('click', (e) => {
      const projectCard = e.target.closest('.project-card');
      if (projectCard) {
        const projectTitle = projectCard.querySelector('h3')?.textContent;
        this.trackEvent('project_card_click', {
          'project_name': projectTitle,
          'event_category': 'engagement'
        });
      }
    });
  }

  trackEvent(eventName, parameters) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
  }
}

// Global Functions
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    utils.scrollToElement(section);
  }
}

function trackProjectView(projectId) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'project_view', {
      'project_id': projectId,
      'event_category': 'engagement'
    });
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all managers
  new LoadingManager();
  new ThemeManager();
  new NavigationManager();
  new ProjectManager();
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

  // Add loading states to images
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
      this.style.opacity = '1';
    });
    
    img.addEventListener('error', function() {
      this.style.opacity = '0.5';
      console.warn('Failed to load image:', this.src);
    });
  });

  console.log('🚀 ThannxAI Portfolio loaded successfully!');
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

// Error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  
  // Track errors in analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      'description': e.error.toString(),
      'fatal': false
    });
  }
});

// Performance monitoring
window.addEventListener('load', () => {
  // Measure page load performance
  const perfData = performance.getEntriesByType('navigation')[0];
  const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
  
  if (typeof gtag !== 'undefined') {
    gtag('event', 'timing_complete', {
      'name': 'page_load',
      'value': Math.round(loadTime)
    });
  }
});
