var dgram = require('dgram');
const path = require('path'); // Modulo de nodejs para trabajar con rutas
const express = require('express'); // Configurar express
var fs = require('fs'); //  File System module


var PLOTSAMPLINGTIME = 35; //ms

/////////////////////
//** UDP Network **//
/////////////////////
// The UDP Network is used to communicate with the CPWalker from
// the user interface (web). The webserver communicates with the
// CPWalker using an UDP Network generated by an ESP32 mounted in
// the robot. The webserver uses several UDP sockets pointing to 
// different PORTS to receive and send data. The main objectives 
// are to configure the therapy settings, move the robot, and 
// receive data comming from the sensors.
// 
// UPD sockets to send data
var udp_send = dgram.createSocket('udp4');
// UDP sockets to receive data
var s_left_knee = dgram.createSocket('udp4');
var s_right_knee = dgram.createSocket('udp4');
var s_left_hip = dgram.createSocket('udp4');
var s_right_hip = dgram.createSocket('udp4');
var s_weight = dgram.createSocket('udp4');
var s_can = dgram.createSocket('udp4');
var s_pos = dgram.createSocket('udp4');
// UDP constants to send data
const CPWALKER_IP = '192.168.4.1';
const LOCAL_IP = 'localhost';
const EXO_PORT = 50011; //Exoskeleton port
const WEIGHT_PORT = 50015; //Patient weight control
const TRACTION_PORT = 50012; //Traction control
const IMPEDANCE_PORT = 50016; //Impedance control

/////////////////////////////////
//** Webserver configuration **//
/////////////////////////////////
// 
// Express initialization
const app = express();
app.set('port', process.env.PORT || 3000)
// Send static files
app.use(express.static(path.join(__dirname, 'public')));
// Configure PORT of the web
const server = app.listen(app.get('port'), () => {
    console.log('Server', app.get('port'));
})

/////////////////////////////////
//** Socket io configuration **//
/////////////////////////////////
// Socket io is the javascript library used for the
// realtime, bi-directional communication between web 
// clients and servers. 
//
// Give the server to socketio
const SocketIO = require('socket.io'); 
const io = SocketIO(server);


////////////////////////////////
//** Database configuration **//
////////////////////////////////
//
var mysql = require('mysql');

//////////////////////////////
//***** Data Reception *****//
//////////////////////////////
//
// Receive UDP data from several ports of the ESP32 mounted in CPWalker:
// - port: 10001 -> left knee angles (real position, reference position)
// - port: 10002 -> right knee angles (real position, reference position)
// - port: 10003 -> left hip angles (real position, reference position)
// - port: 10004 -> righ hip angles (real position, reference position)
// - port: 10005 -> Strain gauge wheight
// - port: 10006 -> CAN error
// - port: 10007 -> Position error
//
// Received data format: 
// Joint data: 8 bytes in hexadecimal => [sign_real_pos, interger_real_pos, decimals_1_real_pos, decimals_2_real_pos, sign_ref_pos, interger_ref_pos, decimals_1_ref_pos, decimals_2_ref_pos]
//
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
    [left_knee_real, left_knee_ref] = decodeRealRef(msg);
});
// Right knee data
s_right_knee.on('message', function(msg, info) {
    [right_knee_real, right_knee_ref] = decodeRealRef(msg);
});
// Left hip data
s_left_hip.on('message', function(msg, info) {
    [left_hip_real, left_hip_ref] = decodeRealRef(msg);
});
// Right hip data
s_right_hip.on('message', function(msg, info) {
    [right_hip_real, right_hip_ref] = decodeRealRef(msg);
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
// Bind the UDP ports
s_left_knee.bind(10001); 
s_right_knee.bind(10002); 
s_left_hip.bind(10003); 
s_right_hip.bind(10004); 
s_weight.bind(10005); 
s_can.bind(10006);
s_pos.bind(10007);

///////////////////////////////////////
//*** Server-Client communication ***//
///////////////////////////////////////
// Websockets
io.on('connection', (socket) => {
    console.log('new connection', socket.id);

    //Users Databases
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "mysql",
        database: "cpwdb"
    });
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "SELECT * FROM tabla_sesion JOIN tabla_pacientes ON tabla_sesion.idPaciente = tabla_pacientes.idtabla_pacientes JOIN tabla_terapeutas ON tabla_sesion.idTerapeuta = tabla_terapeutas.idtabla_terapeutas";
        con.query(sql, function (err, sessions_data) {
            if (err) throw err;
            //console.log(result);
            socket.emit('datostabla', sessions_data);         //session_data---- datos de las sesiones (configuraciones)
        });

        if (err) throw err;
        console.log("Connected Patient!");
        var sql = "SELECT * FROM tabla_pacientes";
        con.query(sql, function (err, patients_list) {
            if (err) throw err;
            console.log(patients_list);
            socket.emit('patientdata', patients_list);        // patients_list ---- Lista de pacientes, id-nombre-apellido
        });

        if (err) throw err;
        console.log("Connected Therapist!");
        var sql = "SELECT * FROM tabla_terapeutas";
        con.query(sql, function (err, therapist_list) {
            if (err) throw err;
            console.log(therapist_list);
            socket.emit('therapistdata', therapist_list);     //therapist_list ---- Lista de Terapeutas, id-nombre-apellido-centro
        });
    });

    // Move the platform manualy. Listen traction:message events 
    // and send UDP data to the platform (called in move.js)
    socket.on('traction:message', (data) => {
        moveManually(data);
    })

    // Send data to the charts in therapy monitoring
    setInterval(function () {
        socket.emit('monitoring:jointData', {
            right_hip_real: right_hip_real,
            right_hip_ref: right_hip_ref,
            left_hip_real: left_hip_real,
            left_hip_ref: left_hip_ref,
            right_knee_real: right_knee_real,
            right_knee_ref: right_knee_ref,
            left_knee_real: left_knee_real,
            left_knee_ref: left_knee_ref
        })
    }, PLOTSAMPLINGTIME);
    
    // Save therapy settings in a JSON file.
    socket.on('settings:save_settings', (data) => {
        fs.writeFileSync('config/therapySettings.json', JSON.stringify(data), function (err){
            if (err) throw err;
            console.log('Therapy settings saved!')
        })
    })

    // Show therapy settings in the monitoring screen.
    socket.on('monitoring:ask_therapy_settings', function(callbackFn) {
        // Read therappy settings from config file.
        fs.readFile('config/therapySettings.json', (err, data) => {
            if (err) throw err;
            let config = JSON.parse(data);
            console.log(config);
            // Send values
            socket.emit('monitoring:show_therapy_settings', {
                patient_name : config.patient_name,
                gmfcs :  config.gmfcs,
                gait_velocity :   config.gait_velocity,
                rom :   config.rom,
                pbws :   config.pbws,
                steps :   config.steps,
                left_hip_config :   config.left_hip_config,
                left_knee_config :   config.left_knee_config,
                right_hip_config :   config.right_hip_config,
                right_knee_config :   config.right_knee_config
            })
        });
    });

    // Update joint chart plots.
    socket.on('monitoring:jointData_ask', function(callbackFn) {
        socket.emit('monitoring:jointData_resp', {
            right_hip_real: right_hip_real,
            right_hip_ref: right_hip_ref,
            left_hip_real: left_hip_real,
            left_hip_ref: left_hip_ref,
            right_knee_real: right_knee_real,
            right_knee_ref: right_knee_ref,
            left_knee_real: left_knee_real,
            left_knee_ref: left_knee_ref
        })
    });

    socket.on('deleted_patient', function(iddeleted) {
        console.log(iddeleted);
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "mysql",
            database: "cpwdb"
          });
            con.connect(function(err) {
                if (err) throw err;
                console.log("Eliminado");
                //var sql = "SELECT * FROM tabla_sesion JOIN tabla_pacientes ON tabla_sesion.idPaciente = tabla_pacientes.idtabla_pacientes JOIN tabla_terapeutas ON tabla_sesion.idTerapeuta = tabla_terapeutas.idtabla_terapeutas";
               // con.query(sql, function (err, result) {
                //  if (err) throw err;
                  //console.log(result);
                //  socket.emit('datostabla', result);
               // });
    
            });
    });

    //INSERTAR PACIENTE QUE SE TRAE DESDE LA WEB HACIA LA BASE DE DATOS.
    socket.on('insertPatient', function(patient) {
        console.log(patient);
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "mysql",
            database: "cpwdb"
          });
            con.connect(function(err) {
                if (err) throw err;
                console.log("Agregado");
                console.log(patient[0]);
                console.log(patient[1]);
                var sql = "INSERT INTO tabla_pacientes (NombrePaciente, ApellidoPaciente) VALUES (?)";
                con.query(sql,[patient], function (err, result) {
                  if (err) throw err;
                  console.log("1 record inserted");
                //  socket.emit('datostabla', result);
                });
    
            });
    }); 

    // Configure the robot.
    socket.on('monitoring:configure_robot', function(callbackFn) {
        configureStartPos();
    });

    // Start therapy.
    socket.on('monitoring:start', function(callbackFn) {
        startTherapy();
    });

    // Stop therapy.
    socket.on('monitoring:stop', function(callbackFn) {
        stopTherapy();
    });
})

///////////////////
//** FUNCTIONS **//
///////////////////
//
// Move manually the robotic platform 
function moveManually(data) {
    //Get values 
    w_r = data.w_right;
    w_l = data.w_left;
    //Command variables 
    var cmd_start;
    var cmd_v_l;
    var cmd_v_r;
    var cmd_traction_mode;
    //Commands transformation:
    cmd_start = 0; 
    cmd_v_r = Math.round(50 * (1 + w_r/100));
    cmd_v_l = Math.round(50 * (1 + w_l/100));
    if (w_r === 0 && w_l === 0) {
        cmd_traction_mode = 0;  //0 -> STOP
    } else {
        cmd_traction_mode = 10; //10 -> Manual control
    }
    var trac_manual = [cmd_start, cmd_v_r, cmd_v_l, cmd_traction_mode];
    // Send UDP Mesage:
    stopExo();
    sendUDP(trac_manual,TRACTION_PORT, CPWALKER_IP); 
}

// Configure robot with the therapy settings and move to start position.  
function configureStartPos() {
    console.log("Configure and move to start pos");
    var exo_config = [];
    // Traction control variabels
    var trac_config = [];
    var cmd_start;
    var cmd_v_r;
    var cmd_v_l;
    var cmd_traction_mode;
    // Weight support variabels
    var weight_conf = [];
    var calibrate;
    var pat_weight
    var pbws;
    // Get therapy settings from json file
    fs.readFile('config/therapySettings.json', (err, data) => {
        if (err) throw err;
        // Get json object
        let config = JSON.parse(data);
        // Traction control config and initial position
        cmd_start = 150; // Exoskeleton goes to initial position
        cmd_v_r = 50; // Velocity of right wheel 0 
        cmd_v_l = 50; // Velocity of left wheel 0
        cmd_traction_mode = 0;
        trac_config = [cmd_start, cmd_v_r, cmd_v_l, cmd_traction_mode];
        // Weight support config
        calibrate = 1;
        pat_weight = parseInt(config.weight);
        pbws =  parseInt(config.pbws);
        weight_conf = [calibrate, pat_weight, pbws, 0];
        // Exoskeleton config and move to initial position.
        exo_config = [0,0,0,0,0,0,0,0];
        if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 0; } 
        if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 1; } 
        if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 2; } 
        if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 3; } 
        if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 4; } 
        if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 5; } 
        if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 6; } 
        if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 7; } 
        if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 8; } 
        if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 9; } 
        if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 10;} 
        if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 11;} 
        if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 12;} 
        if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 13;} 
        if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 14;} 
        if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 15;} 
        exo_config[1] = 20; // Move to the start position.
        exo_config[2] = parseInt(config.steps);
        exo_config[3] = parseInt(config.gait_velocity);
        exo_config[4] = parseInt(config.rom);
        exo_config[5] = parseInt(config.leg_length);
        // Send data to the robot
        sendUDP(trac_config, TRACTION_PORT, CPWALKER_IP); 
        sendUDP(weight_conf, WEIGHT_PORT, CPWALKER_IP);   
        sendUDP(exo_config, EXO_PORT, CPWALKER_IP);  
    });
}

function startTherapy() {
    // Traction control variabels
    var trac_config = [];
    var cmd_start;
    var cmd_v_r;
    var cmd_v_l;
    var cmd_traction_mode;
    // Exo control variabels
    var exo_config = [];
    var trajectory_ctr;
    var impedance_ctr;
    // Impedance variables
    var imp_config = [];
    var cal_imp;
    var niv_imp;
    var check_gauges;
    var weight_ref;
    // Read therappy settings from config file.
    fs.readFile('config/therapySettings.json', (err, data) => {
        if (err) throw err;
        // Get json object
        let config = JSON.parse(data);
        // Check type of therapy (trajectory control, impedance control)
        if (data.right_hip_config == "t_control" || data.left_hip_config == "t_control"
            || data.right_knee_config == "t_control" || data.left_knee_config == "t_control") {
            trajectory_ctr = true;
        } else {
            impedance_ctr = true;
        }
        // TRAJECTORY CONTROL
        if (config.control_mode == "trajectory") {
            console.log("Trajectory Control");
            // Traction control config and initial position
            cmd_start = 0; // Exoskeleton does not go to initial position
            cmd_v_r = 50; // Velocity of right wheel 0 
            cmd_v_l = 50; // Velocity of left wheel 0
            cmd_traction_mode = 20;
            trac_config = [cmd_start, cmd_v_r, cmd_v_l, cmd_traction_mode];
            // Impedance config
            cal_imp = 1;
            niv_imp = 0;
            check_gauges = 0;
            weight_ref = 0;
            imp_config = [cal_imp, niv_imp, check_gauges, weight_ref];
            // Exoskeleton config trajectory control mode.
            exo_config = [0,0,0,0,0,0,0,0];
            if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 0; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 1; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 2; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 3; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 4; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 5; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 6; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 7; } 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 8; } 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 9; } 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 10;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 11;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 12;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 13;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 14;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 15;} 
            exo_config[1] = 4; // Start motion in position control mode
            exo_config[2] = parseInt(config.steps);
            exo_config[3] = parseInt(config.gait_velocity);
            exo_config[4] = parseInt(config.rom);
            exo_config[5] = parseInt(config.leg_length);
        // IMPEDANCE CONTROL
        } else {
            console.log("Impedance Control");
            // Traction control config and initial position
            cmd_start = 0; // Exoskeleton does not go to initial position
            cmd_v_r = 50; // Velocity of right wheel 0 
            cmd_v_l = 50; // Velocity of left wheel 0
            cmd_traction_mode = 20; // Traction in "Auto" mode
            trac_config = [cmd_start, cmd_v_r, cmd_v_l, cmd_traction_mode];
            // Impedance config
            cal_imp = 1;
            if (config.control_mode == "h_impedance") {niv_imp = 3;}
            else if (config.control_mode == "m_impedance") {niv_imp = 2;}
            else if (config.control_mode == "l_impedance") {niv_imp = 1;} 
            else { niv_imp = 0;}
            check_gauges = 0;
            weight_ref = 0;
            imp_config = [cal_imp, niv_imp, check_gauges, weight_ref];
            // Exoskeleton config impedance control mode.
            exo_config = [0,0,0,0,0,0,0,0];
            if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 0; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 1; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 2; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 3; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 4; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 5; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 6; } 
            if (config.left_hip_config == "disable" && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 7; } 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 8; } 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 9; } 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 10;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "disable" && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 11;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "disable") {exo_config[0] = 12;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "disable" && config.right_knee_config == "enable" ) {exo_config[0] = 13;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "disable") {exo_config[0] = 14;} 
            if (config.left_hip_config == "enable"  && config.right_hip_config == "enable"  && config.left_knee_config == "enable"  && config.right_knee_config == "enable" ) {exo_config[0] = 15;} 
            exo_config[1] = 10; // Start motion in impedance control mode
            exo_config[2] = parseInt(config.steps);
            exo_config[3] = parseInt(config.gait_velocity);
            exo_config[4] = parseInt(config.rom);
            exo_config[5] = parseInt(config.leg_length);
        }
        // Send data to the robot
        sendUDP(trac_config, TRACTION_PORT, CPWALKER_IP);
        sendUDP(imp_config, IMPEDANCE_PORT, CPWALKER_IP);
        sendUDP(exo_config, EXO_PORT, CPWALKER_IP);     
    });
}

// Stop therapy.  
function stopTherapy() {
    console.log("Stop Therapy");
    // Traction control variabels
    var trac_config = [];
    var cmd_start;
    var cmd_v_r;
    var cmd_v_l;
    var cmd_traction_mode;
    // Exo control variabels
    var exo_config = [];
    // Exoskeleton config and move to initial position.
    exo_config = [0,0,0,0,0,0,0,0];
    // Traction control config and initial position
    cmd_start = 0; // Exoskeleton does not go to initial position
    cmd_v_r = 50; // Velocity of right wheel 0 
    cmd_v_l = 50; // Velocity of left wheel 0
    cmd_traction_mode = 0; // Stop traction
    trac_config = [cmd_start, cmd_v_r, cmd_v_l, cmd_traction_mode];
    // Send data
    sendUDP(trac_config, TRACTION_PORT, CPWALKER_IP);
    sendUDP(exo_config, EXO_PORT, CPWALKER_IP);  
}

function stopExo() {
    // Exo control variabels
    var exo_config = [];
   // Exoskeleton config and move to initial position.
   exo_config = [0,0,0,0,0,0,0,0];
   // Send data
   sendUDP(exo_config, EXO_PORT, CPWALKER_IP);  
}

// Sends COMMAND(array of numbers) to a PORT(int) of a specific IP(string)
function sendUDP(COMMAND, PORT, IP) {
    // Transform COMMAND to hexadecimal
    var COMMAND_HEX = [];
    for (let index = 0; index < COMMAND.length; index++) {
        if (COMMAND[index] < 16) {
            COMMAND_HEX[index] = (0).toString(16) + (COMMAND[index]).toString(16);            
        } else {
            COMMAND_HEX[index] = (COMMAND[index]).toString(16);
        }
    }
    var msg = Buffer.from(COMMAND_HEX.join(''),'hex');
    udp_send.send(msg, PORT, IP);
    console.log(`PORT:` + PORT + '; COMMAND: ' + COMMAND + '; COMMAND_HEX: ' + COMMAND_HEX.join('')); 
}

// Decode joint real and reference angle values. Get the coded_value and returns an array 
// with the real and reference angles  
function decodeRealRef(coded_values) {
    // Receive data of the reference and real position of the left knee:
    var sign_real_pos;
    var interger_real_pos;
    var decimals_1_real_pos; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_real_pos;
    var sign_ref_pos;
    var interger_ref_pos;
    var decimals_1_ref_pos; // No es necesario ya que los decimales nunca son mayores que 256
    var decimals_2_ref_pos;
    var codified_values = []; // Contains codified values 
    // Transform the coded_number of type string to an hex number array 
    for (i = 0 ; i < String(coded_values).length; i++) {
        codified_values.push(String(coded_values).charCodeAt(i));
    }
    // Decode values:
    // Sign:  0 = positive number, 1 = negative number
    if (codified_values[0] == 0) {
        sign_real_pos = 1;
    } else {
        sign_real_pos = -1;
    }
    if (codified_values[4] == 0) {
        sign_ref_pos = 1;
    } else {
        sign_ref_pos = -1;
    }
    // Interger values:
    interger_real_pos = codified_values[1];
    interger_ref_pos =  codified_values[5];
    // Decimals values:
    decimals_2_real_pos = codified_values[3];
    decimals_2_ref_pos =  codified_values[7];
    
    return [ sign_real_pos * (interger_real_pos + decimals_2_real_pos/100) , sign_ref_pos * (interger_ref_pos + decimals_2_ref_pos/100) ]
}
