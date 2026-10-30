/* Request Quotation: a button on the service pages that opens a short form.
   Detail pages get it under the intro text; the Services page gets it below the cards.
   On submit the details are emailed to info@akgm.ae from webadminakgm@gmail.com (js/form-mailer.js). */
(function () {
    'use strict';

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

    var intro = document.querySelector('.single-services-page .col-md-9 .single-well');
    var cards = document.querySelector('.all-services');
    if (!intro && !cards) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'about-btn quote-btn';
    button.innerHTML = '<i class="fa fa-file-text-o"></i> Request Quotation';
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
        '    <input type="checkbox" name="botcheck" style="display: none;" tabindex="-1" autocomplete="off">' +
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
        '    <p class="quote-note" role="status" aria-live="polite"></p>' +
        '  </form>' +
        '</div>';

    if (intro) {
        intro.appendChild(button);
    } else {
        var wrap = document.createElement('div');
        wrap.className = 'quote-btn-center';
        wrap.appendChild(button);
        cards.parentNode.parentNode.appendChild(wrap);
    }
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
        var submit = form.querySelector('.quote-submit');
        var note = form.querySelector('.quote-note');
        submit.disabled = true;
        submit.textContent = 'Sending...';
        note.className = 'quote-note';
        note.textContent = '';
        window.FormMailer.send('quote', {
            subject: 'Quotation Request: ' + val('service') + ' - ' + val('name'),
            replyTo: val('email'),
            fields: {
                'Service': val('service'),
                'Name': val('name'),
                'Phone': val('phone'),
                'Email': val('email'),
                'Location': val('location'),
                'Details': val('details')
            },
            botcheck: form.elements['botcheck'].checked
        }).then(function () {
            form.reset();
            close();
            window.FormMailer.showSuccess('Quotation Request Sent', 'Thank you! Our team will review your request and contact you soon.');
        }, function (error) {
            note.className = 'quote-note quote-note-error';
            note.textContent = error;
        }).then(function () {
            submit.disabled = false;
            submit.textContent = 'Send Request';
        });
    });
})();
