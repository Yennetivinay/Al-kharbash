/**
 * AL Kharbash website forms mailer — Google Apps Script web app.
 *
 * Runs inside the webadminakgm@gmail.com Google account and sends the website's
 * form submissions from that account as branded HTML emails:
 *   Contact Us, Request Quotation  ->  info@akgm.ae
 *   Submit Resume (with CV file)    ->  hr@akgm.ae
 *
 * Recipients are fixed here, so the web app link can't be used to email anyone else.
 * Setup steps are in google-apps-script/SETUP.md.
 */

var RECIPIENTS = {
  contact: 'info@akgm.ae',
  quote: 'info@akgm.ae',
  resume: 'hr@akgm.ae'
};
var SENDER_NAME = 'AL Kharbash Website';
var MAX_CV_BYTES = 1024 * 1024; // 1 MB, same as the form
var CV_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};
var MAX_FIELD_LENGTH = 5000;

// Look of each form's email: heading, coloured label, intro line, and which field is the long message
var FORM_STYLES = {
  contact: { refPrefix: 'ENQ', heading: 'New Website Enquiry', badge: 'CONTACT US', badgeColor: '#1565c0',
             intro: 'Someone sent a message through the Contact Us form.', messageField: 'Message' },
  quote: { refPrefix: 'QTN', heading: 'New Quotation Request', badge: 'QUOTATION', badgeColor: '#e65100',
           intro: 'A customer has requested a quotation.', messageField: 'Details' },
  resume: { refPrefix: 'HR', heading: 'New Job Application', badge: 'CAREERS', badgeColor: '#2e7d32',
            intro: 'A new application was submitted through the Submit Resume form.', messageField: 'Covering Letter' }
};
var BRAND = '#800017';
var BRAND_DARK = '#5e0011';
var TIMEZONE = 'Asia/Dubai';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var form = data.form;
    if (!RECIPIENTS.hasOwnProperty(form)) return reply(false, 'Unknown form.');
    // hidden spam-trap field: people never fill it, bots usually do
    if (data.botcheck) return reply(true);

    var fields = [];
    var raw = data.fields || {};
    for (var label in raw) {
      if (!raw.hasOwnProperty(label)) continue;
      var value = String(raw[label] == null ? '' : raw[label]).trim().slice(0, MAX_FIELD_LENGTH);
      fields.push({ label: String(label).slice(0, 60), value: value });
    }

    var replyTo = String(data.replyTo || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) return reply(false, 'Please enter a valid email address.');

    var options = { name: SENDER_NAME, replyTo: replyTo };
    var cvName = '';

    if (form === 'resume') {
      var file = data.file;
      if (!file || !file.name || !file.base64) return reply(false, 'Please attach your CV.');
      var ext = String(file.name).split('.').pop().toLowerCase();
      if (!CV_TYPES.hasOwnProperty(ext)) return reply(false, 'Please choose a Word DOC or PDF file.');
      var bytes = Utilities.base64Decode(file.base64);
      if (bytes.length > MAX_CV_BYTES) return reply(false, 'Your CV is larger than 1 MB. Please choose a smaller file.');
      cvName = String(file.name).slice(0, 150);
      options.attachments = [Utilities.newBlob(bytes, CV_TYPES[ext], cvName)];
    }

    // A unique reference in every subject stops Gmail/Outlook bundling separate submissions
    // into one conversation, and gives staff a number to quote: type + date + that day's count,
    // e.g. ENQ-311026-01 = first Contact Us enquiry on 31 Oct 2026
    var now = new Date();
    var ref = dailyRef(FORM_STYLES[form].refPrefix, Utilities.formatDate(now, TIMEZONE, 'ddMMyy'));
    var subject = String(data.subject || 'Website form').slice(0, 200) + ' [' + ref + ']';
    var sentAt = Utilities.formatDate(now, TIMEZONE, "EEEE, d MMMM yyyy 'at' h:mm a");
    options.htmlBody = buildHtml(form, subject, fields, replyTo, cvName, sentAt, ref);
    MailApp.sendEmail(RECIPIENTS[form], subject, buildText(fields, replyTo, cvName, sentAt, ref), options);
    return reply(true);
  } catch (err) {
    console.error(err);
    return reply(false, 'Something went wrong. Please try again.');
  }
}

// Plain-text version for email apps that don't show HTML
function buildText(fields, replyTo, cvName, sentAt, ref) {
  var lines = ['Reference: ' + ref, ''];
  fields.forEach(function (f) {
    if (f.value.indexOf('\n') !== -1) lines.push('', f.label + ':', f.value, '');
    else lines.push(f.label + ': ' + (f.value || 'Not provided'));
  });
  if (cvName) lines.push('', 'CV attached: ' + cvName);
  lines.push('', '—', 'Received ' + sentAt + ' (Dubai time) from the AL Kharbash website.',
             'Reply to this email to answer ' + replyTo + '.');
  return lines.join('\n');
}

// Branded HTML version. Table layout with inline styles so it looks right in Outlook, Gmail and phones.
function buildHtml(form, subject, fields, replyTo, cvName, sentAt, ref) {
  var style = FORM_STYLES[form];
  var name = valueOf(fields, 'Name') || replyTo;
  var phone = valueOf(fields, 'Phone') || valueOf(fields, 'Phone Number');
  var message = valueOf(fields, style.messageField);
  var highlight = form === 'quote' ? valueOf(fields, 'Service') : form === 'resume' ? valueOf(fields, 'Position') : valueOf(fields, 'Subject');
  var highlightLabel = form === 'quote' ? 'Service requested' : form === 'resume' ? 'Position applied for' : 'Subject';

  var rows = fields.filter(function (f) { return f.label !== style.messageField; }).map(function (f, i) {
    var value = f.value ? linkify(f.label, f.value) : '<span style="color:#aaaaaa;">Not provided</span>';
    return '<tr>' +
      '<td style="padding:12px 16px;width:38%;background:' + (i % 2 ? '#ffffff' : '#faf6f7') + ';border-bottom:1px solid #f0e6e8;font-size:13px;font-weight:bold;color:#6b5a5d;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">' + esc(f.label) + '</td>' +
      '<td style="padding:12px 16px;background:' + (i % 2 ? '#ffffff' : '#faf6f7') + ';border-bottom:1px solid #f0e6e8;font-size:15px;color:#222222;vertical-align:top;">' + value + '</td>' +
      '</tr>';
  }).join('');

  var messageBlock = message
    ? '<tr><td style="padding:8px 32px 0;">' +
        '<div style="font-size:13px;font-weight:bold;color:#6b5a5d;text-transform:uppercase;letter-spacing:0.4px;margin:0 0 8px;">' + esc(style.messageField) + '</div>' +
        '<div style="background:#fbf8f9;border-left:4px solid ' + BRAND + ';border-radius:4px;padding:16px 18px;font-size:15px;line-height:1.6;color:#333333;">' + esc(message).replace(/\n/g, '<br>') + '</div>' +
      '</td></tr>'
    : '';

  var cvBlock = cvName
    ? '<tr><td style="padding:20px 32px 0;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#edf7ee;border:1px solid #c8e6c9;border-radius:6px;"><tr>' +
          '<td style="padding:14px 18px;font-size:14px;color:#2e7d32;"><span style="font-size:18px;">&#128206;</span>&nbsp; <b>CV attached:</b> ' + esc(cvName) + '</td>' +
        '</tr></table>' +
      '</td></tr>'
    : '';

  var replySubject = encodeURIComponent('Re: ' + subject);
  var buttons =
    '<a href="mailto:' + esc(replyTo) + '?subject=' + replySubject + '" style="display:inline-block;background:' + BRAND + ';color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:13px 26px;border-radius:4px;margin:4px 6px;">&#9993;&nbsp; Reply to ' + esc(firstName(name)) + '</a>' +
    (phone ? '<a href="tel:' + esc(phone.replace(/[^\d+]/g, '')) + '" style="display:inline-block;background:#ffffff;color:' + BRAND + ';border:2px solid ' + BRAND + ';text-decoration:none;font-size:15px;font-weight:bold;padding:11px 24px;border-radius:4px;margin:4px 6px;">&#9742;&nbsp; Call ' + esc(phone) + '</a>' : '');

  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="margin:0;padding:0;background:#f2eef0;font-family:Segoe UI,Helvetica,Arial,sans-serif;">' +
    '<div style="display:none;max-height:0;overflow:hidden;">' + esc(style.heading + ' from ' + name + (highlight ? ' — ' + highlight : '')) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2eef0;padding:24px 12px;"><tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08);">' +

      // header
      '<tr><td style="background:' + BRAND + ';background-image:linear-gradient(135deg,' + BRAND + ' 0%,' + BRAND_DARK + ' 100%);padding:26px 32px;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
          '<td style="color:#ffffff;">' +
            '<div style="font-size:22px;font-weight:bold;letter-spacing:1px;">AL KHARBASH</div>' +
            '<div style="font-size:13px;color:#f3d6db;letter-spacing:0.5px;">Facilities Management</div>' +
          '</td>' +
          '<td align="right" style="vertical-align:middle;"><span style="display:inline-block;background:' + style.badgeColor + ';color:#ffffff;font-size:11px;font-weight:bold;letter-spacing:1px;padding:6px 12px;border-radius:20px;">' + style.badge + '</span></td>' +
        '</tr></table>' +
      '</td></tr>' +

      // title
      '<tr><td style="padding:30px 32px 6px;">' +
        '<div style="font-size:24px;font-weight:bold;color:#222222;margin:0 0 6px;">' + esc(style.heading) + '</div>' +
        '<div style="font-size:14px;color:#777777;">' + esc(style.intro) + '</div>' +
        '<div style="display:inline-block;margin-top:12px;background:#f4f4f4;border:1px solid #e3e3e3;border-radius:4px;padding:4px 10px;font-size:12px;color:#555555;font-family:Consolas,Menlo,monospace;">Ref: ' + esc(ref) + '</div>' +
      '</td></tr>' +

      // highlight card
      (highlight
        ? '<tr><td style="padding:18px 32px 4px;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf3f5;border:1px solid #f0dde1;border-radius:6px;"><tr>' +
              '<td style="padding:16px 18px;">' +
                '<div style="font-size:12px;color:#8a6d73;text-transform:uppercase;letter-spacing:0.5px;">' + esc(highlightLabel) + '</div>' +
                '<div style="font-size:18px;font-weight:bold;color:' + BRAND + ';margin-top:4px;">' + esc(highlight) + '</div>' +
              '</td>' +
              '<td align="right" style="padding:16px 18px;">' +
                '<div style="font-size:12px;color:#8a6d73;text-transform:uppercase;letter-spacing:0.5px;">From</div>' +
                '<div style="font-size:16px;font-weight:bold;color:#222222;margin-top:4px;">' + esc(name) + '</div>' +
              '</td>' +
            '</tr></table>' +
          '</td></tr>'
        : '') +

      // details table
      '<tr><td style="padding:20px 32px 12px;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e6e8;border-radius:6px;border-collapse:separate;overflow:hidden;">' + rows + '</table>' +
      '</td></tr>' +

      messageBlock + cvBlock +

      // actions
      '<tr><td align="center" style="padding:28px 32px 8px;">' + buttons + '</td></tr>' +
      '<tr><td align="center" style="padding:6px 32px 28px;font-size:12px;color:#999999;">Or simply press <b>Reply</b> — it goes straight to ' + esc(replyTo) + '</td></tr>' +

      // footer
      '<tr><td style="background:#2b2124;padding:20px 32px;font-size:12px;line-height:1.7;color:#cbbec1;">' +
        '<div>&#128337;&nbsp; Received ' + esc(sentAt) + ' (Dubai time)</div>' +
        '<div>&#127760;&nbsp; Sent automatically from the AL Kharbash Facilities Management website</div>' +
        '<div style="margin-top:8px;color:#8f8285;">Ras Al khore Ind 2, P.O.Box 31311, Dubai, UAE &nbsp;|&nbsp; +971 4 333 8733</div>' +
      '</td></tr>' +

    '</table>' +
    '</td></tr></table></body></html>';
}

// Next number for this form type today: ENQ-311026-01, ENQ-311026-02 ... (restarts at 01 each day)
function dailyRef(prefix, day) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties();
    var last = (props.getProperty('ref_' + prefix) || '').split('|'); // "311026|4"
    var count = last[0] === day ? Number(last[1] || 0) + 1 : 1;
    props.setProperty('ref_' + prefix, day + '|' + count);
    return prefix + '-' + day + '-' + (count < 10 ? '0' + count : count);
  } finally {
    lock.releaseLock();
  }
}

function valueOf(fields, label) {
  for (var i = 0; i < fields.length; i++) if (fields[i].label === label) return fields[i].value;
  return '';
}

function firstName(name) {
  return String(name).split(/\s+/)[0] || name;
}

// Email and phone values become clickable links in the details table
function linkify(label, value) {
  var safe = esc(value).replace(/\n/g, '<br>');
  if (/email/i.test(label) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return '<a href="mailto:' + esc(value) + '" style="color:' + BRAND + ';text-decoration:none;font-weight:bold;">' + safe + '</a>';
  }
  if (/phone/i.test(label)) {
    return '<a href="tel:' + esc(value.replace(/[^\d+]/g, '')) + '" style="color:' + BRAND + ';text-decoration:none;font-weight:bold;">' + safe + '</a>';
  }
  return safe;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Visiting the web app link in a browser just confirms it is running
function doGet() {
  return ContentService.createTextOutput('AL Kharbash forms mailer is running. (version 5 - daily reference numbers)');
}

function reply(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: success, message: message || '' }))
    .setMimeType(ContentService.MimeType.JSON);
}
