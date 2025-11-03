#!/bin/bash

# packager

compile() {
    mkdir -p build/apps
    rm build/indexes/*
    mkdir -p build/indexes

    # system files
    ./scripts/tcpkg build/system build/indexes/system.idx -override=true

    # Build the files explorer
    mkdir -p build/apps/gui/finder/resources
    cp assets/apps/finder.svg build/apps/gui/finder/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/finder build/indexes/com.constellation.finder.idx -override=true

    # Build the CoreExecutable
    ./scripts/tcpkg build/apps/background/CoreExecutable build/indexes/com.constellation.CoreExecutable.idx -override=true

    # Build Terminal
    mkdir -p build/apps/gui/terminal/resources
    cp assets/apps/terminal.svg build/apps/gui/terminal/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/terminal build/indexes/com.constellation.terminal.idx -override=true

    # Build Popup
    ./scripts/tcpkg build/apps/gui/popup build/indexes/com.constellation.popup.idx -override=true

    # Build System Settings
    mkdir -p build/apps/gui/settings/resources
    cp assets/apps/settings.svg build/apps/gui/settings/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/settings build/indexes/com.constellation.settings.idx -override=true

    # Build keystone search
    mkdir -p build/apps/gui/keystone/resources
    cp assets/apps/keystone.svg build/apps/gui/keystone/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/keystone build/indexes/com.constellation.search.idx -override=true

    # Build the Dock
    mkdir -p build/apps/gui/dock/resources
    cp assets/apps/dock.svg build/apps/gui/dock/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/dock build/indexes/com.constellation.dock.idx -override=true
    
    # Build app library
    ./scripts/tcpkg build/apps/gui/library build/indexes/com.constellation.library.idx -override=true

    # Build the systemLoginInterface
    ./scripts/tcpkg build/apps/gui/systemLoginInterface build/indexes/com.constellation.systemLoginInterface.idx -override=true

    # Build the calculator
    mkdir -p build/apps/gui/calculator/resources
    cp assets/apps/calculator.svg build/apps/gui/calculator/resources/icon.svg
    ./scripts/tcpkg build/apps/gui/calculator build/indexes/com.constellation.calculator.idx -override=true

    # Package media files
    ./scripts/tcpkg assets/sounds build/indexes/sounds.idx -override=true
    ./scripts/tcpkg assets/wallpapers build/indexes/wallpapers.idx -override=true

    # Package vector files
    ./scripts/tcpkg assets/vectors build/indexes/vectors.idx -override=true

    # Build the Out of Box Experience
    ./scripts/tcpkg build/system/installation/oobe build/indexes/com.constellation.oobe.idx -override=true

    # Build FiletypeDatabaseManager
    ./scripts/tcpkg build/apps/background/filetypeDatabaseManager build/indexes/com.constellation.fTypeDbMgr.idx -override=true

    # Package CoreServices directory
    ./scripts/tcpkg build/services build/indexes/services.idx -override=true

    # Build languageRuntime
    ./scripts/tcpkg build/apps/gui/crlRuntime build/indexes/com.constellation.crlRuntime.idx -override=true

    # Build previewer
    ./scripts/tcpkg build/apps/gui/preview build/indexes/com.constellation.preview.idx -override=true

    # Build ConstellationGuiManager
    ./scripts/tcpkg build/apps/gui/cwm build/indexes/com.constellation.guiManager.idx -override=true

    # Build usershell
    ./scripts/tcpkg build/apps/tui/usershell build/indexes/com.constellation.usershell.idx -override=true
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