import { Sprite, Ally, Mob } from "./classes.js";

import { allyData } from "./data/allyData.js";
import { mobData } from "./data/mobData.js";

// Background
export const forestBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: { src: "./../assets/images/bg/forestv2.png" },
});

// Ally
export const soldierUnit = new Ally(allyData.soldier);

// Mob
export const orcUnit = new Mob(mobData.orc);
