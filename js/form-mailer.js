/* Sends the Contact Us, Request Quotation and Submit Resume forms through the
   Google Apps Script web app in google-apps-script/Code.gs, which emails them from
   webadminakgm@gmail.com (contact + quotation -> info@akgm.ae, resumes -> hr@akgm.ae).
   The web app link only sends to those fixed addresses, so it is safe in page code. */
(function () {
    'use strict';

    var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBBZWnjHGvYKC_qxU8gDgUvn9Njm83V-VXrbWbWCLM_jvn8-tSw3HBxdEqgjIWTcg-Nw/exec';

    function readFile(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                // "data:application/pdf;base64,AAAA..." -> "AAAA..."
                resolve({ name: file.name, base64: String(reader.result).split(',')[1] || '' });
            };
            reader.onerror = function () { reject('Could not read your CV file. Please choose it again.'); };
            reader.readAsDataURL(file);
        });
    }

    // form: 'contact' | 'quote' | 'resume'
    // message: { subject, replyTo, fields: {label: value}, botcheck, file (optional File) }
    // Resolves on success; rejects with a message to show the visitor.
    function send(form, message) {
        if (SCRIPT_URL.indexOf('https://') !== 0) {
            return Promise.reject('The form is not set up yet. Please call us or email info@akgm.ae.');
        }
        var filePromise = message.file ? readFile(message.file) : Promise.resolve(null);
        return filePromise.then(function (file) {
            var payload = {
                form: form,
                subject: message.subject,
                replyTo: message.replyTo,
                fields: message.fields,
                botcheck: !!message.botcheck,
                file: file
            };
            // sent as plain text so the browser makes a simple request Google accepts from any site
            return fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) }).then(function (res) {
                return res.json();
            }, function () {
                throw 'Could not send your message. Please check your connection and try again.';
            });
        }).then(function (json) {
            if (!json || !json.success) throw ((json && json.message) || 'Something went wrong. Please try again.');
            return json;
        }, function (error) {
            throw (typeof error === 'string' ? error : 'Something went wrong. Please try again.');
        });
    }

    // Centred "sent successfully" dialog shared by all three forms
    function showSuccess(title, text) {
        var lastFocus = document.activeElement;
        var overlay = document.createElement('div');
        overlay.className = 'form-success-modal';
        overlay.innerHTML =
            '<div class="form-success-dialog" role="alertdialog" aria-modal="true" aria-labelledby="formSuccessTitle" aria-describedby="formSuccessText">' +
            '  <div class="form-success-icon"><i class="fa fa-check"></i></div>' +
            '  <h3 id="formSuccessTitle"></h3>' +
            '  <p id="formSuccessText"></p>' +
            '  <button type="button" class="form-success-ok">OK</button>' +
            '</div>';
        overlay.querySelector('h3').textContent = title;
        overlay.querySelector('p').textContent = text;
        document.body.appendChild(overlay);
        document.body.classList.add('quote-open'); // stops the page scrolling behind the dialog

        function close() {
            document.removeEventListener('keydown', onKey);
            overlay.parentNode.removeChild(overlay);
            document.body.classList.remove('quote-open');
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        function onKey(e) {
            if (e.key === 'Escape' || e.keyCode === 27 || e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                close();
            }
        }
        overlay.querySelector('.form-success-ok').addEventListener('click', close);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close();
        });
        document.addEventListener('keydown', onKey);
        overlay.querySelector('.form-success-ok').focus();
    }

    window.FormMailer = { send: send, showSuccess: showSuccess };
})();
