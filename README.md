<p align="center">
  <img src="app/icon.svg" width="72" alt="" />
</p>

<h1 align="center">M3E Canvas</h1>

<p align="center">
  <strong>Sketch Material 3 Expressive screens in the browser, link them, tap through them, and copy a prompt for your AI coding tool.</strong>
</p>

<p align="center">
  <a href="https://mannie09.github.io/m3e-canvas/"><img alt="Live demo" src="https://img.shields.io/badge/demo-mannie09.github.io%2Fm3e--canvas-6750A4?logo=googlechrome&logoColor=white" /></a>
  <a href="https://github.com/mannie09/m3e-canvas/actions/workflows/deploy.yml"><img alt="Deploy" src="https://github.com/mannie09/m3e-canvas/actions/workflows/deploy.yml/badge.svg" /></a>
  <a href="https://github.com/mannie09/m3e-canvas/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/mannie09/m3e-canvas?style=flat&logo=github&color=6750A4" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://github.com/sponsors/mannie09"><img alt="Sponsor" src="https://img.shields.io/badge/sponsor-%E2%9D%A4-EA4AAA?logo=githubsponsors&logoColor=white" /></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
  <img alt="React" src="https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61DAFB" />
  <img alt="Material 3 Expressive" src="https://img.shields.io/badge/Material%203-Expressive-EADDFF?logo=materialdesign&logoColor=6750A4" />
  <img alt="No backend" src="https://img.shields.io/badge/backend-none%20(localStorage)-2E6A45" />
</p>

<p align="center">
  <a href="https://mannie09.github.io/m3e-canvas/"><strong>Open the app</strong></a>
</p>

Works with any AI coding tool that takes a prompt, such as Claude Code, Codex, Gemini CLI or Cursor: copy the prompt, paste it into the tool, and ask for the app.

## What it does

- **Drag-and-drop parts** – buttons, icon buttons, FABs, split buttons, FAB menus, chips, app bars, navigation bars, floating toolbars, tabs, search bars, cards, lists, dialogs, snackbars, text fields, dropdowns, switches, checkboxes, radio buttons, sliders, text, images, camera and map placeholders, badges, boxes and dividers, all drawn to Material 3 Expressive.
- **Magnetic connections** – bring two buttons or list items close and they fuse into a connected group; the corners soften as they meet.
- **Real M3 Expressive loading** – the shape-morphing Loading Indicator (ported from material-components-android) and wavy linear / circular progress indicators.
- **Phone and desktop screens** – add as many screens as you like, name them, pick a background, and drag a screen to move everything on it. Switch any screen between a 412×892 phone and a 1280×800 desktop from its label: bars stretch, the navigation bar becomes a rail (and a rail becomes a bar again on a phone), and the parts are laid out again beside it. Screens of both sizes can share one design; same-named screens are written into the prompt as one screen at two widths.
- **Tap to navigate** – give any tappable part, an app bar icon or a navigation bar destination a target screen (or "back") and a transition: slide from any of the four sides, fade, expand or none. Arrows show the flow on the canvas; the preview lets you tap through it, and back plays the transition in reverse.
- **Swipe to navigate** – a screen can open another on a left / right / up / down swipe. In the preview the screen follows your finger, and the reverse swipe goes back.
- **Toggle buttons** – any button can flip on tap, changing its icon and style.
- **Layers and groups** – a layers panel lists the z-order of each screen; drag a row to bring parts forward or send them back, and open a group or a connected run to reorder what is inside it. Select several parts and group them to keep their overlap and move them as one. The prompt describes overlaps and side-by-side rows explicitly so the generated layout keeps them.
- **Theme** – the four M3 Expressive axes in one panel. Color: seven presets or one seed color that becomes a full Material 3 scheme you can fine-tune, light / dark, three contrast levels and a dynamic-color switch (match the phone wallpaper). Shape: square, rounded or full corners for every part at once. Type: Roboto, Roboto Flex, Roboto Serif or the system font, with the emphasized styles. Motion: the standard or the expressive spring scheme, which also drives the preview.
- **Prompt output** – the whole design (or a single screen) becomes a concise natural-language prompt in English, including your own notes on what each part does. Pick Android (the default) or the web as the target and the prompt asks for the matching stack.
- **Tidy** – one button snaps bars to the edges, the FAB to the corner, joins neighbouring list items and buttons, and stacks the rest on 16dp margins. Press it again to undo.
- **Optional AI helper** – bring your own key (OpenAI, Claude, Gemini or DeepSeek) and let the model write a part's behavior note or a screen's description. Each rewrite can be undone. The key stays in your browser and the request goes straight to the provider; there is no server in between.
- **Export** – copy the prompt (edit it by hand first if you like) or save a screen as a PNG.
- **Share links and AI drafts (beta)** – copy a link that opens your design on anyone's canvas, or copy an instruction for Claude Code, Codex or another coding agent: it reads [agent.md](public/agent.md), sketches what you described, and replies with such a link.
- **Alignment guides**, undo/redo, keyboard shortcuts, seven color themes, a favorites row in the parts panel, and everything is saved in your browser (localStorage).
- **Phone-friendly** – on a phone you get one fixed screen and a buttons-only editor: tap the plus to add a button, tap a button to move it, and edit its text, icon and style in a bottom sheet. The full multi-screen editor is for desktop browsers.

## Keyboard

| Key | Action |
| --- | --- |
| `V` / `H` | Select / hand tool (hold `Space` to pan) |
| Wheel, `Ctrl` + wheel | Pan, zoom |
| `+` `-` `0` | Zoom in, zoom out, fit |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / redo |
| `Ctrl+D` | Duplicate |
| Arrows (`Shift` = 8dp) | Nudge |
| `Ctrl` + drag | Move without snapping (no guides, no 4dp grid) |
| `Delete` | Delete part or screen |
| `P` | Preview |

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

The app is a static Next.js export. To host it under a sub-path (for example a GitHub Pages project site), set `NEXT_PUBLIC_BASE_PATH=/your-repo` at build time. `.github/workflows/deploy.yml` does this automatically and publishes `out/` to GitHub Pages on every push to `main`.

## Contributing

Bug reports, part requests and pull requests are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) explains the setup, the conventions (English comments) and where each kind of change lives. Questions go to [Discussions](https://github.com/mannie09/m3e-canvas/discussions).

## Support

M3E Canvas is free and MIT-licensed, and stays that way. If it saves you time, you can [sponsor the work on GitHub](https://github.com/sponsors/mannie09); it pays for the hours that go into new parts, the prompt, and reviewing contributions. No feature is behind sponsorship.

Thanks to the sponsors who keep this going:

- [Yspritan](https://github.com/YspritanHyzygy)

## Credits

- Loading indicator shapes and animation model: [material-components-android](https://github.com/material-components/material-components-android) (Apache-2.0) via [Aler1x/m3-loading-indicator](https://github.com/Aler1x/m3-loading-indicator). See `NOTICE`.
- Icons: [Material Symbols](https://fonts.google.com/icons) (Apache-2.0). Fonts are loaded from Google Fonts.

## See also

- [matraic/m3e](https://github.com/matraic/m3e) – Material 3 Expressive as Lit web components (MIT), with React bindings and an icon package. A good home for the screens you sketch here.
- [Beer CSS](https://www.beercss.com/) – Material Design 3 as a plain CSS framework (MIT). Another way to build the web version of a screen you sketch here.

## License

MIT © mannie09
