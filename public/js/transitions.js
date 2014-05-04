var bg = document.querySelector("#cloudcc");
var play = document.querySelector(".jp-play");
var pause = document.querySelector(".jp-pause");
var stop = document.querySelector(".jp-stop");
var looping = false;
var val = 50;

function setup () {
	play.addEventListener("click", construct, false);
	pause.addEventListener("click", stopping, false);
	stop.addEventListener("click", stopping, false);

	bg.addEventListener("webkitTransitionEnd", loop, false);
}
setup();

function construct(e) {
	looping = true; 
	loop(null);
	console.log("set true");
}

function stopping(e) {
	looping = false;
	console.log("set false");
}

function loop(e) {
	if (looping == true) {
		if (bg.className == "first")
			bg.className = "second";
		else if (bg.className == "second")
			bg.className = "first";
	}
}