# BF6 Portal Experiences (Public)

My Battlefield 6 Portal game modes and the maps made for them, kept together.

## How it is laid out

Each folder is one experience: one game mode plus the maps it runs on.

| In each experience | What it is |
| --- | --- |
| `src/` | The game mode script (TypeScript) |
| `spatials/` | The exported map files Portal reads |
| `maps/` | The Godot scenes those map files were exported from |
| `package.json` | Experience name, version and build scripts |


The projects follow Mike DeLuca's
[bf6-portal-scripting-template](https://github.com/deluca-mike/bf6-portal-scripting-template).

## Building one

```
cd <experience folder>
npm install
npm run build
```

The result lands in `dist/`. Paste `dist/bundle.ts` and `dist/bundle.strings.json` into the Portal web editor.

## Opening the maps

The scenes in `maps/` and `One-Offs/` open in the Godot project that ships with the Portal SDK. Copy the folder
you want into the SDK project's `levels` folder first.

Some scenes were traced over reference models that are not in this repository. Those scenes still open, with the
reference model shown as missing.

## Not stored here

`.env` files hold your own Portal session and mod ids. Copy `.env.example` to `.env` and fill it in yourself.
