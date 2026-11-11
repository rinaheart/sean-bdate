<a id="readme-top"></a>

<div align="center">

[![Vite][vite-shield]][vite-url]
[![Bun][bun-shield]][bun-url]
[![Playwright][playwright-shield]][playwright-url]
[![A11y WCAG 2.2][a11y-shield]][a11y-url]
[![License][license-shield]][license-url]

</div>

<br />
<div align="center">
  <a href="#readme-top">
    <img src="assets/avatar-default.webp" alt="Sean Invitation Logo" width="100" height="100" style="border-radius: 50%; border: 3px solid #1E5BFF;">
  </a>

  <h3 align="center">Sean's 12th Birthday Manga Invitation</h3>

  <p align="center">
    An interactive, print-ready vertical manga invitation card web application inspired by the <strong>Blue Lock</strong> soccer manga aesthetic.
    <br />
    <a href="#about-the-project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#about-the-project">View Features</a>
    &middot;
    <a href="#automated-testing--quality-gates">Run Test Suite</a>
    &middot;
    <a href="#usage">Usage Guide</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-highlights">Key Highlights</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#automated-testing--quality-gates">Automated Testing & Quality Gates</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

An interactive, vertical manga invitation card web application built with Vanilla HTML5, modern CSS3, and JavaScript, packaged with Vite. The project delivers an authentic Japanese shōnen manga aesthetic inspired by *Blue Lock*, featuring slanted ink frame dividers, procedural speed lines, and an interactive personalizer with high-res PNG export.

### Key Highlights

* **Authentic Manga Aesthetics**: Procedural SVG speedlines (集中線), ink frame dividers across 4 panels, and a high-contrast duotone palette (Navy `#0A0F2C`, Electric Blue `#1E5BFF`, Cyan Ego Glow `#5FD4FF`, and Accent Yellow `#FFD400`).
* **Slanted Parallelogram Geometry**: Collinear interactive badges and captions (`rotate(-8.5deg) skewX(-8.5deg)`) engineered with strictly vertical side edges (`dx = 0`) parallel to panel borders.
* **Dual-Track Personalization Workflow**: Fast direct click-to-edit interactions on the invitation card (avatar upload, speech bubble guest name, Egoist mode toggle) plus a comprehensive all-in-one **Customize Modal** for complete card customization (guest caption, host title, event details, custom hero photo, info badges, and card folios).
* **Interactive Egoist Toggle**: Tap the eye panel to switch between **Egoist: ON** (cyan electric eyes, solid yellow "ON" label) and **Egoist: OFF** (noir black manga eyes, solid cyan "OFF" label) with print-safe solid colors (zero text glow).
* **Japanese Sound Effects (SFX) Visibility**: Toggle Japanese manga SFX (`ゴゴゴ` & `ドンッ!`) on or off with an ultra-lightweight 22 KB subsetted WOFF2 font.
* **Smart Name Personalization**: Instant uppercase formatting, Vietnamese diacritic stripping (`stripAccents`), binary-search dynamic font auto-fit (26px to 92px), and a dedicated "Clear Name" handwritten blank mode.
* **Hybrid 2-Layer Canvas Compositor**: Direct Canvas 2D raster image clipping combined with DOM vector overlay rendering for pristine **2160×3240 px** (2x Retina, 300 DPI equivalent) PNG downloads.
* **Responsive Autofit & 2-Column Landscape**: Complete viewport-fit layout across mobile, tablet, and desktop without scrollbars, automatically reflowing into a balanced 2-column view in landscape mode with equal-width action buttons.
* **Rock-Solid UX & Accessibility**: `window.pointerdown` capture-phase dismissal preventing blur-then-click race conditions, with zero WCAG 2.2 AA violations.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Vite][Vite.js]][Vite-url]
* [![JavaScript][JavaScript.com]][JavaScript-url]
* [![HTML5][HTML5.com]][HTML5-url]
* [![CSS3][CSS3.com]][CSS3-url]
* [![Bun][Bun.sh]][Bun-url]
* [![Playwright][Playwright.dev]][Playwright-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

Follow these steps to set up the project locally for development and testing.

### Prerequisites

* **Node.js / Bun**:
  * [Node.js](https://nodejs.org/) `>= 18.0.0` or [Bun](https://bun.sh/) `>= 1.0.0`
* **Python (Optional for dev, required for automated test suite)**:
  * Python `>= 3.10` with Playwright:
    ```sh
    pip install playwright
    playwright install chromium
    ```

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/rinaheart/sean-birthday-manga-invitation.git
   cd sean-birthday-manga-invitation
   ```
2. Install package dependencies:
   ```sh
   bun install
   # or
   npm install
   ```
3. Start the local Vite development server:
   ```sh
   bun run dev
   # or
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

### 1. Customizing Guest Avatar
Click or tap anywhere on the **Avatar Panel** (top-left) to open the native image picker. Uploaded images are automatically scaled (max 900px) and cropped in memory via Canvas 2D before saving to `localStorage`.

### 2. Editing Guest Name
Click or tap the comic speech bubble (`HEY GUY!`) to open the inline text editor:
* Type any name (e.g., `Đặng Đức`); the app automatically converts it to uppercase, removes diacritics (`DANG DUC`), and splits two-word names across two lines.
* Press `Enter` or click outside the input to save.
* Press `Escape` to cancel.

### 3. Clear Name for Handwritten Cards
Click the **Clear Name** button in the bottom control bar to render a clean, blank space inside the speech bubble (`.bubble__blank`), allowing names to be handwritten after printing.

### 4. Toggling Egoist Mode
Click or tap the **Eye Panel** (top-right) to toggle Egoist mode:
* **ON**: Displays electric cyan eyes (`eye-panel.webp`) and yellow `ON` indicator.
* **OFF**: Displays noir black manga eyes (`eye-panel-black.webp`) and cyan `OFF` indicator.

### 5. Full Card Customize Modal
Click the **Customize** button in the bottom control bar to open an all-in-one editing dialog:
* **Guest Section**: Customize the "VIP GUEST" badge caption and "HEY" speech greeting.
* **Eye & Egoist Section**: Upload a custom eye panel picture or restore default, edit indicator labels.
* **Main Title & Japanese SFX**: Edit the 4-line event title hierarchy (Lead, Host Name, Age, Event type) and toggle Japanese manga SFX (`ゴゴゴ` & `ドンッ!`) on or off.
* **Hero Image**: Upload custom hero photography or character art (with auto-cover polygon clipping) or restore the default Sean sprite.
* **Date, Time & Location**: Update event date, time, phone number (auto-generates clickable `tel:` link), and venue (auto-generates Google Maps search link).
* **Card Folios**: Customize the two manga volume footer labels.
* Real-time character counters ensure texts remain within ergonomic layout boundaries.
* Click **Apply Changes** to preview instantly, or **Cancel** to discard edits.

### 6. Exporting High-Resolution PNG
Click **Download PNG** to export a print-ready 2160×3240 px (2x retina) PNG file with an automatic unaccented slug filename (e.g. `guest-20261111-1922.png`).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Automated Testing & Quality Gates

The codebase includes an automated test harness executed against headless Chromium instances using Playwright:

```sh
bun run test
```

### Test Suite Architecture

| Suite | File | Focus Areas | Status |
| :--- | :--- | :--- | :--- |
| **01 Characterisation** | `tests/test_01_characterisation.py` | Default DOM, Vietnamese diacritics, auto-fit scale, localStorage, PNG export | **PASS** |
| **02 Regressions** | `tests/test_02_regressions.py` | Guards against BUG-01 to BUG-06 (race conditions, element caching, URL resolution) | **PASS** |
| **03 Visual Geometry** | `tests/test_03_visual_geometry.py` | Parallelogram vertical sides (`dx=0`), collinear axis (`-8.5deg`), clean face | **PASS** |
| **04 A11y & Security** | `tests/test_04_a11y_security.py` | WCAG 2.2 AA audit via local `axe-core`, strict CSP, clean production build | **PASS** |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Authentic Japanese manga panel layout & procedural speedlines
- [x] Slanted parallelogram badges collinear at `-8.5deg` slope
- [x] Clean face on eye panel (screentone removed for printing)
- [x] Egoist Awakening toggle (cyan ON / noir OFF) with print-safe solid colors
- [x] Vietnamese diacritic sanitization (`stripAccents`) & 2-word auto-fit
- [x] Handwritten blank space mode ("Clear Name")
- [x] Hardware Canvas 2D + DOM Compositor for 2x high-res PNG export
- [x] Complete automated test coverage (4 suites, 100% Green)
- [ ] Multi-character sticker overlays
- [ ] Web Share Target API integration for PWA installation

See the active issues for a full list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Run test verification (`bun run test`)
4. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

RinA - [https://github.com/rinaheart](https://github.com/rinaheart)

Project Link: [Repository](./)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

* [Blue Lock (ブルーロック)](https://bluelock-pr.com/) by Muneyuki Kaneshiro & Yusuke Nomura for the visual inspiration
* [html-to-image](https://github.com/bubkoo/html-to-image) for DOM-to-canvas rendering
* [axe-core](https://github.com/dequelabs/axe-core) for accessibility auditing
* [Playwright](https://playwright.dev/) for headless browser testing
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template) by Othneil Drew

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[vite-shield]: https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white
[vite-url]: https://vitejs.dev/
[bun-shield]: https://img.shields.io/badge/Bun-1.0+-FBF0DF?style=for-the-badge&logo=bun&logoColor=black
[bun-url]: https://bun.sh/
[playwright-shield]: https://img.shields.io/badge/Playwright-100%25%20PASS-2EAD33?style=for-the-badge&logo=playwright&logoColor=white
[playwright-url]: https://playwright.dev/
[a11y-shield]: https://img.shields.io/badge/WCAG%202.2-AA%20Compliant-005A9C?style=for-the-badge&logo=w3c&logoColor=white
[a11y-url]: https://www.w3.org/WAI/standards-guidelines/wcag/
[license-shield]: https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge
[license-url]: LICENSE

[Vite.js]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[JavaScript.com]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[HTML5.com]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML5-url]: https://developer.mozilla.org/en-US/docs/Web/HTML
[CSS3.com]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS3-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
[Bun.sh]: https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white
[Bun-url]: https://bun.sh/
[Playwright.dev]: https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white
[Playwright-url]: https://playwright.dev/
