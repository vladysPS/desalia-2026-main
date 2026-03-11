import Game from './game.js';
 
let canvas = document.querySelector('canvas');
 
const ctx = canvas.getContext('2d');
const game = new Game(ctx);
const startBtn = document.getElementById('startBtn');
const poster = document.getElementById('poster');
 

// start btn
startBtn.onclick = () => {
  startBtn.remove();
  poster.remove();
  game.gameLoop();
};

 