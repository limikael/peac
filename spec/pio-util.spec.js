import {pioParse, pioStringify, pioGetEnvNames, pioGetEnv} from "../js/utils/pio-util.js";

describe("pio-util",()=>{
	it("can parse platformio.ini",()=>{
		let p=pioParse(`
[section1]
hello=1
world=2

[env:section2]
test=x
test2=
  a
  b
`);

		expect(p["env:section2"].test2).toEqual(["a","b"]);
		expect(pioGetEnvNames(p)).toEqual(["section2"])

		expect(pioGetEnv(p,"section2").test).toEqual("x");

		let s=pioStringify(p);
		//console.log(s);
	});
});