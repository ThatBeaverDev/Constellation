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

    # Build System Settings
    ./scripts/tcpkg build/apps/settings build/apps/com.constellation.settings.idx -override=true

    # Build keystone search
    ./scripts/tcpkg build/apps/keystone build/apps/com.constellation.search.idx -override=true

    # Build the Dock
    ./scripts/tcpkg build/apps/dock build/apps/com.constellation.dock.idx -override=true
    
    # Build app library
    ./scripts/tcpkg build/apps/library build/apps/com.constellation.library.idx -override=true

    # Package audio files
    mkdir -p build/assets
    ./scripts/tcpkg assets/sounds build/assets/sounds.idx -override=true

    # Build the systemLoginInterface
    ./scripts/tcpkg build/apps/systemLoginInterface build/apps/com.constellation.systemLoginInterface.idx -override=true

    # Build the calculator
    ./scripts/tcpkg build/apps/calculator build/apps/com.constellation.calculator.idx -override=true
}

# first param is directory, second param is name
packageSDKapp() {
    cd $1

    echo "packageSDKapp: $(pwd)"

    npm run build-app

    cd -

    cp "$1/app.idx" "build/apps/$2.idx"
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