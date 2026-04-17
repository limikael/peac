# PEAC System

PEAC is a modular firmware composition and execution platform for embedded and runtime systems.

It combines:
- JavaScript for high-level behavior
- C++ for hardware and native capabilities
- A minimal runtime (PEAC) for orchestration
- A plugin system based on hooks and events

---

# Core Idea

Build firmware once, iterate behavior continuously.

PEAC separates:
- Slow system construction (C++, firmware build)
- Fast iteration (JavaScript deployment)

Commands:

- peac flash → rebuild firmware (C++ + bindings)
- peac deploy → update JavaScript only

---

# Architecture

JavaScript (user logic)
→ QuickJS (embedded runtime)
→ peabind (binding generator)
→ C++ plugins (hardware logic)
→ PlatformIO / ESP-IDF / Arduino
→ Hardware (ESP32 and similar devices)

---

# Components

## peac (Runtime Platform)

PEAC is the runtime system that:
- Executes JavaScript on embedded devices
- Hosts plugin execution via hook-channel
- Manages lifecycle and event loop
- Selects JS engine (e.g. QuickJS)

Example:

peac deploy --engine=quickjs
peac flash

---

## peabind (Binding Layer)

peabind connects JavaScript and C++.

It:
- Parses IDL definitions
- Generates C++/JS glue code
- Hides engine-specific APIs
- Produces engine-agnostic plugins

Key idea:
Plugins do not depend on the JS engine.

---

## hook-channel (Plugin System)

A minimal hook-based execution system.

Core API:

await channel.dispatch("eventName", event)

Features:
- Plugins register functions per hook name
- Ordered execution
- Shared mutable event object

Example plugin:

export function build(ev) {
  ev.messages.push("hello");
}

Execution modes:
- Async: channel.dispatch(...)
- Sync: channel.dispatchSync(...)

---

## peabrain (Application Layer)

peabrain is a machine control application built on PEAC.

It:
- Controls machines
- Uses plugins and bindings
- Runs user-defined automation logic

Example:

let motor = masterDevice.getRemoteDevice(123, { profile: MOTR_PROFILE });
motor.targetPosition = 1000;

---

## canopener (CANopen Stack)

C++ CANopen implementation.

It:
- Runs standalone or as PEAC plugin
- Controls industrial devices
- Supports motors and distributed systems

---

# Plugin System

Plugins are standard Node modules.

Discovered from:
- package.json dependencies
- extraModuleDirs

Filtered by keywords and exports.

---

## Plugin Example

{
  "keywords": ["peac-plugin"],
  "exports": {
    "./main": "./plugin.js"
  }
}

---

## Plugin Code

export function init(ev) {}

export function tick(ev) {}

export function build(ev) {
  ev.files.push("output.cpp");
}

---

# Hook Model

Single primitive:

channel.dispatch("hookName", event)

Design:
- Shared event object
- Ordered execution
- Deterministic behavior

Patterns:

Side effect:
ev.files.push(...)

Accumulation:
ev.config.value = 42

---

# Build System (peac flash)

Pipeline:

1. Discover plugins
2. Collect IDLs + sources
3. Merge IDLs
4. Generate bindings (peabind)
5. Generate PlatformIO project
6. Compile firmware

Output:

.target/
  platformio.ini
  src/
  bindings.cpp
  main.cpp

---

# Deployment (peac deploy)

Fast iteration without firmware rebuild.

Flow:
- Upload JavaScript to device storage
- Device reloads runtime
- QuickJS executes script

Example:

upload main.js → /main.js
reboot device

Runtime:

JS_Eval(ctx, script, ...)

---

# Object Model (peabind)

Cross-language ownership model:

JS object → handle (int) → C++ registry → shared_ptr

Rules:
- C++ owns lifetime via shared_ptr
- JS holds opaque handles
- GC triggers cleanup via FinalizationRegistry

Guarantees:
- No dangling pointers
- No double free
- Stable identity mapping

---

# Event Loop

Runs inside embedded firmware loop:

void loop() {
  processTimers();
  runJS();
}

Supports:
- setTimeout
- setInterval
- async tasks

---

# PlatformIO Integration

Generated project:

[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino

---

# Design Principles

## 1. Separation of concerns
- peac = runtime
- peabind = binding layer
- plugins = functionality
- PlatformIO = build system

## 2. Minimal primitives
- hooks
- events
- bindings

## 3. Deterministic execution
- explicit discovery
- ordered execution

## 4. Engine independence
- plugins are engine-agnostic

## 5. Fast iteration
- firmware rarely changes
- JS changes frequently

---

# Summary

PEAC is a modular embedded runtime where:
- JavaScript controls behavior
- C++ provides hardware capabilities
- Plugins extend the system via hooks
- A minimal runtime orchestrates everything