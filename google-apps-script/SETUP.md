# Website forms mailer — setup

The Contact Us, Request Quotation and Submit Resume forms are emailed from
**webadminakgm@gmail.com** by a small Google Apps Script (`Code.gs`):

| Form | Sent to |
|---|---|
| Contact Us | info@akgm.ae |
| Request Quotation | info@akgm.ae |
| Submit Resume (with CV) | hr@akgm.ae |

## 1. Create the script
1. Sign in to Google as **webadminakgm@gmail.com** (sign out of other Google accounts, or use a private window).
2. Go to **https://script.google.com** and click **New project**.
3. Rename it (top left) to **AL Kharbash Website Forms**.
4. Delete everything in `Code.gs` and paste in the full contents of `google-apps-script/Code.gs` from this project.
5. Click **Save** (disk icon).

## 2. Deploy it as a web app
1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set:
   - Description: `Website forms`
   - **Execute as: Me (webadminakgm@gmail.com)**
   - **Who has access: Anyone**
4. Click **Deploy**, then **Authorize access** and pick webadminakgm@gmail.com.
5. Google will warn "Google hasn't verified this app" (normal for your own script):
   click **Advanced → Go to AL Kharbash Website Forms (unsafe) → Allow**.
6. Copy the **Web app URL** (starts with `https://script.google.com/macros/s/` and ends with `/exec`).

## 3. Connect the website
Open `js/form-mailer.js` and replace `PASTE_GOOGLE_WEB_APP_URL_HERE` with the Web app URL (keep the quotes).

## 4. Test
Open the Web app URL in a browser — it should say "AL Kharbash forms mailer is running."
Then send one test from each form and check info@akgm.ae and hr@akgm.ae (and spam, the first time).
Sent emails also appear in webadminakgm@gmail.com → **Sent**.

## Changing the script later
Edit `Code.gs`, save, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
The Web app URL stays the same, so the website doesn't need changing.

## Limits
- A free Gmail account can send about **100 emails a day** through scripts.
- CVs: Word DOC/DOCX or PDF, max 1 MB.
