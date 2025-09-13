// Dynamic image loader for screenshots
// Loads any image from the screenshot folders regardless of filename

async function loadScreenshot(folderName, imgElement) {
    const basePath = `screenshots/${folderName}/`;
    
    // Try common image extensions
    const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    const possibleNames = [
        'screenshot',
        'Screenshot',
        'image',
        'Image',
        'screen',
        'Screen'
    ];
    
    // First try exact matches
    for (const name of possibleNames) {
        for (const ext of extensions) {
            const path = `${basePath}${name}.${ext}`;
            if (await imageExists(path)) {
                imgElement.src = path;
                return true;
            }
        }
    }
    
    // If no exact match, try to load first image in directory
    // This requires a server endpoint or directory listing
    // For now, we'll use a fallback approach
    
    // Try numbered screenshots
    for (let i = 1; i <= 10; i++) {
        for (const ext of extensions) {
            const path = `${basePath}screenshot${i}.${ext}`;
            if (await imageExists(path)) {
                imgElement.src = path;
                return true;
            }
        }
    }
    
    // Fallback to placeholder
    imgElement.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Inter, sans-serif' font-size='20'%3EObr�zek nenalezen%3C/text%3E%3C/svg%3E`;
    imgElement.alt = `Screenshot pro ${folderName} nenalezen`;
    return false;
}

async function imageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Initialize all screenshots on page load
async function initializeScreenshots() {
    const screenshots = document.querySelectorAll('[data-screenshot-folder]');
    
    for (const img of screenshots) {
        const folder = img.getAttribute('data-screenshot-folder');
        if (folder) {
            await loadScreenshot(folder, img);
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScreenshots);
} else {
    initializeScreenshots();
}

// Export for manual use
window.loadScreenshot = loadScreenshot;
window.initializeScreenshots = initializeScreenshots;