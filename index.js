var dgram = require('dgram');
const path = require('path'); // Modulo de nodejs para trabajar con rutas
const express = require('express'); // Configurar express

// UPD sockets
var s_traction_ctrl = dgram.createSocket('udp4');
var s_exoskeleton_ctrl = dgram.createSocket('udp4');
var s_impedance_ctrl = dgram.createSocket('udp4');
var s_weight_ctrl = dgram.createSocket('udp4');

var s_left_knee = dgram.createSocket('udp4');
var s_right_knee = dgram.createSocket('udp4');
var s_left_hip = dgram.createSocket('udp4');
var s_right_hip = dgram.createSocket('udp4');
var s_weight = dgram.createSocket('udp4');
var s_can = dgram.createSocket('udp4');
var s_pos = dgram.createSocket('udp4');
// Variables, send UDP 
var IP;
const CPWalker_IP = '192.168.4.1';
const LOCAL_IP = 'localhost';
var PORT;
const EXO_PORT = 50011; //Exoskeleton port
const WEIGHT_PORT = 50015; //Patient weight control
const TRACTION_PORT = 50012; //Traction control
const IMPEDANCE_PORT = 50016; //Impedance control
var COMMAND; //String with exadecimal values of the selected comand

// Web server configuration
const app = express(); //Inicializar express en app
app.set('port', process.env.PORT || 3000)

// Send static files
app.use(express.static(path.join(__dirname, 'public')));

// Utilizar el puerto
const server = app.listen(app.get('port'), () => {
    console.log('Server', app.get('port'));
})

// Socket io configuration
const SocketIO = require('socket.io'); // Proporciona el server a socketio
const io = SocketIO(server);


//**************************//
//***** Data Reception *****//
//**************************//
// Receive UDP data from several ports of the ESP32 of the CPWalker:
// - port: 10001 -> left knee angles (real position, reference position)
// - port: 10002 -> right knee angles (real position, reference position)
// - port: 10003 -> left hip angles (real position, reference position)
// - port: 10004 -> righ hip angles (real position, reference position)
// - port: 10005 -> Strain gauge wheight
// - port: 10006 -> CAN error
// - port: 10007 -> Position error
// Received data format: 
// Joint data: 8 bytes in hexadecimal => [sign_real_pos, interger_real_pos, decimals_1_real_pos, decimals_2_real_pos, sign_ref_pos, interger_ref_pos, decimals_1_ref_pos, decimals_2_ref_pos]
var left_knee_real; // Real value of the knee angular position
var left_knee_ref; // Reference value (setpoint)
var right_knee_real; // Real value of the knee angular position
var right_knee_ref; // Reference value (setpoint)
var left_hip_real; // Real value of the hip angular position
var left_hip_ref; // Reference value (setpoint)
var right_hip_real; // Real value of the hip angular position
var right_hip_ref; // Reference value (setpoint)
// Left knee data
s_left_knee.on('message', function(msg, info) {
    // Receive data of the reference and real position of the left knee:
    var sign_real_pos_lk;
    var interger_real_pos_lk;
    var decimals_1_real_pos_lk; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_real_pos_lk;
    var sign_ref_pos_lk;
    var interger_ref_pos_lk;
    var decimals_1_ref_pos_lk; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_ref_pos_lk;
    var codified_values_lk = []; // Contains codified values 
    // Transform the msg of type string to an hex number array 
    for (i = 0 ; i < String(msg).length; i++) {
        codified_values_lk.push(String(msg).charCodeAt(i));
    }
    // Decode values:
    // Sign:  0 = positive number, 1 = negative number
    if (codified_values_lk[0] == 0) {
        sign_real_pos_lk = 1;
    } else {
        sign_real_pos_lk = -1;
    }
    if (codified_values_lk[4] == 0) {
        sign_ref_pos_lk = 1;
    } else {
        sign_ref_pos_lk = -1;
    }
    // Interger values:
    interger_real_pos_lk = codified_values_lk[1];
    interger_ref_pos_lk =  codified_values_lk[5];
    // Decimals values:
    decimals_2_real_pos_lk = codified_values_lk[3];
    decimals_2_ref_pos_lk =  codified_values_lk[7];
    // Reconstruct values:
    left_hip_real = sign_real_pos_lk * (interger_real_pos_lk + decimals_2_real_pos_lk/100);
    left_hip_ref = sign_ref_pos_lk * (interger_ref_pos_lk + decimals_2_ref_pos_lk/100);
});
// Right knee data
s_right_knee.on('message', function(msg, info) {
    // Receive data of the reference and real position of the right knee:
    var sign_real_pos_rk;
    var interger_real_pos_rk;
    var decimals_1_real_pos_rk; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_real_pos_rk;
    var sign_ref_pos_rk;
    var interger_ref_pos_rk;
    var decimals_1_ref_pos_rk; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_ref_pos_rk;
    var codified_values_rk = []; // Contains codified values 
    // Transform the msg of type string to an hex number array 
    for (i = 0 ; i < String(msg).length; i++) {
        codified_values_rk.push(String(msg).charCodeAt(i));
    }
    // Decode values:
    // Sign:  0 = positive number, 1 = negative number
    if (codified_values_rk[0] == 0) {
        sign_real_pos_rk = 1;
    } else {
        sign_real_pos_rk = -1;
    }
    if (codified_values_rk[4] == 0) {
        sign_ref_pos_rk = 1;
    } else {
        sign_ref_pos_rk = -1;
    }
    // Interger values:
    interger_real_pos_rk = codified_values_rk[1];
    interger_ref_pos_rk =  codified_values_rk[5];
    // Decimals values:
    decimals_2_real_pos_rk = codified_values_rk[3];
    decimals_2_ref_pos_rk =  codified_values_rk[7];
    // Reconstruct values:
    right_knee_real = sign_real_pos_rk * (interger_real_pos_rk + decimals_2_real_pos_rk/100);
    right_knee_ref = sign_ref_pos_rk * (interger_ref_pos_rk + decimals_2_ref_pos_rk/100);
});
// Left hip data
s_left_hip.on('message', function(msg, info) {
    // Receive data of the reference and real position of the right knee:
    var sign_real_pos_lh;
    var interger_real_pos_lh;
    var decimals_1_real_pos_lh; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_real_pos_lh;
    var sign_ref_pos_lh;
    var interger_ref_pos_lh;
    var decimals_1_ref_pos_lh; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_ref_pos_lh;
    var codified_values_lh = []; // Contains codified values 
    // Transform the msg of type string to an hex number array 
    for (i = 0 ; i < String(msg).length; i++) {
        codified_values_lh.push(String(msg).charCodeAt(i));
    }
    // Decode values:
    // Sign:  0 = positive number, 1 = negative number
    if (codified_values_lh[0] == 0) {
        sign_real_pos_lh = 1;
    } else {
        sign_real_pos_lh = -1;
    }
    if (codified_values_lh[4] == 0) {
        sign_ref_pos_lh = 1;
    } else {
        sign_ref_pos_lh = -1;
    }
    // Interger values:
    interger_real_pos_lh = codified_values_lh[1];
    interger_ref_pos_lh =  codified_values_lh[5];
    // Decimals values:
    decimals_2_real_pos_lh = codified_values_lh[3];
    decimals_2_ref_pos_lh =  codified_values_lh[7];
    // Reconstruct values:
    left_hip_real = sign_real_pos_lh * (interger_real_pos_lh + decimals_2_real_pos_lh/100);
    left_hip_ref = sign_ref_pos_lh * (interger_ref_pos_lh + decimals_2_ref_pos_lh/100);
});
// Right hip data
s_right_hip.on('message', function(msg, info) {
    // Receive data of the reference and real position of the right knee:
    var sign_real_pos_rh;
    var interger_real_pos_rh;
    var decimals_1_real_pos_rh; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_real_pos_rh;
    var sign_ref_pos_rh;
    var interger_ref_pos_rh;
    var decimals_1_ref_pos_rh; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_ref_pos_rh;
    var codified_values_rh = []; // Contains codified values 
    // Transform the msg of type string to an hex number array 
    for (i = 0 ; i < String(msg).length; i++) {
        codified_values_rh.push(String(msg).charCodeAt(i));
    }
    // Decode values:
    // Sign:  0 = positive number, 1 = negative number
    if (codified_values_rh[0] == 0) {
        sign_real_pos_rh = 1;
    } else {
        sign_real_pos_rh = -1;
    }
    if (codified_values_rh[4] == 0) {
        sign_ref_pos_rh = 1;
    } else {
        sign_ref_pos_rh = -1;
    }
    // Interger values:
    interger_real_pos_rh = codified_values_rh[1];
    interger_ref_pos_rh =  codified_values_rh[5];
    // Decimals values:
    decimals_2_real_pos_rh = codified_values_rh[3];
    decimals_2_ref_pos_rh =  codified_values_rh[7];
    // Reconstruct values:
    right_hip_real = sign_real_pos_rh * (interger_real_pos_rh + decimals_2_real_pos_rh/100);
    right_hip_ref = sign_ref_pos_rh * (interger_ref_pos_rh + decimals_2_ref_pos_rh/100);
});
//TODO
s_weight.on('message', function(msg, info) {
});
//TODO
s_can.on('message', function(msg, info) {
});
//TODO
s_pos.on('message', function(msg, info) {
});
// Bind the udp ports
s_left_knee.bind(10001); 
s_right_knee.bind(10002); 
s_left_hip.bind(10003); 
s_right_hip.bind(10004); 
s_weight.bind(10005); 
s_can.bind(10006);
s_pos.bind(10007);

//***********************//
//*** Web Interaction ***//
//***********************//
// Websockets
io.on('connection', (socket) => {
    console.log('new connection', socket.id);

    // Move the platform manualy. Listen traction:message events and send UDP data to the platform (called in move.js)
    socket.on('traction:message', (data) => {
        //Get values 
        w_r = data.w_right;
        w_l = data.w_left;
        //Command variables 
        var cmd_start;
        var cmd_v_l;
        var cmd_v_r;
        var cmd_traction_mode;
        //Commands transformation:
        cmd_start = 110;
        cmd_v_r = Math.round(50 * (1 + w_r/100));
        cmd_v_l = Math.round(50 * (1 + w_l/100));
        if (w_r === 0 && w_l === 0) {
            cmd_traction_mode = 0;  //0 -> STOP
        } else {
            cmd_traction_mode = 10; //10 -> Manual control
        }
        COMMAND = ((cmd_start).toString(16) + (cmd_v_r).toString(16) + (cmd_v_l).toString(16) + (cmd_traction_mode).toString(16)).toString();
        //UDP Mesage:
        IP = LOCAL_IP;
        PORT = TRACTION_PORT;
        var msg = Buffer.from(COMMAND,'hex');
        s_traction_ctrl.send(msg, PORT, IP);

        //Debug
        //console.log('Velocities:' + w_r , w_l);
        //console.log('COMMAND:' + cmd_start + cmd_v_r + cmd_v_l + cmd_traction_mode);
        //console.log(`HEX COMMAND:` + COMMAND);
        //console.log(`msg:` + msg);  
    })


    // Therapy configurtion variables
    var therapist_name;
    var patient_name;
    var patient_age;
    var gmfcs;
    var leg_length;
    var weight;
    var hip_upper_strap;
    var knee_lower_strap;
    var observations;
    var gait_velocity;
    var rom;
    var pbws;
    var steps;
    var left_hip_config;
    var left_knee_config;
    var right_hip_config;
    var right_knee_config;
    // Save session configuration. Listen "save_settings:message" events (called in therapy_sethings.js)
    socket.on('save_settings:message', (data) => {
        //Get values 
        therapist_name= data.therapist_name;
        patient_name = data.patient_name;
        patient_age =  data.patient_age;
        gmfcs =  data.gmfcs;
        leg_length =  data.leg_length;
        weight =  data.weight;
        hip_upper_strap =  data.hip_upper_strap;
        knee_lower_strap =  data.knee_lower_strap;
        observations =  data.observations;
        gait_velocity =  data.gait_velocity;
        rom =  data.rom;
        pbws =  data.pbws;
        steps =  data.steps;
        left_hip_config =  data.left_hip_config;
        left_knee_config =  data.left_knee_config;
        right_hip_config =  data.right_hip_config;
        right_knee_config =  data.right_knee_config;
        //Debug
        console.log(therapist_name, patient_name, patient_age, gmfcs, leg_length, weight, hip_upper_strap, knee_lower_strap, gait_velocity, rom, pbws,steps, left_hip_config, left_knee_config, right_hip_config, right_knee_config);
    })

    // Update joint chart plots (called in therapy_monitor.js)
    socket.on('jointData_ask', function(callbackFn) {
        socket.emit('jointData_resp', {
            left_knee_real: left_knee_real,
            left_knee_ref: left_knee_ref,
            right_knee_real: right_knee_real,
            right_knee_ref: right_knee_ref,
            left_hip_real: left_hip_real,
            left_hip_ref: left_hip_ref,
            right_hip_real: right_hip_real,
            right_hip_ref: right_hip_ref,
        })
    });

})


