# Wisdom Osara — Portfolio

A static portfolio built with HTML, CSS, and vanilla JavaScript. No build step or runtime packages are required. Fonts and images are served locally.

## Preview

From the repository root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173.

## Update content

- `index.html`: page copy, project cards, contact details, metadata.
- `assets/css/portfolio.css`: visual styles and responsive layouts.
- `assets/css/identity.css`: the personal hero and opening animation.
- `scripts/intro.js`: opening sequence, skip behavior, and focus restoration.
- `assets/css/scroll-scenes.css`: pinned showcase and process section styles.
- `scripts/scroll-scenes.js`: stacked project panels, sticky process progress, and scroll-triggered text/image effects.
- `scripts/portfolio.js`: project preview content, navigation, motion, and accessibility preferences.
- `assets/images/projects/`: live hero screenshots from the four product sites plus the local portfolio redesign.
- `assets/images/`: original assets, including the retained Global Adventures screenshot. The portrait is not displayed.
- `resumedev.pdf`: existing resume, retained from the original site.

When changing a project, update both its HTML link/card and its entry in the `projects` object. The résumé and Global Adventures project are retained from the original portfolio. Current selected products: Properties Haven, Parallel, Worlds, GrowLarge Digital, Wisdom Osara, and Global Adventures. Tech stacks for external products are intentionally unspecified.

Animation follows the device’s reduced-motion preference automatically. The full-screen hero uses a monochrome studio image, subtle image layering, floating navigation, and a condensed “Code.” title with name, role, and two links. It stays face-free. Anton is self-hosted alongside its OFL license. Five staggered shutters animate away before the hero reveals; skip and Escape dismiss them. Deep links and reduced motion bypass the intro. Without JavaScript, content remains visible.

On viewports at least 600px high, when every card fits with room to spare, project panels stick and stack vertically, gently scaling and dimming beneath the next panel. The About statement fills as it scrolls into view, followed by a short bio, résumé link, and a plain technology list. Three compact, full-width process rows reveal their background and titles with scroll progress. Reveals start when content reaches 68% of the viewport height and re-arm after it leaves below the screen. The work title reveals line by line. About/process/contact effects run from 68% to 25% of the viewport, keeping their motion visible while reading. Native scrolling also drives image depth and card stacking. Phone cards use a compact vertical layout and the same sticky stack, with a single outlined arrow beside the title. Short viewports or enlarged text that prevents the cards fitting retain normal flow; reduced motion disables the effects. No wheel interception or perpetual rendering loop is used.

`assets/images/studio.jpg` is a decorative AI-generated studio photograph, not a depiction of Wisdom’s actual workspace. Created with the built-in image generation tool. Prompt: “Landscape editorial photograph for a minimalist developer portfolio: a brushed aluminium laptop on a dark walnut desk in a quiet modernist studio, late afternoon sunlight, architectural shadows, olive-grey plaster, forest green shadows and warm ivory highlights. No people, faces, logos, text, or graphics.”

Legacy Bootstrap, jQuery, and WOW assets remain in the repository for reference, but the redesigned page does not load them.

## Hero captures

Captured from the rendered websites on 2026-09-17. JPEGs are the production assets; PNGs retain the original browser screenshots.

- `properties-haven`: https://www.propertieshaven.com/
- `parallel`: https://www.useparallel.com/
- `worlds`: https://wrlds.co/
- `growlarge-digital`: https://www.growlargedigital.com/
- `wisdom-osara`: http://127.0.0.1:4173/ (the new design); its card links to https://wisdomosara.com/.

The old archive is no longer displayed. Original source images remain in the repository.
