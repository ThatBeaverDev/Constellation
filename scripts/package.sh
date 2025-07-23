#!/bin/bash

# packager

compile() {
    mkdir -p build/apps

    # Build the files explorer
    ./scripts/tcpkg build/apps/finder build/apps/com.constellation.finder.idx -override=true

    # Build the CoreExecutable
    ./scripts/tcpkg build/apps/CoreExecutable build/apps/com.constellation.CoreExecutable.idx -override=true

    # Build Terminal
    ./scripts/tcpkg build/apps/terminal build/apps/com.constellation.terminal.idx -override=true

    # Build Remapper
    ./scripts/tcpkg build/apps/remapper build/apps/com.constellation.remapper.idx -override=true

    # Build Popup
    ./scripts/tcpkg build/apps/popup build/apps/com.constellation.popup.idx -override=true

    # Build Rotur
    ./scripts/tcpkg build/apps/rotur/appl build/apps/com.rotur.appl.idx -override=true
    ./scripts/tcpkg build/apps/rotur/backgr build/apps/com.rotur.backgr.idx -override=true

    # Build System Settings
    ./scripts/tcpkg build/apps/settings build/apps/com.constellation.settings.idx -override=true

    # Build keystone search
    ./scripts/tcpkg build/apps/keystone build/apps/com.constellation.search.idx -override=true

    # Build the Dock
    ./scripts/tcpkg build/apps/dock build/apps/com.constellation.dock.idx -override=true
    
    # Package audio files
    mkdir -p build/assets
    ./scripts/tcpkg assets/sounds build/assets/sounds.idx -override=true
}

daemon() {
    chsum1=""

    while [[ true ]]
    do
        chsum2=`find src/apps -type f -exec md5 {} \;`
        if [[ $chsum1 != $chsum2 ]] ; then           
            if [ -n "$chsum1" ]; then
                compile
            fi
            chsum1=$chsum2
        fi
        sleep 0
    done
}

compile

if [[ $1 == "--watch" ]]
then
    daemon
fi