/*globalThis.bootPromise=new Promise((res,rej)=>{
	globalThis.bootPromiseResolve=res;
	globalThis.bootPromiseReject=rej;
});

function waitFor(bootWaitFor) {
	globalThis.bootWaitFor=bootWaitFor;
}

async function boot() {
	let bootContent=decodeAscii(await readFile("/boot.js"));
	eval(bootContent);

	if (typeof globalThis.bootWaitFor=="function") {
		globalThis.bootWaitFor=globalThis.bootWaitFor();
	}

	await globalThis.bootWaitFor;

	globalThis.bootPromiseResolve();
}

async function awaitBoot() {
	await bootPromise;
}*/