const BUTTON_ID = 'yt-autoscroll-toggle-btn';
let autoscrollEnabled = true; // Local state, not persisted

// Remove old button if it exists (for hot reloads)
const oldBtn = document.getElementById(BUTTON_ID);
if (oldBtn) {
    oldBtn.remove();
};

const btn = document.createElement('button');
btn.id = BUTTON_ID;
btn.style.position = 'fixed';
btn.style.bottom = '24px';
btn.style.right = '24px';
btn.style.zIndex = '9999';
btn.style.padding = '12px 18px';
btn.style.background = '#222';
btn.style.color = '#fff';
btn.style.border = 'none';
btn.style.borderRadius = '8px';
btn.style.fontSize = '16px';
btn.style.cursor = 'pointer';
btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
btn.style.opacity = '0.85';

document.body.appendChild(btn);

function setButtonState(enabled) {
    btn.textContent = enabled ? 'Autoscroll: ON' : 'Autoscroll: OFF';
    btn.style.background = enabled ? '#0a0' : '#a00';
}

// Toggle state on click
btn.addEventListener('click', () => {
    autoscrollEnabled = !autoscrollEnabled;
    setButtonState(autoscrollEnabled);
});

// Initial state
setButtonState(autoscrollEnabled);

let observer;
let activeVideo;
let pollInterval;

function attachListener(video) {
    if (!video) {
        return;
    }

    if (pollInterval) {
        clearInterval(pollInterval);
    }
    activeVideo = video;
    startPollingVideoEnd(video);
}

function startPollingVideoEnd(video) {
    pollInterval = setInterval(() => {
        // Check toggle state before autoscroll
        if (!autoscrollEnabled) {
            return
        }; 

        // Videos might not toggle "ended" attribute 'cause autoplay is on
        // so instead, skip to next one when almost at the end of the video
        if (video.ended) {
            moveToNextShort();
            clearInterval(pollInterval);
        } else if (video.duration && video.currentTime > 0 && (video.duration - video.currentTime) < 0.5) {
            moveToNextShort();
            clearInterval(pollInterval);
        }
    }, 300);
}

function findShortsVideo() {
    return document.querySelector('ytd-reel-video-renderer video');
}

function moveToNextShort() {
    if (!autoscrollEnabled) {
        return;
    }
    const navDown = document.getElementById('navigation-button-down');
    let nextButton;

    if (navDown) {
        nextButton = navDown.querySelector('button');
    } else {
        nextButton = document.querySelector('button[aria-label="Next"]');
    }

    if (nextButton) {
        nextButton.click();
    } else {
        console.log("Next Shorts button not found.");
    }
}

function observeShorts() {
    const shortsPlayer = document.querySelector('ytd-reel-video-renderer video');

    if (!shortsPlayer) {
        return;
    }

    if (observer) {
        observer.disconnect();
    }

    observer = new MutationObserver(() => {
        const video = findShortsVideo();
        attachListener(video);
    });

    observer.observe(shortsPlayer, { childList: true, subtree: true });
}

function init() {
    // Only run on Shorts pages
    if (!window.location.pathname.startsWith('/shorts/')) {
        return;
    }

    const video = findShortsVideo();
    attachListener(video);
    observeShorts();
}

// Run on initial load
init();

// Re-run when navigating between Shorts (YouTube SPA navigation)
let lastPath = location.pathname;

setInterval(() => {
    if (location.pathname !== lastPath) {
        lastPath = location.pathname;
        init();
    }
}, 1000);