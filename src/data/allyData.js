import { attacks } from "./attacks.js";

export const allyData = {
  soldier: {
    position: {
      x: 400,
      y: 373,
    },

    image: {
      src: "./../assets/images/ally/Soldier_Idle.png",
      walk: "./../assets/images/ally/Soldier_Walk.png",
      hurt: "./../assets/images/ally/Soldier_Hurt.png",
      death: "./../assets/images/ally/Soldier_Death.png",
      attack01: "./../assets/images/ally/Soldier_Attack01.png",
      attack02: "./../assets/images/ally/Soldier_Attack02.png",
      attack03: "./../assets/images/ally/Soldier_Attack03.png",
    },
    scale: 5,
    frames: { max: 6, holdFrames: 6 },
    animate: true,
    altFrames: {
      src: { max: 6, holdFrames: 6 },
      walk: { max: 8, holdFrames: 6 },
      hurt: { max: 4, holdFrames: 8 },
      death: { max: 4, holdFrames: 8 },
      attack01: { max: 6, holdFrames: 8 },
      attack02: { max: 6, holdFrames: 8 },
      attack03: { max: 9, holdFrames: 8 },
    },

    name: "Soldier",
    health: 30,
    attacks: [attacks.Slash, attacks.Strike],
  },
};
