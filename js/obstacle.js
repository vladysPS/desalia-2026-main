const obstacleImages = {
    botella: new Image(),
    altavoz: new Image(),
    flamenco: new Image()
};

obstacleImages.botella.src = '/imgs/obstacles/botella-barcelo.png';
obstacleImages.altavoz.src = '';
obstacleImages.flamenco.src = '';
class Obstacle {
  constructor(ctx, canvasWidth, canvasHeight, road, scale = 1) {
    this.ctx = ctx;
    this.road = road;

    this.baseWidth = 45;
    this.baseHeight = 80;
    this.scale = scale;

    // OBSTACLES TYPES
    this.obstacleTypes = ["botella", "altavoz", "flamenco"];

    // Pick random obstacle ***UNCOMMENT WHEN I HAVE THE DESIGNS***
    //const obstalceIndex = Math.floor(Math.random() * this.obstacleType.length);
    //const obstacle = this.obstacleTypes[obstalceIndex];
    this.obstacleImage = obstacleImages.botella

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.width = this.baseWidth * this.scale;
    this.height = this.baseHeight * this.scale;


    this.x = canvasWidth + this.width;

    this.setYPosition();

    this.isOffscreen = false;
  }

  setYPosition() {
    // Anchor obstacle so its bottom sits at the vertical midpoint of the road
    const roadCenterY = this.road
      ? this.road.y + this.road.height / 2
      : this.canvasHeight - this.height / 2; // fallback: center above canvas bottom

    this.y = roadCenterY - this.height;
  }

  updateDimensions(canvasWidth, canvasHeight, scale, road) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    if (road) this.road = road;
    this.scale = scale;

    // Recompute size and X/Y relative to new scale/canvas
    const progress = 1 - (this.x / (this.canvasWidth + this.width)); // 0 at spawn, >1 when offscreen

    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;

    this.x = this.canvasWidth + this.width - progress * (this.canvasWidth + this.width);
    this.setYPosition();
  }

  move(dt = 1 / 60) {
    this.x -= this.road.speed * dt;

    if (this.x + this.width < 0) {
      this.isOffscreen = true;
    }
  }

  draw() {
    // Collision shape: two rectangles forming a bottle-like hitbox
    this.ctx.fillRect(this.x, this.y + this.height * 0.4, this.width, this.height * 0.6);
    this.ctx.fillRect(this.x + this.width * 0.25, this.y, this.width * 0.5, this.height * 0.4);

    // Visual: paint the sprite on top (collision still uses the rectangles above)
    if (this.obstacleImage && this.obstacleImage.complete && this.obstacleImage.naturalWidth > 0) {
      this.ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
    }

  }
}

export default Obstacle;
