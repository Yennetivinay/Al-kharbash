/* Apply Now form: turns the applicant's details into a ready-written email to HR
   (via the email chooser in email-menu.js). The applicant attaches their CV and sends.
   Opened as apply-now.html?job=<position> from a vacancy, or without ?job for a general CV. */
(function () {
    'use strict';

    var HR_EMAIL = 'hr@akgm.ae';
    var form = document.getElementById('applyForm');
    if (!form) return;

    var job = new URLSearchParams(window.location.search).get('job');
    if (job) {
        var pos = document.getElementById('applyPosition');
        pos.querySelector('strong').textContent = job;
        pos.hidden = false;
    }

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
        var subject = (job ? 'Job Application: ' + job : 'CV Submission') + ' - ' + val('fname');
        // Qualification and Covering Letter are optional
        var lines = [
            job ? 'Position: ' + job : 'Position: General application',
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
