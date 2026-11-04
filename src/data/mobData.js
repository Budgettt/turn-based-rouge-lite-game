import { CANVAS_SIZE } from "../constants.js";
import { attacks } from "./attacks.js";

export const mobData = {
  orc: {
    position: {
      x: CANVAS_SIZE.width - 500,
      y: 373,
    },

    image: {
      src: "./../assets/images/mob/orc/Orc_Idle.png",
      walk: "./../assets/images/mob/orc/Orc_Walk.png",
      hurt: "./../assets/images/mob/orc/Orc_Hurt.png",
      death: "./../assets/images/mob/orc/Orc_Death.png",
      attack01: "./../assets/images/mob/orc/Orc_Attack01.png",
      attack02: "./../assets/images/mob/orc/Orc_Attack02.png",
    },
    scale: 5,
    frames: { max: 6, holdFrames: 4 },
    animate: true,
    altFrames: {
      src: { max: 6, holdFrames: 4 },
      walk: { max: 8, holdFrames: 4 },
      hurt: { max: 4, holdFrames: 6 },
      death: { max: 4, holdFrames: 6 },
      attack01: { max: 6, holdFrames: 8 },
      attack02: { max: 6, holdFrames: 4 },
    },
    flipped: true,

    name: "Orc",
    health: 30,
    attacks: [attacks.Crescent, attacks.Rend],
  },
  blood_teeth: {
    position: {
      x: CANVAS_SIZE.width - 500,
      y: 373,
    },

    image: {
      src: "./../assets/images/mob/blood_teeth/Blood_Teeth_Idle.png",
      walk: "./../assets/images/mob/blood_teeth/Blood_Teeth_Walk.png",
      hurt: "./../assets/images/mob/blood_teeth/Blood_Teeth_Hurt.png",
      death: "./../assets/images/mob/blood_teeth/Blood_Teeth_Death.png",
      attack01: "./../assets/images/mob/blood_teeth/Blood_Teeth_Attack01.png",
      attack02: "./../assets/images/mob/blood_teeth/Blood_Teeth_Attack02.png",
    },
    scale: 5,
    frames: { max: 6, holdFrames: 4 },
    animate: true,
    altFrames: {
      src: { max: 6, holdFrames: 4 },
      walk: { max: 8, holdFrames: 4 },
      hurt: { max: 4, holdFrames: 6 },
      death: { max: 4, holdFrames: 6 },
      attack01: { max: 8, holdFrames: 6 },
      attack02: { max: 8, holdFrames: 6 },
    },
    flipped: true,

    name: "Blood Teeth",
    health: 20,
    attacks: [attacks.Swipe, attacks.Bite],
  },
};
