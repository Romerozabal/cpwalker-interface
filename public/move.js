const socket = io();

var speed = 50;
var direction;

window.onload = function(){ 
  document.getElementById("velocity_input").onclick = function() {
    max_vel = 0.6;
    speed = document.getElementById("velocity_input").value;
    document.getElementById("velocity_html").innerHTML = speed + "%";
    document.getElementById("velocity_ms").innerHTML = (max_vel * parseInt(speed)/100).toFixed(2).toString() + " (m/s)";
    if (direction != "stop" && direction != undefined){
      sendTraction(direction, speed);
    }
  };
}

const $move_right = document.querySelector('.move_right');
const $arrow_right = document.querySelector('.arrow_right');
const $move_left = document.querySelector('.move_left');
const $arrow_left = document.querySelector('.arrow_left');
const $move_fordward = document.querySelector('.move_fordward');
const $arrow_fordward = document.querySelector('.arrow_fordward');
const $move_backwards = document.querySelector('.move_backwards');
const $arrow_backwards = document.querySelector('.arrow_backwards');

var move_right = false;
var move_left = false;
var move_fordward = false;
var move_backwards = false;

// Animate and get the selected direction of motion
$arrow_right.onclick = () => {
  if (move_right) {
    move_right = false;
    direction = "stop";
    sendTraction("stop", 0);
  } else {
    move_right = true;
    document.getElementById("direction_html").innerHTML = "Right...";
    direction = "right";
    sendTraction("right", speed);
  }
  $arrow_right.animate([
    {left: '0'},
    {left: '10px'},
    {left: '0'}
  ],{
    duration: 700,
    iterations: 1
  });
}
$arrow_left.onclick = () => {
  if (move_left) {
    move_left = false;
    direction = "stop";
    sendTraction("stop", 0);
  } else {
    move_left = true;
    document.getElementById("direction_html").innerHTML = "Left...";
    direction = "left";
    sendTraction("left", speed);
    $arrow_left.animate([
      {left: '0'},
      {left: '10px'},
      {left: '0'}
    ],{
      duration: 700,
      iterations: 1
    });
  }
 
}
$arrow_fordward.onclick = () => {
  if (move_fordward) {
    move_fordward = false;
    direction = "stop";
    sendTraction("stop", 0);
  } else {
    move_fordward = true;
    document.getElementById("direction_html").innerHTML = "Fordward...";
    direction = "fordward";
    sendTraction("fordward", speed);
  }
  $arrow_fordward.animate([
    {left: '0'},
    {left: '10px'},
    {left: '0'}
  ],{
    duration: 700,
    iterations: 1
  });
}
$arrow_backwards.onclick = () => {
  if (move_backwards) {
    move_backwards = false;
    direction = "stop";
    sendTraction("stop", 0);
  } else {
    move_backwards = true;
    document.getElementById("direction_html").innerHTML = "Backwards...";
    direction = "backwards";
    sendTraction("backwards", speed);
  }
  $arrow_backwards.animate([
    {left: '0'},
    {left: '10px'},
    {left: '0'}
  ],{
    duration: 700,
    iterations: 1
  });
}


// Send wheels velocity to the server
function sendTraction(direction, speed){
    //Wheels velocities
    var w_r;
    var w_l;
    if (speed == 0) {
      document.getElementById("direction_html").innerHTML = "Stop";
    }

    if (direction == "right") {
      w_r = - speed;
      w_l =  speed;
    } else if (direction == "left") {
      w_r =   speed;
      w_l = - speed;
    } else if (direction == "backwards") {
      w_r = - speed;
      w_l = - speed;
    } else if (direction == "fordward") {
      w_r = speed;
      w_l = speed;
    } else if (direction == "stop") {
      w_r = speed;
      w_l = speed;
    }
    
    // Send data to server
    socket.emit('traction:message', {
        w_right: w_r,
        w_left: w_l
    })
}
