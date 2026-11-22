# SkyGarage Storage

Static website with Vercel serverless functions for SkyGarage Storage, an independent, owner-operated Dallas-Fort Worth business that sells CeilingSAM Storage Elevator systems and coordinates professional installation by independent installers.

## Site structure

- `index.html` - Home page: hero, who we are, what the Storage Elevator is, how it works, products and installed prices, why SkyGarage, service area, FAQ, and booking call to action.
- `pricing.html` - Products and Pricing: both products in detail, installed prices, product-only retail reference prices, and what is included.
- `installers.html` - Installer offer and pay, what a job involves, requirements, and the installer application form.
- `book.html` - Customer booking form.
- `login.html` - Installer Login: access code form for approved installers.
- `installer-area.html` - Installer area: lists scheduled jobs from `/api/jobs`, redirects to login on a 401 response, and has a logout link.
- `assets/style.css` - Shared stylesheet for every page (deep navy and sky blue theme).
- `assets/logo.png` - Business logo used in the header of every page.
- `assets/favicon.png` - Favicon used on every page.

## Serverless functions (api folder)

Plain Node CommonJS handlers, no dependencies. They use the global fetch available in Node 18 and later.

- `api/submit.js` - Accepts POST JSON from the booking form (`formType: "booking"`) and the installer application form (`formType: "installer"`). Validates that name, phone, and email are present (400 if missing). Builds a plain text summary email and sends it through the Resend API. Returns 200 with `{ok:true}` on success. If the API key is missing or Resend fails, it logs the submission with console.log and returns 502 with `{ok:false}` so failures are visible.
- `api/verify.js` - Accepts POST JSON `{code}`. If the code matches the access code environment variable, it sets the `sg_installer` cookie and returns 200. Otherwise it returns 401. Returns 500 if the environment variable is not set.
- `api/jobs.js` - If the `sg_installer=ok` cookie is present, it reads `jobs.json` from the project root and returns it. Otherwise it returns 401.
- `api/logout.js` - Clears the `sg_installer` cookie and returns 200.

## Environment variables needed on Vercel

Set these two in the Vercel project settings. Neither value belongs in this repo.

- `RESEND_API_KEY` - Resend API key used by `api/submit.js` to send form submissions by email.
- `INSTALLER_ACCESS_CODE` - The access code approved installers enter on the Installer Login page.

## Managing jobs

Jobs are managed by editing `jobs.json` at the project root. It starts as `{"jobs": []}`.

Each job is an object with these fields: `date`, `timeWindow`, `city`, `product`, `customerFirstName`, `status`, and `notes`. See `jobs.example.json` for one sample job object in that shape. Only the customer first name is stored in a job, never a full name.

After editing `jobs.json`, redeploy (or let the next deployment pick it up) so the installer area shows the updated list.

## Notes

- All navigation links point to the `.html` files directly, so they work with or without the `cleanUrls` setting in `vercel.json`.
- The booking form is the public contact method for customers. There is no public phone number or email address on the site.
- Prices on the site: 4x8 Storage Elevator is $2,099 installed (product-only retail reference $1,499). 4x8 Storage Elevator Pro is $2,399 installed (product-only retail reference $1,799).
