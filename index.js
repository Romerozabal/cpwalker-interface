var dgram = require('dgram');
const path = require('path'); // Modulo de nodejs para trabajar con rutas
const express = require('express'); // Configurar express

//Socket for UPD communications
var s = dgram.createSocket('udp4');
// UDP NETWORK 
var IP;
const CPWalker_IP = '192.168.4.1';
const LOCAL_IP = 'localhost';
var PORT;
const EXO_PORT = 50011; //Exoskeleton port
const WEIGHT_PORT = 50015; //Patient weight control
const TRACTION_PORT = 50012; //Traction control
const IMPEDANCE_PORT = 50016; //Impedance control
var COMMAND; //String with exadecimal values of the selected comand
//Examples TRACTION:  MOVE 6E19190A ,   STOP 6E32320A

//Configuracion server
const app = express(); //Inicializar express en app
app.set('port', process.env.PORT || 3000)

// Enviar archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Utilizar el puerto
const server = app.listen(app.get('port'), () => {
    console.log('Server', app.get('port'));
})

// Consfiguracion socket io
const SocketIO = require('socket.io'); // Proporciona el server a socketio
const io = SocketIO(server);

// Websockets
io.on('connection', (socket) => {
    console.log('new connection', socket.id);

    //Listen traction:message events
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
        //IP = LOCAL_IP;
        PORT = 8080;
        var msg = Buffer.from(COMMAND,'hex');
        s.send(msg, PORT, IP);

        //Debug
        console.log('Velocities:' + w_r , w_l);
        console.log('COMMAND:' + cmd_start + cmd_v_r + cmd_v_l + cmd_traction_mode);
        console.log(`HEX COMMAND:` + COMMAND);
        console.log(`msg:` + msg);  
    })

    //Listen login:message events
    socket.on('login:message', (data) => {
        //Get values 
        therapist_name = data.therapist_name;
        patient_name = data.patient_name;

        //Debug
        console.log(therapist_name, patient_name);
    })
})


