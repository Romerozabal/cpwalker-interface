const socket = io();

window.onload = function(){ 
    document.getElementById("login_therapist_patient").onclick = function() {
        console.log("Entro en logins");
        var therapist_name = document.getElementById("therapistsnames");
        var patient_name = document.getElementById("patientssnames");
        // Send data to server
        socket.emit('login:message', {
            therapist_name: therapist_name.value,
            patient_name: patient_name.value
        })
        console.log(patient_name, therapist_name);
    };
   
    document.getElementById("gait_velocity").onclick = function() {
        console.log("Entro en gait velocity");
        var gait_velocity = document.getElementById("gait_velocity").value;
        document.getElementById("gait_velocity_value").innerHTML = gait_velocity + "%";
    };

    document.getElementById("rom").onclick = function() {
        console.log("Entro en gait rom");
        var gait_velocity = document.getElementById("rom").value;
        document.getElementById("rom_value").innerHTML = gait_velocity + "%";
    };

    document.getElementById("pbws").onclick = function() {
        console.log("Entro en gait pbws");
        var gait_velocity = document.getElementById("pbws").value;
        document.getElementById("pbws_value").innerHTML = gait_velocity + "%";
    };

};