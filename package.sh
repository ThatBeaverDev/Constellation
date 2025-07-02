#!/bin/bash

# packager

compile() {
    mkdir -p build/apps/build

    # Build the files explorer
    ./tcpkg src/apps/code/finder build/apps/build/com.constellation.finder.idx -override=true

    # Build the demo app
    ./tcpkg src/apps/ApplicationFoundation demoApp.idx -override=true

    # Build the CoreExecutable
    ./tcpkg src/apps/code/CoreExecutable build/apps/build/com.constellation.CoreExecutable.idx -override=true

    # Build Terminal
    ./tcpkg src/apps/code/terminal build/apps/build/com.constellation.terminal.idx -override=true

    # Build Remapper
    ./tcpkg src/apps/code/remapper build/apps/build/com.constellation.remapper.idx -override=true

    # Build Popup
    ./tcpkg src/apps/code/popup build/apps/build/com.constellation.popup.idx -override=true
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