# peakernel

> A fully pluggable embedded platform where capabilities, runtime, and communication are unified and transport-independent.

## Why peakernel?

Peakernel brings a modern developer experience to embedded systems:

* Install hardware capabilities with npm
* Run JavaScript on the device and deploy in <1 second
* Extend everything - firmware, runtime, CLI, and communication - using plugins

## 30-second quick start

Create a new project:

```bash
npm create peakernel
cd my-project
```

Flash the device:

```bash
npm run flash
```

This flashes a minimal firmware and runs `blink.js` (LED blinking).

Edit `blink.js`:

```js
const LEDPIN=8; // Check your board for onboard LED pin, 8 is for ESP32-C3 supermini.
pinMode(LEDPIN,"output");
setInterval(()=>{
  digitalWrite(LEDPIN,!digitalRead(LEDPIN));
},1000);
```

Deploy instantly (no full flash):

```bash
npm run deploy
```

Open a REPL on the device:

```bash
peakernel monitor
```

## The core idea

peakernel separates:

* **firmware** (stable base)
* **runtime** (JavaScript on device)
* **capabilities** (plugins)

This allows fast iteration:

```bash
edit code → deploy (<1s) → test → repeat
```

## Plugins

> Plugins are full-stack modules that extend firmware, runtime, and tooling.

A single plugin can:

* add native firmware (C/C++)
* expose JavaScript APIs on the device
* add CLI commands
* expose RPC endpoints
* integrate into build/deploy
* provide new transports (serial, TCP, cloud, etc.)

### Example: install hardware with npm

```bash
npm install peakernel-can
npm run flash
```

Now your device has CAN support:

```js
await can.send(...)
```

No manual SDK integration. No firmware patching.

### Example: UI on a 20x4 LCD (React-style)

Install:

```bash
npm install peakernel-lcdui
```

Write:

```js
function App() {
  return (
    <Menu>
      <MenuItem label="Item 1" />
      <MenuItem label="Item 2" />
    </Menu>
  );
}

renderController(<App />);
```

This renders a navigable UI on a 20x4 LCD using a rotary encoder.

## Commands

Commands are provided by the core and plugins:

```bash
peakernel --help
```

Plugins can:

* add new commands
* extend existing ones
* integrate into workflows

## RPC & transport

The CLI communicates with the device via JSON-RPC.

Transports are pluggable:

```
serial:/dev/ttyUSB0
tcp://192.168.1.50
peacloud://device-uuid
```

Same commands, different connection.

```bash
peakernel monitor --target=peacloud://device-uuid
```

## JavaScript on the device

peakernel runs JavaScript directly on the device using pluggable engines:

* QuickJS
* mquickjs (experimental)

You can:

```bash
npm run deploy   # fast iteration (<1s)
peakernel monitor # REPL
```

## Architecture (high level)

```
CLI
  ↓
Transport (serial / TCP / cloud)
  ↓
JSON-RPC
  ↓
Device runtime (JS engine)
  ↓
Plugins (firmware + APIs)
```

## What makes peakernel different?

* No fixed SDK
* No monolithic firmware
* No separation between tooling and runtime

Instead:

> **Everything is a plugin.**

## Vision

* Hardware capabilities installable via npm
* Devices accessible locally or remotely with the same commands
* One system for firmware, runtime, CLI, and automation

## Related

* `peabrain` — a physical industrial controller built on peakernel

## Status

Early stage, evolving quickly.
