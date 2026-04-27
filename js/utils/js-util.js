export class DeclaredError extends Error {
	constructor(...args) {
		super(...args);
		this.declared=true;
	}
}

export function stringChunkify(str, chunkSize) {
	const chunks = [];
	for (let i = 0; i < str.length; i += chunkSize) {
		chunks.push(str.slice(i, i + chunkSize));
	}
	return chunks;
}

export function arrayify(a) {
    if (!a)
        a=[];

    if (!Array.isArray(a))
        a=[a];

    return a.flat(Infinity);
}
