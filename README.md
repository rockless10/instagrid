# instagrid

> **An Instagram Grid Planner That Stays On Your Machine**
> *Don't post it before you mock it. YOUR feed. YOUR pixels. YOUR machine.*

> **This is a fork** of [chrisvrakas/mkgrid](https://github.com/chrisvrakas/mkgrid) (MIT), with two additions:
> per-post **captions** and opt-in **cross-device sync**. Everything else is Chris Vrakas's work.

<div align="center"><img src="assets/images/instagrid-banner.png" alt="instagrid — make grid" width="100%"></div>

---

instagrid is a browser-based tool for planning your Instagram grid *before* you post. Drop in your photos, arrange the feed, crop every tile, insert and rearrange rows, write the caption for each post, preview the whole profile, and export post-ready images — or the entire feed as one picture. Nothing tracks you, and by default nothing leaves your machine.

Built for people who want to plan a beautiful feed without handing unreleased work to third party companies.

> Local is the default, not a setting you have to find. The one thing that leaves your device is a **shared board**, and only when you press the button that creates one. → **[privacy.html](privacy.html)**

## Quick Links

- [Quick Start](#quick-start)
- [Features](#features)
- [The Grid Is the Ad](#the-grid-is-the-ad)
- [Philosophy](#philosophy)
- [Privacy](#privacy)
- [Recommended Tools](#-recommended-tools)
- [Credits & Inspiration](#-credits--inspiration)
- [License](#-license)

---

## Why This Exists

Your Instagram grid is a first impression you only get to make once. The order of your posts, the color story across rows, what sits next to what — the grid is a composition, and once a post is up, re-sequencing it means deleting and re-uploading.

So people rehearse. The problem is *how*. Every existing grid planner wants you to create an account, upload your unreleased photos to their servers, and pay a monthly subscription to unlock basic features — all to preview a layout. You hand over your content and your data to plan a grid.

**[instagrid-app.vercel.app](https://instagrid-app.vercel.app)** does the same job with none of that. It's one HTML file that runs entirely in your browser. Your photos are loaded, arranged, cropped, and exported on your own machine. There is no account, no upload, no server, no analytics. Close the tab and the only place your feed ever existed is your own browser.

The privacy of your work depends on the ownership of your work. 

It's `mkdir` for your feed: **make grid**.

---

## Quick Start

> **Never used a tool like this?** There's nothing to install and nothing to sign up for. It's a website.

**Step 1** — Open **[instagrid-app.vercel.app](https://instagrid-app.vercel.app)** in any modern browser (desktop or mobile).

**Step 2** — Drop your photos anywhere on the page, or click the box to pick them. Drop straight onto a tile to fill that tile. They load instantly — and stay on your device.

**Step 3** — Arrange and crop:
- Drag a tile's grip to reorder
- Click a tile to open its caption editor
- Press and hold a tile (or just start dragging) to pan the crop; scroll or pinch to zoom. The zoom slider acts on the tile you last held
- Hit **⬇** beside a row to open an empty row there, pushing that row and everything below it down

**Step 4** — Hit **EXPORT** for post-ready images (zipped), or the whole feed as a single picture.

That's it. Your work auto-saves locally, so it's there when you come back.

> **Tip:** Want proof nothing is uploaded? Open your browser's DevTools, watch the Network tab, and use the tool. Nothing goes out. That's the whole point.

---

## Requirements

- Any modern browser — Chrome, Safari, Firefox, Edge, Brave, LibreWolf, etc.
- That's it. No install, no account, no dependencies.

**Note on hardened browsers:** Tools with aggressive anti-fingerprinting (`privacy.resistFingerprinting` in LibreWolf / Mullvad / Tor) can interfere with canvas export. If your exported images come out striped, use a standard browser for the export step — the planning itself works everywhere.

---

## Features

### True 3:4 Grid
Instagram switched grid thumbnails to a 3:4 vertical crop in early 2025. instagrid matches it by default, so what you plan is what posts — no surprise re-cropping when you upload. Toggle to **4:5** or **1:1** for legacy content.

### Drag, Arrange & Crop
Pointer-driven reordering with per-tile pan and continuous zoom — from whole-image (letterboxed) through fill, all the way to 5×. A click opens the post; a press-and-hold picks the tile up for re-framing, so the zoom control always follows the photo you last held rather than one you happened to click. Every tile gets the exact crop you want. Works identically with mouse and touch.

### A Grid That Grows With You
No fixed 3×3 / 3×6 / 3×9 choice: the grid always keeps an empty row at the bottom and adds another the moment you fill it. Hit **⬇** beside any row to open an empty row right there, pushing that row and everything under it down — which is what actually happens on Instagram when you post. **✕** takes a row back out.

### Fresh and Used
The photo tray splits into two drawers: **Fresh** for what's still waiting, **Used** for what's already in the grid. Both are listed by filename — a natural sort, so `photo2` comes before `photo10` — which keeps a numbered shoot in shooting order no matter what order you dropped the files in. Import forty photos and you can still see what's left to place.

### Editable Profile Mockup
Avatar, handle, name, bio, link, stats, and highlights — all editable, so you preview the *whole profile*, not just a grid of tiles. See exactly what a visitor sees.

### Two Exports, One Button
Individual post-ready images bundled to a single **ZIP**, or the **entire feed as one image** to hand a client or save for reference. Optional posting-order overlay numbers each tile.

### Captions *(fork addition)*
Click any tile — or its **✎** — to write that post's caption in a popup, with live counts against Instagram's 2,200-character and 30-hashtag limits. Captions belong to the grid slot, so they travel with a tile when you rearrange the feed and survive swapping a different photo in. Tiles that have one show a small badge. The editor also has **Copy caption**, which puts the text on your clipboard, and **Download original**, which pulls that tile's photo back out as you imported it — uncropped, under its original filename. The post-ready 1080px crops still come from **EXPORT**, whose ZIP adds a `captions.txt` numbered to match the image files.

### Cross-Device Sync *(fork addition, opt-in)*
Press **⇅ SYNC** to create a shared board. You get one secret link; open it on your phone and you have the same grid, with edits flowing both ways. Local storage stays the working copy, so the app is instant and keeps working offline, syncing when it reconnects. Simultaneous edits are caught by an ETag check and surface as a *keep mine / load theirs* prompt rather than silently overwriting. This is the only feature that uploads anything — see [Privacy](#privacy).

### Local-First Persistence
Your work auto-saves to **IndexedDB** — in your browser, on your device — and is restored on reload. Degrades gracefully to memory-only where storage is blocked.

### Plus
Undo / redo with keyboard shortcuts, downscale-on-import to keep things fast, and a fully responsive layout that works on desktop and mobile.

> *"The grid is the first thing they see. Plan it like it matters."*

---

## The Grid Is the Ad

Here's the trick the subscription apps can't do as cleanly: **plan the whole grid as one composition, export it, and post it row by row.** Your profile becomes a single image — a poster, a billboard — assembled from individual posts that only line up because you planned them in advance.

The feed *is* the marketing. instagrid is how you build it.

---

## Philosophy

instagrid follows a strict set of principles:

**Privacy as architecture.** The privacy isn't a promise — it's the build. There is no backend, so there is nothing to leak, sell, or subpoena. The whole tool is a static file you can read top to bottom.

**Zero bloat.** One HTML file. No frameworks, no build step, no CDN, no `node_modules`. The ZIP writer and the canvas exporter are hand-rolled. If vanilla JS can't do it, it doesn't belong here.

**Open source.** A tool that handles your work should be one you can inspect, modify, and own — not rent.

**Don't trust me. Verify.** Open DevTools, watch the Network tab, read the source. The proof that nothing is uploaded is that there's nothing to find.

---

## Privacy

Every action — importing, cropping, arranging, captioning, previewing, exporting — runs locally in your browser. No account, no cookies, no analytics, no third-party scripts. Your work saves to IndexedDB on your device.

**The one exception is a shared board.** If you press ⇅ SYNC and create one, your photos are uploaded to a private Vercel Blob store, readable only through this site's own API with the board secret. Some honest caveats:

- **Anyone with the link can read and edit the board.** It is a credential, not just a URL — don't post it publicly. *Rotate secret* invalidates a leaked link everywhere.
- The secret lives in the URL **fragment**, which browsers never transmit, so it stays out of server access logs. Only its SHA-256 is stored.
- Lose the link and you can't reach the board from a *new* device; devices already syncing keep their local copy.
- Your local copy is always authoritative, so a backend outage degrades to the original local-only app instead of losing work.

Nothing above happens until you deliberately create a board. The site is hosted on Vercel, which keeps standard access logs (IP, timestamp) for security. instagrid itself records nothing.

Planning a feed is deciding, in private, what you'll show in public. This tool keeps that first part private.

**[→ Full privacy policy](privacy.html)**

---

## Tech Stack

- **HTML5 / CSS3 / Vanilla JS** — semantic, single-file, no frameworks
- **IndexedDB** — local persistence (memory-only fallback)
- **Canvas API** — all image + ZIP export, hand-rolled, zero libraries
- **Pointer Events** — unified mouse + touch
- **GitHub Pages** — static hosting · **Cloudflare** — DNS + SSL

> **⚠️ Cloudflare SSL:** keep mode on **Custom** (not Full Strict) with GitHub Pages — Full Strict throws Error 526. If the site 526s, check this first.

---

## 🔧 Recommended Tools

instagrid is one piece of a private creative workflow. Consider expanding to a broader stack worth building around it:

### Image & Metadata
- **[exiftool](https://exiftool.org)** — strip EXIF/GPS metadata from photos *before* posting. Prevents doxxing via image data.
- **[Adobe Photoshop](https://www.adobe.com/products/photoshop.html)** — useful for optimizing and editing images prior to grid mockup
- **[GIMP](https://www.gimp.org/)** / **[Krita](https://krita.org/)** — open source image editors
- **[Squoosh](https://squoosh.app/)** — local, in-browser image compression (also zero-upload)

### Further Reading
Looking for more? I maintain an ever-evolving list of 1,000+ hand-picked privacy tools, books, and resources at **[chrisvrakas.com/resources.html](https://chrisvrakas.com/resources.html)** — also an open-source repo at **[github.com/chrisvrakas/awesome-polymathic-resource-stack](https://github.com/chrisvrakas/awesome-polymathic-resource-stack)**.

---

## 🙏 Credits & Inspiration

instagrid is built on a belief that creative tools can be private *and* good. In that spirit:

- **[@chris_vrakas](https://instagram.com/chris_vrakas)** — years of hand-planning a feed in Photoshop, the workflow this tool replaces
- **The open-source community** — for the idea that the tools you depend on should be ones you can read and own
- **[GitHub Pages](https://pages.github.com)** & **[Cloudflare](https://cloudflare.com)** — free static hosting + SSL that just works

---

## 📄 License

Open source under the [MIT License](LICENSE) — fork it, modify it, learn from it. Just give credit where it's due.

---

## 📬 Contact

**Chris Vrakas**

- Website: [chrisvrakas.com](https://chrisvrakas.com)
- Instagram: [@chris_vrakas](https://instagram.com/chris_vrakas) · [@mkgrid.app](https://instagram.com/mkgrid.app)
- GitHub: [@chrisvrakas](https://github.com/chrisvrakas)
- X: [@chris_vrakas](https://x.com/chris_vrakas)
- Medium: [@chrisvrakas](https://medium.com/@chrisvrakas)

---

## ⚡ Fast Facts

- **Zero tracking** — no analytics, no cookies, no fingerprinting, no phoning home
- **Zero accounts** — no signup, no login, no email, ever
- **No upload by default** — your photos stay in the browser unless you create a shared board
- **No subscription** — planning a grid shouldn't cost you a monthly fee or your data
- **100% HTML/CSS/JS** — readable, auditable, forkable, yours
- **Shows its work** — open the source or the Network tab. Nothing is hidden, because nothing is happening behind your back.

---

<div align="center">

*"Curate in private, post in public."*

<br>

**[instagrid-app.vercel.app](https://instagrid-app.vercel.app)** · **[@mkgrid.app](https://instagram.com/mkgrid.app)** · **[GitHub](https://github.com/rockless10/instagrid)**

<br>

*Don't post it before you mock it.*

</div>
