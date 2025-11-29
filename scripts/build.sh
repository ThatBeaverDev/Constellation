fix() {
    npx prettier src --write
}

clean() {
    #rm -rf build/*
    #rm -rf types/*

    # delete .DS_Store files since they mess up .idx packaging
    find . -name .DS_Store -exec rm {} +

    # delete empty directories. I know what they did.
    npx remove-empty-directories src
}

build_tsc() {
    npx tsc

    # Copy extra assets to the build directory
    node scripts/copy.mjs

    build_apps_d_ts

    node build/system/security/hash/secureHash.js
}

build_apps_d_ts() {    
    # copy global.d.ts to types (entrypoint for rollup)
    mkdir -p types
    cp src/global.d.ts types/global.d.ts
    cp src/fs/BrowserFsTypes.d.ts types/fs/BrowserFsTypes.d.ts

    npx rollup -c
}

package_apps() {
    /bin/bash scripts/package.sh
}

# need for Constellation to know it is built
date_file() {
    node -e "console.log(Date.now())" > build/date.txt

    # increment build number
    echo "export const buildNumber =" $(node -e "import { buildNumber } from './build/system/buildVer.js'; console.log(buildNumber + 1)") ";" > src/system/buildver.ts
}

clean
if [[ $1 != "--no-fix" ]]
then
    fix
fi
build_tsc
package_apps
date_file
