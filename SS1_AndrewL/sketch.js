/*
  Name: Andrew L.
  Title: Basketball Court
   A simple 2D top-down view of a basketball court using shapes.
*/
function setup() {
  createCanvas(1200, 750); 
}

function draw() {
  background(228, 164, 102);

  // Outer Boundary Court Lines
  stroke(255);          
  strokeWeight(6);     
  noFill();
  rect(50, 50, 1100, 650);

  // Left and Right Keys 
  strokeWeight(4);       
  fill(52, 108, 176);    
  rect(50, 250, 220, 250);   
  rect(930, 250, 220, 250);  

  // Mid-Court Division Line 
  strokeWeight(4);       
  line(600, 50, 600, 700);

  // Backboards
  stroke(40);            
  strokeWeight(5);
  line(90, 335, 90, 415);   
  line(1110, 335, 1110, 415); 
 
  // Center Jumping Circle 
  stroke(255);
  strokeWeight(4);
  noFill();
  ellipse(600, 375, 180, 180);

  // Rims
  stroke(235, 94, 40);      
  fill(235, 94, 40, 120);   
  strokeWeight(3);
  ellipse(110, 375, 30, 30);   
  ellipse(1090, 375, 30, 30);  

  // Three-Point Line Arcs
  stroke(255);
  strokeWeight(4);
  noFill();
  arc(50, 375, 420, 420, -HALF_PI, HALF_PI);
  arc(1150, 375, 420, 420, HALF_PI, -HALF_PI);

  noLoop();
}
