const socket = io();

//** Global variables **//
var THERAPY_MONITOR_GOTO_LINK;
// Joints data 
var right_hip_real;
var right_hip_ref;
var left_hip_real;
var left_hip_ref;
var right_knee_real;
var right_knee_ref;
var left_knee_real;
var left_knee_ref;
var right_leg_index;
var left_leg_index;
var current_step = 0;
var flag_stp = true;
var numberElements = 100;

var increase_time = false;
var decrease_time = false;

setInterval(function () {
	if (decrease_time && parseInt(document.getElementById("time_window").value) > 0) {
		document.getElementById("time_window").value = parseInt(document.getElementById("time_window").value) - 1;
		document.getElementById("time_window").innerHTML = (document.getElementById("time_window").value).toString() + " (s)";
		numberElements = parseInt(document.getElementById("time_window").value) * 10;
		console.log(document.getElementById("time_window").value);
	}
	
	if (increase_time) {
		document.getElementById("time_window").value = parseInt(document.getElementById("time_window").value) + 1;
		document.getElementById("time_window").innerHTML = (document.getElementById("time_window").value).toString() + " (s)";
		numberElements = parseInt(document.getElementById("time_window").value) * 10;
	}
}, 100);

// Get charts form html and plot the incomming data. 
window.onload = function() {
	////////////////
	//** Charts **//
	////////////////
	// Charts configuration
	//Configuration variables

	document.getElementById("time_window_decrease").onmousedown = function() {
		decrease_time = true;		
	};	
	document.getElementById("time_window_decrease").onmouseup = function() {
		decrease_time = false;
	};
	document.getElementById("time_window_increase").onmousedown = function() {
		increase_time = true;
	};
	document.getElementById("time_window_increase").onmouseup = function() {
		increase_time = false;
	};

	//Globals
	var updateCount = 0;

	// Chart Objects
	var ctxrhip = document.getElementById('r_hip_chart').getContext('2d');
	var ctxlhip = document.getElementById('l_hip_chart').getContext('2d');
	var ctxrknee = document.getElementById('r_knee_chart').getContext('2d');
	var ctxlknee = document.getElementById('l_knee_chart').getContext('2d');
	ctxrhip.canvas.height = 340;
	ctxlhip.canvas.height = 340;
	ctxrknee.canvas.height = 340;
	ctxlknee.canvas.height = 340;

	//chart instances & configuration
	var commonOptions = {
		scales: {
			xAxes: [{
				type: 'time',
				distribution: 'line',
				time: {
					unit: 'second',
					displayFormats: {
                        quarter: 'HH MM SS'
                    }
				},
				scaleLabel: {
					display: true,
					labelString: 'Time'
				},
				ticks: {
					autoSkip: false,
					sampleSize: 100,
					maxRotation: 0,
					minRotation: 0
				}
			}],
			yAxes: [{
				ticks: {
					suggestedMax: 60,    // maximum will be 70, unless there is a lower value.
					suggestedMin: -20,    // minimum will be -10, unless there is a lower value.
				},
				scaleLabel: {
					display: true,
					labelString: 'Degrees'
				}
			}]
		},
		legend: {display: true},
		tooltips:{
			enabled: false
		},
		maintainAspectRatio: false
	};
	var ctxrhipInstance = new Chart(ctxrhip, {
		type: 'line',
		data: {
			datasets: [{
				label: "Reference",
				data: 0,
				fill: false,
				borderColor: '#2626FF',
				borderWidth: 1.5,
				pointStyle: 'line'
			}, {
				label: 'Real',
				data: 0,
				fill: false,
				borderColor: '#FF2626',
				borderWidth: 1.5,
				pointStyle: 'line'
			}]
		},
		options: Object.assign({}, commonOptions, {
			//showLines: false, // disable for a single dataset
			animation: {
				duration: 0 // general animation time
			},
			elements: {
				line: {
					tension: 0 // disables bezier curves
				}
			},
			title:{
			display: true,
			text: "Right Hip",
			fontSize: 18
			}
		})
	});

	var ctxlhipInstance = new Chart(ctxlhip, {
		type: 'line',
		data: {
			datasets: [{
				label: "Reference",
				data: 0,
				fill: false,
				borderColor: '#2626FF',
				borderWidth: 1.5,
				pointStyle: 'line'
			}, {
				label: 'Real',
				data: 0,
				fill: false,
				borderColor: '#FF2626',
				borderWidth: 1.5,
				pointStyle: 'line'
			}]
		},
		options: Object.assign({}, commonOptions, {
			//showLines: false, // disable for a single dataset
			animation: {
				duration: 0 // general animation time
			},
			elements: {
				line: {
					tension: 0 // disables bezier curves
				}
			},
			title:{
			display: true,
			text: "Left Hip",
			fontSize: 18
			}
		})    
	});

	var ctxrkneeInstance = new Chart(ctxrknee, {
		////showLines: false, // disable for a single dataset
		animation: {
            duration: 0 // general animation time
        },
		elements: {
            line: {
                tension: 0 // disables bezier curves
            }
		},
		type: 'line',
		data: {
			datasets: [{
				label: "Reference",
				data: 0,
				fill: false,
				borderColor: '#2626FF',
				borderWidth: 1.5,
				pointStyle: 'line'
			}, {
				label: 'Real',
				data: 0,
				fill: false,
				borderColor: '#FF2626',
				borderWidth: 1.5,
				pointStyle: 'line'
			}]
		},
		options: Object.assign({}, commonOptions, {
			//showLines: false, // disable for a single dataset
			animation: {
				duration: 0 // general animation time
			},
			elements: {
				line: {
					tension: 0 // disables bezier curves
				}
			},
			title:{
			display: true,
			text: "Right Knee",
			fontSize: 18
			}
		})
	});

	var ctxlkneeInstance = new Chart(ctxlknee, {
		//showLines: false, // disable for a single dataset
		animation: {
            duration: 0 // general animation time
        },
		elements: {
            line: {
                tension: 0 // disables bezier curves
            }
		},
		type: 'line',
		data: {
			datasets: [{
				label: "Reference",
				data: 0,
				fill: false,
				borderColor: '#2626FF',
				borderWidth: 1.5,
				pointStyle: 'line'
			}, {
				label: 'Real',
				data: 0,
				fill: false,
				borderColor: '#FF2626',
				borderWidth: 1.5,
				pointStyle: 'line'
			}]
		},
		options: Object.assign({}, commonOptions, {
			//showLines: false, // disable for a single dataset
			animation: {
				duration: 0 // general animation time
			},
			elements: {
				line: {
					tension: 0 // disables bezier curves
				}
			},
			title:{
			display: true,
			text: "Left Knee",
			fontSize: 18
			}
		})    
	});

	// Receive joints data from server 
	socket.on('monitoring:jointData', (data) => {
		right_hip_real = Math.floor(data.right_hip_real);
		right_hip_ref = Math.floor(data.right_hip_ref);
		left_hip_real = Math.floor(data.left_hip_real);
		left_hip_ref = Math.floor(data.left_hip_ref);
		right_knee_real = Math.floor(data.right_knee_real);
		right_knee_ref = Math.floor(data.right_knee_ref);
		left_knee_real = Math.floor(data.left_knee_real);
		left_knee_ref = Math.floor(data.left_knee_ref);
		right_leg_index = parseInt(data.right_leg_index);
		left_leg_index = parseInt(data.left_leg_index);

		if (left_leg_index <= 20) {
			flag_stp = true;
		}

		if (left_leg_index >= 190 && flag_stp) {
			flag_stp = false;
			current_step = current_step + 1;
			document.getElementById("current_steps").innerHTML = current_step.toString() + " / " + document.getElementById("steps").innerHTML;
		}

		ctxrhipInstance.data.labels.push(new Date());
		ctxrhipInstance.data.datasets[0].data.push(right_hip_ref);
		ctxrhipInstance.data.datasets[1].data.push(right_hip_real);
		
		ctxlhipInstance.data.labels.push(new Date());
		ctxlhipInstance.data.datasets[0].data.push(left_hip_ref);
		ctxlhipInstance.data.datasets[1].data.push(left_hip_real);

		ctxrkneeInstance.data.labels.push(new Date());
		ctxrkneeInstance.data.datasets[0].data.push(right_knee_ref);
		ctxrkneeInstance.data.datasets[1].data.push(right_knee_real);
		
		ctxlkneeInstance.data.labels.push(new Date());
		ctxlkneeInstance.data.datasets[0].data.push(left_knee_ref);
		ctxlkneeInstance.data.datasets[1].data.push(left_knee_real);

		console.log(ctxlkneeInstance.data.datasets[1].data. length);
		console.log(numberElements);
		console.log(updateCount);

		if(updateCount >= numberElements){
			ctxrhipInstance.data.labels.shift();
			ctxrhipInstance.data.datasets[0].data.shift();
			ctxrhipInstance.data.datasets[1].data.shift();

			ctxlhipInstance.data.labels.shift();
			ctxlhipInstance.data.datasets[0].data.shift();
			ctxlhipInstance.data.datasets[1].data.shift();

			ctxrkneeInstance.data.labels.shift();
			ctxrkneeInstance.data.datasets[0].data.shift();
			ctxrkneeInstance.data.datasets[1].data.shift();

			ctxlkneeInstance.data.labels.shift();
			ctxlkneeInstance.data.datasets[0].data.shift();
			ctxlkneeInstance.data.datasets[1].data.shift();

			if (numberElements < ctxrkneeInstance.data.datasets[0].data.length) {
				ctxrhipInstance.data.labels.shift();
				ctxrhipInstance.data.datasets[0].data.shift();
				ctxrhipInstance.data.datasets[1].data.shift();

				ctxlhipInstance.data.labels.shift();
				ctxlhipInstance.data.datasets[0].data.shift();
				ctxlhipInstance.data.datasets[1].data.shift();

				ctxrkneeInstance.data.labels.shift();
				ctxrkneeInstance.data.datasets[0].data.shift();
				ctxrkneeInstance.data.datasets[1].data.shift();

				ctxlkneeInstance.data.labels.shift();
				ctxlkneeInstance.data.datasets[0].data.shift();
				ctxlkneeInstance.data.datasets[1].data.shift();

				updateCount--;
			}
		}
		else updateCount++;
		ctxrhipInstance.update();
		ctxlhipInstance.update();
		ctxrkneeInstance.update();
		ctxlkneeInstance.update();			
	})
	
	// Start stop interaction
	document.getElementById("start_stop").onclick = function() {
		// Move to the start position and configure the robot with the therapy settings
		if (document.getElementById("start_stop").value == "start_position") {
			document.getElementById("start_stop").value = "countdown";
			socket.emit('monitoring:configure_robot');
			var myTimer;
			myTimer = setInterval(myClock, 1000);
			var c = 4;
			function myClock() {
				document.getElementById("start_stop").innerHTML = --c;
					if (c == 0) {
						clearInterval(myTimer);
						document.getElementById("save_data").style.display = 'none';
						document.getElementById("start_stop").value = "start";
						document.getElementById("start_stop").innerHTML = "START";
						document.getElementById("start_stop").style.background = "#09c768";
					}
			}
			current_step = 0;
			document.getElementById("current_steps").innerHTML = current_step.toString() + " / " + document.getElementById("steps").innerHTML;			
		// Start the therapy
		} else if (document.getElementById("start_stop").value == "start") {
				document.getElementById("start_stop").value = "countdown";
				socket.emit('monitoring:start');
				var myTimer;
				myTimer = setInterval(myClock, 1000);
				var c = 4;
				function myClock() {
					document.getElementById("start_stop").innerHTML = --c;
						if (c == 0) {
							clearInterval(myTimer);
							document.getElementById("save_data").style.display = 'none';
							document.getElementById("start_stop").value = "stop";
							document.getElementById("start_stop").innerHTML = "STOP";
							document.getElementById("start_stop").style.background = "#fd4e4e"; 
							current_step = 0;
							document.getElementById("current_steps").innerHTML = current_step.toString() + " / " + document.getElementById("steps").innerHTML;
						}
				}
		// Stop the therapy
		}  else if (document.getElementById("start_stop").value == "stop") {
			document.getElementById("save_data").value = "not_saved";
			document.getElementById("save_data").innerHTML = "Save Data";
			document.getElementById("save_data").style.background = "#fd4e4e";
			document.getElementById("save_data").style.display = 'block';
			document.getElementById("start_stop").value = "start_position";
			document.getElementById("start_stop").innerHTML = "MOVE TO START POSITION";
			document.getElementById("start_stop").style.background = "#0968e4";
			socket.emit('monitoring:stop'); 
			current_step = 0;
			document.getElementById("current_steps").innerHTML = current_step.toString() + " / " + document.getElementById("steps").innerHTML;
		}
	};

	// Start stop interaction
	document.getElementById("save_data").onclick = function() {
		if (document.getElementById("save_data").value == "not_saved") { 
			// Change button style
			document.getElementById("save_data").value = "saved";
			document.getElementById("save_data").innerHTML = "Data Saved";
			document.getElementById("save_data").style.background = "#0968e4";

			// Save configurtion 
			socket.emit('addsesiondata')
			// Obtain gait therapy information


		}
	}


	// Advise: changing window and will stop therapy
	document.getElementById("indexHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "index.HTML";
	};
	document.getElementById("moveHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "move.html";
	};
	document.getElementById("usersHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "users.html";
	};
	document.getElementById("therapySettingsHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "therapy_settings.html";
	};
	document.getElementById("fesHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "fes.html";
	};	

	document.getElementById("continue-therapy").onclick = function() {
		$("#modal-change-page").modal('hide');
	}

	document.getElementById("stop-exit-therapy").onclick = function() {
		// Redirect to the therapy monitoring window
		location.replace(THERAPY_MONITOR_GOTO_LINK)
	}
};

// Show modal if click on change page
function preventChange() {
	$("#modal-change-page").modal('show');
 };

 // Stop therapy in case of window reunload
window.onbeforeunload = function() {
	socket.emit("monitoring:stop");
}

// Show therapy settings in table
socket.emit('monitoring:ask_therapy_settings');
socket.on('monitoring:show_therapy_settings', (data) => {
	document.getElementById("patient").innerHTML =  data.patient_name;
	document.getElementById("gait_velocity").innerHTML = data.gait_velocity;
	document.getElementById("ROM").innerHTML =  data.rom;
	document.getElementById("PBWS").innerHTML =  data.pbws;
	document.getElementById("steps").innerHTML =  data.steps;
	document.getElementById("control_mode").innerHTML =  data.control_mode;
	document.getElementById("right_knee_config").innerHTML =  data.right_knee_config;
	document.getElementById("left_knee_config").innerHTML =  data.left_knee_config;
	document.getElementById("right_hip_config").innerHTML =  data.right_hip_config;
	document.getElementById("left_hip_config").innerHTML =  data.left_hip_config;
})

