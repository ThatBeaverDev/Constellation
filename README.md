# Constellation
[![GitHub release](https://img.shields.io/github/release/ThatBeaverDev/Constellation.svg)](https://github.com/ThatBeaverDev/Constellation/releases)
[![License](https://img.shields.io/github/license/ThatBeaverDev/Constellation)](https://github.com/ThatBeaverDev/Constellation/blob/main/LICENSE)
[![Latest Version](https://img.shields.io/github/package-json/v/ThatBeaverDev/Constellation)](https://github.com/ThatBeaverDev/Constellation)

Constellation is an environment for JavaScript (Or TypeScript) based apps to run inside.

## Running it
If you want to run the **latest** version of Constellation, it is pre-built at https://constellation-sys.vercel.app

### Running Alternate Versions
If you want to run either an old version or the development branch, follow these instructions:

#### Check the version
Constellation has two version histories in this repository, Constellation[Castorea] and the current version.

Generally, the split is defined as the commit on the 15th of June 2025 (`291332b`), `Restart the Project`

If you are trying to run a version from before here - note you need another repository.
Running this version is *not* supported at this time, and you're on your own.

#### Downloading it
To get the source code, simply use `git` - but it is important to pass `--recursive` to clone the submodules.
```sh
git clone https://github.com/ThatBeaverDev/Constellation --recursive
```
If you are trying to run the development branch:
```sh
git checkout dev
```
Otherwise, I trust you know how to use checkout to get to another commit - it is recommended to look for groups and go for the last one, since they may be out of order.

Once cloned and within the directory (`cd Constellation`), you can get it built.

Constellation has 3 commands to help with building it.
1. `npm run newenv`
    - This runs the other two commands together along with others like `npm install`, useful for a first clone
2. `npm run build`
    - This builds the project, allowing it to be ran.
3. `npm run dev`
    - This runs a local webserver so you can access the project from the web.

I'm going to assume you want to setup a new environment:
```sh
npm run newenv
```
This will set everything up

Once this is finished, Constellation should be accessible from `http://localhost:5173`.

## Modifying it
Since Constellation uses TypeScript for large parts of the code, it must be compiled.
Constellation can be compiled with this command:
```sh
npm run build
```
However, this recompiled *everything*.
To just recompile Apps, you can just run this command, which should compile faster:
```sh
npm run build-apps
```