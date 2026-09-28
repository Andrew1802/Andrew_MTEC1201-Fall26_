/*
  Andrew L.
  Simple Shot
  A Close up of a Basketball dropping through a hoop with windforce making it more challenging 
  Left Click to shoot the ball and try to click above the hoop to make a shot
*/

// Ball
let ballX = 120;         
let ballY = 400;         
let speedX = 0;          
let speedY = 0;          
let gravityValue = 0.4;  
let isShot = false;      
let scoreCount = 0;     

// Windforce
let windForce = 0;       
let hasScoredThisShot = false; 

function setup() {
  createCanvas(1000, 750);
  
  windForce = random(-0.45, 0.45);
}

function draw() {
  background(240, 245, 255); 

  // Canvas
  fill(40);                  
  noStroke();                
  textSize(32);              
  textFont('sans-serif');    
  
  // Make 20 text
  text("Make 20", 50, 60); 
  
  // Shots Counter
  textSize(28); 
  text("Shots: ", 650, 70);
  fill(240, 60, 40); 
  text(scoreCount, 755, 70); 

  // Windforce Indicator
  textSize(24);
  if (windForce > 0.1) {
    fill(240, 60, 40); 
    text("➡️", 50, 110);
  } else if (windForce < -0.1) {
    fill(40, 100, 250); 
    text("⬅️", 50, 110);
  } else {
    fill(100); 
    text("🍃", 50, 110);
  }

  // Backboard
  stroke(100);
  strokeWeight(4);
  fill(160); 
  rect(970, 250, 30, 150); 

  // Rear attachment to backbaord
  ellipse(970, 280, 10, 10);
  ellipse(970, 370, 10, 10);

  stroke(40);
  strokeWeight(6);
  fill(255); 
  rect(650, 100, 320, 450); 
  
  stroke(240, 60, 40); 
  strokeWeight(8);
  noFill();
  rect(650, 280, 130, 130); 
  
  fill(40);
  noStroke();
  rect(620, 365, 30, 30);

  // PHYSICS  
  if (isShot == true) {
    speedY = speedY + gravityValue; 
    speedX = speedX + windForce;
    ballX = ballX + speedX;
    ballY = ballY + speedY;

    // Backboard collision
    if (ballX + 45 > 650 && ballY > 100 && ballY < 550) {
      ballX = 650 - 45;         
      speedX = -speedX * 0.6;   
    }
  }
  
  // Aiming indicator
  noStroke();
  fill(100, 150, 255, 120);
  ellipse(mouseX, mouseY, 25, 25); 

  // Rim trigger
  if (speedY > 0 && ballX > 370 && ballX < 600 && ballY > 330 && ballY < 380) {
    if (hasScoredThisShot == false) {
      scoreCount = scoreCount + 1;      
      hasScoredThisShot = true;         
      
      // Score reset after reaching 20
      if (scoreCount > 20) {
        scoreCount = 0;
      }
    }
    
    speedX = 0;   
    speedY = 6;   
    ballX = 485;  
  }

  // Reset if the ball falls off the bottom edge
  if (ballY > 800) {
    resetBall(); 
  }

  // Basketball
  stroke(0);
  strokeWeight(3);
  fill(245, 110, 30); 
  ellipse(ballX, ballY, 90, 90); 

  // Basketball seams 
  noFill();
  strokeWeight(2.5);
  line(ballX - 45, ballY, ballX + 45, ballY); 
  arc(ballX, ballY, 90, 90, 50, 130);       

  // Rim
  stroke(240, 60, 40); 
  strokeWeight(14);   
  noFill();
  line(360, 380, 620, 380); 
}

//  Reset ball
function resetBall() {
  ballX = 120;
  ballY = 400;    
  speedX = 0;
  speedY = 0;
  isShot = false; 
  hasScoredThisShot = false; 
  
  // Windforce for a challenge
  windForce = random(-0.45, 0.45);
}

// Mouse click to shoot
function mousePressed() {
  if (isShot == false) {
    speedX = (mouseX - ballX) * 0.035; 
    speedY = (mouseY - ballY) * 0.035;
    isShot = true; 
  }
}

function keyPressed() {
  resetBall();
}