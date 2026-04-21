globalThis.fidMap=new Map();
globalThis.nextFid=1;

function encodeAscii(str) {
    const arr=new Uint8Array(str.length);
    for (let i=0; i<str.length; i++)
        arr[i]=str.charCodeAt(i);

    return arr;
}

function decodeAscii(buf) {
	let s="";
    for (let i=0; i<buf.length; i++)
        s+=String.fromCharCode(buf[i]);

    return s;
}

function fileOpen(pathname, mode) {
	let fid=nextFid++;
	let fh=getFsInstance().open(pathname,mode)
	if (!fh)
		throw new Error("Unable to open file");

	fh.setDataEventSize(0);
	fidMap.set(fid,fh);
	return fid;
}

function fileReadString(fid, size) {
	let fh=fidMap.get(fid);
	if (!fh)
		throw new Error("File not open");

	if (fh.isClosed())
		return null;

	fh.setDataEventSize(size);
	return new Promise((resolve,reject)=>{
		function handleData(data) {
			fh.off("data",handleData)
			fh.setDataEventSize(0);
			resolve(decodeAscii(data));
		}

		fh.on("data",handleData)
	});
}

function fileClose(fid) {
	let fh=fidMap.get(fid);
	if (!fh)
		throw new Error("File not open");

	fh.close();
	fidMap.delete(fid);
}

function getInfo() {
	let o={};
	let info=collectInfo();
	let keys=info.getKeys();
	for (let i=0; i<keys.size(); i++) {
		let key=keys.at(i);
		switch (info.getType(key)) {
			case "int":
				o[key]=info.getInt(key);
				break;

			case "string":
				o[key]=info.getString(key);
				break;
		}
	}

	return o;
}
