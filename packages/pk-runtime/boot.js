function setInterval(fn, ms) {
	let t=createInterval(ms);
	t.on("timer",fn);
	return t.getId();
}

function setTimeout(fn, ms) {
	let t=createTimeout(ms);
	t.on("timer",fn);
	return t.getId();
}

function clearTimeout(id) {
	clearTimer(id);
}

function clearInterval(id) {
	clearTimer(id);
}

if (globalThis.Fs) {
	globalThis.fs=Fs.getInstance();

	let devConsole=globalThis.fs.open("/dev/console","doesn't matter");
	if (devConsole) {
		globalThis.console={};
		globalThis.console.log=s=>{
			let bytes=encodeAscii(s+"\n");
		    if (devConsole)
		    	devConsole.write(bytes);
		}
	}
}

if (!globalThis.console) {
	globalThis.console={};
	globalThis.console.log=serialWriteString;
}

globalThis.bootPromise=new Promise((res,rej)=>{
	globalThis.bootPromiseResolve=res;
	globalThis.bootPromiseReject=rej;
});

async function boot() {
	try {
		if (globalThis.bootFunction)
			await globalThis.bootFunction();

		else {
			//gc();
			let bootBuffer=await readFile("/boot.js");
			let bootContent=decodeAscii(bootBuffer);
			await eval(bootContent);
		}

		globalThis.bootPromiseResolve();
		bootResolve();
	}

	catch (e) {
		globalThis.bootPromiseReject(e);
		bootReject(e.message);
	}
}

async function awaitBoot() {
	await bootPromise;
}
