import { CANVAS_SIZE, GAME_FRAMERATE } from "./constants.js";
import { forestBackground } from "./sprites.js";
import { Ally, Mob } from "./classes.js";
import { allyData } from "./data/allyData.js";
import { mobData } from "./data/mobData.js";
import { attacks } from "./data/attacks.js";

export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.fps = GAME_FRAMERATE.fps;
    this.lastTime = 0;

    // milliseconds between allowed clicks
    this.dialogueBoxDelay = 800;

    // flags also reset in resetGame() upon startup
    this.isPaused = true;
    this.dialogueBoxFlag = false;
    this.inBattle = false;
    this.battleLost = false;
    this.battleVictory = false;
    this.playerTop = true;

    this.allies = [];
    this.mobs = [];
    this.queue = [];

    this.init();
  }

  // initial canvas setup
  init() {
    this.setCanvasSize();
    this.setupInput();

    this.ctx.imageSmoothingEnabled = false;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.animate(t));
  }
  // setup player button inputs
  setupInput() {
    // Main Menu Listener
    document.getElementById("playBtn").onclick = () => {
      this.startGame();
    };
    // Pause Menu Listener
    document.getElementById("continueBtn").onclick = () => {
      this.hidePauseUI();
    };
    document.getElementById("restartBtn").onclick = () => {
      this.resetGame();
      this.hidePauseUI();
    };
    // Button Inputs
    window.addEventListener("keydown", (e) => {
      switch (e.key.toLowerCase()) {
        case "escape":
          if (!this.isPaused) {
            this.showPauseUI();
          }
      }
    });
    // Dialogue Box Listener
    document.getElementById("dialogueBox").addEventListener("click", (e) => {
      if (this.dialogueBoxFlag) return;
      if (this.battleVictory) {
        this.endBattleWin();
      } else if (this.battleLost) {
        this.endBattleLoss();
      }
      // call next event queued for game
      if (this.queue.length > 0) {
        this.playerTop = false; // swapping turns
        this.queue[0](); // calling next action stored for game
        this.queue.shift(); // then remove that element
        this.toggleDialogueBoxDelay(); // toggle flag
        document
          .getElementById("greenArrowRotating")
          .classList.remove("active"); // removing green arrow indicator
      } else {
        // turning dialogue box off
        e.currentTarget.classList.remove("active");
        document
          .getElementById("greenArrowRotating")
          .classList.remove("active"); // removing green arrow indicator
        this.playerTop = true;
      }
    });
  }
  // opens dialogue box
  openDialogueBox() {
    this.toggleDialogueBoxDelay();
    document.getElementById("dialogueBox").classList.add("active");
  }
  // toggle dialogueBox click delay
  toggleDialogueBoxDelay() {
    if (this.dialogueBoxFlag) return;
    this.dialogueBoxFlag = true;
    setTimeout(() => {
      document.getElementById("greenArrowRotating").classList.add("active");
      this.dialogueBoxFlag = false;
    }, this.dialogueBoxDelay);
    this.checkAllHealth();
  }
  // check health of allies and mobs in battle to determine battle win/loss
  checkAllHealth() {
    // ally has zero health
    this.allies.forEach((ally) => {
      if (ally.currentHealth <= 0) {
        this.battleLost = true;
      }
    });
    // all mobs have zero health
    this.mobs.forEach((mob) => {
      if (mob.currentHealth <= 0) {
        this.battleVictory = true;
      }
    });
  }
  // create attack buttons for allies
  setupAttackInput(ally) {
    document
      .getElementById("attacksBox")
      .querySelectorAll("button")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          if (!this.playerTop) return;
          if (this.battleLost || this.battleVictory) return;
          // Grabbing the selected attack
          const selectedAttack = e.currentTarget.innerHTML;
          const resultAttack = selectedAttack.replaceAll(" ", "_");
          // turn on dialogue box
          this.openDialogueBox();
          // ally attack
          ally.attack({
            attack: attacks[resultAttack],
            target: this.mobs[0],
            allyIndex: 0,
            mobIndex: 0,
          });
          this.checkAllHealth();
          if (this.battleVictory) return;
          // mob attack
          this.queue.push(() => {
            this.mobs[0].attack({
              target: ally,
              allyIndex: 0,
              mobIndex: 0,
            });
          });
          this.checkAllHealth();
          if (this.battleLost) return;
        });
      });
  }
  // remove ally attacks
  removeAttackInput() {
    document
      .getElementById("attacksBox")
      .querySelectorAll("button")
      .forEach((button) => {
        button.remove();
      });
  }
  // setup for a new battle
  setupBattle() {
    this.spawnMobs();

    let allyCount = 0;
    let mobCount = 0;

    // allies
    this.allies.forEach((ally) => {
      allyCount++;
      // populate ally health information
      document.querySelector(`#ally${allyCount}ui`).classList.add("active");
      document.querySelector(`#ally${allyCount}Name`).innerHTML = ally.name;
      document.querySelector(`#ally${allyCount}Health-max`).innerHTML =
        ally.maxHealth;
      document.querySelector(`#ally${allyCount}Health-current`).innerHTML =
        ally.currentHealth;
      document.querySelector(`#ally${allyCount}HealthBar-green`).style.width =
        (100 * ally.currentHealth) / ally.maxHealth + "%";

      // populate ally attacks box
      ally.attacks.forEach((attack) => {
        const attackBtn = document.createElement("button");
        attackBtn.innerHTML = attack.name;
        document.querySelector("#attacksBox").append(attackBtn);
      });

      // setup listener for attacks
      this.setupAttackInput(ally);
    });

    // mobs
    this.mobs.forEach((mob) => {
      mobCount++;
      // populate mob info
      document.querySelector(`#mob${mobCount}ui`).classList.add("active");
      document.querySelector(`#mob${mobCount}Name`).innerHTML = mob.name;
      document.querySelector(`#mob${mobCount}Health-max`).innerHTML =
        mob.maxHealth;
      document.querySelector(`#mob${mobCount}Health-current`).innerHTML =
        mob.currentHealth;
      document.querySelector(`#mob${mobCount}HealthBar-green`).style.width =
        (100 * mob.currentHealth) / mob.maxHealth + "%";
    });
  }
  // create new ally units
  spawnAllies() {
    let player = new Ally(allyData.soldier);
    this.allies.push(player);
  }
  // create new mob units
  spawnMobs() {
    let orc = new Mob(mobData.orc, 0);
    this.mobs.push(orc);

    // let bloodTeeth = new Mob(mobData.blood_teeth, 0);
    // this.mobs.push(bloodTeeth);
  }
  // reseting variables for fresh battle
  battleReset() {
    this.inBattle = false;
    this.battleLost = false;
    this.battleVictory = false;

    // reset mobs
    let mobCount = 0;
    this.mobs.forEach(() => {
      mobCount++;
      document.querySelector(`#mob${mobCount}ui`).classList.remove("active");
    });
    this.mobs = [];

    // remove ally attacks
    this.removeAttackInput();
  }
  //
  endBattleLoss() {
    this.showMenuUI();
  }
  //
  endBattleWin() {
    this.battleReset();
  }
  // reset game variables for a new game
  resetGame() {
    // reset flags
    this.isPaused = true;
    this.dialogueBoxFlag = false;
    this.inBattle = false;
    this.battleLost = false;
    this.battleVictory = false;
    this.playerTop = true;
    // reset arrays
    this.allies = [];
    this.mobs = [];
    this.queue = [];
    // reset dialogueBox & arrow
    document.getElementById("dialogueBox").classList.remove("active");
    document.getElementById("dialogueBox").innerHTML = "";
    document.getElementById("greenArrowRotating").classList.remove("active");
    setTimeout(() => {
      // failsafe to hide arrow
      document.getElementById("greenArrowRotating").classList.remove("active");
    }, this.dialogueBoxDelay);
    // remove ally attacks
    this.removeAttackInput();
    // spawn in new ally
    this.spawnAllies();
  }
  // events after clicking play
  startGame() {
    this.resetGame();
    this.unPauseGame();
    this.hideMenuUI();
    this.hidePauseUI();
  }
  // hides main menu
  hideMenuUI() {
    this.unPauseGame();
    document.querySelectorAll(".ui-menu-container").forEach((panel) => {
      panel.classList.remove("active");
    });
    document.getElementById("overlappingDiv").classList.remove("active");
  }
  // shows main menu
  showMenuUI() {
    this.pauseGame();
    document.querySelectorAll(".ui-menu-container").forEach((panel) => {
      panel.classList.add("active");
    });
    document.getElementById("overlappingDiv").classList.add("active");
  }
  // hides pause menu
  hidePauseUI() {
    this.unPauseGame();
    document.querySelectorAll(".ui-pause-container").forEach((panel) => {
      panel.classList.remove("active");
    });
    document.getElementById("overlappingDiv").classList.remove("active");
  }
  // shows pause menu
  showPauseUI() {
    this.pauseGame();
    document.querySelectorAll(".ui-pause-container").forEach((panel) => {
      panel.classList.add("active");
    });
    document.getElementById("overlappingDiv").classList.add("active");
  }
  pauseGame() {
    this.isPaused = true;
  }
  unPauseGame() {
    this.isPaused = false;
  }
  // game animation loop
  animate(timestamp) {
    // pausing animation
    if (this.isPaused) {
      requestAnimationFrame((t) => this.animate(t));
      return;
    }

    // framerate control
    if (this.lastTime === 0) {
      this.lastTime = timestamp;
    }
    const frameInterval = 1000 / this.fps; // interval for next frame
    const elapsed = timestamp - this.lastTime; // time passed since last frame
    if (elapsed < frameInterval) {
      // skip frame if not enough time has passed
      requestAnimationFrame((t) => this.animate(t));
      return;
    }
    this.lastTime = timestamp - (elapsed % frameInterval);

    // battle setup
    if (!this.inBattle) {
      this.setupBattle();
      this.inBattle = true;
    }

    // draw items
    forestBackground.draw(this.ctx);
    if (this.playerTop) {
      // work around to render mobs/allies on top using playerTop
      this.mobs.forEach((mob) => {
        mob.draw(this.ctx);
      });
      this.allies.forEach((ally) => {
        ally.draw(this.ctx);
      });
    } else {
      this.allies.forEach((ally) => {
        ally.draw(this.ctx);
      });
      this.mobs.forEach((mob) => {
        mob.draw(this.ctx);
      });
    }

    requestAnimationFrame((t) => this.animate(t));
  }
  // setup initial game canvas size
  setCanvasSize() {
    this.canvas.width = CANVAS_SIZE.width;
    this.canvas.height = CANVAS_SIZE.height;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
