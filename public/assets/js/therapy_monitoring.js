const socket = io();

//** Global variables **//
var THERAPY_MONITOR_GOTO_LINK;

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
// Receive joint data from the server to generate the plots
var left_knee_real;
var left_knee_ref;
socket.on('jointData_resp', (data) => {
	left_knee_real = data.left_knee_real;
	left_knee_ref = data.left_knee_ref;
})
function leftKneeReal() {
	socket.emit('jointData_ask');
	return (left_knee_real);
}
function leftKneeRef() {
	socket.emit('jointData_ask');
	return (left_knee_ref);
}
function onRefresh(chart) {
	chart.config.data.datasets[0].data.push({
			x: Date.now(),
			y: leftKneeReal()
		});
	chart.config.data.datasets[1].data.push({
			x: Date.now(),
			y: leftKneeRef()
	});
}

var color = Chart.helpers.color;
var config = {
	type: 'line',
	data: {
		datasets: [{
				label: 'Right',
				borderColor: chartColors.red,
				borderWidth: 1,
				data: []
			}, {
				label: 'Left',
				borderColor: chartColors.blue,
				borderWidth: 1,
				data: []
			}
		]
	},
	options: {
		scales: {
			xAxes: [{
				type: 'realtime',
				realtime: {
					duration: 10000,
					refresh: 100,
					delay: 500,
					onRefresh: onRefresh
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
					labelString: 'value'
				}
			}]
		},
		tooltips: {
			mode: 'nearest',
			intersect: true
		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		responsive: true
		, maintainAspectRatio: false
	}
};

// Get charts form html and plot the incomming data. 
window.onload = function() {
	
    //var ctxhip = document.getElementById('r_l_hip_chart').getContext('2d');
    var ctxknee = document.getElementById('r_l_knee_chart').getContext('2d');
    //ctxhip.canvas.height = 70;
    ctxknee.canvas.height = 70;
    window.r_l_knee_chart = new Chart(ctxknee, config); // Right and Left knee chart
	//window.r_l_hip_chart = new Chart(ctxknee, config); // Right and Left hip chart
	
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


/*
var left_knee_real;
var right_knee_real;
socket.on('jointData_resp', (data) => {
	left_knee_real = data.left_knee_real;
	right_knee_real = data.right_knee_real;
})
function leftKneeData() {
	socket.emit('jointData_ask');
	return (left_knee_real);
}
function rightKneeData() {
	socket.emit('jointData_ask');
	return (right_knee_real);
}
function onRefreshLeftKnee(chart) {
	chart.config.data.datasets[0].(function(dataset) {
		dataset.data.push({
			x: Date.now(),
			y: leftKneeData()
		});
	});
}
function onRefreshRightKnee(chart) {
	chart.config.data.datasets.forEach(function(dataset) {
		dataset.data.push({
			x: Date.now(),
			y: rightKneeData()
		});
	});
}


*/
