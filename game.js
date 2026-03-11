import Background from './js/background.js';
import Road from './js/road.js';
import Player from './js/player.js';
import Obstacle from './js/obstacle.js';

class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.intervalId = undefined; // to set loop and stop it
    this.todoRectoSinMiedo = false; 
    this.baseWidth = 1225;
    this.baseHeight = 700;
    this.targetAspect = this.baseWidth / this.baseHeight; // used to scale elements accordingly

    // SOUNDS
    this.isThemePlaying = false;
    this.soundCrash = new Audio("sounds/flappyhit.mp3");
    this.soundCrash.volume = 0.5;
    this.soundJump = new Audio("sounds/flappyflap.mp3");
    this.soundJump.volume = 0.5;
    this.theme = new Audio('sounds/samba.mp3');
    this.theme.volume = 0.5;
    this.countDownSound = new Audio('sounds/countdown.mp3');
    this.countDownSound.volume = 0.5;

    // OBSTACLES
    this.obstacles = [];
    this.obstacleTimer = 0;
    this.obstacleInterval = this.getRandomObstacleTime();
    this.hasCollision = false;

    this.setResponsiveSizes();
    window.addEventListener('resize', () => {
      this.setResponsiveSizes();
    });
 
    this.backSpeed = 1;
    this.background = new Background(this.ctx, this.canvasHeight, 0, this.backSpeed);
    this.background.game = this; // Pass the current Game instance to the Background so I can stop the game
    
    this.roadSpeed =7;
    this.road = new Road(this.ctx, this.roadSpeed, this.canvasHeight);
    
    this.player = new Player(this.ctx, this.canvasHeight, this.soundJump, this.scale);
  }
  getRandomObstacleTime() {
    return 60 + Math.random() * 120; // entre 1 y 3 segundos aprox (en frames a 60fps)    
  }
  setResponsiveSizes() {
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) return;

    const padding = 24; // breathing room around the canvas
    const maxWidth = Math.min(window.innerWidth - padding, this.baseWidth);
    const maxHeight = Math.min(window.innerHeight - padding, this.baseHeight);

    let width = maxWidth;
    let height = width / this.targetAspect;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * this.targetAspect;
    }

    canvasContainer.style.width = `${width}px`;
    canvasContainer.style.height = `${height}px`;

    this.canvasWidth = Math.round(width);
    this.canvasHeight = Math.round(height);
    this.scale = this.canvasHeight / this.baseHeight;

    this.ctx.canvas.width = this.canvasWidth;
    this.ctx.canvas.height = this.canvasHeight;

    // Propagate new sizes to game elements
    if (this.road && typeof this.road.updateDimensions === 'function') {
      this.road.updateDimensions(this.canvasHeight, this.scale);
    }
    if (this.background && typeof this.background.updateDimensions === 'function') {
      this.background.updateDimensions(this.canvasHeight, this.scale);
    }
    if (this.player && typeof this.player.updateDimensions === 'function') {
      this.player.updateDimensions(this.canvasHeight, this.scale);
    }
    this.obstacles.forEach(obstacle => {
      if (typeof obstacle.updateDimensions === 'function') {
        obstacle.updateDimensions(this.canvasWidth, this.canvasHeight, this.scale, this.road);
      }
    });
  }
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  collisions() {
    if (this.hasCollision) return;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];
      if (this.checkCollision(this.player, obstacle)) {
        this.hasCollision = true;

        this.stopGame();
        this.soundCrash.currentTime = 0;
        this.soundCrash.play();

        return;
      }
    }
  }
  gameLoop() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        
        if (!this.isThemePlaying) {
          this.theme.loop = true;
          this.theme.currentTime = 0;
          // this.theme.play();
          this.isThemePlaying = true;
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        this.roadSpeed += 0.005;
        this.road.speed = this.roadSpeed;
        
        this.background.move();
        this.background.draw();
        this.road.move();
        this.road.draw();
        this.player.move();
        this.player.draw();

        // OBSTACLES
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
          this.obstacles.push(
            new Obstacle(this.ctx, this.canvasWidth, this.canvasHeight, this.road, this.scale)
          );
          this.obstacleTimer = 0;
          this.obstacleInterval = this.getRandomObstacleTime();
        }

        this.obstacles.forEach(obstacle => {
          obstacle.move();
          obstacle.draw();
        });

        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffscreen);

        if (!this.todoRectoSinMiedo) {
          this.collisions();
        }

      }, 1000 / 60);
    }
  }

  stopGame() {
    clearInterval(this.intervalId);
    this.intervalId = undefined;

    this.theme.pause();
    this.isThemePlaying = false;

    console.log('Game Over!');
  }
}

export default Game;
