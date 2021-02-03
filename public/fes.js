const socket = io();

window.onload = function(){ 
  document.getElementById("fes_config").onclick = function() {
    document.getElementById("fes_config").innerHTML = "CONFIGURATED";
    document.getElementById("fes_config").style.background = "#4CAF50";
    var channels = document.getElementById("channels").value;
    var stimulation_point = document.getElementById("stimulation_point").value;
    var current = document.getElementById("current").value;
    var pw = document.getElementById("pw").value;
		var group_time = document.getElementById("group_time").value;
    var mode = document.getElementById("mode").value;
    var main_freq = document.getElementById("main_freq").value;
    socket.emit('FES:configuration', {
      channels: channels,
      stimulation_point: stimulation_point,
      current : current,
      pw : pw,
			group_time: group_time,
      mode : mode,
      main_freq : main_freq
    })
  };
}