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
// v 1.2 now with sound!
// v 1.3 randomizer for first ball direction
// v 1.3.2 fix help text
// v 1.4 Add timer to see how fast the player wins
// v 1.4.1 beautify GAMME OVER screen
// v 1.4.2 change Game Won messagging
// v 1.4.3 fix timer out of sight issue
// v 1.5.0-6 random spoiler tribulations
// v 1.6.0 random housefly
// v 1.7.0 bezier curves for housefly 
// v 1.8.0 housefly sound
// v 1.8.1-2 various bug fixes
// v 1.9   hamburger
// v 2.0   hamburger and hotdog sounds
// v 2.1   ied for extra points!

// Define version number
const version = "2.1.3";

// spoiler hotdog (graphic=hotdog)
const flyingGraphic = new Image();
flyingGraphic.src = 'flying.svg'; // Path to hotdog

flyingGraphic.onload = function() {
            console.log('Flying graphic loaded');
};

flyingGraphic.onerror = function() {
            console.error('Error loading flying graphic');
};
let graphicWidth = 50 * 1.3; // Increase size by 30%
let graphicHeight = 50 * 1.3; // Increase size by 30%
let graphicX, graphicY;
let graphicSpeed = 2;
let graphicDirection = 1; // 1 for right, -1 for left
let graphicActive = false;
let lastGraphicTime = 0;
const graphicMinInterval = 11000; // Minimum interval in milliseconds (30 seconds)


//-------------------------------------------------------------
// hamburger graphic burgerGraphic
const burgerGraphic = new Image();
burgerGraphic.src = 'hamburger.svg'; // Path to hamburger

burgerGraphic.onload = function() {
            console.log('Hamburger loaded');
};

burgerGraphic.onerror = function() {
            console.error('Error loading hamburger graphic');
};
let burgerWidth = 50 * 1.5; // Increase size by 50%
let burgerHeight = 50 * 1.5; // Increase size by 50%
let burgerX, burgerY;
let burgerSpeed = 1;
let burgerDirection = 1; // 1 for right, -1 for left
let burgerActive = false;
let lastBurgerTime = 0;
const burgerMinInterval = 12000; // Minimum interval in milliseconds (30 seconds)
const foodSound = new Audio('burgerhit.wav');
foodSound.load();
foodSound.volume = 0.3;
//-------------------------------------------------------------

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// ied 
const iedGraphic = new Image();
iedGraphic.src = 'ied.svg'; // Path to hamburger

iedGraphic.onload = function() {
            console.log('IED loaded');
};

iedGraphic.onerror = function() {
            console.error('Error loading IED  graphic');
};
let iedWidth = 50 * 1.1; 
let iedHeight = 50 * 1.1;
let iedX, iedY;
let iedSpeed = 5;
let iedDirection = 1; // 1 for right, -1 for left
let iedActive = false;
let lastIedTime = 0;
const iedMinInterval = 28000; // Minimum interval in milliseconds (30 seconds)
const iedSound = new Audio('explosion.mp3');
iedSound.load();
iedSound.volume = 0.9;
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@




// housefly effect
// Load the housefly sound
const houseflySound = new Audio('mosquito.mp3'); // Ensure the path is correct
houseflySound.load();
// Set volume to half
houseflySound.volume = 0.1;



const houseflyGraphic = new Image();
houseflyGraphic.src = 'housefly.svg'; // Ensure this path is correct

houseflyGraphic.onload = function() {
  //  console.log('Housefly loaded successfully');
};

houseflyGraphic.onerror = function() {
    console.error('Error loading housefly ');
};

const houseflyDuration = 5300; // Duration in milliseconds (4 seconds)
let houseflyAngle = 0;
let houseflyX, houseflyY;
let houseflyWidth = 50; // Adjust size as needed
let houseflyHeight = 50; // Adjust size as needed
let houseflySpeed = 1;
let houseflyFrameCount = 0; // Frame counter for controlling housefly speed
const houseflyFrameDelay = 2; // Move the housefly every 5 frames
let houseflyActive = false;
let houseflyFlightPath = [];
let houseflyFlightIndex = 0;
let lastHouseflyTime = 0;

const houseflyMinInterval = 19000; // Minimum interval prime number to not interfere often with hotdog







// Developer-defined ball speed
const initialBallSpeed = 4.1;
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

// load paddle hit sound
const paddleHitSound = new Audio('hit.wav');
const brickHitSound  = new Audio('brick.wav');
const finishedSound  = new Audio('finished.waw');
const lostSound      = new Audio('lost.waw');
const ballGoneSound =  new Audio('ballgone.wav');
const startSound =     new Audio('start.mp3');


// timer variables
let startTime = 0;
let elapsedTime = 0;



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
playSoundWithLimit(startSound, 800);
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
     startTime = Date.now(); // Start the timer
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
          // make a short sound so that it can play for repetive collions
          playSoundWithLimit(brickHitSound, 160); // Play sound for 200 ms
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
  ctx.textAlign = "left"; // Align text to the left
//  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
  ctx.fillText("Lives: " + lives + "  Time: " + elapsedTime.toFixed(2) + "s", canvas.width - 200, 20);
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
 playSoundWithLimit(startSound, 1300);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "24px Arial";
  ctx.fillStyle = "red";
  ctx.fillText("Q to quit", canvas.width / 2 - 80, canvas.height / 2);
  ctx.fillStyle = "yellow";
  ctx.fillText("R to restart", canvas.width / 2 - 80, canvas.height / 2 + 30);
  ctx.fillStyle = "cyan"; // Change color from green to cyan
  ctx.fillText("+ to speed up", canvas.width / 2 - 80, canvas.height / 2 + 60);
  ctx.fillText("- to slow down", canvas.width / 2 - 80, canvas.height / 2 + 90);
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
  ctx.fillStyle = "#A7C7E7";
  ctx.fillText(
    "Hotdog, burgers and bombs for more points",
    canvas.width / 2 - 80,
    canvas.height / 2 + 180,
  );
  ctx.fillStyle = "#FF00FF"; // Bright purple color
  ctx.fillText("(c) 2024 by hotdog studios", canvas.width / 2 - 80, canvas.height / 2 + 240);
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
  drawGraphic();  // Draw the hotdog
  drawBurger();   // Draw the burger
  drawIed();      // Draw the IED
  drawHousefly(); // Draw the housefly
  collisionDetection();
  checkGraphicCollision(); // Check for collisions with the hotdog
  checkBurgerCollision();  // and the burger
  checkIedCollision();
  moveGraphic(); // Move the hotdog
  moveBurger();  // move the burger
  moveIed();
  moveHousefly(); // Move the housefly

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
       paddleHitSound.play(); // Play sound when the ball hits the paddle
    } else {
      lives--;
      playSoundWithLimit(ballGoneSound,700); // ball lost
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
    elapsedTime = (Date.now() - startTime) / 1000; // Update elapsed tim
    activateGraphic();  // Randomly activate the hotdog
    activateBurger();   // Randomly activate the burger
    activateIed();
    activateHousefly(); // Check and activate the housefly
    requestAnimationFrame(draw);
  }
}

function resetBall() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = ballSpeed;
  dy = -ballSpeed;
  setRandomInitialDirection(); // Set a random initial direction for the ball
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
  elapsedTime = (Date.now() - startTime) / 1000; // Calculate elapsed time in seconds	
  playSoundWithLimit(lostSound,1000);
  submitScore("Player1", score); // Replace "Player1" with actual player identifier
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "48px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center"; // Center align text
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
  ctx.fillStyle = "CYAN";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = "ORANGE";
  ctx.fillText("Time: " + elapsedTime.toFixed(2) + "s", canvas.width / 2, canvas.height / 2 + 50);
  ctx.fillStyle = "RED";
   ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 100);
   if (quit) {
       ctx.fillText("QUIT", canvas.width / 2, canvas.height / 2 + 150);
    }
  started = false;
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
}

// Function to play sound with limited duration
function playSoundWithLimit(audioElement, duration) {
    audioElement.pause();
    audioElement.currentTime = 0; // Reset to start
    audioElement.play().then(() => {
        setTimeout(() => {
            audioElement.pause();
            audioElement.currentTime = 0; // Reset to start
        }, duration);
    }).catch((error) => {
        console.error('Error playing audio:', error);
    });
}


//player finished the game
function gameWon() {
  playSoundWithLimit(finishedSound, 1000);       // Play sound when the ball hits the paddle
  submitScore("Player1", score);                 // Replace "Player1" with actual player identifier
  elapsedTime = (Date.now() - startTime) / 1000; // Calculate elapsed time in seconds
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "48px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center"; 
  ctx.fillText("CONGRATS! You finished!", canvas.width / 2, canvas.height / 2 - 50);
  ctx.fillStyle = "ORANGE";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = "CYAN";
  ctx.fillText("Time: " + elapsedTime.toFixed(2) + "s", canvas.width / 2, canvas.height / 2 + 50);
  ctx.fillStyle = "RED";
  ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 100);
  started = false;
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);
}



// Function to set a random initial direction for the ball
function setRandomInitialDirection() {
    const angle = Math.random() * Math.PI / 1.7 + Math.PI / 4.2; // Random angle between 27 and 135 degrees
    dx = ballSpeed * Math.cos(angle);
    dy = -ballSpeed * Math.sin(angle);
}



// spoiler hotdog moving


// hotdog drawing
function drawGraphic() {
    if (graphicActive) {
  //      console.log('Drawing HOTDOG at:', graphicX, graphicY, graphicWidth, graphicHeight);
        ctx.drawImage(flyingGraphic, graphicX, graphicY, graphicWidth, graphicHeight);
    }
}


function activateGraphic() {
    if (allBricksCleared()) return;

    const currentTime = Date.now();
    if (currentTime - lastGraphicTime >= graphicMinInterval) {
        graphicActive = true;
        lastGraphicTime = currentTime; // Update last activation time
        graphicY = canvas.height / 2; // Set Y position to the middle
        if (Math.random() < 0.5) {
            graphicX = -graphicWidth; // Start from the left
            graphicDirection = 1;
        } else {
            graphicX = canvas.width; // Start from the right
            graphicDirection = -1;
        }
    }
}

function moveGraphic() {
    if (graphicActive) {
        graphicX += graphicSpeed * graphicDirection;
        if (graphicDirection === 1 && graphicX > canvas.width) {
            graphicActive = false;
        } else if (graphicDirection === -1 && graphicX < -graphicWidth) {
            graphicActive = false;
        }
    }
}

// are we hitting the hotdog ?
function checkGraphicCollision() {
    if (graphicActive && 
        x > graphicX && 
        x < graphicX + graphicWidth && 
        y > graphicY && 
        y < graphicY + graphicHeight) {
        dy = -dy; // Deflect the ball
        playSoundWithLimit(foodSound, 270); // Play sound for 260 ms
        score +=  2500
    }
}



function activateHousefly() {
    if (allBricksCleared()) return;

    const currentTime = Date.now();
    if (currentTime - lastHouseflyTime >= houseflyMinInterval) {
        houseflyActive = true;
        houseflyFlightPath = generateSmoothFlightPath();
        houseflyFlightIndex = 0;
        const initialPoint = houseflyFlightPath[houseflyFlightIndex];
        houseflyX = initialPoint.x;
        houseflyY = initialPoint.y;
        lastHouseflyTime = currentTime; // Update last activation time
//        console.log('Housefly activated at:', houseflyX, houseflyY); // Log the initial position

        // Play the housefly sound
        houseflySound.currentTime = 0; // Reset sound to start
        houseflySound.loop = true; // Loop the sound
        houseflySound.play().then(() => {
            console.log('Housefly sound playing');
        }).catch((error) => {
            console.error('Error playing housefly sound:', error);
        });

        // Stop the housefly sound and deactivate the housefly after houseflyDuration
        setTimeout(() => {
            houseflySound.pause();
            houseflyActive = false;
            console.log('Housefly sound paused and housefly deactivated after', houseflyDuration / 1000, 'seconds');
        }, houseflyDuration);
    }
}

function moveHousefly() {
    if (houseflyActive) {
        houseflyFrameCount++;
        if (houseflyFrameCount % houseflyFrameDelay === 0) { // Move every houseflyFrameDelay frames for smoother movement
            if (houseflyFlightIndex < houseflyFlightPath.length) {
                const target = houseflyFlightPath[houseflyFlightIndex];
                const dx = target.x - houseflyX;
                const dy = target.y - houseflyY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Calculate the angle of movement
                houseflyAngle = Math.atan2(dy, dx);

                // Ensure speed affects the movement directly
                if (distance > houseflySpeed) {
                    houseflyX += (dx / distance) * houseflySpeed;
                    houseflyY += (dy / distance) * houseflySpeed;
                } else {
                    houseflyX = target.x;
                    houseflyY = target.y;
                    houseflyFlightIndex++;
                }
 //               console.log('Housefly moving to:', houseflyX, houseflyY, 'Angle:', houseflyAngle); // Log the updated position and angle
            } else {
                houseflyActive = false; // Deactivate the housefly when it completes the flight path
                houseflySound.pause();
  //              console.log('Housefly sound paused and housefly deactivated');
            }
        }
    }
}


function generateSmoothFlightPath() {
    const path = [];
    const numPoints = 100; // Number of points in the path
    const amplitude = 50; // Amplitude of the sine wave
    const frequency = 0.1; // Frequency of the sine wave
    let startX = Math.random() * canvas.width;
    let startY = Math.random() * canvas.height;
    
    for (let i = 0; i < numPoints; i++) {
        const x = startX + i * 10;
        const y = startY + amplitude * Math.sin(frequency * i);
        path.push({ x: x % canvas.width, y: (y % canvas.height + canvas.height) % canvas.height });
    }
    
//    console.log('Generated housefly path:', path); // Log the generated path
    return path;
}



function drawHousefly() {
    if (houseflyActive) {
//        console.log('Drawing housefly at:', houseflyX, houseflyY, houseflyWidth, houseflyHeight);

        ctx.save(); // Save the current context state
        ctx.translate(houseflyX, houseflyY); // Move the origin to the housefly's position
        ctx.rotate(houseflyAngle); // Rotate the context to the housefly's angle
        ctx.drawImage(houseflyGraphic, -houseflyWidth / 2, -houseflyHeight / 2, houseflyWidth, houseflyHeight); // Draw the housefly centered at the new origin
        ctx.restore(); // Restore the context to its original state
    }
}


//burger graphics here DONE!

function activateBurger() {
    if (allBricksCleared()) return; //don't draw if game over

    const currentTime = Date.now();
    if (currentTime - lastBurgerTime >= burgerMinInterval) {
        burgerActive = true;
        lastBurgerTime = currentTime; // Update last activation time
        burgerY = canvas.height / 3; // Set Y position quarter
        if (Math.random() < 0.5) {
            burgerX = -burgerWidth; // Start from the left
            burgerDirection = 1;
        } else {
            burgerX = canvas.width; // Start from the right
            burgerDirection = -1;
        }
    }
}

// burger moving  DONE!

function moveBurger() {

    if (burgerActive) {
        burgerX += burgerSpeed * burgerDirection;
        if (burgerX > canvas.width || burgerX < -burgerWidth) {
            burgerActive = false; // Deactivate the burger
        }
    }
}


// burger DONE!
function drawBurger() {
    if (burgerActive) {
       // console.log('Drawing burger  at:', burgerX, burgerY, burgerWidth, burgerHeight);
        ctx.drawImage(burgerGraphic, burgerX, burgerY, burgerWidth, burgerHeight);
    }
}

//hitting a burger?? DONE!
function checkBurgerCollision() {
    if (burgerActive && 
        x > burgerX && 
        x < burgerX + burgerWidth && 
        y > burgerY && 
        y < burgerY + burgerHeight) {
        dy = -dy; // Deflect the ball
        playSoundWithLimit(foodSound, 270); // Play sound for 260 ms
        score +=  5000  
    }
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// IED

function activateIed() {
    if (allBricksCleared()) return; //don't draw if game over

    const currentTime = Date.now();
    if (currentTime - lastIedTime >= iedMinInterval) {
        iedActive = true;
        lastIedTime = currentTime; // Update last activation time
        iedY = canvas.height / 8; // Set Y position quarter
        if (Math.random() < 0.5) {
            iedX = -iedWidth; // Start from the left
            iedDirection = 1;
        } else {
            iedX = canvas.width; // Start from the right
            iedDirection = -1;
        }
    }
}



function moveIed() {

    if (iedActive) {
        iedX += iedSpeed * iedDirection;
        if (iedX > canvas.width || iedX < -iedWidth) {
            iedActive = false; // Deactivate the ied
        }
    }
}


// 
function drawIed() {
    if (iedActive) {
        //console.log('Drawing ied  at:', iedX, iedY, iedWidth, iedHeight);
        ctx.drawImage(iedGraphic, iedX, iedY, iedWidth, iedHeight);
    }
}

//hitting an IED??
function checkIedCollision() {
    if (iedActive &&
        x > iedX &&
        x < iedX + iedWidth &&
        y > iedY &&
        y < iedY + iedHeight) {
        dy = -dy; // Deflect the ball
        playSoundWithLimit(iedSound, 2400); 
        score +=  10000
    }
}

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


//---------------------------------------------------------------------
function allBricksCleared() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                return false;
            }
        }
    }
    return true;
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
