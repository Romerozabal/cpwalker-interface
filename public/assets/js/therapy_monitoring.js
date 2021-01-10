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
// Charts time configuration variables (in ms)
var chartDuration = 10000;
var refreshTime = 10;
var delayChart = 200;
// Data sampling time (in ms)
var samplingTime = 10; 

//************//
//** Charts **//
//************//
var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};
var color = Chart.helpers.color;
// Configuration of the right hip chart
var configrhip = {
	type: 'line',
	data: {
		datasets: [{
				label: 'Real',
				borderColor: chartColors.red,
				borderWidth: 1,
  		    	showLine: false, // disable for a single dataset
			    data: []
			}, {
				label: 'Reference',
				borderColor: chartColors.blue,
				borderWidth: 1,
  		    	showLine: false, // disable for a single dataset
			    data: []
			}
		]
	},
	options: {
		showLines: false, // disable for all datasets
		animation: {
            duration: 0 // general animation time
        },
		elements: {
            line: {
                tension: 0 // disables bezier curves
            }
		},
		
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: chartDuration,
					refresh: refreshTime,
					delay: delayChart,
					onRefresh: onRefreshRH
				},
				scaleLabel: {
					display: true,
					labelString: 'Time'
				},
				ticks: {
					autoSkip: false,
					maxRotation: 0,
					minRotation: 0
				}
			}],
			yAxes: [{
				display: true,
				ticks: {
					suggestedMax: 50,    // maximum will be 70, unless there is a lower value.
					suggestedMin: -20,    // minimum will be -10, unless there is a lower value.
				},
				scaleLabel: {
					display: true,
					labelString: 'Degrees'
				}
			}]
		},
		tooltips: {
			mode: 'nearest',
			intersect: false
		},
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
		maintainAspectRatio: false
	}
};

// Configuration of the left hip chart
var configlhip = {
	type: 'line',
	data: {
		datasets: [{
				label: 'Real',
				borderColor: chartColors.red,
				borderWidth: 1,
  		    	showLine: false, // disable for a single dataset
			    data: []
			}, {
				label: 'Reference',
				borderColor: chartColors.blue,
				borderWidth: 1,
  		    	showLine: false, // disable for a single dataset
			    data: []
			}
		]
	},
	options: {
		showLines: false, // disable for all datasets
		animation: {
            duration: 0 // general animation time
        },
		elements: {
            line: {
                tension: 0 // disables bezier curves
            }
		},
		
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: chartDuration,
					refresh: refreshTime,
					delay: delayChart,
					onRefresh: onRefreshLH
				},
				scaleLabel: {
					display: true,
					labelString: 'Time'
				},
				ticks: {
					autoSkip: false,
					maxRotation: 0,
					minRotation: 0
				}
			}],
			yAxes: [{
				display: true,
				ticks: {
					suggestedMax: 50,    // maximum will be 70, unless there is a lower value.
					suggestedMin: -20,    // minimum will be -10, unless there is a lower value.
				},
				scaleLabel: {
					display: true,
					labelString: 'Degrees'
				}
			}]
		},
		tooltips: {
			mode: 'nearest',
			intersect: false
		},
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
		maintainAspectRatio: false
	}
};

// Configuration of the right knee chart
var configrknee = {
	type: 'line',
	data: {
		datasets: [{
				label: 'Real',
				borderColor: chartColors.red,
				borderWidth: 1,
				showLine: false, // disable for a single dataset
			    data: []
			}, {
				label: 'Reference',
				borderColor: chartColors.blue,
				borderWidth: 1,
				showLine: false, // disable for a single dataset
			    data: []
			}
		]
	},
	options: {
		showLines: false, // disable for a single dataset
		animation: {
            duration: 0 // general animation time
        },
		elements: {
            line: {
                tension: 0 // disables bezier curves
            }
		},
		
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: chartDuration,
					refresh: refreshTime,
					delay: delayChart,
					onRefresh: onRefreshRK
				},
				scaleLabel: {
					display: true,
					labelString: 'Time'
				},
				ticks: {
					sampleSize: 1,
					autoSkip: false,
					maxRotation: 0,
					minRotation: 0
					
				}
			}],
			yAxes: [{
				display: true,
				ticks: {
					suggestedMax: 65,    // maximum will be 70, unless there is a lower value.
					suggestedMin: 0,    // minimum will be -10, unless there is a lower value.
					// OR //
					beginAtZero: true	
				},
				scaleLabel: {
					display: true,
					labelString: 'Degrees'
				}
			}]
		},
		tooltips: {
			mode: 'nearest',
			intersect: false
		},
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
		maintainAspectRatio: false
	}
};

// Configuration of the left knee chart
var configlknee = {
	type: 'line',
	data: {
		datasets: [{
				label: 'Real',
				borderColor: chartColors.red,
				borderWidth: 1,
  		    	showLine: false, // disable for a single dataset
			    data: []
			}, {
				label: 'Reference',
				borderColor: chartColors.blue,
				borderWidth: 1,
  		    	showLine: false, // disable for a single dataset
			    data: []
			}
		]
	},
	options: {
		showLines: false, // disable for all datasets
		animation: {
            duration: 0 // general animation time
        },
		elements: {
            line: {
                tension: 0 // disables bezier curves
            }
		},
		
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: chartDuration,
					refresh: refreshTime,
					delay: delayChart,
					onRefresh: onRefreshLK
				},
				scaleLabel: {
					display: true,
					labelString: 'Time'
				},
				ticks: {
					autoSkip: false,
					maxRotation: 0,
					minRotation: 0
				}
			}],
			yAxes: [{				
				display: true,
				ticks: {
					suggestedMax: 65,    // maximum will be 70, unless there is a lower value.
					suggestedMin: 0,    // minimum will be -10, unless there is a lower value.
					// OR //
					beginAtZero: true 
				},
				scaleLabel: {
					display: true,
					labelString: 'Degrees'
				}
			}]
		},
		tooltips: {
			mode: 'nearest',
			intersect: false
		},
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
		maintainAspectRatio: false
	}
};

// Call server to update joints data
window.setInterval(function(){
	socket.emit('monitoring:jointData_ask');
}, samplingTime);

// Call server to update joints data
window.setInterval(function(){
	onRefreshRH();
	onRefreshLH();
	onRefreshRK();
	onRefreshLK();
}, refreshTime);

// Get charts form html and plot the incomming data. 
window.onload = function() {	
	// Charts configuration
	var ctxrhip = document.getElementById('r_hip_chart').getContext('2d');
	var ctxlhip = document.getElementById('l_hip_chart').getContext('2d');
	var ctxrknee = document.getElementById('r_knee_chart').getContext('2d');
    var ctxlknee = document.getElementById('l_knee_chart').getContext('2d');
	ctxrhip.canvas.height = 300;
	ctxlhip.canvas.height = 300;
	ctxrknee.canvas.height = 300;
	ctxlknee.canvas.height = 300;
	window.r_knee_chart = new Chart(ctxrhip, configrhip); 
	window.l_hip_chart = new Chart(ctxlhip, configlhip);
	window.r_knee_chart = new Chart(ctxrknee, configrknee); 
	window.l_hip_chart = new Chart(ctxlknee, configlknee); 

	// Receive joints data from server 
	socket.on('monitoring:jointData_resp', (data) => {
		right_hip_real = parseInt(data.right_hip_real);
		right_hip_ref = data.right_hip_ref;
		left_hip_real = data.left_hip_real;
		left_hip_ref = data.left_hip_ref;
		right_knee_real = data.right_knee_real;
		right_knee_ref = data.right_knee_ref;
		left_knee_real = data.left_knee_real;
		left_knee_ref = data.left_knee_ref;
		/*
		console.log("right_hip_real:");
		console.log(right_hip_real);
		console.log("right_hip_ref:");
		console.log(right_hip_ref);
		console.log("left_hip_real:");
		console.log(left_hip_real);
		console.log("left_hip_ref:");
		console.log(left_hip_ref);
		console.log("right_knee_real:");
		console.log(right_knee_real);
		console.log("right_knee_ref:");
		console.log(right_knee_ref);
		console.log("left_knee_real:");
		console.log(left_knee_real);
		console.log("left_knee_ref:");
		console.log(left_knee_ref);
		*/
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
		THERAPY_MONITOR_GOTO_LINK = "index.HTML"
	};
	document.getElementById("moveHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "move.html"
	};
	document.getElementById("usersHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "users.html"
	};
	document.getElementById("therapySettingsHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "therapy_settings.html"
	};
	document.getElementById("fesHTML").onclick = function() {
		preventChange();
		THERAPY_MONITOR_GOTO_LINK = "fes.html"
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
	//document.getElementById("steps").innerHTML =  data.steps;
	document.getElementById("right_knee_config").innerHTML =  data.right_knee_config;
	document.getElementById("left_knee_config").innerHTML =  data.left_knee_config;
	document.getElementById("right_hip_config").innerHTML =  data.right_hip_config;
	document.getElementById("left_hip_config").innerHTML =  data.left_hip_config;
})

// Functions called when charts refresh to update data sets
function onRefreshRH(chart) {
	chart.config.data.datasets[0].data.push({
			x: Date.now(),
			y: right_hip_real
		});
	chart.config.data.datasets[1].data.push({
			x: Date.now(),
			y: Math.round(right_hip_ref)
	});
}
function onRefreshLH(chart) {
	chart.config.data.datasets[0].data.push({
			x: Date.now(),
			y: Math.round(left_hip_real)
		});
	chart.config.data.datasets[1].data.push({
			x: Date.now(),
			y: Math.round(left_hip_ref)
	});
}
function onRefreshRK(chart) {
	chart.config.data.datasets[0].data.push({
			x: Date.now(),
			y: Math.round(right_knee_real)
		});
	chart.config.data.datasets[1].data.push({
			x: Date.now(),
			y: Math.round(right_knee_ref)
	});
}
function onRefreshLK(chart) {
	chart.config.data.datasets[0].data.push({
			x: Date.now(),
			y: Math.round(left_knee_real)
		});
	chart.config.data.datasets[1].data.push({
			x: Date.now(),
			y: Math.round(left_knee_ref)
	});
}