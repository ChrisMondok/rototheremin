var context, oscillator, gainNode, analyzer;

function init() {
	document.getElementById('instructions').remove();
	window.AudioContext = window.AudioContext || window.webkitAudioContext;

	context = new window.AudioContext();

	oscillator = context.createOscillator();

	gainNode = context.createGain();
	gainNode.gain.value = 0;

	analyzer = context.createAnalyser();
	//analyzer.smoothingTimeConstant = 0;

	oscillator.connect(gainNode);
	gainNode.connect(analyzer);
	analyzer.connect(context.destination);

	setUpListeners();

	startDrawing();
}

function startDrawing() {
	var freqArr = new Uint8Array(analyzer.frequencyBinCount);
	var freqContext = document.getElementById("freq-canvas").getContext("2d");

	var timeArr = new Uint8Array(analyzer.frequencyBinCount);
	var timeContext = document.getElementById("time-canvas").getContext("2d");

	var draw = function() {
		analyzer.getByteFrequencyData(freqArr);
		analyzer.getByteTimeDomainData(timeArr);
		freqContext.clearRect(0, 0, 1024, 255);
		timeContext.clearRect(0, 0, 1024, 255);

		freqContext.strokeStyle = "lime";
		timeContext.strokeStyle = "lime";

		freqContext.beginPath();
		timeContext.beginPath();
		for(var i = 0; i < freqArr.length; i++)
		{
			freqContext.lineTo(i, 255-freqArr[i]);
			timeContext.lineTo(i, 255-timeArr[i]);
		}
		freqContext.stroke();
		timeContext.stroke();
		requestAnimationFrame(draw);
	};

	draw();
}

function setUpListeners() {
	var gain = 0.5;
	var isPlaying = false;

	function gainInputListener(e) {
		gain = Number(e.target.value);
		if(isPlaying)
			gainNode.gain.value = gain;
	};

	document.getElementById("gain-input").addEventListener("input", gainInputListener);
	document.getElementById("gain-input").addEventListener("change", gainInputListener);

	var started = false;
	document.getElementById("canvas-container").addEventListener("touchstart", function(e) {
		if(!started) {
			started = true;
			oscillator.start(0);
		}
		gainNode.gain.value = gain;
		isPlaying = true;
		e.preventDefault();
	});

	document.getElementById("canvas-container").addEventListener("touchend", function() {
		gainNode.gain.value = 0;
		isPlaying = false;
	});

	document.getElementById("waveform-select").addEventListener("change", function(e) {
		oscillator.type = e.target.value;
	});

	window.addEventListener("deviceorientation", orientationListener, true);
}

function orientationListener(e) {
	var pct = Math.min(Math.max(0, e.beta / 180), 1);
	oscillator.frequency.value = pct * 3000;
}
