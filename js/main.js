// Tailwind CSS Configuration
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        }
    }
}

// Scroll handling variables
let lastScrollTop = 0;
let ticking = false;

// Scroll progress and active section detection
function updateScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
    }
    
    // Hide/show header based on scroll direction
    const header = document.querySelector('header.sticky');
    const sidebar = document.getElementById('sidebar');
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down - hide header
        header?.classList.add('hide');
        sidebar?.classList.add('scroll-up');
    } else {
        // Scrolling up - show header
        header?.classList.remove('hide');
        sidebar?.classList.remove('scroll-up');
    }
    
    lastScrollTop = scrollTop;
    
    // Update active navigation in sidebar
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');
    
    let currentSection = '';
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Check if section is in viewport (with some offset for header)
        if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = section.id;
        }
    });
    
    // Update active state in sidebar
    navItems.forEach(item => {
        item.classList.remove('active');
        const sectionName = item.onclick.toString().match(/scrollToSection\('(.+?)'\)/);
        if (sectionName && sectionName[1] === currentSection) {
            item.classList.add('active');
        }
    });
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
    }
});

// Smooth scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offset = 80; // Adjusted for just the header height
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Tab functionality
function showTab(tabName, button) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    // Show selected tab
    document.getElementById(tabName).classList.remove('hidden');
    
    // Update button styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        btn.classList.add('text-gray-600');
    });
    button.classList.remove('text-gray-600');
    button.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
}

// Advanced tab functionality
function showAdvancedTab(tabName, button) {
    // Hide all tabs
    document.querySelectorAll('.adv-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    // Show selected tab
    document.getElementById(tabName).classList.remove('hidden');
    
    // Update button styles
    document.querySelectorAll('.adv-tab-btn').forEach(btn => {
        btn.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
        btn.classList.add('text-gray-600');
    });
    button.classList.remove('text-gray-600');
    button.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Component loader function
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component ${url}:`, error);
    }
}

// Function to load all components
async function loadAllComponents() {
    const components = [
        { url: 'components/header.html', containerId: 'header-container' },
        { url: 'components/section-start.html', containerId: 'start-container' },
        { url: 'components/section-interface.html', containerId: 'interface-container' },
        { url: 'components/section-video.html', containerId: 'video-container' },
        { url: 'components/section-search.html', containerId: 'search-container' },
        { url: 'components/section-reports.html', containerId: 'reports-container' },
        { url: 'components/section-advanced.html', containerId: 'advanced-container' },
        { url: 'components/section-faq.html', containerId: 'faq-container' },
        { url: 'components/footer.html', containerId: 'footer-container' }
    ];

    // Load all components in parallel
    await Promise.all(
        components.map(component => 
            loadComponent(component.url, component.containerId)
        )
    );

    // Initialize functionality after all components are loaded
    initializeAfterLoad();
}

// Initialize functionality that depends on all components being loaded
function initializeAfterLoad() {
    // Re-initialize observers and event handlers after dynamic content load
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Header and navigation positioning is handled by CSS

    // Re-initialize FAQ functionality if it exists
    initializeFAQ();
    
    // Initialize dynamic screenshot loading
    if (window.screenshotLoader) {
        window.screenshotLoader.init();
    }
    
    // Dispatch event for other scripts
    document.dispatchEvent(new Event('componentsLoaded'));
}

// FAQ functionality initialization
function initializeFAQ() {
    // This function will be called after components are loaded
    // to ensure FAQ accordion works properly
}

// Toggle FAQ accordion (used in the FAQ component)
function toggleAccordion(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('svg');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
        button.setAttribute('aria-expanded', 'true');
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
        button.setAttribute('aria-expanded', 'false');
    }
}

// Toggle panel functionality for interface section
function togglePanel(panelId) {
    // Define panel pairs that should toggle together
    const panelPairs = {
        'leftPanel': 'mainArea',
        'mainArea': 'leftPanel',
        'bottomPanel': 'rightPanel',
        'rightPanel': 'bottomPanel'
    };

    // Toggle the clicked panel
    toggleSinglePanel(panelId);

    // Toggle the paired panel if exists
    const pairedPanelId = panelPairs[panelId];
    if (pairedPanelId) {
        toggleSinglePanel(pairedPanelId);
    }
}

// Helper function to toggle a single panel
function toggleSinglePanel(panelId) {
    const content = document.getElementById(panelId + 'Content');
    const icon = document.getElementById(panelId + 'Icon');

    if (!content || !icon) return;

    if (content.classList.contains('hidden')) {
        // Show content
        content.classList.remove('hidden');
        content.classList.add('animate-slide-down');
        icon.style.transform = 'rotate(180deg)';
    } else {
        // Hide content
        content.classList.add('hidden');
        content.classList.remove('animate-slide-down');
        icon.style.transform = 'rotate(0deg)';
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', loadAllComponents);

// Screenshot zoom functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add zoom overlay
    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay';
    document.body.appendChild(overlay);
    
    // Add click handlers to all screenshots
    const screenshots = document.querySelectorAll('img[alt*="AISEE"]');
    screenshots.forEach(img => {
        img.classList.add('screenshot-zoom');
        img.addEventListener('click', function() {
            if (this.classList.contains('zoomed')) {
                this.classList.remove('zoomed');
                overlay.classList.remove('active');
            } else {
                this.classList.add('zoomed');
                overlay.classList.add('active');
            }
        });
    });
    
    // Click overlay to close
    overlay.addEventListener('click', function() {
        const zoomedImg = document.querySelector('.screenshot-zoom.zoomed');
        if (zoomedImg) {
            zoomedImg.classList.remove('zoomed');
            this.classList.remove('active');
        }
    });
});