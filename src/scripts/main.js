'use strict';

const Game = require('../modules/Game.class');

const game = new Game();
let isAnimating = false;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
const SWIPE_THRESHOLD = 30;

const cells = document.querySelectorAll('.field-cell');
const startBtn = document.querySelector('.button.start');
const scoreEl = document.querySelector('.game-score');
const bestScoreEl = document.querySelector('.best-score');
const messageLose = document.querySelector('.message-lose');
const messageWin = document.querySelector('.message-win');
const messageStart = document.querySelector('.message-start');
const boardEl = document.querySelector('.game-field');

function updateStartButton() {
  startBtn.classList.remove('start');
  startBtn.classList.add('restart');
  startBtn.textContent = 'Restart';
  messageStart.classList.add('hidden');
}

function hideMessages() {
  messageWin.classList.add('hidden');
  messageLose.classList.add('hidden');
}

function showGameStatus() {
  const status = game.getStatus();

  if (status === 'win') messageWin.classList.remove('hidden');
  if (status === 'lose') messageLose.classList.remove('hidden');
}

function render() {
  const board = game.getState();

  board.forEach((row, i) => {
    row.forEach((value, j) => {
      const index = i * 4 + j;
      const cell = cells[index];

      cell.textContent = value || '';
      cell.className = 'field-cell';
      if (value) cell.classList.add(`field-cell--${value}`);
    });
  });

  scoreEl.textContent = game.getScore();
  bestScoreEl.textContent = game.getHighscore();

  hideMessages();
  showGameStatus();
}

document.addEventListener('keydown', (e) => {
  if (isAnimating) return;
  isAnimating = true;
  setTimeout(() => (isAnimating = false), 100);

  updateStartButton();
  if (['win', 'lose'].includes(game.getStatus())) return;

  const actions = {
    ArrowLeft: () => game.moveLeft(),
    ArrowRight: () => game.moveRight(),
    ArrowUp: () => game.moveUp(),
    ArrowDown: () => game.moveDown(),
  };

  const action = actions[e.key];
  if (!action) return;

  action();
  render();
});

function handleSwipe(dx, dy) {
  updateStartButton();
  if (['win', 'lose'].includes(game.getStatus())) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > SWIPE_THRESHOLD) game.moveRight();
    else if (dx < -SWIPE_THRESHOLD) game.moveLeft();
  } else {
    if (dy > SWIPE_THRESHOLD) game.moveDown();
    else if (dy < -SWIPE_THRESHOLD) game.moveUp();
  }

  render();
}

// Touch
boardEl.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
});

boardEl.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  endX = touch.clientX;
  endY = touch.clientY;
  handleSwipe(endX - startX, endY - startY);
});

// Mouse
let isMouseDown = false;

boardEl.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  startX = e.clientX;
  startY = e.clientY;
});

boardEl.addEventListener('mouseup', (e) => {
  if (!isMouseDown) return;
  isMouseDown = false;
  endX = e.clientX;
  endY = e.clientY;
  handleSwipe(endX - startX, endY - startY);
});

startBtn.addEventListener('click', () => {
  updateStartButton();
  game.start();
  render();
});

render();
