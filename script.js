const ROWS = 6;
const COLS = 7;

let board = [];       // board[row][col] = null | 'red' | 'yellow'
let currentPlayer = 'red';
let gameOver = false;

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const turnChip = document.getElementById('turnChip');
const turnText = document.getElementById('turnText');
const resetBtn = document.getElementById('resetBtn');
const winOverlay = document.getElementById('winOverlay');
const winMessage = document.getElementById('winMessage');
const playAgainBtn = document.getElementById('playAgainBtn');

function createBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  boardEl.innerHTML = '';
  boardEl.classList.remove('locked');

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', () => handleColumnClick(col));
      boardEl.appendChild(cell);
    }
  }
}

function handleColumnClick(col) {
  if (gameOver) return;

  const row = getLowestEmptyRow(col);
  if (row === -1) return; // column full

  board[row][col] = currentPlayer;
  renderPiece(row, col, currentPlayer, true);

  const winningCells = checkWin(row, col, currentPlayer);
  if (winningCells) {
    gameOver = true;
    boardEl.classList.add('locked');
    highlightWin(winningCells);
    announceWin(currentPlayer);
    return;
  }

  if (isBoardFull()) {
    gameOver = true;
    boardEl.classList.add('locked');
    statusEl.textContent = "It's a draw — the board is full.";
    announceDraw();
    return;
  }

  currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
  updateTurnIndicator();
}

function getLowestEmptyRow(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!board[row][col]) return row;
  }
  return -1;
}

function renderPiece(row, col, player, animate) {
  const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  cell.classList.add(`filled-${player}`);
  if (animate) cell.classList.add(`drop-${player}`);
}

function updateTurnIndicator() {
  turnChip.className = `chip chip--${currentPlayer}`;
  turnText.textContent = `${capitalize(currentPlayer)}'s turn`;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function checkWin(row, col, player) {
  const directions = [
    { dr: 0, dc: 1 },   // horizontal
    { dr: 1, dc: 0 },   // vertical
    { dr: 1, dc: 1 },   // diagonal down-right
    { dr: 1, dc: -1 },  // diagonal down-left
  ];

  for (const { dr, dc } of directions) {
    const line = [[row, col]];

    // walk forward
    let r = row + dr, c = col + dc;
    while (inBounds(r, c) && board[r][c] === player) {
      line.push([r, c]);
      r += dr; c += dc;
    }
    // walk backward
    r = row - dr; c = col - dc;
    while (inBounds(r, c) && board[r][c] === player) {
      line.push([r, c]);
      r -= dr; c -= dc;
    }

    if (line.length >= 4) return line;
  }
  return null;
}

function inBounds(row, col) {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function isBoardFull() {
  return board[0].every(cell => cell !== null);
}

function highlightWin(cells) {
  for (const [row, col] of cells) {
    const cell = boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('win');
  }
}

function announceWin(player) {
  statusEl.textContent = `${capitalize(player)} connects four.`;
  winMessage.textContent = `${capitalize(player)} wins!`;
  winOverlay.classList.add('show');
}

function announceDraw() {
  winMessage.textContent = "It's a draw!";
  winOverlay.classList.add('show');
}

function resetGame() {
  currentPlayer = 'red';
  gameOver = false;
  statusEl.textContent = '';
  winOverlay.classList.remove('show');
  updateTurnIndicator();
  createBoard();
}

resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

createBoard();
updateTurnIndicator();
