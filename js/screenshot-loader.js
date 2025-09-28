// Screenshot loader that works with any filename
// Maps folder names to actual filenames dynamically

// Pre-defined knowledge of what files exist to avoid 404s
const knownScreenshots = {
    'login': 'screenshot.mov',
    'main-interface': 'screenshot.png',
    // 'panels': removed - empty file
    'video-player': 'screenshot.mov',
    'video-upload': 'screenshot.mov',
    'video-upload-dialog': 'screenshot.png',
    'search': 'screenshot.mov',
    'reports': 'screenshot.png',
    'advanced': 'screenshot.mov',
    // 'processing-states': removed - empty file
    'project-actions': 'screenshot.mov',
    'project-page': 'screenshot.mov',
    'detect-image-search': 'screenshot.mov',
    'detect-learned-class': 'screenshot.mov',
    'detect-text-search': 'screenshot.mov',
    'find-similar-results': 'screenshot.mov'
};

const screenshotMap = {};

// Try to load images with various possible names
async function findScreenshot(folder) {
    const basePath = `screenshots/${folder}/`;

    // First check if we know exactly what file exists
    if (knownScreenshots[folder]) {
        const path = `${basePath}${knownScreenshots[folder]}`;
        // Return the known path directly without checking
        // This prevents 404 errors for known files
        return path;
    }

    // If not in known list, return null (don't try fallbacks)
    // All existing screenshots are already mapped
    return null;
}

// Check if media file exists (image or video)
function checkImage(path) {
    return new Promise((resolve) => {
        // Check if it's a video file
        const videoExtensions = ['.mov', '.mp4', '.webm', '.MOV', '.MP4', '.WEBM'];
        const isVideo = videoExtensions.some(ext => path.toLowerCase().includes(ext));

        if (isVideo) {
            // For videos, try to load with fetch (silently)
            fetch(path, { method: 'HEAD' })
                .then(response => {
                    // Also check content-length to avoid empty files
                    const contentLength = response.headers.get('content-length');
                    resolve(response.ok && contentLength && parseInt(contentLength) > 0);
                })
                .catch(() => resolve(false));
        } else {
            // For images, use Image object
            const img = new Image();
            img.onload = () => {
                // Check if image has actual dimensions (not empty)
                resolve(img.width > 0 && img.height > 0);
            };
            img.onerror = () => resolve(false);
            img.src = path;
        }
    });
}

// Load screenshot with automatic fallback
async function loadDynamicScreenshot(folder) {
    // Check cache first
    if (screenshotMap[folder]) {
        return screenshotMap[folder];
    }
    
    // Find the screenshot
    const path = await findScreenshot(folder);
    
    if (path) {
        screenshotMap[folder] = path;
        return path;
    }
    
    // Return placeholder if not found
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='Inter, sans-serif' font-size='18' font-weight='500'%3E${folder}%3C/text%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Inter, sans-serif' font-size='14'%3EScreenshot bude doplněn%3C/text%3E%3C/svg%3E`;
}

// Apply to all images with data-screenshot attribute
async function initializeAllScreenshots() {
    const images = document.querySelectorAll('img[data-screenshot]');

    for (const img of images) {
        const folder = img.getAttribute('data-screenshot');
        if (folder) {
            const src = await loadDynamicScreenshot(folder);

            // Check if it's a video file
            const videoExtensions = ['.mov', '.mp4', '.webm'];
            const isVideo = videoExtensions.some(ext => src.toLowerCase().includes(ext));

            if (isVideo) {
                // Replace img with video element
                const video = document.createElement('video');
                video.src = src;
                video.className = img.className;
                video.setAttribute('autoplay', '');
                video.setAttribute('loop', '');
                video.setAttribute('muted', '');
                video.setAttribute('playsinline', '');
                // No controls - play like a GIF
                // video.setAttribute('controls', '');
                video.style.width = '100%';
                video.style.height = 'auto';
                video.classList.add('screenshot-video', 'screenshot-zoom', 'cursor-pointer');

                // Copy other attributes
                if (img.hasAttribute('alt')) video.setAttribute('title', img.getAttribute('alt'));
                if (img.hasAttribute('loading')) video.setAttribute('loading', img.getAttribute('loading'));

                // No visual indicator for videos - they should look like GIFs
                // const container = img.closest('.screenshot-container');
                // if (container) {
                //     container.style.position = 'relative';
                // }

                // Replace img with video (check if parent exists first)
                if (img.parentNode) {
                    img.parentNode.replaceChild(video, img);
                }

                // Ensure video plays (silently handle autoplay failures)
                video.addEventListener('loadeddata', function() {
                    this.play().catch(e => {
                        // Silently handle autoplay prevention - it's expected behavior
                        // Videos will play on first user interaction
                        const playOnInteraction = () => {
                            this.play().catch(() => {}); // Silently fail if still not allowed
                        };

                        // Try to play on any user interaction
                        ['click', 'touchstart', 'keydown'].forEach(event => {
                            document.addEventListener(event, playOnInteraction, { once: true });
                        });
                    });
                });

                // Add click handler for zoom
                video.addEventListener('click', function(e) {
                    if (!e.target.closest('video').hasAttribute('controls') || e.offsetY < e.target.clientHeight - 40) {
                        this.classList.toggle('zoomed');
                        const overlay = document.querySelector('.zoom-overlay');
                        if (overlay) overlay.classList.toggle('active');
                    }
                });
            } else {
                // Original image handling
                img.src = src;

                // Add loading state
                img.classList.add('screenshot-loading');

                // Check if it's a GIF
                const isGif = src.toLowerCase().includes('.gif');
                if (isGif) {
                    // Add special class for GIFs
                    img.classList.add('screenshot-gif');
                    // Set attributes for GIF animations
                    img.setAttribute('loading', 'eager'); // Load GIFs immediately
                    // Add title to indicate it's an animation
                    img.setAttribute('title', img.getAttribute('title') || 'Animace - klikněte pro zvětšení');
                }

                img.onload = () => {
                    img.classList.remove('screenshot-loading');
                    img.classList.add('screenshot-loaded');

                    // For GIFs, ensure they loop
                    if (isGif) {
                        // GIFs loop automatically, but we can add visual indicator
                        const container = img.closest('.screenshot-container');
                        if (container && !container.querySelector('.gif-indicator')) {
                            const indicator = document.createElement('div');
                            indicator.className = 'gif-indicator';
                            indicator.innerHTML = '🎬 Animace';
                            indicator.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; z-index: 10;';
                            container.style.position = 'relative';
                            container.appendChild(indicator);
                        }
                    }
                };
            }
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllScreenshots);
} else {
    // DOM is already loaded
    initializeAllScreenshots();
}

// Re-initialize after dynamic content load
document.addEventListener('componentsLoaded', initializeAllScreenshots);

// Export for use in other scripts
window.screenshotLoader = {
    load: loadDynamicScreenshot,
    init: initializeAllScreenshots,
    checkImage: checkImage
};