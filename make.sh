#!/bin/bash

build() {
    npm run build-nofix
}

daemon() {
    chsum1=""

    while [[ true ]]
    do
        chsum2=`find src -type f -exec md5 {} \;`
        if [[ $chsum1 != $chsum2 ]] ; then           
            if [ -n "$chsum1" ]; then
                build
            fi
            chsum1=$chsum2
        fi
        sleep 0
    done
}

build

if [[ $1 == "--watch" ]]
then
    daemon
fi