#!/bin/bash

# packager

compile() {
    mkdir -p build/apps

    # Build the files explorer
    mkdir -p build/apps/gui/finder/resources
    cp assets/apps/finder.svg build/apps/gui/finder/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/finder build/apps/com.constellation.finder.idx -override=true

    # Build the CoreExecutable
    ./scripts/tcpkg build/apps/background/CoreExecutable build/apps/com.constellation.CoreExecutable.idx -override=true

    # Build Terminal
    mkdir -p build/apps/gui/terminal/resources
    cp assets/apps/terminal.svg build/apps/gui/terminal/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/terminal build/apps/com.constellation.terminal.idx -override=true

    # Build Popup
    ./scripts/tcpkg build/apps/gui/popup build/apps/com.constellation.popup.idx -override=true

    # Build System Settings
    mkdir -p build/apps/gui/settings/resources
    cp assets/apps/settings.svg build/apps/gui/settings/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/settings build/apps/com.constellation.settings.idx -override=true

    # Build keystone search
    mkdir -p build/apps/gui/keystone/resources
    cp assets/apps/keystone.svg build/apps/gui/keystone/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/keystone build/apps/com.constellation.search.idx -override=true

    # Build the Dock
    mkdir -p build/apps/gui/dock/resources
    cp assets/apps/dock.svg build/apps/gui/dock/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/dock build/apps/com.constellation.dock.idx -override=true
    
    # Build app library
    ./scripts/tcpkg build/apps/gui/library build/apps/com.constellation.library.idx -override=true

    # Build the systemLoginInterface
    ./scripts/tcpkg build/apps/gui/systemLoginInterface build/apps/com.constellation.systemLoginInterface.idx -override=true

    # Build the calculator
    mkdir -p build/apps/gui/calculator/resources
    cp assets/apps/calculator.svg build/apps/gui/calculator/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/calculator build/apps/com.constellation.calculator.idx -override=true

    # assets files
    mkdir -p build/assets

    # Package audio files
    ./scripts/tcpkg assets/sounds build/assets/sounds.idx -override=true

    # Package vector files
    ./scripts/tcpkg assets/vectors build/assets/vectors.idx -override=true

    # Build the Out of Box Experience
    ./scripts/tcpkg build/installation/oobe build/installation/com.constellation.oobe.idx -override=true

    # Build FiletypeDatabaseManager
    ./scripts/tcpkg build/apps/background/filetypeDatabaseManager build/apps/background/com.constellation.fTypeDbMgr.idx -override=true

    # Package CoreServices directory
    ./scripts/tcpkg build/services build/services.idx -override=true

    # Build languageRuntime
    ./scripts/tcpkg build/apps/gui/crlRuntime build/apps/com.constellation.crlRuntime.idx -override=true

    # Build previewer
    ./scripts/tcpkg build/apps/gui/preview build/apps/com.constellation.preview.idx -override=true
}

# first param is directory, second param is name
packageSDKapp() {
    cd $1

    echo "packageSDKapp: $(pwd)"

    npm run build-app

    cd -

    cp "$1/app.idx" "build/apps/$2.idx"
}

compile