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



// Get charts form html and plot the incomming data. 
window.onload = function() {
	////////////////
	//** Charts **//
	////////////////
	// Charts configuration
	//Configuration variables
	var numberElements = 70;

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
					displayFormats: {
						second: 'mm:ss'
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
					tension: 0.3 // disables bezier curves
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
					tension: 0.4 // disables bezier curves
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
                tension: 0.4 // disables bezier curves
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
					tension: 0.4 // disables bezier curves
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
                tension: 0.4 // disables bezier curves
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
					tension: 0.4 // disables bezier curves
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

		ctxrhipInstance.data.labels.push(new Date());
		ctxrhipInstance.data.datasets[0].data.push(right_knee_ref);
		ctxrhipInstance.data.datasets[1].data.push(right_knee_real);
		
		ctxlhipInstance.data.labels.push(new Date());
		ctxlhipInstance.data.datasets[0].data.push(left_knee_ref);
		ctxlhipInstance.data.datasets[1].data.push(left_knee_real);

		ctxrkneeInstance.data.labels.push(new Date());
		ctxrkneeInstance.data.datasets[0].data.push(right_knee_ref);
		ctxrkneeInstance.data.datasets[1].data.push(right_knee_real);
		
		ctxlkneeInstance.data.labels.push(new Date());
		ctxlkneeInstance.data.datasets[0].data.push(left_knee_ref);
		ctxlkneeInstance.data.datasets[1].data.push(left_knee_real);

		
		if(updateCount > numberElements){
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
			document.getElementById("start_stop").value = "start";
			document.getElementById("start_stop").innerHTML = "START";
			socket.emit('monitoring:configure_robot');
		// Start the therapy
		} else if (document.getElementById("start_stop").value == "start") {
				document.getElementById("start_stop").value = "stop";
				document.getElementById("start_stop").innerHTML = "STOP";
				document.getElementById("start_stop").style.background = "#FF0000"; 
				socket.emit('monitoring:start');
		// Stop the therapy
		} else {
			document.getElementById("start_stop").value = "start";
			document.getElementById("start_stop").innerHTML = "START";
			document.getElementById("start_stop").style.background = "#4CAF50";
			socket.emit('monitoring:stop'); 
		}
	};


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
		document.getElementById("modal-change-page").modal('hide');
	}
	document.getElementById("stop-exit-therapy").onclick = function() {
		// Redirect to the therapy monitoring window
		location.replace(THERAPY_MONITOR_GOTO_LINK)
	}

	// Functions called when charts refresh to update data sets
	function onRefreshRH() {
		console.log("onRefreshRH");
		ctxrhipInstance.data.labels.push(new Date());
		ctxrhipInstance.data.datasets.forEach((dataset) =>{dataset.data.push(1)});
	}
	function onRefreshLH() {
		console.log("onRefreshLH");
		ctxlhipInstance.data.labels.push(new Date());
		ctxlhipInstance.data.datasets.forEach((dataset) =>{dataset.data.push({
				right_hip_real
			})
		});
	}
	function onRefreshRK(chart) {
		console.log("onRefreshRK");
		ctxrkneeInstance.data.labels.push(new Date());
		ctxrkneeInstance.data.datasets.forEach((dataset) =>{dataset.data.push({
				x: Date.now(),
				y: right_hip_real
			})
		});
	}
	function onRefreshLK(chart) {
		console.log("onRefreshLK");
		ctxlkneeInstance.data.labels.push(new Date());
		ctxlkneeInstance.data.datasets[0].data.push({
				x: Date.now(),
				y: right_hip_real
		});
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
	//document.getElementById("steps").innerHTML =  data.steps;
	document.getElementById("right_knee_config").innerHTML =  data.right_knee_config;
	document.getElementById("left_knee_config").innerHTML =  data.left_knee_config;
	document.getElementById("right_hip_config").innerHTML =  data.right_hip_config;
	document.getElementById("left_hip_config").innerHTML =  data.left_hip_config;
})

