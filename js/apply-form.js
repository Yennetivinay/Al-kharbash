/* Apply Now form: emails the applicant's details and CV to hr@akgm.ae from
   webadminakgm@gmail.com (js/form-mailer.js) — no email app needed.
   The applicant picks a position from the dropdown; apply-now.html?job=<position> pre-selects it. */
(function () {
    'use strict';

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

        var position = val('position');
        var subject = (position === 'General application' ? 'CV Submission' : 'Job Application: ' + position) + ' - ' + val('fname');
        var button = document.getElementById('rsubmit');
        var msg = document.getElementById('applyMsg');
        button.disabled = true;
        button.textContent = 'SENDING...';
        msg.hidden = true;

        // Qualification and Covering Letter are optional
        window.FormMailer.send('resume', {
            subject: subject,
            replyTo: val('remail'),
            fields: {
                'Position': position,
                'Name': val('fname'),
                'Email': val('remail'),
                'Phone Number': val('phone'),
                'Gender': val('gender'),
                'Qualification': val('quali'),
                'Age': val('age'),
                'Nationality': val('nation'),
                'Covering Letter': val('cmessage')
            },
            botcheck: form.elements['botcheck'].checked,
            file: cvInput.files[0]
        }).then(function () {
            form.reset();
            window.FormMailer.showSuccess('Application Submitted Successfully', 'Thank you for applying. Our HR team will review your CV and contact you if you are shortlisted.');
        }, function (error) {
            msg.className = 'apply-msg apply-msg-error';
            msg.innerHTML = '<i class="fa fa-exclamation-circle"></i> <span></span>';
            msg.querySelector('span').textContent = error;
            msg.hidden = false;
        }).then(function () {
            button.disabled = false;
            button.textContent = 'SUBMIT';
        });
    });
})();
