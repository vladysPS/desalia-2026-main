class Obstacle {
  constructor(ctx, canvasWidth, canvasHeight, road) {
    this.ctx = ctx;
    this.road = road;

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.width = 60;
    this.height = 80;

    this.x = canvasWidth + this.width;

    // Y aleatorio (entre suelo y una altura superior)
    const ground = canvasHeight;
    const minY = ground - this.height;
    const maxY = ground - this.height - canvasHeight * 0.3;

    this.y = 500;
    console.log("this y", this.y)

    this.isOffscreen = false;
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