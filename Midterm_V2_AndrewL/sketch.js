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
let windForce = 0;

// Timer
let startTime;
let totalTimeLimit = 45;
let timePausedAt = 0;

// Game State
let isGameOver = false;
let gameStarted = false;
let gameWon = false;

// Visuals
let rimFlash = 0;       
let clickTimeout;       
let niceTextTimer = 0; 

// Preload for the fence
function preload() {
  fenceImg = loadImage('fence.png');
}

function setup() {
  createCanvas(1150, 750);
  windForce = random(-0.06, 0.06);
}

function draw() {
  background(220, 240, 255);

  // Park Court
  fill(255, 225, 120);
  noStroke();
  rect(0, 290, width, 15);

  fill(85, 90, 100);
  rect(0, 300, width, 450);

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
    arc(bx, by, 36, 36, 45, 135);
  };

  // Stack 5 Basketballs in the rack
  drawVerticalRackBall(50, rackTopY + 30);
  drawVerticalRackBall(50, rackTopY + 90);
  drawVerticalRackBall(50, rackTopY + 150);
  drawVerticalRackBall(50, rackTopY + 210);
  drawVerticalRackBall(50, rackTopY + 270);

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

  // Ambient Wind Particles
  stroke(255, 255, 255, 80);
  strokeWeight(2);
  for (let i = 0; i < 3; i++) {
    let y = 180 + i * 30;
    let xStart = 450 + (frameCount * 2) % 400;
    line(xStart, y, xStart + (windForce * 300), y);
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

  let flagStretchWidth = windForce * 650;

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
        isShot = false;
      } else {
        ballY = 735 - 35;
        speedY = -speedY * 0.55;
        speedX = speedX * 0.8;
        spinSpeed *= 0.6;
      }
    }
  }

  // Physics background Ball
  if (isLegacyActive) {
    legacySpeedY = legacySpeedY + gravityValue;
    legacySpeedX = legacySpeedX + windForce;
    legacyX = legacyX + legacySpeedX;
    legacyY = legacyY + legacySpeedY;
    legacyAngle += legacySpinSpeed;

    // Backboard Collision for background legacy ball
    if (legacyX + 35 > 930 && legacyY > 70 && legacyY < 330) {
      legacyX = 930 - 35;
      legacySpeedX = -legacySpeedX * 0.6;
      legacySpinSpeed = -legacySpinSpeed * 0.5;
    }

    // Ground Bounce for background legacy ball
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

    // Despawn check out of bounds
    if (legacyY > 850 || legacyX < -50 || legacyX > width + 50) {
      isLegacyActive = false;
    }
  }

  // Aiming Indicator
  if (!isGameOver && gameStarted) {
    noStroke();
    fill(100, 150, 255, 120);
    ellipse(mouseX, mouseY, 20, 20);
  }

  // Rim Trigger 
  if (isShot && speedY > 0 && ballX > 783 && ballX < 903 && ballY > 213 && ballY < 248) {
    if (hasScoredThisShot == false) {
      scoreCount = scoreCount + 1;
      hasScoredThisShot = true;
      rimFlash = 255;
      niceTextTimer = 90; 

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
    isShot = false;
  }

  // Draw Legacy Ball if alive
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
    arc(0, 0, 70, 70, 50, 130);
    pop();
  }

  // Draw Primary Ball
  if (!isShot || (isShot)) {
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
    arc(0, 0, 70, 70, 50, 130);
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
  if (gameStarted && !isGameOver && !isShot) {
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
    isGameOver = false;
    gameWon = false;
    gameStarted = true;
    startTime = millis();
    isLegacyActive = false;
    resetBall();
  } else if (!isShot) {
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
  windForce = random(-0.06, 0.06);
}