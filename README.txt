RUMESH & NETHMI — FINAL WEDDING INVITATION

Included:
- index.html — complete invitation website
- admin.html — private RSVP / invitee dashboard
- assets — wedding photos, music and background video
- netlify/functions — persistent RSVP + guest API
- netlify.toml — Netlify deployment configuration

NETLIFY DEPLOYMENT
1. Upload this folder/repository to Netlify (recommended: connect a Git repository, or drag the folder into Netlify).
2. Netlify will install @netlify/blobs and deploy the Functions automatically.
3. In Netlify: Project configuration > Environment variables, add:
   ADMIN_KEY = your-private-admin-password
4. Redeploy the site after saving the variable.
5. Open /admin.html and enter the same ADMIN_KEY.

RSVP DATA
The RSVP form writes to Netlify Blobs, so responses are centrally stored rather than browser localStorage. The dashboard reads the same data from any device after the admin key is entered.

PERSONALIZED INVITATIONS
From the dashboard, add a guest. The generated link is:
   /index.html?name=Guest%20Name
Send that link to the guest on WhatsApp or another channel.

MUSIC
The wedding music is included locally. Browsers can block audible autoplay before user interaction; the opening screen automatically attempts playback and the first tap/click starts it when required by the browser.

IMPORTANT
Do not publish ADMIN_KEY inside HTML/JS. Keep it only in Netlify environment variables.
