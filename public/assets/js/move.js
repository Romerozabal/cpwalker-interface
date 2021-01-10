const socket = io();
var canvas, ctx;

//When the file is loaded, do the next steps:
window.addEventListener('load', () => {
    //Returns html element drawing and specify a 2D drowing
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');          
    resize(); 

    // Call StartDrawing when the mouse is pressed , 
    // call stopDrawing when it isn't pressed and draw when there mouse is moved:
    document.addEventListener('mousedown', startDrawing);
    document.addEventListener('mouseup', stopDrawing);
    document.addEventListener('mousemove', Draw);

    document.addEventListener('touchstart',startDrawing);
    document.addEventListener('touchend', stopDrawing);
    document.addEventListener('touchcancel', stopDrawing);
    document.addEventListener('touchmove', Draw);
    window.addEventListener('resize', resize);

    document.getElementById("speed").innerText = 0;
    document.getElementById("angle").innerText = 0;

    sendTraction(0,0);

});


function sendTraction(speed, angle_in_degrees){
    //Wheels velocities
    var w_r;
    var w_l;

    if (45 < angle_in_degrees && angle_in_degrees < 135) {
        w_r = speed;
        w_l = speed;
    } else if (135 > angle_in_degrees && angle_in_degrees < 225) {
        w_r =   speed;
        w_l = - speed;
    } else if (225 < angle_in_degrees &&  angle_in_degrees < 315) {
        w_r = - speed;
        w_l = - speed;
    } else {
        w_r = - speed;
        w_l =  speed;
    }
    
    // Send data to server
    socket.emit('traction:message', {
        w_right: w_r,
        w_left: w_l
    })

    console.log(w_r, w_l);
}

var width, height, radius, x_orig, y_orig;
function resize() {
    width = window.innerWidth - 300;
    radius = 100;
    height = radius * 6.5;
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    background();
    joystick(width / 2, height / 3);
}

function background() {
    x_orig = width / 2;
    y_orig = height / 3;

    ctx.beginPath();
    ctx.arc(x_orig, y_orig, radius + 20, 0, Math.PI * 2, true);
    ctx.fillStyle = '#e9deff'; 
    ctx.fill();
}

function joystick(width, height) {
    ctx.beginPath();
    ctx.arc(width, height, radius, 0, Math.PI * 2, true);
    ctx.fillStyle = '#2e59d9';
    ctx.fill();
    ctx.strokeStyle = '#b69dff'; 
    ctx.lineWidth = 8;
    ctx.stroke();
}

let coord = { x: 0, y: 0 };
let paint = false;

function getPosition(event) {
    var mouse_x = event.clientX || event.touches[0].clientX;
    var mouse_y = event.clientY || event.touches[0].clientY;
    coord.x = mouse_x - canvas.offsetLeft;
    coord.y = mouse_y - canvas.offsetTop;
}

function is_it_in_the_circle() {
    var current_radius = Math.sqrt(Math.pow(coord.x - x_orig, 2) + Math.pow(coord.y - y_orig, 2));
    if (radius >= current_radius) return true
    else return false
}


function startDrawing(event) {
    paint = true;
    getPosition(event);
    if (is_it_in_the_circle()) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background();
        joystick(coord.x, coord.y);
        Draw();
    }
}


function stopDrawing() {
    paint = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background();
    joystick(width / 2, height / 3);
    document.getElementById("speed").innerText = 0;
    document.getElementById("angle").innerText = 0;

    sendTraction(0,0);

}

function Draw(event) {

    if (paint) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background();
        var angle_in_degrees,x, y, speed;
        var angle = Math.atan2((coord.y - y_orig), (coord.x - x_orig));

        if (Math.sign(angle) == -1) {
            angle_in_degrees = Math.round(-angle * 180 / Math.PI);
        }
        else {
            angle_in_degrees =Math.round( 360 - angle * 180 / Math.PI);
        }


        if (is_it_in_the_circle()) {
            joystick(coord.x, coord.y);
            x = coord.x;
            y = coord.y;
        }
        else {
            x = radius * Math.cos(angle) + x_orig;
            y = radius * Math.sin(angle) + y_orig;
            joystick(x, y);
        }

    
        getPosition(event);

        var speed =  Math.round(100 * Math.sqrt(Math.pow(x - x_orig, 2) + Math.pow(y - y_orig, 2)) / radius);

        var x_relative = Math.round(x - x_orig);
        var y_relative = Math.round(y_orig - y);
        

        document.getElementById("speed").innerText = speed;
        document.getElementById("angle").innerText = angle_in_degrees;

        sendTraction(speed, angle_in_degrees);

    }            
} 
