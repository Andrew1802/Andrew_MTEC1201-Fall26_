/*
  Andrew L.
  Simple Shot
  A Close up of a Basketball dropping through a hoop with a gentle windforce and large flag indicator
  Clicking the ball rack picks up a new ball instantly while letting your previous shot finish its bounce sequence.
*/

// Fence Image
let fenceImg;

// Fence Size
let fenceTileWidth = 250;
let fenceTileHeight = 220;
let fenceYPosition = 80;

// Rack Layout
let rackBallOffsets = [30, 90, 150, 210, 270];

// Wind Visuals
let windStreakHeights = [180, 210, 240];

// Active Ball
let ballX = 350;
let ballY = 410;
let speedX = 0;
let speedY = 0;
let ballAngle = 0;
let spinSpeed = 0.08;
let isShot = false;
let bounceCount = 0;
let hasScoredThisShot = false;

// Motion Trail
let ballTrail = [];          
const TRAIL_LENGTH = 10;     

// background legacy ball
let legacyX = -100;
let legacyY = -100;
let legacySpeedX = 0;
let legacySpeedY = 0;
let legacyAngle = 0;
let legacySpinSpeed = 0;
let legacyBounceCount = 0;
let isLegacyActive = false;

// Physics
let gravityValue = 0.4;
let scoreCount = 0;

// Windforce
const WIND_MIN = -0.025;
const WIND_MAX = 0.025;
let windForce = 0;

// Timer
let startTime;
let totalTimeLimit = 45;
let timePausedAt = 0;

// Game State
let isGameOver = false;
let gameStarted = false;
let gameWon = false;
let needsNewBall = false;  

// Visuals
let rimFlash = 0;       
let clickTimeout;       
let niceTextTimer = 0; 

// Score Indicator Loop
let scoreLoopTimer = 0;
const SCORE_LOOP_DURATION = 100;
const SCORE_LOOP_CYCLES = 3;
const SCORE_ORBIT_RADIUS = 52;
const SCORE_ARC_SPAN = 1.9;

function setup() {
  createCanvas(1150, 750);
  loadImage('fence.png',
    function(img) { fenceImg = img; },
    function() { fenceImg = null; }
  );
  windForce = randomWind();
}

function draw() {
  background(220, 240, 255);

  // Park Court
  fill(255, 225, 120);
  noStroke();
  rect(0, 290, width, 15);

  // Court Gradient 
  noStroke();
  for (let y = 300; y < 750; y += 2) {
    let t = (y - 300) / 450;             
    fill(lerp(110, 50, t),            
         lerp(116, 53, t),               
         lerp(128, 60, t));              
    rect(0, y, width, 2);
  }

  fill(70, 175, 90);
  rect(0, 300, width, 12);
  rect(0, 735, width, 15);

  // Fence Image Fixing
  if (fenceImg) {
    for (let x = 0; x < width; x += fenceTileWidth) {
      image(fenceImg, x, fenceYPosition, fenceTileWidth, fenceTileHeight);
    }
  }

  // Court Lines
  stroke(255);
  strokeWeight(5);
  noFill();

  line(10, 312, 10, 735);
  line(1140, 312, 1140, 735);

  rect(560, 435, 580, 160);
  arc(560, 515, 140, 160, HALF_PI, -HALF_PI);

  stroke(255, 255, 255, 100);
  arc(560, 515, 140, 160, -HALF_PI, HALF_PI);
  stroke(255);

  arc(1140, 523.5, 1750, 423, HALF_PI, -HALF_PI);

  // Basketball Rack
  let rackTopY = 345;
  let rackBotY = 705;

  // Rack Base
  stroke(20);
  strokeWeight(9);
  line(12, rackBotY, 88, rackBotY);
  stroke(80);
  strokeWeight(4);
  ellipse(20, rackBotY + 4, 10, 10);
  ellipse(80, rackBotY + 4, 10, 10);

  // Outer Frame
  stroke(40);
  strokeWeight(7);
  line(25, rackTopY, 25, rackBotY);
  line(75, rackTopY, 75, rackBotY);

  // Guide Rails
  stroke(160);
  strokeWeight(3.5);
  line(34, rackTopY, 34, rackBotY - 15);
  line(66, rackTopY, 66, rackBotY - 15);

  // Support Bars
  stroke(50);
  strokeWeight(4);
  line(25, rackTopY + 125, 75, rackTopY + 125);
  line(25, rackTopY + 250, 75, rackTopY + 250);
  line(25, rackBotY - 45, 75, rackBotY - 45);

  // Cross Brace
  stroke(40);
  strokeWeight(6);
  line(25, rackTopY, 75, rackTopY);

  // Basketball in the Rack
  let drawVerticalRackBall = function(bx, by) {
    noStroke();
    fill(0, 0, 0, 40);
    ellipse(bx + 2, by + 2, 38, 38);

    stroke(0);
    strokeWeight(1.8);
    fill(240, 105, 25);
    ellipse(bx, by, 36, 36);

    stroke(30);
    strokeWeight(1.5);
    noFill();
    line(bx - 18, by, bx + 18, by);
    line(bx, by - 18, bx, by + 18);
    bezier(bx - 15, by - 9, bx - 8, by - 4, bx + 8, by - 4, bx + 15, by - 9);
    bezier(bx - 15, by + 9, bx - 8, by + 4, bx + 8, by + 4, bx + 15, by + 9);
  };

  // Stack 5 Basketballs in the rack
  for (let i = 0; i < rackBallOffsets.length; i++) {
    drawVerticalRackBall(50, rackTopY + rackBallOffsets[i]);
  }

  // Text HUD
  fill(40);
  noStroke();
  textSize(24);
  textFont('sans-serif');
  textAlign(LEFT);
  text("Shots Made: " + scoreCount, 40, 45);

  // Timer Loop
  let timeLeft;
  if (!isGameOver && gameStarted) {
    let elapsedTime = (millis() - startTime) / 1000;
    timeLeft = totalTimeLimit - elapsedTime;

    if (timeLeft <= 0) {
      timeLeft = 0;
      isGameOver = true;
      gameWon = false;
    }
    timePausedAt = timeLeft;
  } else if (!gameStarted) {
    timeLeft = totalTimeLimit;
  } else {
    timeLeft = timePausedAt;
  }

  let minutes = floor(timeLeft / 60);
  let seconds = floor(timeLeft % 60);
  let formattedTime = minutes + ":" + nf(seconds, 2);

  fill(50);
  text("Time: " + formattedTime, 300, 45);

  // Nice! Text
  if (niceTextTimer > 0 && !isGameOver && gameStarted) {
    push();
    textAlign(RIGHT, TOP);
    textSize(26);
    textFont('sans-serif');
    // Fade out 
    let textAlpha = map(niceTextTimer, 0, 90, 0, 255);
    fill(46, 204, 113, textAlpha); 
    text("Nice!", width - 40, 25);
    pop();
    niceTextTimer--; 
  }

  // Wind Strength 
  let windRatio = windForce / WIND_MAX;

  // Ambient Wind Particles
  stroke(255, 255, 255, 80);
  strokeWeight(2);
  for (let i = 0; i < windStreakHeights.length; i++) {
    let y = windStreakHeights[i];
    let xStart = 450 + (frameCount * 2) % 400;
    let particleLength = windRatio * 90;
    line(xStart, y, xStart + particleLength, y);
  }

  // Wind Flag
  let flagPoleX = 350;
  let flagPoleY = 150;

  stroke(100);
  strokeWeight(6);
  line(flagPoleX, flagPoleY, flagPoleX, flagPoleY + 140);
  fill(60);
  noStroke();
  ellipse(flagPoleX, flagPoleY, 10, 10);

  // Flag Cloth
  stroke(40);
  strokeWeight(2);
  fill(231, 76, 60);

  // Flag reading wind speed strength
  let flagStretchWidth = windRatio * 45;

  beginShape();
  vertex(flagPoleX, flagPoleY + 10);
  vertex(flagPoleX + flagStretchWidth, flagPoleY + 30 + sin(frameCount * 0.15) * 6);
  vertex(flagPoleX, flagPoleY + 60);
  endShape(CLOSE);

  // Rear Wall
  stroke(100);
  strokeWeight(4);
  fill(160);
  rect(1120, 150, 30, 120);
  ellipse(1120, 170, 8, 8);
  ellipse(1120, 240, 8, 8);

  // Backboard Design
  stroke(60);
  strokeWeight(5);
  fill(255);
  rect(930, 70, 190, 260);

  stroke(40);
  strokeWeight(3);
  noFill();

  line(931, 113, 1119, 113);
  line(931, 143, 1119, 143);
  line(931, 270, 1119, 270);
  line(931, 300, 1119, 300);

  stroke(40);
  strokeWeight(4);
  rect(982, 178, 86, 65);

  stroke(210);
  strokeWeight(2);
  rect(939, 79, 172, 242);

  // Hoop
  fill(40);
  noStroke();
  rect(908, 230, 22, 18);

  // Net
  stroke(255);
  strokeWeight(2.5);
  noFill();

  line(775, 239, 788, 300);
  line(795, 239, 803, 300);
  line(813, 239, 819, 300);
  line(833, 239, 836, 300);
  line(851, 239, 851, 300);
  line(871, 239, 868, 300);
  line(891, 239, 885, 300);
  line(904, 239, 901, 300);

  line(775, 239, 901, 300);
  line(911, 239, 788, 300);

  arc(843, 261, 100, 13, 0, PI);
  arc(847, 283, 68, 10, 0, PI);
  arc(847, 299, 46, 7, 0, PI);

  // Physics Ball
  if (isShot == true && !isGameOver && gameStarted) {
    speedY = speedY + gravityValue;
    speedX = speedX + windForce;
    ballX = ballX + speedX;
    ballY = ballY + speedY;
    ballAngle += spinSpeed;

    // Motion Trail
    ballTrail.push({ x: ballX, y: ballY });
    if (ballTrail.length > TRAIL_LENGTH) {
      ballTrail.shift();
    }

    // Backboard Collision
    if (ballX + 35 > 930 && ballY > 70 && ballY < 330) {
      ballX = 930 - 35;
      speedX = -speedX * 0.6;
      spinSpeed = -spinSpeed * 0.5;
    }

    // Ground Bounce
    if (ballY + 35 >= 735 && speedY > 0) {
      bounceCount++;
      if (bounceCount > 1) {
        endShot();
      } else {
        ballY = 735 - 35;
        speedY = -speedY * 0.55;
        speedX = speedX * 0.8;
        spinSpeed *= 0.6;
      }
    }
  }

  // Physics background ball
  if (isLegacyActive) {
    legacySpeedY = legacySpeedY + gravityValue;
    legacySpeedX = legacySpeedX + windForce;
    legacyX = legacyX + legacySpeedX;
    legacyY = legacyY + legacySpeedY;
    legacyAngle += legacySpinSpeed;

    // Backboard collision for background legacy ball
    if (legacyX + 35 > 930 && legacyY > 70 && legacyY < 330) {
      legacyX = 930 - 35;
      legacySpeedX = -legacySpeedX * 0.6;
      legacySpinSpeed = -legacySpinSpeed * 0.5;
    }

    // Ground bounce for background legacy ball
    if (legacyY + 35 >= 735 && legacySpeedY > 0) {
      legacyBounceCount++;
      if (legacyBounceCount > 1) {
        isLegacyActive = false;
      } else {
        legacyY = 735 - 35;
        legacySpeedY = -legacySpeedY * 0.55;
        legacySpeedX = legacySpeedX * 0.8;
        legacySpinSpeed *= 0.6;
      }
    }

    // Despawn if out of bounds
    if (legacyY > 850 || legacyX < -50 || legacyX > width + 50) {
      isLegacyActive = false;
    }
  }

  // Aiming Indicator 
  if (!isGameOver && gameStarted && !needsNewBall) {
    noStroke();
    fill(100, 150, 255, 120);
    ellipse(mouseX, mouseY, 20, 20);
  }

  // Pickup text after a shot ends
  if (needsNewBall && gameStarted && !isGameOver) {
    let pulse = 140 + sin(frameCount * 0.12) * 70;

    noFill();
    stroke(46, 204, 113, pulse);
    strokeWeight(3);
    rect(10, 335, 80, 380, 10);
  }

  // Rim Trigger 
  if (isShot && speedY > 0 && ballX > 783 && ballX < 903 && ballY > 213 && ballY < 248) {
    if (hasScoredThisShot == false) {
      scoreCount = scoreCount + 1;
      hasScoredThisShot = true;
      rimFlash = 255;
      niceTextTimer = 90; 
      scoreLoopTimer = SCORE_LOOP_DURATION; 

      if (scoreCount >= 10) {
        isGameOver = true;
        gameWon = true;
      }
    }
    speedX = speedX * 0.1;
    speedY = 5;
  }

  // Reset if active ball goes out of bounds 
  if (isShot && (ballY > 850 || ballX < -50 || ballX > width + 50)) {
    endShot();
  }

  // Draw Legacy Ball if active
  if (isLegacyActive) {
    push();
    translate(legacyX, legacyY);
    rotate(legacyAngle);
    stroke(0);
    strokeWeight(2.5);
    fill(245, 110, 30);
    ellipse(0, 0, 70, 70);
    noFill();
    strokeWeight(2);
    line(-35, 0, 35, 0);
    line(0, -35, 0, 35);
    bezier(-30, -18, -16, -8, 16, -8, 30, -18);
    bezier(-30, 18, -16, 8, 16, 8, 30, 18);
    pop();
  }

  // Ball Motion Trail 
  if (ballTrail.length > 0) {
    push();
    noStroke();
    for (let i = 0; i < ballTrail.length; i++) {
      let t = (i + 1) / ballTrail.length;  
      let size = 70 * (0.55 + 0.35 * t);
      fill(245, 110, 30, 90 * t);
      ellipse(ballTrail[i].x, ballTrail[i].y, size, size);
    }
    pop();
  }

  // Primary Ball
  if (!needsNewBall || scoreLoopTimer > 0) {
    push();
    translate(ballX, ballY);
    rotate(ballAngle);
    stroke(0);
    strokeWeight(2.5);
    fill(245, 110, 30);
    ellipse(0, 0, 70, 70);
    noFill();
    strokeWeight(2);
    line(-35, 0, 35, 0);
    line(0, -35, 0, 35);
    bezier(-30, -18, -16, -8, 16, -8, 30, -18);
    bezier(-30, 18, -16, 8, 16, 8, 30, 18);
    pop();
  }

  // Rim
  stroke(240, 60, 40);
  strokeWeight(9);
  noFill();
  line(775, 239, 911, 239);

  // Swish Glow Effect 
  if (rimFlash > 0) {
    stroke(255, 255, 0, rimFlash);
    strokeWeight(12);
    line(775, 239, 911, 239);
    rimFlash -= 15;
  }

  // Score Indicator Loop 
  drawScoreIndicator();

  // Start Game / Game Over Overlays
  if (!gameStarted || isGameOver) {
    fill(0, 0, 0, 160);
    noStroke();
    rect(0, 0, width, height);

    // Box Layout
    let boxWidth = 650;
    let boxHeight = 220;
    let boxX = width / 2 - boxWidth / 2;
    let boxY = height / 2 - boxHeight / 2;

    // White Box
    fill(255);
    stroke(0);
    strokeWeight(3);
    rect(boxX, boxY, boxWidth, boxHeight);

    // Reset settings 
    textAlign(CENTER, CENTER);
    textFont('sans-serif');
    noStroke();

    if (!gameStarted) {
      fill(0);
      textSize(36);
      text("SIMPLE SHOT", width / 2, boxY + 50);

      textSize(18);
      text("Make 10 shots to win and pay attention to wind direction", width / 2, boxY + 110);

      textSize(16);
      fill(0, 150, 0);
      text("Play Again", width / 2, boxY + 165);
    } else if (isGameOver) {
      textSize(40);
      if (gameWon) {
        fill(0, 150, 0);
        text("WINNER", width / 2, boxY + 50);
      } else {
        fill(200, 0, 0);
        text("GAME OVER", width / 2, boxY + 50);
      }

      textSize(20);
      fill(0);
      text("Final Score: " + scoreCount + " baskets", width / 2, boxY + 115);

      textSize(16);
      fill(100);
      text("Play Again", width / 2, boxY + 165);
    }
  }
}

// Looping green arc that rotates the scored ball
function drawScoreIndicator() {
  if (scoreLoopTimer <= 0) return;

  let progress = 1 - scoreLoopTimer / SCORE_LOOP_DURATION; 
  let fadeIn = constrain(progress * 8, 0, 1);
  let fadeOut = scoreLoopTimer < 20 ? scoreLoopTimer / 20 : 1;
  let alpha = 255 * fadeIn * fadeOut;

  // Arc rotation
  let rotation = progress * TWO_PI * SCORE_LOOP_CYCLES;

  push();
  translate(ballX, ballY);
  noFill();

  // Faint full ring around the ball
  stroke(46, 204, 113, alpha * 0.2);
  strokeWeight(8);
  ellipse(0, 0, SCORE_ORBIT_RADIUS * 2, SCORE_ORBIT_RADIUS * 2);

  // Main green arc
  stroke(46, 204, 113, alpha * 0.85);
  strokeWeight(5);
  arc(0, 0, SCORE_ORBIT_RADIUS * 2, SCORE_ORBIT_RADIUS * 2, rotation, rotation + SCORE_ARC_SPAN);

  // Bright leading edge
  stroke(130, 255, 175, alpha);
  strokeWeight(7);
  arc(0, 0, SCORE_ORBIT_RADIUS * 2, SCORE_ORBIT_RADIUS * 2, rotation, rotation + 0.6);

  // Head dot at the leading edge
  let headX = cos(rotation + 0.6) * SCORE_ORBIT_RADIUS;
  let headY = sin(rotation + 0.6) * SCORE_ORBIT_RADIUS;
  noStroke();
  fill(130, 255, 175, alpha);
  ellipse(headX, headY, 10, 10);

  pop();

  scoreLoopTimer--;
}

function mousePressed() {
  if (!gameStarted || isGameOver) {
    handleInput(false);
    return;
  }

  if (mouseX >= 0 && mouseX <= 100 && mouseY >= 330 && mouseY <= 720) {
    clearTimeout(clickTimeout);

    if (isShot) {
      legacyX = ballX;
      legacyY = ballY;
      legacySpeedX = speedX;
      legacySpeedY = speedY;
      legacyAngle = ballAngle;
      legacySpinSpeed = spinSpeed;
      legacyBounceCount = bounceCount;
      isLegacyActive = true;
    }

    resetBall();
    return;
  }

  clearTimeout(clickTimeout);
  clickTimeout = setTimeout(function() {
    if (!isShot) {
      handleInput(false);
    }
  }, 200);
}

function doubleClicked() {
  if (gameStarted && !isGameOver && !isShot && !needsNewBall) {
    if (mouseX >= 0 && mouseX <= 100 && mouseY >= 330 && mouseY <= 720) {
      return;
    }
    clearTimeout(clickTimeout);
    handleInput(true);
  }
}

function keyPressed() {
  if (!gameStarted || isGameOver) {
    handleInput(false);
  }
}

function handleInput(isHardShot) {
  if (!gameStarted) {
    gameStarted = true;
    startTime = millis();
  } else if (isGameOver) {
    scoreCount = 0;
    niceTextTimer = 0; 
    scoreLoopTimer = 0;
    isGameOver = false;
    gameWon = false;
    gameStarted = true;
    startTime = millis();
    isLegacyActive = false;
    resetBall();
  } else if (!isShot && !needsNewBall) {
    isShot = true;
    bounceCount = 0;
    hasScoredThisShot = false;

    let powerMultiplier = isHardShot ? 0.12 : 0.06;
    speedX = (mouseX - ballX) * powerMultiplier;
    speedY = (mouseY - ballY) * powerMultiplier;
    spinSpeed = isHardShot ? 0.18 : 0.08;
  }
}

function resetBall() {
  ballX = 350;
  ballY = 410;
  speedX = 0;
  speedY = 0;
  spinSpeed = 0.08;
  ballAngle = 0;
  isShot = false;
  bounceCount = 0;
  hasScoredThisShot = false;
  needsNewBall = false;
  scoreLoopTimer = 0;
  ballTrail = [];
  windForce = randomWind();
}

// Hide the ball after shot ends to pick a new from the rack
function endShot() {
  isShot = false;
  needsNewBall = true;
  ballTrail = [];
}

// Random wind value
function randomWind() {
  return random(WIND_MIN, WIND_MAX);
}
