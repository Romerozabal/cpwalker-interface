const socket = io();

window.onload = function(){ 
    // Updates the therapist and patient name according to the selected names in the "login" popup.
    document.getElementById("login_therapist_patient").onclick = function() {
        var therapist_name = document.getElementById("therapistsnames");
        var patient_name = document.getElementById("patientssnames");
        document.getElementById("therapist").innerHTML = therapist_name.value;
        document.getElementById("patient").innerHTML = patient_name.value;
    };
   
    // Updates the value of the "gait_velocity" range input
    document.getElementById("gait_velocity").onclick = function() {
        var gait_velocity = document.getElementById("gait_velocity").value;
        document.getElementById("gait_velocity_value").innerHTML = gait_velocity + "%";
    };

    // Updates the value of the "rom" range input
    document.getElementById("rom").onclick = function() {
        var rom = document.getElementById("rom").value;
        document.getElementById("rom_value").innerHTML = rom + "%";
    };

    // Updates the value of the "pbws" range input
    document.getElementById("pbws").onclick = function() {
        var pbws = document.getElementById("pbws").value;
        document.getElementById("pbws_value").innerHTML = pbws + "%";
    };

    // When the "save_settings" button is clicked, send all the configured parameters to the server 
    document.getElementById("save_settings").onclick = function() {
        // First click change colour
        if (document.getElementById("save_settings").value == "save_settings") {
            document.getElementById("save_settings").value = "continue";
            document.getElementById("save_settings").innerHTML = "Continue";
            document.getElementById("save_settings").style.background = "#4CAF50"; 
        // Second click send data
        } else if (document.getElementById("save_settings").value == "continue") {
            var therapist_name = document.getElementById("therapistsnames").value;
            var patient_name = document.getElementById("patientssnames").value;
            var patient_age = document.getElementById("patient_age").value;
            var gmfcs = document.getElementById("gmfcs").value;
            var leg_length = document.getElementById("leg_length").value;
            var weight = document.getElementById("weight").value;
            var hip_upper_strap = document.getElementById("hip_upper_strap").value;
            var knee_lower_strap = document.getElementById("knee_lower_strap").value;
            var observations = document.getElementById("observations").value;
            var gait_velocity = document.getElementById("gait_velocity").value;
            var rom = document.getElementById("rom").value;
            var pbws = document.getElementById("pbws").value;
            var steps = document.getElementById("steps").value;
            var left_hip_config = document.getElementById("left_hip_config").value;
            var left_knee_config = document.getElementById("left_knee_config").value;
            var right_hip_config = document.getElementById("right_hip_config").value;
            var right_knee_config = document.getElementById("right_knee_config").value;
            
            // Send data to server
            socket.emit('save_settings:message', {
                therapist_name: therapist_name,
                patient_name: patient_name,
                patient_age: patient_age,
                gmfcs: gmfcs,
                leg_length: leg_length,
                weight: weight,
                hip_upper_strap: hip_upper_strap,
                knee_lower_strap: knee_lower_strap,
                observations: observations,
                gait_velocity: gait_velocity,
                rom: rom,
                pbws: pbws,
                steps: steps,
                left_hip_config: left_hip_config,
                left_knee_config: left_knee_config,
                right_hip_config: right_hip_config,
                right_knee_config: right_knee_config
            })

            // Redirect to the therapy monitoring window
            location.replace("therapy_monitoring.html")

        }
    };

};