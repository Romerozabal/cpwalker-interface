const socket = io();

// Trigger modal
$( document ).ready( function() {
    $("#myModal").modal('show');
    $('.modal-backdrop').appendTo('.modal_area');
});

// Prevent disapearing 
$('#myModal').modal({
    backdrop: 'static',
    keyboard: false
})


window.onload = function(){ 
    // Updates the therapist and patient name according to the selected names in the "login" popup.
    document.getElementById("login_therapist_patient").onclick = function() {
        if  (document.getElementById("therapists-list").value == "no_choose" ||
             document.getElementById("patients-list").value == "no_choose") {   
                if  (document.getElementById("therapists-list").value == "no_choose") {
                    document.getElementById("empty_therapist").innerHTML = "Select a therapist or login a new one."
                }   
                if  (document.getElementById("therapists-list").value != "no_choose") {
                    document.getElementById("empty_therapist").innerHTML = ""
                }                 
                if (document.getElementById("patients-list").value == "no_choose") {    
                    document.getElementById("empty_patient").innerHTML = "Select a patient or login a new one."
                } 
                if (document.getElementById("patients-list").value != "no_choose") {    
                    document.getElementById("empty_patient").innerHTML = ""
                } 
        } else {
            var therapist_name = document.getElementById("therapists-list");
            var patient_name = document.getElementById("patients-list");
            document.getElementById("therapist-name").innerHTML = therapist_name.value;
            //document.getElementById("therapist_").innerHTML = therapist_name.value;
            document.getElementById("patient-name").innerHTML = patient_name.value;
            $('#myModal').modal('hide');
        }        
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
            // Send data to server
            socket.emit('settings:save_settings', {
                therapist_name: document.getElementById("therapists-list").value,
                patient_name: document.getElementById("patients-list").value,
                patient_age: document.getElementById("patient_age").value,
                gmfcs: document.getElementById("gmfcs").value,
                leg_length: document.getElementById("leg_length").value,
                weight: document.getElementById("weight").value,
                observations: document.getElementById("observations").value,
                gait_velocity: document.getElementById("gait_velocity").value,
                rom: document.getElementById("rom").value,
                pbws: document.getElementById("pbws").value,
                steps: document.getElementById("steps").value,
                control_mode : document.getElementById("control_mode").value,
                left_hip_config: document.getElementById("left_hip_config").value,
                left_knee_config: document.getElementById("left_knee_config").value,
                right_hip_config: document.getElementById("right_hip_config").value,
                right_knee_config: document.getElementById("right_knee_config").value
            })
            // Redirect to the therapy monitoring window
            location.replace("therapy_monitoring.html")
        }
    };
};