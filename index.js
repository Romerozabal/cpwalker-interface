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
const CPWALKER_IP = '192.168.4.2';
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

////////////////////////////////////
//** Export .xlsx configuration **//
////////////////////////////////////
//
const ExcelJS = require('exceljs');
const { parse } = require('path');

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
//
//Connect with DataBase CPW_DB
var con = mysql.createConnection({
host: "localhost",
user: "root",
password: "mysql",
database: "cpwdb"
});
// Websockets
io.on('connection', (socket) => {
    console.log('new connection', socket.id);
    resetTexas();
    var datitos=[];

    //
    socket.on('refreshlist',function() {
        console.log("Connected!");
        var sql = "SELECT * FROM tabla_sesion JOIN tabla_pacientes ON tabla_sesion.idPaciente = tabla_pacientes.idtabla_pacientes JOIN tabla_terapeutas ON tabla_sesion.idTerapeuta = tabla_terapeutas.idtabla_terapeutas";
        con.query(sql, function (err, sessions_data) {
            if (err) throw err;
            socket.emit('datostabla', sessions_data);   //session_data---- datos de las sesiones (configuraciones)
        });
        console.log("Connected Patient!");
        var sql = "SELECT * FROM tabla_pacientes";
        con.query(sql, function (err, patients_list) {
            if (err) throw err;
            socket.emit('patientdata', patients_list);  //patients_list ----- lista de pacientes(id-nombre-apellido)
        });
        console.log("Connected Therapist!");
        var sql = "SELECT * FROM tabla_terapeutas";
        con.query(sql, function (err, therapist_list) {
            if (err) throw err;
            socket.emit('therapistdata', therapist_list);     //therapist_list ---- Lista de Terapeutas, id-nombre-apellido-centro
        });          
    })

    //DELET PATIENT DATABASE
    socket.on('deleted_patient', function(iddeleted) {
        var sql = "DELETE FROM tabla_pacientes WHERE idtabla_pacientes="+iddeleted;
        con.query(sql, function (err, result) {
            console.log("Delet Patient");
        });
    });

    //EDIT PATIENT DATABASE
    socket.on('edit_patient', function(editpat) {
        var sql = 'UPDATE tabla_pacientes SET NombrePaciente = ?, ApellidoPaciente = ?  WHERE (idtabla_pacientes=?)'
        con.query(sql,[editpat.NombrePaciente,editpat.ApellidoPaciente,editpat.idtabla_pacientes], function (err, result) {
            console.log("Edited Patient");
        });
    });
    // ADD PATIENT IN DATABASE
    socket.on('insertPatient', function(patient) {
        var sql = "INSERT INTO tabla_pacientes (NombrePaciente, ApellidoPaciente) VALUES (?)";
        con.query(sql,[patient], function (err, result) {
            if (err) throw err;
            console.log("1 record Patient");
        });
    });

    //DOWNLOAD PATIENT LIST (DATABASE)
    socket.on('download_patients',function(res){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('My Sheet');
        worksheet.columns = [
            { header: 'Id Patient', key: 'idtabla_pacientes', width: 10 },
            { header: 'First Name', key: 'NombrePaciente', width: 10 },
            { header: 'Last Name', key: 'ApellidoPaciente', width: 10 }
        ];
        var sql = "SELECT * FROM tabla_pacientes";
        con.query(sql, function (err, patients_list) {
            if (err) throw err;
            datitos=patients_list;
            //console.log(datitos);
                for (var i = 0; i < patients_list.length; i++) {
                    worksheet.addRow((patients_list[i]));
                }   
            workbook.xlsx.writeFile("Patients_DB.xlsx");
        });     
    })
    app.get('/downloadpatients', (req, res) => setTimeout(function(){ res.download('./Patients_DB.xlsx'); }, 100))


    
    // ADD THERAPIST IN DATABASE
    socket.on('insertTherapist', function(therapist) {
        var sql = "INSERT INTO tabla_terapeutas (NombreTerapeuta, ApellidoTerapeuta, Centro) VALUES (?)";
        con.query(sql,[therapist], function (err, result) {
            if (err) throw err;
            console.log("1 record Therapist");
        });
    });

    //EDIT THERAPIST DATABASE
    socket.on('edit_therapist', function(editpat) {
        var sql = 'UPDATE tabla_terapeutas SET NombreTerapeuta = ?, ApellidoTerapeuta = ?, Centro = ?  WHERE (idtabla_terapeutas=?)'
        con.query(sql,[editpat.NombreTerapeuta,editpat.ApellidoTerapeuta, editpat.Centro,editpat.idtabla_terapeutas], function (err, result) {
            console.log("Edited therapist");
        });
    });

    //DELET THERAPIST DATABASE
    socket.on('deleted_therapist', function(iddeleted) {
        var sql = "DELETE FROM tabla_terapeutas WHERE idtabla_terapeutas="+iddeleted;
        con.query(sql, function (err, result) {
            console.log("Delet Therapist");
        });
    });  

    //DOWNLOAD PATIENT LIST (DATABASE)
    socket.on('download_therapist',function(res){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Therapists');
        worksheet.columns = [
            { header: 'Id Therapist', key: 'idtabla_terapeutas', width: 10 },
            { header: 'First Name', key: 'NombreTerapeuta', width: 10 },
            { header: 'Last Name', key: 'ApellidoTerapeuta', width: 10 }
        ];
        var sql = "SELECT * FROM tabla_terapeutas";
        con.query(sql, function (err, therapist_list) {
            if (err) throw err;
                for (var i = 0; i < therapist_list.length; i++) {
                    worksheet.addRow((therapist_list[i]));
                }   
            workbook.xlsx.writeFile("Therapists_DB.xlsx");
        });     
    })
    app.get('/downloadtherapists', (req, res) => setTimeout(function(){ res.download('./Therapists_DB.xlsx'); }, 100))

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
        fs.writeFileSync('/home/pi/CPWalker/cpwalker-interface/config/therapySettings.json', JSON.stringify(data), function (err){
            if (err) throw err;
            console.log('Therapy settings saved!')
        })
    })

    // Show therapy settings in the monitoring screen.
    socket.on('monitoring:ask_therapy_settings', function(callbackFn) {
        // Read therappy settings from config file.
        fs.readFile('/home/pi/CPWalker/cpwalker-interface/config/therapySettings.json', (err, data) => {
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

    // Update joint chart plots.
    socket.on('FES:configuration', function(data) {
        var stimulation_point = data.stimulation_point;
        //console.log(data.channels, data.current, data.pw, data.main_freq, data.mode)
        var trama = configFES(data.channels, data.current, data.pw, data.main_freq, data.mode);
        sendUDP(trama,50017,CPWALKER_IP);
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));        
        })();
        sendUDP(trama,8080,"localhost");        
    });
})

///////////////////
//** FUNCTIONS **//
///////////////////
//
// Move manually the robotic platform 
function resetTexas () {
    sendUDP(255,9999,CPWALKER_IP);
}

function configFES (channels, current, pw ,main_freq, group_time, mode) {   
    // channels: Stimulator channels to be sued (example:'00100011' // Canales activos, segun orden descendente:1 (tibial), 2(Gastrocnemios) y 5 (Cuádriceps))    
    // current: Stimulation Current [mA]
    // pw: Pulse width [us]
    // main_freq: Attendance frequency [hz]
    // group_time: Attendance frequency between groups (doublets and triplets)
    // mode: Mode of assistance: single pulses, doublets and triplets
       
    // Channels:
    channels_dec = parseInt(channels,2); 
    console.log("channels_dec: " + channels_dec);

    // Main frequency
    period = Math.abs((1/main_freq)*1000); // sec to msec
    console.log("period: " + period);
    period_mod = period-1;             // Datasheet: period=main_time*.5ms + 1ms
    console.log("period_mod: " + period_mod);
    main_time = period_mod/.5;
    console.log("main_time: " + main_time);
    main_time_bin = parseInt(main_time,10).toString(2); 
    console.log("main_time_bin: " + main_time_bin);
    main_time_bin = binaryResize (main_time_bin, 11)
    console.log("main_time_bin (11): " + main_time_bin);

    // Group frequency (neceista tamaño 8 bits)
    console.log("group_time: " + group_time);
    group_time_bin = parseInt(group_time).toString(2); // Conver to binary
    console.log("group_time_bin: " + group_time_bin);
    group_time_bin = binaryResize (group_time_bin, 8); // Resize binary number
    console.log("group_time_bin (8): " + group_time_bin);

    // Frequency configuration   
    var crc_update_bin = ('100' + binaryResize(parseInt((channels_dec + main_time + group_time) % 8 , 10).toString(2), 3) + '00'); // Update sequence
    var crc_update =  parseInt(crc_update_bin, 2);
    console.log("crc_update: " + crc_update);
    console.log("crc_update_bin: " + crc_update_bin);

    var tren_set = [crc_update,  parseInt('00'+channels.substr(0,channels.length-2),2) , parseInt('0'+channels.substr(channels.length-1,2)+'00000',2) , parseInt('000000'+ group_time_bin.substr(0,2),2) , parseInt('0'+group_time_bin.substr(group_time.length-2,2)+main_time_bin.substr(0,4),2) , parseInt('0'+main_time_bin.substr(4,main_time_bin.length-4),2)]; // Attendance sequence    

    // Pulse width
    pw_bin=parseInt(pw).toString(2); 
    pw_bin = binaryResize(pw_bin,9);
    console.log("pw_bin: " + pw_bin);


    // Current
    crc_update_bin = parseInt('101' + binaryResize(parseInt((pw + current + mode) % 32).toString(2), 5));
    crc_update = parseInt(crc_update_bin, 2);
    tramaStim  = [crc_update, parseInt('0' + binaryResize(parseInt(mode).toString(2),2) + '000' + pw_bin.substr(0,2), 2), parseInt('0' + pw_bin.substr(2,pw_bin.length), 2), current, 0, 0, 0, 0, 0, 0];
    trama = tren_set.concat(tramaStim);
    console.log("crc_update_bin (8): " + crc_update_bin);
    console.log("tramaStim: " + tramaStim);
    console.log("tren_set: " + tren_set);
    console.log("trama: " + trama);
    return trama;
}

function binaryResize (data, size) {
    var dataResized = '';
    for (let index = 0; index <= size; index++) {
        if (index <= data.length) {
            dataResized = dataResized + data.charAt(index);
        } else {
            dataResized = '0' + dataResized;
        }
    }
    return dataResized;
}
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
    var trac_manual = [cmd_start, cmd_v_l, cmd_v_r, cmd_traction_mode];
    // Send UDP Mesage:
    stopExo();
    (async () => {
        await new Promise(resolve => setTimeout(resolve, 50));        
    })();
    sendUDP(trac_manual, TRACTION_PORT, CPWALKER_IP);
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
    fs.readFile('/home/pi/CPWalker/cpwalker-interface/config/therapySettings.json', (err, data) => {
        if (err) throw err;
        // Get json object
        let config = JSON.parse(data);
        // Traction control config and initial position
        cmd_start = 150; // Exoskeleton goes to initial position
        cmd_v_r = 50; // Velocity of right wheel 0 
        cmd_v_l = 50; // Velocity of left wheel 0
        cmd_traction_mode = 0;
        trac_config = [cmd_start, cmd_v_l, cmd_v_r, cmd_traction_mode];
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
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));        
        })();
        sendUDP(trac_config, TRACTION_PORT, CPWALKER_IP);
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));        
        })();
        sendUDP(weight_conf, WEIGHT_PORT, CPWALKER_IP);
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));        
        })();
        setTimeout(sendUDP(exo_config, EXO_PORT, CPWALKER_IP), 50);
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));        
        })();
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
    fs.readFile('/home/pi/CPWalker/cpwalker-interface/config/therapySettings.json', (err, data) => {
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
            trac_config = [cmd_start, cmd_v_l, cmd_v_r, cmd_traction_mode];
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
            trac_config = [cmd_start, cmd_v_l, cmd_v_r, cmd_traction_mode];
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
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));        
        })();
        sendUDP(trac_config, TRACTION_PORT, CPWALKER_IP);
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));        
        })();
        sendUDP(imp_config, IMPEDANCE_PORT, CPWALKER_IP);
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));        
        })();
        sendUDP(exo_config, EXO_PORT, CPWALKER_IP);
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));        
        })();
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
    trac_config = [cmd_start, cmd_v_l, cmd_v_r, cmd_traction_mode];
    // Send data
    (async () => {
        await new Promise(resolve => setTimeout(resolve, 50));        
    })();
    sendUDP(trac_config, TRACTION_PORT, CPWALKER_IP);
    (async () => {
        await new Promise(resolve => setTimeout(resolve, 50));        
    })();
    sendUDP(exo_config, EXO_PORT, CPWALKER_IP);
    (async () => {
        await new Promise(resolve => setTimeout(resolve, 50));        
    })();
}

function stopExo() {
    // Exo control variabels
    var exo_config = [];
   // Exoskeleton config and move to initial position.
   exo_config = [0,0,0,0,0,0,0,0];
   // Send data   
   sendUDP(exo_config, EXO_PORT, CPWALKER_IP);
   (async () => {
    await new Promise(resolve => setTimeout(resolve, 50));        
    })();
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
    if (COMMAND_HEX.length > 1) {
        var msg = Buffer.from(COMMAND_HEX.join(''),'hex');
    } else {
        var msg = Buffer.from(COMMAND_HEX,'hex');
    }

    udp_send.send(msg, PORT, IP);
    console.log(`PORT:` + PORT + '; COMMAND: ' + COMMAND + '; COMMAND_HEX: ' + COMMAND_HEX); 
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
