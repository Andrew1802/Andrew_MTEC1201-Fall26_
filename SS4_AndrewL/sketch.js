/*
  Andrew L.
  Simple Shot
  A Close up of a Basketball dropping through a hoop with windforce making it more challenging 
  Left Click to shoot the ball and try to click above the hoop to make a shot
*/

// Fence Image
let fenceImg; 

// Fence size
let fenceTileWidth = 250;  
let fenceTileHeight = 295; 
let fenceYPosition = 150;  

// Ball
let ballX = 120;         
let ballY = 500;        
let speedX = 0;          
let speedY = 0;          
let gravityValue = 0.4;  
let isShot = false;      
let scoreCount = 0;     

// Shot Amount Limit
let shotsLeft = 50; 

// Windforce
let windForce = 0;       
let hasScoredThisShot = false; 

// Timer
let startTime;
let totalTimeLimit = 60; 

// Preload for the fence
function preload() {
  fenceImg = loadImage('fence.png'); 
}

function setup() {

  createCanvas(1450, 900);
  
  windForce = random(-0.45, 0.45);
  startTime = millis();
}

function draw() {
  background(220, 240, 255); 

  // Park Court 
  fill(255, 225, 120);
  noStroke();
  rect(0, 440, width, 15);

  fill(85, 90, 100);
  rect(0, 450, width, 450);

  fill(70, 175, 90);
  rect(0, 450, width, 12); 
  rect(0, 885, width, 15);  

  // Fence Image fixing
  
  if (fenceImg) {
    for (let x = 0; x < width; x += fenceTileWidth) {
      image(fenceImg, x, fenceYPosition, fenceTileWidth, fenceTileHeight);
    }
  }

  // Court lines
  stroke(255);
  strokeWeight(5);
  noFill();
  
  line(10, 462, 10, 885);
  
  arc(10, 670, 200, 100, -HALF_PI, HALF_PI);
 
  line(1260, 462, 1260, 885);
  
  rect(960, 585, 300, 170);
  
  arc(960, 670, 160, 170, HALF_PI, -HALF_PI);
  
  stroke(255, 255, 255, 100);
  arc(960, 670, 160, 170, -HALF_PI, HALF_PI);
  stroke(255); 
  
  arc(1260, 670, 950, 420, HALF_PI, -HALF_PI);
  

  // Text
  fill(40);                  
  noStroke();                
  textSize(32);              
  textFont('sans-serif');    
  
  // Text Allignment
  textAlign(LEFT);
  text("Make 20", 50, 60); 
  text("Shots Left: " + shotsLeft, 250, 60); 
  text("Shots Made: " + scoreCount, 550, 60);

  // Timer
  let elapsedTime = (millis() - startTime) / 1000;
  let timeLeft = totalTimeLimit - elapsedTime;
  
  // Reset Timer at 0
  if (timeLeft <= 0) {
    startTime = millis(); 
    timeLeft = totalTimeLimit; 
  }
  
  let minutes = floor(timeLeft / 60);
  let seconds = floor(timeLeft % 60);
  let formattedTime = minutes + ":" + nf(seconds, 2); 
  
  fill(50);
  text("Time: " + formattedTime, 850, 60);

  // Windforce Indicator
  textSize(24);
  if (windForce > 0.1) {
    fill(240, 60, 40); 
    text("➡️", 1100, 35);
  } else if (windForce < -0.1) {
    fill(40, 100, 250); 
    text("⬅️", 1100, 35);
  } else {
    fill(100); 
    text("🍃", 1100, 35);
  }

  // Backboard Design
  stroke(60); 
  strokeWeight(6);
  fill(255); 
  rect(1100, 50, 320, 450); 
  
  stroke(40); 
  strokeWeight(4);
  noFill();
  
  line(1115, 120, 1405, 120);
  line(1115, 170, 1405, 170);
  
  line(1115, 390, 1405, 390);
  line(1115, 440, 1405, 440);
  
  stroke(40); 
  strokeWeight(6);
  rect(1185, 230, 150, 110); 
  
  stroke(210);
  strokeWeight(3);
  rect(1115, 65, 290, 420);

  fill(40);
  noStroke();
  rect(1070, 315, 30, 30);


  // Net
  stroke(255);
  strokeWeight(3.5);
  noFill();
  
  line(850, 330, 870, 430);
  line(880, 330, 895, 430);
  line(910, 330, 920, 430);
  line(940, 330, 945, 430);
  line(970, 330, 970, 430);
  line(1000, 330, 995, 430);
  line(1030, 330, 1020, 430);
  line(1050, 330, 1045, 430);

  line(850, 330, 1045, 430);
  line(1050, 330, 870, 430);
  
  arc(950, 365, 160, 20, 0, PI);
  arc(957, 400, 110, 15, 0, PI);
  arc(957, 428, 75, 10, 0, PI);

  // PHYSICS  
  if (isShot == true) {
    speedY = speedY + gravityValue; 
    speedX = speedX + windForce;
    ballX = ballX + speedX;
    ballY = ballY + speedY;

    // Backboard collision
    if (ballX + 45 > 1100 && ballY > 50 && ballY < 500) {
      ballX = 1100 - 45;         
      speedX = -speedX * 0.6;   
    }
  }
  
  // Aiming indicator
  noStroke();
  fill(100, 150, 255, 120);
  ellipse(mouseX, mouseY, 25, 25); 

  // Rim trigger 
  if (speedY > 0 && ballX > 860 && ballX < 1040 && ballY > 280 && ballY < 330) {
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
    ballX = 950; 
  }

  // Reset if the ball falls off the bottom edge
  if (ballY > 950) {
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
  line(850, 330, 1050, 330); 
  
  // Rear wall of the rim
  stroke(100);
  strokeWeight(4);
  fill(160); 
  rect(1420, 200, 30, 150); 
  ellipse(1420, 230, 10, 10);
  ellipse(1420, 320, 10, 10);
}

//  Reset ball
function resetBall() {
  ballX = 120;
  ballY = 500;    
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
    
    shotsLeft = shotsLeft - 1; 
  }
}

function keyPressed() {
  resetBall();
  startTime = millis(); 
}