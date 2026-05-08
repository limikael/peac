//initEspBus(5,4);

setInterval(()=>{
	//console.log("writing...");
	//getBus().writeSlcan("t12320824")
	//console.log("wrote...");
},1000);

getBus().on("slcan",s=>{
//	console.log(s);
});

//gc();

let m=getMasterDevice();
let d=m.createRemoteDevice(5);

d.insert(0x2001,1);
d.insert(0x6201,1);
d.at(0x2001,1).setInt(1);

setInterval(()=>{
	d.at(0x6201,1).setInt(!d.at(0x6201,1).getInt());
},1000);
