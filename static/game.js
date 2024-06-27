// Breakout game for enviroments with Go and javascript
// (c) 2024 by moshix
// 
// initially created to have a fun game to play on powerful 
//  IBM z mainframes running z/OS
//  ... but it really runs anywhere
// v 0.1 humble beginnings
// v 0.2 web server and html canvas
// v 0.3 game logic
// v 0.4 colors!
// v 0.5 restart, pause and resume
// v 0.6 score keeping
// v 0.7 logic refinements
// v 0.8 rip out Pause
// v 0.9 make ball speed developer defined
// v 1.0 pause/unpause the game
// v 1.1 boss key

// Define version number
const version = "1.1.0";

// Developer-defined ball speed
const initialBallSpeed = 2;
let ballSpeed = initialBallSpeed;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleHeight = 10;
const paddleWidth = 100;
let paddleX = (canvas.width - paddleWidth) / 2;

const ballRadius = 10;
let x, y, dx, dy;
resetBall();

const brickRowCount = 5;
const brickColumnCount = 10;
const brickWidth =
  (canvas.width - 2 * 30 - (brickColumnCount - 1) * 10) / brickColumnCount; // 30px space on each side
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
function createBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}
createBricks();

let rightPressed = false;
let leftPressed = false;
let started = false;
let paused = false;
let bossKeyActive = false;
let score = 0;
let lives = 3;
let message = "";
let showMessage = false;

let speedIncreases = 0;
let speedDecreases = 0;
const maxSpeedAdjustments = 3;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Touch control buttons
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");

if (leftButton && rightButton) {
  leftButton.addEventListener("touchstart", () => {
    leftPressed = true;
    if (!started) {
      started = true;
      draw();
    }
  });
  leftButton.addEventListener("touchend", () => (leftPressed = false));
  rightButton.addEventListener("touchstart", () => {
    rightPressed = true;
    if (!started) {
      started = true;
      draw();
    }
  });
  rightButton.addEventListener("touchend", () => (rightPressed = false));
}

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  } else if (e.key == "Q" || e.key == "q") {
    gameOver(true);
  } else if (e.key == "R" || e.key == "r") {
    restartGame();
  } else if (e.key == "+" || e.key == "=") {
    increaseSpeed();
  } else if (e.key == "-" || e.key == "_") {
    decreaseSpeed();
  } else if (e.key == "P" || e.key == "p") {
    togglePause();
  } else if (e.key == "B" || e.key == "b") {
    toggleBossKey();
  } else if (!started) {
    started = true;
    draw();
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

function togglePause() {
  paused = !paused;
  if (!paused) {
    draw();
  } else {
    ctx.font = "48px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("PAUSED", canvas.width / 2 - 100, canvas.height / 2);
  }
}

function toggleBossKey() {
  const bossScreen = document.getElementById("bossScreen");
  bossKeyActive = !bossKeyActive;
  if (bossKeyActive) {
    paused = true;
    bossScreen.style.display = "block";
  } else {
    paused = false;
    bossScreen.style.display = "none";
    draw();
  }
}

function increaseSpeed() {
  if (speedIncreases < maxSpeedAdjustments) {
    ballSpeed *= 1.1;
    speedIncreases++;
    adjustBallSpeed();
  }
}

function decreaseSpeed() {
  if (speedDecreases < maxSpeedAdjustments) {
    ballSpeed /= 1.1;
    speedDecreases++;
    adjustBallSpeed();
  }
}

function adjustBallSpeed() {
  let angle = Math.atan2(dy, dx);
  dx = Math.sign(dx) * Math.abs(ballSpeed * Math.cos(angle));
  dy = Math.sign(dy) * Math.abs(ballSpeed * Math.sin(angle));
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status == 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score += (brickRowCount - r) * 100;
          if (score == brickRowCount * brickColumnCount * 300) {
            gameWon();
          }
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = getColorForRow(r);
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function getColorForRow(row) {
  switch (row) {
    case 0:
      return "#FF0000"; // Red for top layer
    case 1:
      return "#FF4500"; // Orange for second layer
    case 2:
      return "#FFA500"; // Orange for middle layer
    case 3:
      return "#FFD700"; // Yellow for fourth layer
    case 4:
      return "#FFFF00"; // Yellow for bottom layer
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Score: " + score + "  Speed: " + ballSpeed.toFixed(2), 8, 20); // Show ball speed next to score
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function drawMessage() {
  if (showMessage) {
    const messageParts = message.split(" ");
    const colors = ["red", "orange", "yellow"];
    const fontSize = 24;
    ctx.font = `${fontSize}px Arial`;
    let offsetX = 100;
    messageParts.forEach((part, index) => {
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillText(part, offsetX, canvas.height / 2);
      offsetX += ctx.measureText(part).width + 10;
    });
  }
}

function drawWalls() {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, canvas.height);
  ctx.moveTo(canvas.width, 0);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"; // Subdued color
  ctx.lineWidth = 2; // Thin line
  ctx.stroke();
}

function drawControls() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "24px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("Q to quit", canvas.width / 2 - 50, canvas.height / 2);
  ctx.fillStyle = "yellow";
  ctx.fillText("R to restart", canvas.width / 2 - 60, canvas.height / 2 + 30);
  ctx.fillStyle = "cyan"; // Change color from green to cyan
  ctx.fillText("+ to speed up", canvas.width / 2 - 60, canvas.height / 2 + 60);
  ctx.fillText("- to slow down", canvas.width / 2 - 70, canvas.height / 2 + 90);
  ctx.fillStyle = "white";
  ctx.fillText(
    "P to pause/resume",
    canvas.width / 2 - 80,
    canvas.height / 2 + 120,
  );
  ctx.fillText(
    "B for boss key",
    canvas.width / 2 - 80,
    canvas.height / 2 + 150,
  );
}

function draw() {
  if (paused || bossKeyActive) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWalls(); // Draw the walls
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  drawMessage();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      lives--;
      if (lives <= 0) {
        gameOver(false);
      } else {
        resetBall();
        paddleX = (canvas.width - paddleWidth) / 2;
        message = "You just lost one ball";
        showMessage = true;
        setTimeout(() => {
          showMessage = false;
        }, 2000);
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;

  if (started) {
    requestAnimationFrame(draw);
  }
}

function resetBall() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = ballSpeed;
  dy = -ballSpeed;
}

function submitScore(player, score) {
  fetch("/update-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ player, score }),
  });
}

function gameOver(quit) {
  submitScore("Player1", score); // Replace "Player1" with actual player identifier
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "48px Arial";
  ctx.fillStyle = "#FFFFFF";
  if (quit) {
    ctx.fillText("QUIT", canvas.width / 2 - 50, canvas.height / 2 - 50);
  } else {
    ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2 - 50);
  }
  ctx.fillText(
    "Score: " + score,
    canvas.width / 2 - 100,
    canvas.height / 2 + 50,
  );
  ctx.fillText(
    "Press R to restart",
    canvas.width / 2 - 150,
    canvas.height / 2 + 100,
  );
  started = false;
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
}

function gameWon() {
  submitScore("Player1", score); // Replace "Player1" with actual player identifier
  alert("YOU WIN, CONGRATS!");
  document.location.reload();
}

function restartGame() {
  score = 0;
  lives = 3;
  rightPressed = false;
  leftPressed = false;
  started = false;
  ballSpeed = initialBallSpeed; // Reset ball speed
  speedIncreases = 0;
  speedDecreases = 0;
  paused = false;
  bossKeyActive = false;
  createBricks();
  resetBall();
  drawControls();
}

// Set the version number dynamically
document.getElementById("version").innerText = "Version: " + version;

// Show controls before starting the game
drawControls();
