/*
  Andrew L.
  Simple Shot
  A Close up of a Basketball dropping through a hoop with a gentle windforce and large flag indicator
  Left Click to shoot the ball and try to click above the hoop to make a shot
*/

// Fence Image
let fenceImg; 

// Fence size
let fenceTileWidth = 250;  
let fenceTileHeight = 220; 
let fenceYPosition = 80;  

// Ball 
let ballX = 350;         
let ballY = 410;        
let speedX = 0;          
let speedY = 0;          
let gravityValue = 0.4;  
let isShot = false;      
let scoreCount = 0;     

// Scoring flag
let hasScoredThisShot = false; 

// Track number of bounces on the floor
let bounceCount = 0;

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

// Preload for the fence
function preload() {
  fenceImg = loadImage('fence.png'); 
}

function setup() {
  createCanvas(1150, 750);
  windForce = random(-0.12, 0.12); 
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

  // Fence Image fixing
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

  // Wind Flag
  let flagPoleX = 350;
  let flagPoleY = 150;
  
  stroke(100);
  strokeWeight(6);
  line(flagPoleX, flagPoleY, flagPoleX, flagPoleY + 140);
  fill(60);
  noStroke();
  ellipse(flagPoleX, flagPoleY, 10, 10);
  
  // Flag cloth
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

  // BACKBOARD DESIGN
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

  // Physics
  if (isShot == true && !isGameOver && gameStarted) {
    speedY = speedY + gravityValue; 
    speedX = speedX + windForce; 
    ballX = ballX + speedX;
    ballY = ballY + speedY;

    // Backboard collision
    if (ballX + 35 > 930 && ballY > 70 && ballY < 330) {
      ballX = 930 - 35;         
      speedX = -speedX * 0.6;   
    }

    // Bounce
    if (ballY + 35 >= 735 && speedY > 0) {
      bounceCount++; 
      
      if (bounceCount > 1) {
        resetBall();
      } else {
        ballY = 735 - 35;         
        speedY = -speedY * 0.55;  
        speedX = speedX * 0.8;    
      }
    }
  }
  
  // Aiming indicator
  if (!isGameOver && gameStarted) {
    noStroke();
    fill(100, 150, 255, 120);
    ellipse(mouseX, mouseY, 20, 20); 
  }

  // Rim trigger
  if (speedY > 0 && ballX > 783 && ballX < 903 && ballY > 213 && ballY < 248) {
    if (hasScoredThisShot == false) {
      scoreCount = scoreCount + 1;      
      hasScoredThisShot = true;         
      
      if (scoreCount >= 10) {
        isGameOver = true;
        gameWon = true;
      }
    }
    
    speedX = 0;   
    speedY = 5;   
    ballX = 843; 
  }

  // Reset if ball goes out of bounds
  if (ballY > 850 || ballX < -50 || ballX > width + 50) {
    resetBall(); 
  }

  // Basketball
  stroke(0);
  strokeWeight(2.5);
  fill(245, 110, 30); 
  ellipse(ballX, ballY, 70, 70); 

  // Basketball seams 
  noFill();
  strokeWeight(2);
  line(ballX - 35, ballY, ballX + 35, ballY); 
  arc(ballX, ballY, 70, 70, 50, 130);       

  // Rim
  stroke(240, 60, 40); 
  strokeWeight(9);   
  noFill();
  line(775, 239, 911, 239); 

  // Start game overlay
  if (!gameStarted) {
    fill(0, 0, 0, 120);
    noStroke();
    rect(0, 0, width, height);

    stroke(40);
    strokeWeight(4);
    fill(255);
    rectMode(CENTER);
    rect(width / 2, height / 2, 520, 260, 12); 

    noStroke();
    fill(40);
    textSize(26);
    textAlign(CENTER, CENTER);
    text("make 10 shots to win", width / 2, height / 2 - 30);

    stroke(30);
    strokeWeight(2);
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 + 40 && mouseY < height / 2 + 90) {
      fill(46, 204, 113); 
    } else {
      fill(39, 174, 96); 
    }
    rect(width / 2, height / 2 + 65, 200, 50, 8);

    noStroke();
    fill(255);
    textSize(22);
    text("Start Game", width / 2, height / 2 + 65);

    rectMode(CORNER);
  }

  // Game over overlay
  if (isGameOver) {
    fill(0, 0, 0, 100);
    noStroke();
    rect(0, 0, width, height);

    stroke(40);
    strokeWeight(4);
    fill(255);
    rectMode(CENTER);
    rect(width / 2, height / 2, 380, 220, 12); 

    noStroke();
    textAlign(CENTER, CENTER);
    
    if (gameWon) {
      fill(46, 204, 113); 
      textSize(36);
      text("Nice!", width / 2, height / 2 - 40);

      stroke(30);
      strokeWeight(2);
      if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 + 20 && mouseY < height / 2 + 70) {
        fill(235, 95, 20); 
      } else {
        fill(245, 110, 30); 
      }
      rect(width / 2, height / 2 + 45, 200, 50, 8);

      noStroke();
      fill(255);
      textSize(22);
      text("Play Again", width / 2, height / 2 + 45);
    } else {
      fill(231, 76, 60); 
      textSize(36);
      text("Try Again", width / 2, height / 2 - 40);

      stroke(30);
      strokeWeight(2);
      if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 + 20 && mouseY < height / 2 + 70) {
        fill(46, 204, 113); 
      } else {
        fill(39, 174, 96); 
      }
      rect(width / 2, height / 2 + 45, 200, 50, 8);

      noStroke();
      fill(255);
      textSize(22);
      text("Restart Game", width / 2, height / 2 + 45);
    }
    rectMode(CORNER);
  }
}

// Reset ball
function resetBall() {
  ballX = 350;
  ballY = 410;    
  speedX = 0;
  speedY = 0;
  isShot = false; 
  hasScoredThisShot = false; 
  bounceCount = 0; 
  
  // Random wind force
  windForce = random(-0.12, 0.12);
}

function mousePressed() {
  if (!gameStarted) {
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 + 40 && mouseY < height / 2 + 90) {
      gameStarted = true;
      startTime = millis(); 
    }
    return;
  }

  if (isGameOver) {
    if (gameWon) {
      if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 + 20 && mouseY < height / 2 + 70) {
        restartGameFully();
      }
    } else {
      if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100 && mouseY > height / 2 + 20 && mouseY < height / 2 + 70) {
        restartGameFully();
      }
    }
    return; 
  }

  if (isShot == false) {

speedX = (mouseX - ballX) * 0.035;
speedY = (mouseY - ballY) * 0.035;
isShot = true;
}
}
function restartGameFully() {
scoreCount = 0;
isGameOver = false;
gameWon = false;
startTime = millis();
resetBall();
}
function keyPressed() {
if (!isGameOver && gameStarted) {
resetBall();
startTime = millis();
}
}