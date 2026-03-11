class Player {
  constructor(ctx, canvasHeight, soundJump, scale = 1) {
    this.ctx = ctx;

    this.canvasHeight = canvasHeight;
    this.scale = scale;

    this.baseWidth = 120;
    this.baseHeight = 150;
    this.baseX = 100;
    this.baseGravity = 0.5;
    this.baseJumpStrength = -15;

    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
    this.x = this.baseX * scale;
    this.playerGroundposition = canvasHeight - this.height - (canvasHeight / 8);
    this.y = this.playerGroundposition;

    this.img = new Image();
    this.img.src = "imgs/skater-sprite-1.png";
    this.img.isReady = false;
    this.img.onload = () => (this.img.isReady = true);
    this.runningHorizontalFrames = 12;

    this.imgJump = new Image();
    this.imgJump.src = "imgs/jump-sprite.png";
    this.imgJump.isReady = false;
    this.imgJump.onload = () => (this.imgJump.isReady = true);
    this.jumpingHorizontalFrames = 17;

    this.verticalFrames = 1;

    this.xFrame = 0;
    this.yFrame = 0;
    this.spriteFrameCounter = 0;

    this.vy = 0;
    this.gravity = this.baseGravity * scale;
    this.jumpStrength = this.baseJumpStrength * scale;

    this.soundJump = soundJump;

    document.addEventListener("click", () => this.jump());
    document.addEventListener("keydown", (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        this.jump(); 
        event.preventDefault();
      }
    });
  }

  updateDimensions(canvasHeight, scale) {
    const previousHeight = this.canvasHeight || canvasHeight;
    const previousGround =
      this.playerGroundposition ?? (previousHeight - this.height - previousHeight / 8);
    const distanceFromGround = previousGround - this.y;
    const previousScale = this.scale || 1;

    this.canvasHeight = canvasHeight;
    this.scale = scale;

    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
    this.x = this.baseX * scale;

    this.gravity = this.baseGravity * scale;
    this.jumpStrength = this.baseJumpStrength * scale;

    this.playerGroundposition = canvasHeight - this.height - (canvasHeight / 8);

    const heightRatio = canvasHeight / previousHeight || 1;
    const scaledDistance = distanceFromGround * heightRatio;
    this.y = Math.min(this.playerGroundposition - scaledDistance, this.playerGroundposition);
    this.vy *= scale / previousScale;
  }

  jump() {
    if (this.y === this.playerGroundposition) {
      this.vy = this.jumpStrength;
      this.xFrame = 0;
      this.spriteFrameCounter = 0;
      this.soundJump.play();
    }
  }

  draw() {
    const inAir = this.y < this.playerGroundposition;
    const img = inAir ? this.imgJump : this.img;
    const hFrames = inAir ? this.jumpingHorizontalFrames : this.runningHorizontalFrames;
    const endX = hFrames;

    if (!img.isReady) return;

    this.ctx.save();
    this.ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    this.ctx.drawImage(
      img,
      (img.width * this.xFrame) / hFrames,
      (img.height * this.yFrame) / this.verticalFrames,
      img.width / hFrames,
      img.height / this.verticalFrames,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );

    this.ctx.restore();

    this.spriteFrameCounter++;
 
    if (this.spriteFrameCounter % 8 === 0) {
      this.xFrame += 1;
      if (this.xFrame >= endX) this.xFrame = 0;
    }
  }

  move() {
    this.y += this.vy;

    if (this.y < this.playerGroundposition) {
      this.vy += this.gravity;
    }

    if (this.y >= this.playerGroundposition) {
      this.y = this.playerGroundposition;
      this.vy = 0;
    }
  }
}

export default Player;
