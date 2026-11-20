// Product-type SVG thumbnails bundled at build time.
// These are inlined into the JS bundle via Vite's ?raw import so the PDF
// generator does NOT require network access to render product icons.

import bermudaDoor from '../assets/types/bermuda-door.svg?raw';
import circle from '../assets/types/circle.svg?raw';
import doubleDoor from '../assets/types/double-door.svg?raw';
import halfMoon from '../assets/types/half-moon.svg?raw';
import horizontalRollerXo from '../assets/types/horizontal-roller-xo.svg?raw';
import horizontalRollerXox from '../assets/types/horizontal-roller-xox.svg?raw';
import pictureWindow from '../assets/types/picture-window.svg?raw';
import sgd2Panel from '../assets/types/sgd-2-panel.svg?raw';
import sgd3Panel from '../assets/types/sgd-3-panel.svg?raw';
import sgd4Panel from '../assets/types/sgd-4-panel.svg?raw';
import sideLight from '../assets/types/side-light.svg?raw';
import singleDoor from '../assets/types/single-door.svg?raw';
import singleHung from '../assets/types/single-hung.svg?raw';

// Raw SVG XML keyed by slug (matches THUMB_SLUGS in quotePdfHtml.js)
export const THUMB_SVG_BY_SLUG = {
  'bermuda-door': bermudaDoor,
  'circle': circle,
  'double-door': doubleDoor,
  'half-moon': halfMoon,
  'horizontal-roller-xo': horizontalRollerXo,
  'horizontal-roller-xox': horizontalRollerXox,
  'picture-window': pictureWindow,
  'sgd-2-panel': sgd2Panel,
  'sgd-3-panel': sgd3Panel,
  'sgd-4-panel': sgd4Panel,
  'side-light': sideLight,
  'single-door': singleDoor,
  'single-hung': singleHung,
};
