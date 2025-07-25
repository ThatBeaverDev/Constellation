fix() {
    npx prettier src --write
}

clean() {
    rm -rf build/*
    rm -rf types/*

    # delete .DS_Store files since they mess up .idx packaging
    find . -name .DS_Store -exec rm {} +
}

build_tsc() {
    npx tsgo

    # Copy extra assets to the build directory
    node scripts/copy.mjs

    build_apps_d_ts
}

build_apps_d_ts() {    
    # copy global.d.ts to types (entrypoint for rollup)
    cp src/global.d.ts types/global.d.ts

    npx rollup -c

    # add an export {} to the .d.ts file so it can augment global scope
    printf "export {}\n\n%s" "$(cat src/apps/app-template/constellation.d.ts)" > src/apps/app-template/constellation.d.ts
}

package_apps() {
    /bin/bash scripts/package.sh
}

# need for Constellation to know it is built
date_file() {
    node -e "console.log(Date.now())" > build/date.txt
}

clean
if [[ $1 != "--no-fix" ]]
then
    fix
fi
build_tsc
package_apps
date_file
