/*
  Andrew L.
  Simple Shot
  A Close up of a Basketball dropping through a hoop
  Left Click to shoot the ball and try to click above the hoop to make a shot
*/

// Ball
let ballX = 120;         
let ballY = 400;         
let speedX = 0;          
let speedY = 0;          
let gravityValue = 0.4;  
let isShot = false;      

function setup() {
  
  createCanvas(1000, 750);
}

function draw() {
  background(240, 245, 255); // 

  // Backboard
  stroke(40);
  strokeWeight(6);
  fill(255); // Solid white
  rect(650, 100, 320, 450); 
  
  // Box inside Backboard
  stroke(240, 60, 40); // Orange-red color
  strokeWeight(8);
  noFill();
  rect(650, 280, 130, 130); 
  
  // Backboard outline
  fill(40);
  noStroke();
  rect(620, 365, 30, 30);

  // Apply physics when the ball is shot
  if (isShot == true) {
    speedY = speedY + gravityValue; 
    ballX = ballX + speedX;
    ballY = ballY + speedY;

    // Backbaoard collision 
    if (ballX + 45 > 650 && ballY > 100 && ballY < 550) {
      ballX = 650 - 45;         
      speedX = -speedX * 0.6;   
    }
  }
  noStroke();
  fill(100, 150, 255, 120);
  ellipse(mouseX, mouseY, 25, 25);

  if (speedY > 0 && ballX > 370 && ballX < 600 && ballY > 330 && ballY < 380) {
    speedX = 0;   
    speedY = 6;   
    ballX = 485;  
  }

  // Reset if the ball falls off the edge
  if (ballY > 800) {
    resetBall(); // 
  }

  // Baskeball
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

function resetBall() {
  ballX = 120;
  ballY = 400;    
  speedX = 0;
  speedY = 0;
  isShot = false; 
}

// Mouse click to shoot
function mousePressed() {
  if (isShot == false) {
    speedX = (mouseX - ballX) * 0.035;
    speedY = (mouseY - ballY) * 0.035;
    isShot = true; // 
  }
}

// Puts ball back to start
function keyPressed() {
  resetBall();
}