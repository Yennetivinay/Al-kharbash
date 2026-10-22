/* Request Quotation: floating button on every page that opens a short form.
   On submit the details become a ready-written email (via the email chooser in
   email-menu.js), the same way the Apply Now form works — no server needed. */
(function () {
    'use strict';

    var QUOTE_EMAIL = 'akco@alkharbashgroup.com';

    var SERVICES = [
        'Facilities Management', 'General Maintenance', 'Security Guard Services', 'Cleaning Services',
        'Air Conditioning', 'Solar Lighting System', 'Carpentry Work', 'Electro Mechanical',
        'Civil and Masonry', 'Other'
    ];
    // service pre-selected when the form is opened from that service's page
    var PAGE_SERVICE = {
        'facility-management.html': 'Facilities Management',
        'servicesdetails.html': 'General Maintenance',
        'securityguard.html': 'Security Guard Services',
        'cleaning.html': 'Cleaning Services',
        'air-conditioning.html': 'Air Conditioning',
        'solar-lighting.html': 'Solar Lighting System',
        'carpentry.html': 'Carpentry Work',
        'electro-mechanical.html': 'Electro Mechanical',
        'civil-masonry.html': 'Civil and Masonry'
    };

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'quote-fab';
    button.innerHTML = '<i class="fa fa-file-text-o"></i><span class="quote-fab-long">Request Quotation</span><span class="quote-fab-short">Quote</span>';
    button.setAttribute('aria-haspopup', 'dialog');

    var modal = document.createElement('div');
    modal.className = 'quote-modal';
    modal.hidden = true;
    modal.innerHTML =
        '<div class="quote-dialog" role="dialog" aria-modal="true" aria-labelledby="quoteTitle">' +
        '  <button type="button" class="quote-close" aria-label="Close">&times;</button>' +
        '  <h3 id="quoteTitle">Request a Quotation</h3>' +
        '  <p class="quote-intro">Tell us what you need and our team will get back to you.</p>' +
        '  <form class="quote-form" novalidate>' +
        '    <label>Name *<input type="text" name="name" required autocomplete="name"></label>' +
        '    <div class="quote-row">' +
        '      <label>Phone *<input type="tel" name="phone" required autocomplete="tel"></label>' +
        '      <label>Email *<input type="email" name="email" required autocomplete="email"></label>' +
        '    </div>' +
        '    <label>Service *<select name="service" required><option value="">Choose a service</option>' +
        SERVICES.map(function (s) { return '<option>' + s + '</option>'; }).join('') +
        '    </select></label>' +
        '    <label>Property location<input type="text" name="location" placeholder="e.g. Al Barsha, Dubai"></label>' +
        '    <label>Details<textarea name="details" rows="4" placeholder="Describe the work, size of the property, preferred dates…"></textarea></label>' +
        '    <button type="submit" class="quote-submit">Send Request</button>' +
        '    <p class="quote-note">You\'ll choose Gmail, Outlook or your email app to send it.</p>' +
        '  </form>' +
        '</div>';

    document.body.appendChild(button);
    document.body.appendChild(modal);

    var form = modal.querySelector('form');
    var lastFocus = null;

    function open() {
        lastFocus = document.activeElement;
        var page = window.location.pathname.split('/').pop();
        var service = form.elements['service'];
        if (PAGE_SERVICE[page] && !service.value) service.value = PAGE_SERVICE[page];
        modal.hidden = false;
        document.body.classList.add('quote-open');
        form.elements['name'].focus();
    }

    function close() {
        modal.hidden = true;
        document.body.classList.remove('quote-open');
        if (lastFocus) lastFocus.focus();
    }

    button.addEventListener('click', open);
    modal.querySelector('.quote-close').addEventListener('click', close);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) close();
    });
    document.addEventListener('keydown', function (e) {
        // the email chooser handles Escape itself while it is open
        if ((e.key === 'Escape' || e.keyCode === 27) && !modal.hidden && !document.querySelector('.email-menu')) close();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        function val(n) { return form.elements[n].value.trim(); }
        var subject = 'Quotation Request: ' + val('service') + ' - ' + val('name');
        var body = [
            'Service: ' + val('service'),
            'Name: ' + val('name'),
            'Phone: ' + val('phone'),
            'Email: ' + val('email'),
            'Location: ' + (val('location') || 'Not provided'),
            '',
            'Details:',
            val('details') || 'Not provided'
        ].join('\n');
        if (window.EmailMenu) {
            window.EmailMenu.open(form.querySelector('.quote-submit'), QUOTE_EMAIL, subject, body);
        } else {
            window.location.href = 'mailto:' + QUOTE_EMAIL + '?subject=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(body);
        }
    });
})();
