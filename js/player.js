class Player {
  constructor(ctx, canvasHeight, soundJump, road, scale = 1) {
    this.ctx = ctx;

    this.canvasHeight = canvasHeight;
    this.scale = scale;
    this.road = road;

    this.baseWidth = 191;
    this.baseHeight = 247;
    this.baseX = 100;
    // Convert original per-frame physics to per-second values (60fps baseline)
    // Acceleration needs fps^2 to keep the same time-to-apex as the old frame-based logic
    this.baseGravity = 4000; // px/s^2  (0.5 * 60 * 60)
    this.baseJumpStrength = -1700; // px/s (-15 * 60)

    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
    this.x = this.baseX * scale;

    this.img = new Image();
    this.img.src = "imgs/players/pato-1.png";
    this.img.isReady = false;
    this.img.onload = () => (this.img.isReady = true);
    this.runningHorizontalFrames = 1;

    this.imgJump = new Image();
    this.imgJump.src = "imgs/players/pato-1.png";
    this.imgJump.isReady = false;
    this.imgJump.onload = () => (this.imgJump.isReady = true);
    this.jumpingHorizontalFrames = 1;

    this.verticalFrames = 1;

    this.xFrame = 0;
    this.yFrame = 0;
    this.spriteFrameCounter = 0;
    this.animationTimer = 0; // seconds accumulator

    this.vy = 0;
    this.gravity = this.baseGravity * scale;
    this.jumpStrength = this.baseJumpStrength * scale;

    this.playerGroundposition = this.computeGroundPosition(canvasHeight, this.height);
    this.y = this.playerGroundposition;

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
    const previousScale = this.scale || 1;
    const previousGround = this.playerGroundposition ?? this.computeGroundPosition(previousHeight, this.height);
    const distanceFromGround = previousGround - (this.y ?? previousGround);

    this.canvasHeight = canvasHeight;
    this.scale = scale;

    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
    this.x = this.baseX * scale;

    this.gravity = this.baseGravity * scale;
    this.jumpStrength = this.baseJumpStrength * scale;

    this.playerGroundposition = this.computeGroundPosition(canvasHeight, this.height);

    const heightRatio = canvasHeight / previousHeight || 1;
    const scaledDistance = distanceFromGround * heightRatio;
    this.y = Math.min(this.playerGroundposition - scaledDistance, this.playerGroundposition);
    this.vy *= scale / previousScale;
  }

  computeGroundPosition(canvasHeight = this.canvasHeight, playerHeight = this.height) {
    const roadIsReady =
      this.road &&
      this.road.img &&
      this.road.img.isReady &&
      this.road.height > 0;

    if (roadIsReady) {
      const roadMiddleY = this.road.y + this.road.height / 2;
      return roadMiddleY - playerHeight;
    }

    const effectiveCanvasHeight = canvasHeight ?? this.canvasHeight;
    if (!effectiveCanvasHeight) return 0;

    return effectiveCanvasHeight - playerHeight - effectiveCanvasHeight / 8;
  }

  jump() {
    if (this.y === this.playerGroundposition) {
      this.vy = this.jumpStrength;
      this.xFrame = 0;
      this.spriteFrameCounter = 0;
      this.soundJump.play();
    }
  }

  draw(dt = 1 / 60) {
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

    // Advance animation based on time (roughly one frame every 8 game frames at 60fps)
    this.animationTimer += dt;
    const frameDuration = (8 / 60); // seconds per sprite frame
    if (this.animationTimer >= frameDuration) {
      this.animationTimer -= frameDuration;
      this.xFrame += 1;
      if (this.xFrame >= endX) this.xFrame = 0;
    }
  }

  move(dt = 1 / 60) {
    this.playerGroundposition = this.computeGroundPosition(this.canvasHeight, this.height);

    this.y += this.vy * dt;

    if (this.y < this.playerGroundposition) {
      this.vy += this.gravity * dt;
    }

    if (this.y >= this.playerGroundposition) {
      this.y = this.playerGroundposition;
      this.vy = 0;
    }
  }
}

export default Player;
