#!/bin/bash

compile() {
    mkdir - build/apps/build

    # Build the context bar
    ./tcpkg src/apps/code/context build/apps/build/com.constellation.context.idx -override=true

    # Build the search UI
    ./tcpkg src/apps/code/search build/apps/build/com.constellation.search.idx -override=true

    # Build the files explorer
    ./tcpkg src/apps/code/finder build/apps/build/com.constellation.finder.idx -override=true
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