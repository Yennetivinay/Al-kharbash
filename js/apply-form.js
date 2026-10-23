/* Apply Now form: turns the applicant's details into a ready-written email to HR
   (via the email chooser in email-menu.js). The applicant attaches their CV and sends.
   The applicant picks a position from the dropdown; apply-now.html?job=<position> pre-selects it. */
(function () {
    'use strict';

    var HR_EMAIL = 'hr@akgm.ae';
    var form = document.getElementById('applyForm');
    if (!form) return;

    var job = new URLSearchParams(window.location.search).get('job');
    if (job) document.getElementById('position').value = job;

    function val(id) {
        return document.getElementById(id).value.trim();
    }

    // CV file: Word DOC/DOCX or PDF, max 1 MB (same rules as the original form)
    var cvInput = document.getElementById('resume1');
    var MAX_CV_BYTES = 1024 * 1024;
    function checkCv() {
        var file = cvInput.files[0];
        var error = '';
        if (file) {
            if (!/\.(pdf|doc|docx)$/i.test(file.name)) error = 'Please choose a Word DOC or PDF file.';
            else if (file.size > MAX_CV_BYTES) error = 'Your CV is larger than 1 MB. Please choose a smaller file.';
        }
        cvInput.setCustomValidity(error);
        return error;
    }
    cvInput.addEventListener('change', function () {
        if (checkCv()) cvInput.reportValidity();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        checkCv();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        var cvName = cvInput.files[0].name;
        var position = val('position');
        var subject = (position === 'General application' ? 'CV Submission' : 'Job Application: ' + position) + ' - ' + val('fname');
        // Qualification and Covering Letter are optional
        var lines = [
            'Position: ' + position,
            'Name: ' + val('fname'),
            'Email: ' + val('remail'),
            'Phone Number: ' + val('phone'),
            'Gender: ' + val('gender'),
            'Qualification: ' + (val('quali') || 'Not provided'),
            'Age: ' + val('age'),
            'Nationality: ' + val('nation')
        ];
        if (val('cmessage')) lines.push('', 'Covering Letter:', val('cmessage'));
        lines.push('', 'CV attached: ' + cvName);
        var body = lines.join('\n');

        var msg = document.getElementById('applyMsg');
        msg.innerHTML = '<i class="fa fa-paperclip"></i> Choose how to send your application below, then <strong>attach your CV</strong> (<span></span>) before pressing Send.';
        msg.querySelector('span').textContent = cvName;
        msg.hidden = false;

        var button = document.getElementById('rsubmit');
        if (window.EmailMenu) {
            window.EmailMenu.open(button, HR_EMAIL, subject, body);
        } else {
            window.location.href = 'mailto:' + HR_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        }
    });
})();
