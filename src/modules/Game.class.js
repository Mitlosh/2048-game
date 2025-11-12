'use strict';

/**
 * This class represents the game.
 * Now it has a basic structure, that is needed for testing.
 * Feel free to add more props and methods if needed.
 */
class Game {
  /**
   * Creates a new game instance.
   *
   * @param {number[][]} initialState
   * The initial state of the board.
   * @default
   * [[0, 0, 0, 0],
   *  [0, 0, 0, 0],
   *  [0, 0, 0, 0],
   *  [0, 0, 0, 0]]
   *
   * If passed, the board will be initialized with the provided
   * initial state.
   */
  constructor(initialState) {
    this.score = 0;
    this.status = 'playing';
    this.highscore = Number(localStorage.getItem('highscore')) || 0;

    if (initialState) {
      this.board = initialState.map((row) => row.slice());
    } else {
      this.start();
    }
  }

  _updateHighscore() {
    if (this.score > this.highscore) {
      this.highscore = this.score;
      localStorage.setItem('highscore', this.highscore);
    }
  }
  // Add Random Tile on the board
  _addRandomTile() {
    const emptyCells = [];

    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[i].length; j++) {
        if (this.board[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }

    if (emptyCells.length === 0) {
      return;
    }

    const [row, col] =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;

    this.board[row][col] = newValue;
  }
  // Merge Row
  _slideAndMergeRow(row) {
    const nonZero = row.filter((x) => x !== 0);

    for (let i = 0; i < nonZero.length; i++) {
      if (nonZero[i] === nonZero[i + 1]) {
        nonZero[i] *= 2;
        nonZero[i + 1] = 0;
        this.score += nonZero[i];
        this._updateHighscore();
      }
    }

    const merged = nonZero.filter((x) => x !== 0);

    while (merged.length < 4) {
      merged.push(0);
    }

    return merged;
  }
  // Check if two arrays are equal
  arraysEqual(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  // Transpose Matrix
  transpose(matrix = this.board) {
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
  }
  move(direction) {
    const oldBoard = this.getState();
    let newBoard;

    switch (direction) {
      case 'left':
        newBoard = this._moveLeftInternal();
        break;

      case 'right':
        newBoard = this._reverseBoard();
        newBoard = this._moveLeftInternal(newBoard);
        newBoard = this._reverseBoard(newBoard);
        break;

      case 'up':
        newBoard = this.transpose();
        newBoard = this._moveLeftInternal(newBoard);
        newBoard = this.transpose(newBoard);
        break;

      case 'down':
        newBoard = this.transpose();
        newBoard = this._reverseBoard(newBoard);
        newBoard = this._moveLeftInternal(newBoard);
        newBoard = this._reverseBoard(newBoard);
        newBoard = this.transpose(newBoard);
        break;
    }

    if (!this._boardsEqual(oldBoard, newBoard)) {
      this.board = newBoard;
      this._addRandomTile();
    }

    this.checkGameStatus();
  }

  moveLeft() {
    this.move('left');
  }
  moveRight() {
    this.move('right');
  }
  moveUp() {
    this.move('up');
  }
  moveDown() {
    this.move('down');
  }

  _moveLeftInternal(board = this.board) {
    return board.map((row) => this._slideAndMergeRow(row));
  }

  _reverseBoard(board = this.board) {
    return board.map((row) => [...row].reverse());
  }

  _boardsEqual(a, b) {
    return a.every((row, i) => this.arraysEqual(row, b[i]));
  }

  /**
   * @returns {number}
   */
  getScore() {
    return this.score;
  }

  /**
   * @returns {number[][]}
   */
  getState() {
    return this.board.map((row) => row.slice());
  }
  getHighscore() {
    return this.highscore;
  }

  /**
   * Returns the current game status.
   *
   * @returns {string} One of: 'idle', 'playing', 'win', 'lose'
   *
   * `idle` - the game has not started yet (the initial state);
   * `playing` - the game is in progress;
   * `win` - the game is won;
   * `lose` - the game is lost
   */
  getStatus() {
    return this.status;
  }

  checkGameStatus() {
    if (this.checkGameOver()) {
      this.status = 'lose';
    } else if (this.checkGameWin()) {
      this.status = 'win';
    }
  }

  /**
   * Starts the game.
   */
  start() {
    this.board = Array(4)
      .fill()
      .map(() => Array(4).fill(0));

    this.score = 0;
    this.status = 'playing';

    this._addRandomTile();
    this._addRandomTile();
  }

  /**
   * Resets the game.
   */
  restart() {
    this.start();
  }

  checkGameWin() {
    return this.board.some((row) => row.includes(2048));
  }
  checkGameOver() {
    if (this.board.flat().includes(0)) {
      return false;
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = this.board[i][j];

        if (
          (i < 3 && this.board[i + 1][j] === current) ||
          (j < 3 && this.board[i][j + 1] === current)
        ) {
          return false;
        }
      }
    }

    return true;
  }
}

module.exports = Game;
