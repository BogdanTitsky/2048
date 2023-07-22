import Grid from './Grid.js';
import Tile from './Tile.js';

const gameBoard = document.getElementById('game-board');

const grid = new Grid(gameBoard);

grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);

setupInput();

function setupInput() {
    window.addEventListener('keydown', handleInput, { once: true });
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);
}

async function handleInput(event) {
    switch (event.key) {
        case 'ArrowUp':
            if (!canMoveUp()) {
                setupInput();
                return;
            }
            await moveUp();
            break;
        case 'ArrowDown':
            if (!canMoveDown()) {
                setupInput();
                return;
            }
            await moveDown();
            break;
        case 'ArrowLeft':
            if (!canMoveLeft()) {
                setupInput();
                return;
            }
            await moveLeft();
            break;
        case 'ArrowRight':
            if (!canMoveRight()) {
                setupInput();
                return;
            }
            await moveRight();
            break;
        default:
            setupInput();
            return;
    }

    grid.cells.forEach((cell) => cell.mergeTiles());

    const newTile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = newTile;

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransirion(true).then(() => {
            alert('Game Over');
        });
        return;
    }

    setupInput();
}

function moveUp() {
    return slideTiles(grid.cellsByColumn);
}
function moveDown() {
    return slideTiles(grid.cellsByColumn.map((column) => [...column].reverse()));
}
function moveLeft() {
    return slideTiles(grid.cellsByRow);
}
function moveRight() {
    return slideTiles(grid.cellsByRow.map((row) => [...row].reverse()));
}

function slideTiles(cells) {
    return Promise.all(
        cells.flatMap((group) => {
            const promises = [];
            for (let i = 0; i < group.length; i++) {
                const cell = group[i];
                if (cell.tile == null) continue;
                let lastValidCell;
                for (let j = i - 1; j >= 0; j--) {
                    const moveToCell = group[j];
                    if (!moveToCell.canAccept(cell.tile)) break;
                    lastValidCell = moveToCell;
                }

                if (lastValidCell != null) {
                    promises.push(cell.tile.waitForTransirion());
                    if (lastValidCell.tile != null) {
                        lastValidCell.mergeTile = cell.tile;
                    } else {
                        lastValidCell.tile = cell.tile;
                    }
                    cell.tile = null;
                }
            }
            return promises;
        })
    );
}

function canMoveUp() {
    return canMove(grid.cellsByColumn);
}
function canMoveDown() {
    return canMove(grid.cellsByColumn.map((column) => [...column].reverse()));
}
function canMoveLeft() {
    return canMove(grid.cellsByRow);
}
function canMoveRight() {
    return canMove(grid.cellsByRow.map((row) => [...row].reverse()));
}

function canMove(cells) {
    return cells.some((group) => {
        return group.some((cell, index) => {
            if (index === 0) return false;
            if (cell.tile == null) return false;
            const moveToCell = group[index - 1];
            return moveToCell.canAccept(cell.tile);
        });
    });
}

let startX, startY, endX, endY;

function handleTouchStart(event) {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
}

function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    endX = touch.clientX;
    endY = touch.clientY;
    handleSwipe();
}

function handleSwipe() {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const swipeThreshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
            handleSwipeRight();
        } else {
            handleSwipeLeft();
        }
    } else if (Math.abs(deltaY) > swipeThreshold) {
        if (deltaY > 0) {
            handleSwipeDown();
        } else {
            handleSwipeUp();
        }
    }
}

async function handleSwipeUp() {
    if (!canMoveUp()) {
        return;
    }
    await moveUp();
    handleAfterMove();
}

async function handleSwipeDown() {
    if (!canMoveDown()) {
        return;
    }
    await moveDown();
    handleAfterMove();
}

async function handleSwipeLeft() {
    if (!canMoveLeft()) {
        return;
    }
    await moveLeft();
    handleAfterMove();
}

async function handleSwipeRight() {
    if (!canMoveRight()) {
        return;
    }
    await moveRight();
    handleAfterMove();
}

function handleAfterMove() {
    grid.cells.forEach((cell) => cell.mergeTiles());

    const newTile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = newTile;

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransirion(true).then(() => {
            alert('Game Over');
        });
    }
}
