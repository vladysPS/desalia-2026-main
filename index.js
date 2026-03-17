import Game from './game.js';
 
let canvas = document.querySelector('canvas');
let playerAvatar = undefined;
 
const ctx = canvas.getContext('2d');
const game = new Game(ctx);
const startBtn = document.getElementById('startBtn');
const poster = document.getElementById('poster');
const title = document.querySelector('.heading');
const playerSelector = document.querySelector('.player-selector');

const playerDivs = document.querySelectorAll('.player-selector .image-container');

playerDivs.forEach(div => {
  div.addEventListener('click', () => {

      playerDivs.forEach(d => d.classList.remove('selected'));
      playerAvatar = div.dataset.duckNumber;
      div.classList.add('selected');
      console.log(`Duck number selected: ${playerAvatar}`);
    
  });
});

 

// start btn
startBtn.onclick = () => {
  if (playerAvatar === undefined){
    alert('select a player to start game');
  } else{
    game.setPlayerAvatar(playerAvatar);
    startBtn.remove();
    title.remove();
    playerSelector.remove();
    poster.remove();
    game.gameLoop();
  }
};

 