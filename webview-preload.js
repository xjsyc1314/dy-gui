(function() {
    'use strict';
    let lastHref = location.href;
    function checkAndNotify() {
        if (location.href !== lastHref) {
            lastHref = location.href;
            window.postMessage({ type: 'url-changed', url: lastHref }, '*');
        }
    }
    const _push = history.pushState;
    history.pushState = function() { _push.apply(this, arguments); checkAndNotify(); };
    const _replace = history.replaceState;
    history.replaceState = function() { _replace.apply(this, arguments); checkAndNotify(); };
    window.addEventListener('popstate', checkAndNotify);
    window.addEventListener('hashchange', checkAndNotify);
    setInterval(checkAndNotify, 500);
})();