initEspBus(5,4);

setInterval(()=>{
	//console.log("writing...");
	getBus().writeSlcan("t12320824")
	//console.log("wrote...");
},1000);

getBus().on("slcan",s=>{
	console.log(s);
});
