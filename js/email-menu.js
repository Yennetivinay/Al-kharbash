/* Email chooser: clicking a link with data-email opens a small menu
   (Gmail / Outlook / default email app / copy address). Without JS the
   link's plain mailto: href still works. */
(function () {
    'use strict';

    var menu = null;

    function close() {
        if (menu) {
            menu.parentNode.removeChild(menu);
            menu = null;
        }
    }

    function copy(text, button) {
        function done() {
            button.innerHTML = '<i class="fa fa-check"></i> Copied!';
            setTimeout(close, 900);
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
        } else {
            fallbackCopy(text);
            done();
        }
    }

    function fallbackCopy(text) {
        var field = document.createElement('textarea');
        field.value = text;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(field);
    }

    // link: element to place the menu under; subject/body: optional pre-filled email
    function open(link, email, subject, body) {
        close();
        email = email || link.getAttribute('data-email');
        var to = encodeURIComponent(email);
        var su = subject ? encodeURIComponent(subject) : '';
        var bd = body ? encodeURIComponent(body) : '';
        var mailtoQuery = [su && 'subject=' + su, bd && 'body=' + bd].filter(Boolean).join('&');

        menu = document.createElement('div');
        menu.className = 'email-menu';
        menu.setAttribute('role', 'menu');
        menu.innerHTML =
            '<div class="email-menu-title">Send an email to ' + email + '</div>' +
            '<a role="menuitem" target="_blank" rel="noopener" href="https://mail.google.com/mail/?view=cm&fs=1&to=' + to + (su ? '&su=' + su : '') + (bd ? '&body=' + bd : '') + '"><i class="fa fa-google"></i> Gmail</a>' +
            '<a role="menuitem" target="_blank" rel="noopener" href="https://outlook.live.com/mail/0/deeplink/compose?to=' + to + (su ? '&subject=' + su : '') + (bd ? '&body=' + bd : '') + '"><i class="fa fa-windows"></i> Outlook / Hotmail</a>' +
            '<a role="menuitem" href="mailto:' + email + (mailtoQuery ? '?' + mailtoQuery : '') + '"><i class="fa fa-envelope-o"></i> Email app</a>' +
            '<button type="button" role="menuitem"><i class="fa fa-clipboard"></i> Copy address</button>';
        document.body.appendChild(menu);

        menu.querySelector('button').addEventListener('click', function () { copy(email, this); });
        var items = menu.querySelectorAll('a');
        for (var i = 0; i < items.length; i++) {
            items[i].addEventListener('click', function () { setTimeout(close, 0); });
        }

        // Place below the link, kept inside the viewport
        var r = link.getBoundingClientRect();
        var w = menu.offsetWidth, h = menu.offsetHeight;
        var left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
        var top = r.bottom + 6;
        if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
        menu.querySelector('a').focus();
    }

    document.addEventListener('click', function (e) {
        var link = e.target.closest ? e.target.closest('a[data-email]') : null;
        if (link) {
            e.preventDefault();
            if (menu && menu.getAttribute('data-for') === link.getAttribute('data-email') && menu._link === link) {
                close();
            } else {
                open(link);
                menu._link = link;
                menu.setAttribute('data-for', link.getAttribute('data-email'));
            }
            return;
        }
        if (menu && !menu.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) close();
    });
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);

    // Used by forms (e.g. apply-now.html) to open the menu with a pre-written email
    window.EmailMenu = {
        open: function (anchor, email, subject, body) {
            open(anchor, email, subject, body);
            menu._link = anchor;
            menu.setAttribute('data-for', email);
        }
    };
})();
