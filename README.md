# 🧠 peakernel

> A plugin-based OS kernel for embedded devices, where JavaScript is the application layer.

---

## 🚀 Overview

peakernel is a system for building programmable embedded devices where:

* **JavaScript is the application**
* **C++ plugins provide capabilities**
* **The kernel is composed at build time**

It is designed for building real hardware systems:

* sensors
* displays
* controllers
* distributed devices

---

## 🎯 Core Idea

> Build the kernel once, iterate on behavior in JavaScript.

peakernel separates:

* **Slow path** → compiling firmware (C++)
* **Fast path** → updating application logic (JS)

```bash
peakernel flash   # rebuild kernel (plugins + firmware)
peakernel deploy  # update JavaScript only
```

---

## 🧠 Mental Model

> You are writing an application that runs on a tiny OS, directly connected to hardware.

* JavaScript is the **application layer**
* The system is **event-driven**
* Hardware is exposed through **plugins**

This is not:

* a scripting layer
* a configuration system

👉 **JS is the program**

---

## 🧩 Architecture

```
JavaScript (application)
        ↓
Event system (unified)
        ↓
Bindings + VFS
        ↓
C++ plugins
        ↓
Hardware / SDK (Arduino, ESP-IDF, etc.)
```

---

## 🔌 Plugin System

All functionality comes from plugins.

Examples:

* `pk-gpio` → GPIO control
* `pk-vfs` → virtual file system
* `pk-quickjs` → JavaScript engine
* `pk-runtime` → timers + event loop
* `pk-arduino` / `pk-espidf` → platform integration

---

### ⚠️ Important: Build-Time Only

> Plugins are **compiled into the kernel**.
> They are **not loaded dynamically at runtime**.

To change functionality:

```bash
pnpm add pk-some-plugin
peakernel flash
```

There is:

* no runtime module loading
* no dynamic drivers
* no hot-plug plugins

👉 The firmware *is* the system.

---

## 📦 Project Setup

```bash
peakernel init
pnpm add pk-gpio pk-vfs pk-quickjs
peakernel flash
```

The package manager acts as the **kernel configuration system**.

---

## ⚙️ Kernel Design

The kernel itself is extremely small.

```cpp
void peakernel_setup() {
    peakernel_notify_setup();
    peakernel_notify_start();
}

void peakernel_loop() {
    peakernel_notify_loop();
}
```

Plugins inject lifecycle functions at build time:

```cpp
void peakernel_notify_loop() {
    runtime_loop();
    gpio_loop();
    quickjs_loop();
    fs_loop();
}
```

👉 The system is **statically composed**, not dynamically orchestrated.

---

## 🔄 Execution Model

* Native (C++) code drives the system loop
* Plugins handle:

  * hardware
  * timing
  * IO
* JavaScript runs **only in response to events**

There is:

* ❌ no `tick()` in JS
* ✅ event-driven execution

---

## 📡 Unified Event System

All events—regardless of origin—use the same interface:

```js
obj.on("event", handler);
obj.off("event", handler);
```

Events can come from:

* hardware (GPIO, etc.)
* VFS streams
* native objects (via bindings)

---

## 📁 Virtual File System (VFS)

All stream-based IO is exposed via a VFS.

Example:

```js
let console = await open("/dev/console");

console.on("data", chunk => {
  console.log(chunk);
});

console.write("hello");
```

> Everything that behaves like a stream can live in the VFS.

---

## 🔗 Native Bindings (peabind)

Plugins can expose direct APIs to JavaScript via bindings.

Example:

```js
pinMode(8, "output");
digitalWrite(8, 1);

pin(8).on("change", v => {
  console.log(v);
});
```

Bindings support:

* functions
* classes
* events

---

## 🧠 Two Exposure Models

Plugins expose functionality in two ways:

### 1. VFS (streams)

* for continuous IO
* event-driven

### 2. Bindings (functions + objects)

* for control / RPC-style APIs

> Plugins choose the most natural abstraction.

---

## 🔁 Lifecycle

Plugins hook into the kernel lifecycle:

* `setup`
* `start`
* `loop`
* `stop`

These are composed into a single executable at build time.

---

## 🧪 Example

```js
pinMode(8, "output");

setInterval(() => {
  digitalWrite(8, 1);
  setTimeout(() => digitalWrite(8, 0), 100);
}, 1000);
```

---

## 🧭 Design Principles

### 1. JavaScript is the application

Not configuration. Not scripting. The actual program.

---

### 2. Build-time composition

The system is defined by installed plugins.

---

### 3. Minimal kernel

The kernel only orchestrates lifecycle.

---

### 4. Unified event model

Same `.on()` interface everywhere.

---

### 5. Multiple abstraction styles

* streams (VFS)
* direct APIs (bindings)

---

### 6. Hardware-first

Designed for real devices, not just software environments.

---

## 🧭 One-line Summary

> peakernel is a build-time composed embedded OS kernel where JavaScript applications control hardware through native plugins and a unified event-driven model.
