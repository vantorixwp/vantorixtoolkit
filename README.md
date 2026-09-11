# Vantorix website

Marketing site, documentation and the licence-gated download for Vantorix Pro.

## Layout

```
public/                  served as the website
  index.html             landing page, pricing, download gate, contact
  docs.html              full documentation
  styles.css  script.js  docs.js
  assets/                icon and banner
private/
  vantorix-pro.zip       NOT served — only /api/download can read it
api/
  download.js            checks the licence, then streams the zip
vercel.json
```

`outputDirectory` is set to `public`, so Vercel only serves that folder.
Nothing in `private/` has a URL. The zip is reachable only through the
function, and only with a key the licence server accepts.

## Deploying

1. Push this repository to GitHub.
2. In Vercel, import the repository. Framework preset: **Other**. Leave the
   build command empty.
3. Deploy. No build step runs; the function is detected from `api/`.

## Environment variable

The function defaults to the licence server below. Set this in
Vercel → Settings → Environment Variables if the server ever moves:

```
VANTORIX_LICENSE_API = https://licenses.themevally.com/wp-json/vantorix-license/v1
```

## Releasing a new Pro version

Replace `private/vantorix-pro.zip` and push. That is the whole release process
for the download. Existing installs update through the licence server's
`/update` endpoint, which is separate.

## What the gate does and does not do

It stops the file being handed around by anyone who finds the URL, and it means
every download is tied to a key you issued.

It does not stop a customer editing the plugin or passing it on afterwards. The
plugin is GPL and they are within their rights. What actually protects the
business is the licence server: activations are counted per domain, updates only
reach activated sites, and support is tied to a key.

## Things to change before going live

- WhatsApp number in `public/script.js` (`WHATSAPP_NUMBER`)
- Facebook and email links in `public/index.html`
- The three package prices in `public/index.html` — both the pricing cards and
  the `<select>` in the contact form, so the prefilled message stays correct
