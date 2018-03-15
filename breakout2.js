//Initalize canvas variables
var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

// Background Gradient
var grd = ctx.createLinearGradient(0,0,200,0);

//keyboard events
document.addEventListener("keydown", keyboardEvents, false);

//Ball Properties
var move_x = 1;
var move_y = -1;
var RADIUS = 10;
var ball_x = c.width/2;
var ball_y = c.height/2;
var BALL_FPS = 5;


//Paddle Properties
var PADDLE_HEIGHT = 10;
var PADDLE_WIDTH = 50;
var paddle_x = c.width/2;
var paddle_y= c.height - PADDLE_HEIGHT;
var PADDLE_FPS = 15;

//General Game properties
var numLives = 3;
var i = 0;
var j = 0;
var game_over = false;
var showResetMenu = false;
var end_game = false;
var welcomeScreen = true;
var level = 1;
var score = 0;
var score_tracker = 0;
var gameOverLatch = false;


//block properties
var numRows = 3;
var numCols = 15;
var blockWidth = 40;
var blockHeight = 20;
var spacing = 10;
var topMargin = 30;
var leftMargin = 30;
var blocks = [];
var place_x = 0;
var place_y = 0;
var colorSelector = 0;


function gameCanvas() {
    ctx.clearRect(0,0,c.width,c.height);
    ctx.beginPath();
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, c.width, c.height);
}

function play(){
    
    
    //clears the canvas
    ctx.clearRect(0,0,c.width,c.height);
    
    //draws blocks to break
    if(!welcomeScreen){ 
    drawLevel();
    //draw ball and paddle
    drawBall();
    drawPaddle();
    //movement
    moveBall();
    //block collison
    breakBlock();
    //draw lives
    showLivesLeft();
    //draw level
    showLevel();
    //draw score
    showScore();
    //show game over message
    if(game_over){
        // Implements highscore API
        if(!gameOverLatch){
            highscore(score);
            update_scores();
        }
        
        gameOver();
    }
    //reset game
    if(showResetMenu){
    resetMenu();
    }
    //if user deos not want to play again
    if(end_game){
    endGame();    
    }
    
    } else{
    welcome();
    }
    
}


function welcome(){                                         
    //cover screen for welcome message
    ctx.beginPath();
    ctx.rect(0, 0, c.width, c.height);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
    
    //message
    ctx.font = "50px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Welcome to...", 20, 70,1000);
    
    //Break out image
    var img = document.getElementById("thumbnail");
    ctx.drawImage(img, 150, 100);
    
    //message
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Play (ENTER)", c.width - 280, c.height - 20 ,1000);
    
 
}

function drawPaddle(){
    //drawing the paddle
    ctx.beginPath();
    ctx.rect(paddle_x, paddle_y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
    
}

function drawBall(){
    //drawing the ball
    ctx.beginPath();
    ctx.arc(ball_x,ball_y,RADIUS,0,Math.PI*2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
    
 
}

function moveBall(){
    
    $("#something").click(function(e){
   var parentOffset = $(this).parent().offset(); 
   //or $(this).offset(); if you really just want the current element's offset
   var relX = e.pageX - parentOffset.left;
   var relY = e.pageY - parentOffset.top;
    });
    
    //moving the ball and detecting the edges of the canvas
    if(ball_y + move_y < RADIUS){
        move_y = -1*move_y;
        
    }else if(ball_y + move_y > c.height - RADIUS - PADDLE_HEIGHT){
        //paddle collision detection
        if(ball_x >= paddle_x && ball_x <= paddle_x + PADDLE_WIDTH){
            if(!showResetMenu && !game_over && !end_game){
                playHitSound();
            }
            move_y = -1*move_y;
            
            if( ball_x < paddle_x + PADDLE_WIDTH/2){
                move_x -= .75;
            }
            if(ball_x > paddle_x + PADDLE_WIDTH/2){
                move_x += .75;
            }
        }else if (ball_y + move_y > c.height + RADIUS){
            if(numLives == 1){
                
               numLives = numLives -1;
               game_over = true;
               
               //5s timer before asking to play again
               setTimeout(resetMenu, 5000);    
               
               //stop the ball
               move_x = 0;
               move_y = 0;
                
            }else{
            //player loss a life
            numLives = numLives - 1;
            //restart the ball position to continue playing
            ball_x = c.width/2;
            ball_y = c.height/2;
            move_x = 1;
            move_y = -1;
            }
        }
        
    }
    if(ball_x + move_x > c.width - RADIUS || ball_x + move_x < RADIUS){
        move_x = -1*move_x;
        
    }
    //level complete
    if(numLives != 0 && score_tracker == numRows*numCols){
        score_tracker = 0;
        level++;
        if(numRows < 7){
            numRows++;
        }
        ball_x = c.width/2;
        ball_y = c.height/2;
        move_x = 1;
        move_y = -1;

    //Creating the block objects to break
    for(i = 0; i < numCols; i++){
        blocks[i] = [];
        for(j = 0; j < numRows; j++){
            blocks[i][j]={ block_x: 0, block_y: 0, color: Math.floor(Math.random() * 6) + 1, broken: false};
        
        }
    }
    for(i = 0; i < numCols; i++){
        for(j = 0; j < numRows; j++){
                blocks[i][j].broken = false;
                
            }
        }
        
    
    drawLevel();
    }
    
    ball_x = ball_x + move_x;
    ball_y = ball_y + move_y;
    
}

function movePaddle(e) {
      
$( "#gameCanvas" ).mousemove(function( e ) {
    var rect = c.getBoundingClientRect();
    paddle_x = e.clientX - rect.left - PADDLE_WIDTH/2;
});

}

setInterval(play,BALL_FPS);
document.onmousemove = movePaddle;

//Creating the block objects to break
for(i = 0; i < numCols; i++){
    blocks[i] = [];
    for(j = 0; j < numRows; j++){
        blocks[i][j]={ block_x: 0, block_y: 0, color: Math.floor(Math.random() * 6) + 1, broken: false};
        
    }
}

function drawLevel(){
    for(i = 0; i < numCols; i++){
         for(j = 0; j < numRows; j++){
            if(blocks[i][j].broken == false){
            //changing position of block placements
            place_x = i*(blockWidth+spacing)+leftMargin;
            place_y = j*(blockHeight+spacing)+topMargin;
            blocks[i][j].block_x = place_x;
            blocks[i][j].block_y = place_y;
            //drawing and filling
            ctx.beginPath();
            ctx.rect(place_x,place_y,blockWidth,blockHeight);
            
            //random color generator or could make blocks have a theme? 
            colorSelector = blocks[i][j].color;
            switch (colorSelector) {
                case 1:
                ctx.fillStyle = "blue";
                    break;
                case 2:
                ctx.fillStyle = "green";
                    break;
                case 3:
                ctx.fillStyle = "red";
                    break;
                case 4:
                ctx.fillStyle = "yellow";
                    break;
                case 5:
                ctx.fillStyle = "purple";
                    break;
                default:
                ctx.fillStyle = "orange";
            }
            

            ctx.fill();
            ctx.closePath();
            }
         }
    }
}

//detection of brealing a block
function breakBlock(){
                    
for(i = 0; i < numCols; i++){

    for(j = 0; j < numRows; j++){
        
        var blockCheck = blocks[i][j];
        
        if(blockCheck.broken == false){

            if(ball_y < blockCheck.block_y+blockHeight && ball_y > blockCheck.block_y && ball_x < blockCheck.block_x + blockWidth && ball_x > blockCheck.block_x){
                if(!showResetMenu && !game_over && !end_game){
                playHitSound();
                }
                move_y = -1*move_y;
                blockCheck.broken = true;
                score += 5;
                score_tracker ++;

            }
        }
    }  
}

}

function playHitSound(){
    var snd = new Audio("audio/tree.mp3"); // buffers automatically when created
    snd.play();
    
}

function showLivesLeft(){
    
    ctx.font = "20px Courier";
    ctx.fillStyle = "black";
    ctx.fillText("Lives Remaining: " + numLives, 20, 20);
    
    
    
}

function showLevel(){
    
    ctx.font = "20px Courier";
    ctx.fillStyle = "black";
    ctx.fillText("Level: " + level, c.width/2 - 50, 20);
}



function showScore(){
    
    ctx.font = "20px Courier";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 660, 20);
}
    

function gameOver(){

    //cover screen for game over message
    ctx.beginPath();
    ctx.rect(10, 30, c.width - 20, c.height - 20);
    ctx.fillStyle = "rgb(153,204,255)";
    ctx.fill();
    ctx.closePath();
    
    //game over message
    ctx.font = "50px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", c.width/2 - 150, 200, 500);
    
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("Check out your score below!", c.width/2 - 200, 250, 500);
    gameOverLatch = true;
    
}

function resetMenu(){
    showResetMenu = true;
    
    //cover screen for reset message
    ctx.beginPath();
    ctx.rect(10, 30, c.width - 20, c.height - 20);
    ctx.fillStyle = "rgb(153,153,204)";
    ctx.fill();
    ctx.closePath();
    
    //message
    ctx.font = "50px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Would you like to play again?", c.width/2 - 250, 200, 500);
    
   //Yes or no
    ctx.font = "50px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("YES (y)", c.width/2 - 70, 300, 500);
    
    ctx.font = "50px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("NO (n)", c.width/2 - 55, 400, 500);

}

function keyboardEvents(k){
    if(welcomeScreen){
 
            //play
            if(k.keyCode == 13){
            welcomeScreen = false;
            }
        
    }
    
    if(showResetMenu){
    //yes
    k.preventDefault();
    if(k.keyCode == 89) { 
        for(i = 0; i < numCols; i++){

            for(j = 0; j < numRows; j++){
                blocks[i][j].broken = false;
                
            }
        }
        game_over = false;
        showResetMenu = false;
        gameOverLatch = false;
        ball_x = c.width/2;
        ball_y = c.height/2;
        move_x = 1;
        move_y = -1;
        score = 0;
        score_tracker = 0;
        level = 1;
        numLives = 3;
        numRows = 3;
        
    }
        //no
        if(k.keyCode == 78) {
          end_game = true;
        }
    
    }

} 

function endGame(){
    
    //cover screen for final message
    ctx.beginPath();
    ctx.rect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgb(0,204,102)";
    ctx.fill();
    ctx.closePath();
    
    //message
    ctx.font = "50px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Come back soon!!", c.width/2 - 200, 200, 500);
    
    
}

