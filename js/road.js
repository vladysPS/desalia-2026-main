class Road {
  constructor(ctx, speed, canvasHeight) {
    this.speed = speed;
    this.canvasHeight = canvasHeight;
    this.ctx = ctx;
    this.x = 0;
    this.height = canvasHeight /4;
    this.y = this.canvasHeight - this.height;
    console.log("road height", this.height)
    console.log("this.y", this.y)

    this.img = new Image();
    this.img.src = "imgs/road.png";
    this.img.isReady = false;

    this.img.onload = () => {
      this.img.isReady = true;
      this.width = this.img.naturalWidth;
    };
  }

  updateDimensions(canvasHeight, scale) {
    this.canvasHeight = canvasHeight;
    this.height = canvasHeight / 4;
    this.y = this.canvasHeight - this.height;

    if (this.img && this.img.isReady) {
      this.width = (this.img.naturalWidth / this.img.naturalHeight) * this.height;
    }

    if (this.x <= -this.width) {
      this.x = 0;
    }
  }

  draw() {
    if (this.img.isReady) {
      this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      this.ctx.drawImage(this.img, this.x + this.width, this.y, this.width, this.height);
    }
  }

  move() {
    this.x -= this.speed;

    if (this.x <= -this.width) {
      this.x = 0;
    }
  }
}

export default Road;
