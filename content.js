let observer;
let activeVideo;
let pollInterval;

function attachListener(video) {
    if (!video) {
        return;
    }

    // Remove previous polling if any
    if (pollInterval) {
        clearInterval(pollInterval);
    }
    activeVideo = video;
    startPollingVideoEnd(video);
}

function startPollingVideoEnd(video) {
    pollInterval = setInterval(() => {
        if (video.ended) {
            moveToNextShort();
            clearInterval(pollInterval);
        } else if (video.duration && video.currentTime > 0 && (video.duration - video.currentTime) < 0.5) {
            // If within 0.5 seconds of ending
            moveToNextShort();
            clearInterval(pollInterval);
        }
    }, 300);
}

function findShortsVideo() {
    // Shorts video usually has the tag 'video' inside the Shorts player
    return document.querySelector('ytd-reel-video-renderer video');
}

function moveToNextShort() {
    // The next button in Shorts is usually an arrow button
    const navDown = document.getElementById('navigation-button-down');
    let nextButton;

    if (navDown) {
        nextButton = navDown.querySelector('button');
    } else {
        nextButton = document.querySelector('button[aria-label="Next"]');
    }

    console.log('moving to next..')

    if (nextButton) {
        nextButton.click();
    } else {
        console.log("Next Shorts button not found.");
    }
}

function observeShorts() {
    // Observe changes in the Shorts player area
    const shortsPlayer = document.querySelector('ytd-reel-video-renderer video');

    if (!shortsPlayer) {
        return
    }

    if (observer) {
        observer.disconnect();
    }

    observer = new MutationObserver(() => {
        const video = findShortsVideo();
        attachListener(video);
    });

    observer.observe(shortsPlayer, { childList: true, subtree: true });
};

function init() {
    // Only run on Shorts pages
    if (!window.location.pathname.startsWith('/shorts/')) {
        return;
    }

    const video = findShortsVideo();

    attachListener(video);
    observeShorts();
};

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