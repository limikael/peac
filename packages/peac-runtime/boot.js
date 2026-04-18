function setInterval(fn, ms) {
	let t=createInterval(ms);
	t.on("timer",fn);
	//return t.getId();
}

function setTimeout(fn, ms) {
	let t=createTimeout(ms);
	t.on("timer",fn);
	//return t.getId();
}

setInterval(()=>{
	digitalToggle(8);
},250);
