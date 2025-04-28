function bindButtonEvents() {
    document.querySelectorAll('.hk-button, .tab-button').forEach(button => {
        button.removeEventListener('touchstart', handleTouchStart);
        button.removeEventListener('touchend', handleTouchEnd);
        button.removeEventListener('click', handleClick);

        button.addEventListener('touchstart', handleTouchStart);
        button.addEventListener('touchend', handleTouchEnd);
        button.addEventListener('click', handleClick);
    });
}

function handleTouchStart(event) {
    event.target.classList.add('active');
}

function handleTouchEnd(event) {
    event.target.classList.remove('active');
}

function handleClick(event) {
    const action = event.target.getAttribute('data-action');
    if (action && window[action]) {
        window[action]();
    } else {
        console.error(`Function ${action} is not defined.`);
    }
}

function observeContentChanges() {
    const mainContent = document.getElementById('main-content');
    const observer = new MutationObserver(() => {
        bindButtonEvents();
    });
    observer.observe(mainContent, { childList: true, subtree: true });
}