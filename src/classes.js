import gsap from "https://cdn.skypack.dev/gsap";

export class Sprite {
  constructor({
    position,
    image,
    scale = 1,
    frames = { max: 1, holdFrames: 1 },
    animate = false,
    flipped = false,
  }) {
    this.position = position;
    this.frames = { ...frames, curr: 0, elapsed: 0 };
    this.scale = scale;
    this.animate = animate;
    this.flipped = flipped;

    this.isAnimatingAttack = false;
    this.isDead = false;

    this.image = new Image();
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
      this.scaledWidth = this.width * this.scale;
      this.scaledHeight = this.height * this.scale;
      this.drawX = this.position.x - (this.scaledWidth - this.width) / 2;
      this.drawY = this.position.y - (this.scaledHeight - this.height) / 2;
    };
    this.image.src = image.src;
    this.images = image;
  }

  // render out the sprite
  draw(ctx) {
    // calculate position dynamically - for gsap
    const drawX = this.position.x - (this.scaledWidth - this.width) / 2;
    const drawY = this.position.y - (this.scaledHeight - this.height) / 2;

    ctx.save();
    if (this.flipped) {
      ctx.translate(drawX + this.scaledWidth, drawY); // shift origin to draw
      ctx.scale(-1, 1); // flip on x-axis
    }
    ctx.drawImage(
      this.image,
      this.width * this.frames.curr, // start x of img
      0, // start y of img
      this.image.width / this.frames.max, // end x of img
      this.image.height, // end y of img
      this.flipped ? 0 : drawX, // start draw position x
      this.flipped ? 0 : drawY, // start draw position y
      (this.image.width / this.frames.max) * this.scale, // img width
      this.image.height * this.scale, // img height
    );
    ctx.restore();

    // Skip animation code
    if (!this.animate) return;
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }
    // Increase current frame number
    if (this.frames.elapsed % this.frames.holdFrames === 0) {
      if (this.frames.curr < this.frames.max - 1) {
        this.frames.curr++;
      } else {
        if (this.isDead) {
          this.animate = false;
        } else if (this.isAnimatingAttack) {
          this.image.src = this.images.src;
          this.frames.max = this.altFrames.src.max;
          this.frames.holdFrames = this.altFrames.src.holdFrames;
          this.frames.curr = 0;
        } else {
          this.frames.curr = 0;
        }
      }
    }
  }
}

export class Ally extends Sprite {
  constructor({
    position,
    image,
    scale = 1,
    frames = { max: 1, holdFrames: 1 },
    animate = false,
    flipped = false,
    attacks = [],
    altFrames,
    name,
    health,
  }) {
    super({
      position,
      frames,
      scale,
      animate,
      flipped,
      image,
    });
    this.name = name;
    this.maxHealth = health;
    this.currentHealth = this.maxHealth;
    this.attacks = [...attacks];
    this.altFrames = altFrames;
  }

  updateHealth(attack, target, allyindex, mobIndex) {
    // grabbing the target mob health bar
    const targetHealthBar = document.getElementById(
      `mob${mobIndex + 1}Health-current`,
    );
    // value for gsap animation
    const targetHealthValue = {
      val: targetHealthBar.innerHTML || 0,
    };
    // dealing damage
    target.currentHealth -= attack.power;
    // animating health value
    gsap.to(targetHealthValue, {
      val: target.currentHealth,
      onUpdate: () => {
        targetHealthBar.innerHTML = Math.floor(targetHealthValue.val);
      },
    });
    // animate health bar
    gsap.to(`#mob${mobIndex + 1}HealthBar-green`, {
      width: (target.currentHealth / target.maxHealth) * 100 + "%",
      onComplete: () => {
        if (target.currentHealth <= 0) {
          target.death();
        }
      },
    });
  }
  attack({ attack, target, allyIndex, mobIndex }) {
    // prevent duplicate attack if already attacking
    if (this.isAnimatingAttack) return;

    const oldPos = { x: this.position.x, y: this.position.y };
    const timeline = gsap.timeline();

    this.updateHealth(attack, target, allyIndex, mobIndex);
    this.isAnimatingAttack = true;

    // dialogue box text
    document.getElementById("dialogueBox").innerHTML =
      `<span style='color: greenyellow;'>${this.name}</span>&nbsp;used ${attack.name}`;

    // choosing animation
    switch (this.name) {
      case "Soldier":
        switch (attack.name) {
          case "Slash":
            this.image.src = this.images.attack01;
            this.frames.max = this.altFrames.attack01.max;
            this.frames.holdFrames = this.altFrames.attack01.holdFrames;
            this.frames.curr = 0;

            timeline
              .to(this.position, {
                x: target.position.x - 50,
                duration: 0.3,
              })
              .to(this.position, {
                x: target.position.x - 50,
                duration: 0.4,
              })
              .to(this.position, {
                x: oldPos.x,
                duration: 0.2,
                onComplete: () => {
                  this.isAnimatingAttack = false;
                },
              });
            break;
          case "Strike":
            this.image.src = this.images.attack02;
            this.frames.max = this.altFrames.attack02.max;
            this.frames.holdFrames = this.altFrames.attack02.holdFrames;
            this.frames.curr = 0;

            timeline
              .to(this.position, {
                x: target.position.x - 75,
                duration: 0.2,
              })
              .to(this.position, {
                x: target.position.x - 75,
                duration: 0.5,
              })
              .to(this.position, {
                x: oldPos.x,
                duration: 0.2,
                onComplete: () => {
                  this.isAnimatingAttack = false;
                },
              });
            break;
          default:
            console.log("can't find soldier attack");
            break;
        }
        break;
      default:
        console.log("can't attack for unit type");
        break;
    }
  }
  death() {
    this.image.src = this.images.death;
    this.frames.max = this.altFrames.death.max;
    this.frames.holdFrames = this.altFrames.death.holdFrames;
    this.frames.curr = 0;
    this.isDead = true;
  }
}

export class Mob extends Sprite {
  constructor(
    {
      position,
      image,
      scale = 1,
      frames = { max: 1, holdFrames: 1 },
      animate = false,
      flipped = false,
      attacks = [],
      altFrames,
      name,
      health,
    },
    mobIndex,
  ) {
    super({
      position,
      frames,
      scale,
      animate,
      flipped,
      image,
    });
    this.name = name;
    this.maxHealth = health;
    this.currentHealth = this.maxHealth;
    this.attacks = [...attacks];
    this.altFrames = altFrames;
    this.mobIndex = mobIndex;

    this.recalcPos();
  }

  recalcPos() {
    // change x spawn position
    this.position = {
      x: this.position.x + 150 * this.mobIndex,
      y: this.position.y,
    };
  }
  updateHealth(attack, target, allyIndex, mobIndex) {
    // get target ally health bar
    const targetHealthBar = document.getElementById(
      `ally${allyIndex + 1}Health-current`,
    );
    // for gsap animation
    const targetHealthValue = {
      val: targetHealthBar.innerHTML || 0,
    };
    // deal damage
    target.currentHealth -= attack.power;
    // animate health value
    gsap.to(targetHealthValue, {
      val: target.currentHealth,
      onUpdate: () => {
        targetHealthBar.innerHTML = Math.floor(targetHealthValue.val);
      },
    });
    // animate health bar
    gsap.to(`#ally${allyIndex + 1}HealthBar-green`, {
      width: (target.currentHealth / target.maxHealth) * 100 + "%",
      onComplete: () => {
        if (target.currentHealth <= 0) {
          target.death();
        }
      },
    });
  }
  attack({ target, allyIndex, mobIndex }) {
    // prevent duplicate attack if already attacking
    if (this.isAnimatingAttack) return;

    const oldPos = { x: this.position.x, y: this.position.y };
    const timeline = gsap.timeline();
    const randomAttack = Math.floor(Math.random() * this.attacks.length);
    const attack = this.attacks[randomAttack];

    this.updateHealth(attack, target, allyIndex, mobIndex);
    this.isAnimatingAttack = true;

    // dialogue box text
    document.getElementById("dialogueBox").innerHTML =
      `<span style='color: red;'>${this.name}</span>&nbsp;used ${attack.name}`;

    switch (this.name) {
      case "Orc": // rend attack
        switch (attack.name) {
          case "Rend":
            this.image.src = this.images.attack01;
            this.frames.max = this.altFrames.attack01.max;
            this.frames.holdFrames = this.altFrames.attack01.holdFrames;
            this.frames.curr = 0;

            timeline
              .to(this.position, {
                x: target.position.x + 75,
                duration: 0.4,
              })
              .to(this.position, {
                x: target.position.x + 75,
                duration: 0.4,
              })
              .to(this.position, {
                x: oldPos.x,
                duration: 0.2,
                onComplete: () => {
                  this.isAnimatingAttack = false;
                },
              });
            break;
          case "Crescent": //
            this.image.src = this.images.attack02;
            this.frames.max = this.altFrames.attack02.max;
            this.frames.holdFrames = this.altFrames.attack02.holdFrames;
            this.frames.curr = 0;

            timeline
              .to(this.position, {
                x: target.position.x + 75,
                duration: 0.2,
              })
              .to(this.position, {
                x: target.position.x + 75,
                duration: 0.2,
              })
              .to(this.position, {
                x: oldPos.x,
                duration: 0.2,
                onComplete: () => {
                  this.isAnimatingAttack = false;
                },
              });
            break;
        }
        break;

      default:
        console.log("can't find attack for mob type");
        break;
    }
  }
  death() {
    this.image.src = this.images.death;
    this.frames.max = this.altFrames.death.max;
    this.frames.holdFrames = this.altFrames.death.holdFrames;
    this.frames.curr = 0;
    this.isDead = true;
  }
}
