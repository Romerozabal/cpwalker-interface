const socket = io();

// Knee and Hip trajectories
const hip_trajectory = [36.5585, 36.5259, 36.4962, 36.4689, 36.4408, 36.3909, 36.335, 36.271, 36.1943, 36.0842, 35.9539, 35.8015, 35.6229, 35.3996, 35.1472, 34.8671, 34.5588, 34.2085, 33.8337, 33.4375, 33.021, 32.5716, 32.1055, 31.6253, 31.1309, 30.6092, 30.0759, 29.5333, 28.982, 28.4101, 27.8326, 27.2519, 26.6686, 26.0712, 25.4745, 24.881, 24.2907, 23.6928, 23.0991, 22.5103, 21.9251, 21.3314, 20.7416, 20.1566, 19.576, 18.9904, 18.4092, 17.8328, 17.26, 16.6806, 16.1042, 15.5317, 14.9625, 14.3888, 13.8194, 13.2551, 12.6957, 12.1344, 11.5788, 11.0296, 10.4863, 9.943, 9.4059, 8.8751, 8.35, 7.8256, 7.307, 6.7943, 6.2873, 5.782, 5.2825, 4.789, 4.3013, 3.8162, 3.3365, 2.8623, 2.3931, 1.9264, 1.4649, 1.0089, 0.55876, 0.11339, -0.32492, -0.75545, -1.1777, -1.592, -1.9966, -2.3906, -2.7733, -3.1449, -3.503, -3.8462, -4.1732, -4.483, -4.7732, -5.0422, -5.2883, -5.5107, -5.7056, -5.8703, -6.0025, -6.1013, -6.1635, -6.1873, -6.1715, -6.117, -6.0199, -5.8784, -5.691, -5.4588, -5.1776, -4.8459, -4.4624, -4.0296, -3.5434, -3.0028, -2.408, -1.7637, -1.0667, -0.31824, 0.47919, 1.3179, 2.1989, 3.1186, 4.0724, 5.0499, 6.0517, 7.0737, 8.1109, 9.1527, 10.2008, 11.2518, 12.3017, 13.3403, 14.3718, 15.3946, 16.4062, 17.397, 18.3728, 19.3328, 20.2749, 21.189, 22.0824, 22.9548, 23.805, 24.6222, 25.4163, 26.1884, 26.9377, 27.6538, 28.3466, 29.0165, 29.6621, 30.2707, 30.8549, 31.416, 31.9538, 32.4557, 32.9354, 33.3942, 33.8315, 34.2332, 34.613, 34.9714, 35.3072, 35.6047, 35.8803, 36.136, 36.3716, 36.5725, 36.7541, 36.9172, 37.0604, 37.1663, 37.2525, 37.3207, 37.3704, 37.3856, 37.3845, 37.3695, 37.3407, 37.2817, 37.2124, 37.1364, 37.0547, 36.9514, 36.8478, 36.7477, 36.6527, 36.5465, 36.4502, 36.367, 36.2969, 36.2222, 36.1618, 36.1168, 36.085, 36.046, 36.0174, 35.9986, 35.9863];
const knee_trajectory = [6.1418, 6.7972, 7.4686, 8.1689, 8.9067, 9.6842, 10.4966, 11.3337, 12.182, 13.0189, 13.8396, 14.6336, 15.3915, 16.1046, 16.7657, 17.3684, 17.9076, 18.3745, 18.7741, 19.1077, 19.3771, 19.5806, 19.725, 19.8135, 19.8487, 19.828, 19.7606, 19.6507, 19.5023, 19.3141, 19.0962, 18.8534, 18.5896, 18.303, 18.0026, 17.692, 17.3728, 17.0405, 16.7037, 16.3641, 16.0224, 15.6729, 15.3231, 14.9743, 14.6265, 14.2733, 13.9225, 13.5755, 13.2325, 12.8872, 12.5471, 12.213, 11.885, 11.5564, 11.2348, 10.9213, 10.6157, 10.3121, 10.0171, 9.7313, 9.4541, 9.1793, 8.9136, 8.6575, 8.4108, 8.1681, 7.9356, 7.7143, 7.5041, 7.2999, 7.108, 6.9295, 6.7647, 6.6084, 6.4679, 6.3452, 6.2412, 6.1513, 6.0831, 6.0383, 6.018, 6.0166, 6.0428, 6.0985, 6.185, 6.2962, 6.4408, 6.6206, 6.8362, 7.0798, 7.3613, 7.6824, 8.0437, 8.4363, 8.8715, 9.3514, 9.8765, 10.4366, 11.0446, 11.7028, 12.4117, 13.1596, 13.9608, 14.8179, 15.7311, 16.6869, 17.701, 18.7756, 19.9101, 21.0885, 22.3263, 23.6239, 24.9787, 26.3711, 27.8151, 29.3086, 30.8466, 32.4058, 33.9996, 35.624, 37.2719, 38.9172, 40.5709, 42.2259, 43.8718, 45.4793, 47.0568, 48.5956, 50.0841, 51.4928, 52.8325, 54.0975, 55.2796, 56.3539, 57.3346, 58.2194, 59.0042, 59.6669, 60.2264, 60.6839, 61.0388, 61.2726, 61.407, 61.4458, 61.3902, 61.2232, 60.9669, 60.6248, 60.1978, 59.6684, 59.0586, 58.3722, 57.6101, 56.7555, 55.8304, 54.839, 53.7822, 52.6441, 51.4464, 50.193, 48.8851, 47.5074, 46.0817, 44.6124, 43.1012, 41.5343, 39.9329, 38.3016, 36.6427, 34.943, 33.2247, 31.4935, 29.753, 27.9924, 26.2345, 24.4865, 22.7541, 21.028, 19.3339, 17.6818, 16.0799, 14.5222, 13.0349, 11.629, 10.3133, 9.0819, 7.9609, 6.9607, 6.0887, 5.3415, 4.7328, 4.2657, 3.9404, 3.7431, 3.6892, 3.7775, 4.0008, 4.3424, 4.7836, 5.2959, 5.8453];
const samples = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200];

window.onload = function(){
	document.getElementById("test_stimulator").onclick = function() {
		$("#modal_fes_config").modal('show').modal('show');
	}

	document.getElementById("channel0").onclick = function() {
		channel = document.getElementById("channel0")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel1").onclick = function() {
		channel = document.getElementById("channel1")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel2").onclick = function() {
		channel = document.getElementById("channel2")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel3").onclick = function() {
		channel = document.getElementById("channel3")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel4").onclick = function() {
		channel = document.getElementById("channel4")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel5").onclick = function() {
		channel = document.getElementById("channel5")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel6").onclick = function() {
		channel = document.getElementById("channel6")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel7").onclick = function() {
		channel = document.getElementById("channel7")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}


	// Click on plots
	document.getElementById("channel0_stim").onclick = function() {
		channel = document.getElementById("channel0_stim")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel1_stim").onclick = function() {
		channel = document.getElementById("channel1_stim")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel2_stim").onclick = function() {
		channel = document.getElementById("channel2_stim")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel3_stim").onclick = function() {
		channel = document.getElementById("channel3_stim")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel4_stim").onclick = function() {
		channel = document.getElementById("channel4_stim")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel5_stim").onclick = function() {
		channel = document.getElementById("channel5_stim")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel6_stim").onclick = function() {
		channel = document.getElementById("channel6_stim")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}
	document.getElementById("channel7_stim").onclick = function() {
		channel = document.getElementById("channel7_stim")
		if (channel.value != "1" && channel.value != "0") {
			channel.value = "0"
		}
		if (channel.value == "1") {
			channel.value = "0"
			channel.classList.toggle("btn-primary")
			channel.classList.add("btn-secondary")
		} else {
			channel.value = "1"
			channel.classList.toggle("btn-secondary")
			channel.classList.add("btn-primary")
		}
	}


	document.getElementById("r_hip_chart").onclick = function(evt){
		var activePoints = ctxrhipInstance.getElementsAtEvent(evt);
		document.getElementById("save_fes_stimulation").value = "r_hip"
		document.getElementById("fes_angle").style.display = "block";
		document.getElementById("fes_angle").value = (activePoints[0]._index).toString();
		document.getElementById("fes_angle").innerHTML = "Right Hip | Gait percentage: " + (activePoints[0]._index / 200 * 100).toString() +  "% | Angle: " + hip_trajectory[activePoints[0]._index].toString() + "º";
		document.getElementById("save_fes_stimulation").innerHTML = "Save Configuration";
		$("#modal_fes_patern").modal('show').modal('show');
	};

	document.getElementById("l_hip_chart").onclick = function(evt){
		var activePoints = ctxlhipInstance.getElementsAtEvent(evt);
		document.getElementById("save_fes_stimulation").value = "l_hip"
		document.getElementById("modal_fes_config_title").innerHTML = create_patern_name;
		document.getElementById("fes_angle").style.display = "block";
		document.getElementById("fes_angle").value = (activePoints[0]._index).toString();
		document.getElementById("fes_angle").innerHTML = "Left Hip | Gait percentage: " + (activePoints[0]._index / 200 * 100).toString() +  "% | Angle: " + hip_trajectory[activePoints[0]._index].toString() + "º";
		document.getElementById("save_fes_stimulation").innerHTML = "Save Configuration";
		$("#modal_fes_patern").modal('show').modal('show');
	};

	document.getElementById("r_knee_chart").onclick = function(evt){
		var activePoints = ctxrkneeInstance.getElementsAtEvent(evt);
		document.getElementById("save_fes_stimulation").value = "r_knee"
		document.getElementById("modal_fes_config_title").innerHTML = create_patern_name;
		document.getElementById("fes_angle").style.display = "block";
		document.getElementById("fes_angle").value = (activePoints[0]._index).toString();
		document.getElementById("fes_angle").innerHTML = "Right Knee  | Gait percentage: " + (activePoints[0]._index / 200 * 100).toString() +  "% | Angle: " + knee_trajectory[activePoints[0]._index].toString() + "º";
		document.getElementById("save_fes_stimulation").innerHTML = "Save Configuration";
		$("#modal_fes_patern").modal('show').modal('show');
	};

	document.getElementById("l_knee_chart").onclick = function(evt){
		var activePoints = ctxlkneeInstance.getElementsAtEvent(evt);
		document.getElementById("save_fes_stimulation").value = "l_knee"
		document.getElementById("modal_fes_config_title").innerHTML = create_patern_name;
		document.getElementById("fes_angle").style.display = "block";
		document.getElementById("fes_angle").value = (activePoints[0]._index).toString();
		document.getElementById("fes_angle").innerHTML = "Left Knee | Gait percentage: " + (activePoints[0]._index / 200 * 100).toString() +  "% | Angle: " + knee_trajectory[activePoints[0]._index].toString() + "º";
		document.getElementById("save_fes_stimulation").innerHTML = "Save Configuration";
		$("#modal_fes_patern").modal('show').modal('show');
	};

	document.getElementById("save_fes_stimulation").onclick = function() {
		var channels = [0,0,0,0,0,0,0,0]
		channel0 = document.getElementById("channel0_stim")
		channell = document.getElementById("channell_stim")
		channel2 = document.getElementById("channel2_stim")
		channel3 = document.getElementById("channel3_stim")
		channel4 = document.getElementById("channel4_stim")
		channel5 = document.getElementById("channel5_stim")
		channel6 = document.getElementById("channel6_stim")
		channel7 = document.getElementById("channel7_stim")
		if (channel0.value == "1") {
			channels[7] = 1
		}
		if (channel1.value == "1") {
			channels[6] = 1
		}
		if (channel2.value == "1") {
			channels[5] = 1
		}
		if (channel3.value === "1") {
			channels[4] = 1
		}
		if (channel4.value === "1") {
			channels[3] = 1
		}
		if (channel5.value === "1") {
			channels[2] = 1
		}
		if (channel6.value === "1") {
			channels[1] = 1
		}
		if (channel7.value === "1") {
			channels[0] = 1
		}
		channels = channels.join("").toString()
		console.log(channels)
		var joint = document.getElementById("save_fes_stimulation").value;
		var current = document.getElementById("current_stim").value;
		var pw = document.getElementById("pw_stim").value;
		var mode = document.getElementById("mode_stim").value;
		var index = document.getElementById("fes_angle").value;
		socket.emit('FES:save_stim', {
		joint: joint,
		channels: channels,
		current : current,
		pw : pw,
		mode : mode,
		index: index
		})
	};


	document.getElementById("fes_config").onclick = function() {
		var channels = [0,0,0,0,0,0,0,0]
		channel0 = document.getElementById("channel0")
		channell = document.getElementById("channell")
		channel2 = document.getElementById("channel2")
		channel3 = document.getElementById("channel3")
		channel4 = document.getElementById("channel4")
		channel5 = document.getElementById("channel5")
		channel6 = document.getElementById("channel6")
		channel7 = document.getElementById("channel7")
		if (channel0.value == "1") {
			channels[7] = 1
		}
		if (channel1.value == "1") {
			channels[6] = 1
		}
		if (channel2.value == "1") {
			channels[5] = 1
		}
		if (channel3.value === "1") {
			channels[4] = 1
		}
		if (channel4.value === "1") {
			channels[3] = 1
		}
		if (channel5.value === "1") {
			channels[2] = 1
		}
		if (channel6.value === "1") {
			channels[1] = 1
		}
		if (channel7.value === "1") {
			channels[0] = 1
		}
		channels = channels.join("").toString()
		var joint = document.getElementById("fes_config").value;
		var current = document.getElementById("current").value;
		var pw = document.getElementById("pw").value;
		var group_time = document.getElementById("group_time").value;
		var mode = document.getElementById("mode").value;
		var main_freq = document.getElementById("main_freq").value;
		console.log(configuration)
		var index = document.getElementById("fes_angle").value;
		socket.emit('FES:configuration', {
		joint: joint,
		channels: channels,
		current : current,
		pw : pw,
		group_time: group_time,
		mode : mode,
		main_freq : main_freq,
		index: index
		})
	};

	// Ask for the number of serial ports connected
	document.getElementById("serial_port_list").onclick = function () {
		socket.emit('FES:ask_serial_port', {})
	};

	// Get list of serial ports connected
	socket.on('FES:get_serial_port', function(data) {
		console.log(data.serialPorts)
		//document.getElementById('serial_port_list').innerHTML += ('<option value=" + 'data.serialPorts[1].toString()'">'data.serialPorts[1].toString() '</option>');
	});

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
        display: true,
				distribution: 'line',
				scaleLabel: {
					display: true,
					labelString: 'Samples'
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
		maintainAspectRatio: false
  };

  var ctxrhipInstance = new Chart(ctxrhip, {
		type: 'line',
    data: {
      labels: samples,
			datasets: [{
				label: 'Reference trajectory',
				data: hip_trajectory,
				fill: true,
				borderColor: '#2626FF',
				borderWidth: 2,
				pointStyle: 'point'
			}]
		},
		options: Object.assign({}, commonOptions, {
			elements: {
				line: {
					tension: 0.4 // disables bezier curves
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
      labels: samples,
			datasets: [{
				label: 'Reference trajectory',
				data: hip_trajectory,
				fill: true,
				borderColor: '#2626FF',
				borderWidth: 2,
				pointStyle: 'point'
			}]
		},
		options: Object.assign({}, commonOptions, {
			showLines: true, // disable for a single dataset
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
		showLines: true, // disable for a single dataset
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
      labels: samples,
			datasets: [{
				label: 'Reference trajectory',
				data: knee_trajectory,
				fill: true,
				borderColor: '#2626FF',
				borderWidth: 2,
				pointStyle: 'point'
			}]
		},
		options: Object.assign({}, commonOptions, {
			showLines: true, // disable for a single dataset
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
		showLines: true, // disable for a single dataset
		animation: {
            duration: 4 // general animation time
        },
		elements: {
            line: {
                tension: 0.4 // disables bezier curves
            }
		},
		type: 'line',
    data: {
      labels: samples,
			datasets: [{
				label: 'Reference trajectory',
				data: knee_trajectory,
				fill: true,
				borderColor: '#2626FF',
				borderWidth: 2,
				pointStyle: 'point'
			}]
		},
		options: Object.assign({}, commonOptions, {
			showLines: true, // disable for a single dataset
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
}
