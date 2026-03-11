class Obstacle {
  constructor(ctx, canvasWidth, canvasHeight, road, scale = 1) {
    this.ctx = ctx;
    this.road = road;

    this.baseWidth = 60;
    this.baseHeight = 80;
    this.scale = scale;

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

  move() {
    this.x -= this.road.speed;

    if (this.x + this.width < 0) {
      this.isOffscreen = true;
    }
  }

  draw() {
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export default Obstacle;
