#!/bin/bash

# packager

compile() {
    mkdir -p build/apps/build

    # Build the files explorer
    ./scripts/tcpkg build/apps/code/finder build/apps/build/com.constellation.finder.idx -override=true

    # Build the CoreExecutable
    ./scripts/tcpkg build/apps/code/CoreExecutable build/apps/build/com.constellation.CoreExecutable.idx -override=true

    # Build Terminal
    ./scripts/tcpkg build/apps/code/terminal build/apps/build/com.constellation.terminal.idx -override=true

    # Build Remapper
    ./scripts/tcpkg build/apps/code/remapper build/apps/build/com.constellation.remapper.idx -override=true

    # Build Popup
    ./scripts/tcpkg build/apps/code/popup build/apps/build/com.constellation.popup.idx -override=true

    # Build Rotur
    ./scripts/tcpkg build/apps/code/rotur.appl build/apps/build/com.rotur.appl.idx -override=true
    ./scripts/tcpkg build/apps/code/rotur.backgr build/apps/build/com.rotur.backgr.idx -override=true

    # Build System Settings
    ./scripts/tcpkg build/apps/code/settings build/apps/build/com.constellation.settings.idx -override=true

    # Build keystone search
    ./scripts/tcpkg build/apps/code/keystone build/apps/build/com.constellation.search.idx -override=true

    # Build the Dock
    ./scripts/tcpkg build/apps/code/dock build/apps/build/com.constellation.dock.idx -override=true -incrementor=true
}

daemon() {
    chsum1=""

    while [[ true ]]
    do
        chsum2=`find src/apps/code -type f -exec md5 {} \;`
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