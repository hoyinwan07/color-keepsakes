# Color keepsakes

We take pictures of the things we want to keep a little longer. This is a small archive of mine: photos from my camera roll, each paired with a five-color palette I picked by hand, displayed on spinning wire postcard racks like the ones in a souvenir shop.

Pull a postcard. Take a palette. Go make something.

**Live site: [wishyouwerehue.vercel.app](https://wishyouwerehue.vercel.app)**

## What it does

- **Postcard racks.** Three-sided wire racks built in CSS 3D. Drag, swipe, or use the arrow keys to turn them, and click a neighboring rack to bring it forward.
- **Hand-picked palettes.** Every palette is chosen by eye, not extracted by an algorithm. Opening a postcard shows the photo, where and when it was taken, and its five colors.
- **Take it with you.** Copy any palette as CSS custom properties, a Tailwind v4 theme, or Design Tokens JSON, ready to drop into a project or a design tool.

## How it's built

- **Vanilla TypeScript, plain CSS, Vite.** No framework and zero runtime dependencies. The whole app is about 6 KB of gzipped JavaScript.
- **Fast images.** Photos are served as resized WebP: small thumbnails for the racks, and full images only when a postcard is about to open. Each photo shows its palette's average color until it loads.
- **Privacy by default.** Published photos are stripped of EXIF and GPS data, original files never enter the repository, and locations stay at city level. Copied palettes contain only hex values. No analytics, cookies, or third-party requests.
- **Strict security headers.** A Content-Security-Policy that allows only same-origin resources, with no inline scripts or styles and Trusted Types required. All content is rendered through DOM APIs, never HTML strings.
- **Accessible.** Full keyboard support, focus management in the native `<dialog>`, screen-reader announcements, AA color contrast, and a reduced-motion mode that swaps movement for gentle fades.

## Run it locally

Requires Node 22.18+ or 24.

```sh
npm ci
npm run dev
```

Then open http://127.0.0.1:5174.

## License

Code is released under the [MIT License](LICENSE). The photographs are © Hoyin Wan, all rights reserved. Lato is used under the SIL Open Font License (`src/fonts/OFL.txt`).
