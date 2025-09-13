// Screenshot loader that works with any filename
// Maps folder names to actual filenames dynamically

const screenshotMap = {
    'login': null,
    'main-interface': null,
    'panels': null,
    'video-player': null,
    'video-upload': null,
    'search': null,
    'reports': null,
    'advanced': null,
    'processing-states': null,
    'project-actions': null,
    'project-page': null
};

// Try to load images with various possible names
async function findScreenshot(folder) {
    const basePath = `screenshots/${folder}/`;
    
    // List of possible filenames to try (in priority order)
    const possibleFilenames = [
        // Video files have highest priority (for animations)
        'screenshot.mov',
        'screenshot.mp4',
        'screenshot.webm',
        'video.mov',
        'video.mp4',
        'animation.mov',
        'animation.mp4',
        'demo.mov',
        'demo.mp4',
        // GIF files
        'screenshot.gif',
        'animation.gif',
        'demo.gif',
        'screen.gif',
        // Static images
        'screenshot.png',
        'screenshot.jpg',
        'Screenshot.png',
        'Screenshot.jpg',
        'screen.png',
        'screen.jpg',
        'image.png',
        'image.jpg',
        // Common macOS screenshot/recording naming pattern
        /Screen Recording.*\.(mov|mp4)/,
        /Screenshot.*\.(png|gif)/,
        /Screen.*\.(png|gif|mov|mp4)/,
        // Any media file
        /.*\.(png|jpg|jpeg|gif|mov|mp4|webm|PNG|JPG|JPEG|GIF|MOV|MP4|WEBM)$/
    ];
    
    // For pattern matching, we need to make a request to check files
    // Since we can't list directories client-side, we'll try common patterns
    for (const pattern of possibleFilenames) {
        if (pattern instanceof RegExp) {
            // Try common macOS screenshot patterns
            const datePatterns = [
                'Screenshot 2025',
                'Screen Shot',
                'screenshot',
                'image'
            ];
            
            for (const prefix of datePatterns) {
                for (const ext of ['.gif', '.png', '.jpg', '.GIF', '.PNG', '.JPG']) {
                    // Try with various date formats
                    const testPaths = [
                        `${basePath}${prefix}${ext}`,
                        `${basePath}${prefix} at${ext}`,
                    ];
                    
                    for (const path of testPaths) {
                        if (await checkImage(path)) {
                            return path;
                        }
                    }
                }
            }
        } else {
            const path = `${basePath}${pattern}`;
            if (await checkImage(path)) {
                return path;
            }
        }
    }
    
    return null;
}

// Check if media file exists (image or video)
function checkImage(path) {
    return new Promise((resolve) => {
        // Check if it's a video file
        const videoExtensions = ['.mov', '.mp4', '.webm', '.MOV', '.MP4', '.WEBM'];
        const isVideo = videoExtensions.some(ext => path.toLowerCase().includes(ext));

        if (isVideo) {
            // For videos, try to load with fetch
            fetch(path, { method: 'HEAD' })
                .then(response => resolve(response.ok))
                .catch(() => resolve(false));
        } else {
            // For images, use Image object
            const img = new Image();
            img.onload = () => resolve(true);
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

                // Replace img with video
                img.parentNode.replaceChild(video, img);

                // Ensure video plays
                video.addEventListener('loadeddata', function() {
                    this.play().catch(e => {
                        console.log('Auto-play was prevented, trying again...', e);
                        // Try to play on user interaction
                        document.addEventListener('click', () => {
                            this.play();
                        }, { once: true });
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