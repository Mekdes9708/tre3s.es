# TR3ES Static Website

This package converts the site into plain HTML, CSS, and JavaScript for easy publishing on GitHub Pages or GoDaddy.

## Publish
Upload the contents of this folder directly to your hosting root.

## Files
- `index.html` — homepage
- `styles.css` — all styles
- `app.js` — interactions, analytics hooks, CRM-ready form handler
- `assets/` — images and branding
- `legal/` — footer legal pages

## CRM configuration
Open `index.html` and edit `window.TR3ES_CONFIG.crm`.

Supported modes:
- `mailto` — default, opens the user's email client
- `formspree` — set `provider: "formspree"` and `endpoint`
- `hubspot` — set `provider: "hubspot"`, `hubspotPortalId`, and `hubspotFormId`
- `webhook` — set `provider: "webhook"` and `endpoint`

## Analytics configuration
Open `index.html` and edit `window.TR3ES_CONFIG.analytics`.

Supported:
- Google Analytics 4 (`ga4MeasurementId`)
- Plausible (`plausibleDomain`)
- Microsoft Clarity (`clarityId`)

## Hosting notes
- GitHub Pages: upload as a public repo and publish from the root
- GoDaddy: upload all files to `public_html/` or a demo subfolder
