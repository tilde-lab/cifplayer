#!/bin/sh

command -v npm > /dev/null 2>&1 || { echo >&2 "Error: npm package manager should be installed"; exit 1; }

npm install webpack
npm install mathjs

THREEJSFOLDER="three.js-r72"

if [[ ! -d $THREEJSFOLDER ]]; then
    wget --output-document r72.zip https://github.com/mrdoob/three.js/archive/r72.zip
    unzip r72.zip
    rm r72.zip
fi

cp deps/player.html.threejs.json $THREEJSFOLDER/utils/build/includes > /dev/null 2>&1 || { echo >&2 "Failed to download archive"; exit 1; }
cd $THREEJSFOLDER/utils/build
python build.py --include player.html.threejs --amd --output ../../../src/js/libs/three.custom.js > /dev/null 2>&1 || { echo >&2 "Failed to run build.py"; exit 1; }

cd ../../../
./node_modules/webpack/bin/webpack.js --config deps/player.html.math.config.js deps/player.html.math.js src/js/libs/math.custom.js > /dev/null 2>&1 || { echo >&2 "Failed to run webpack"; exit 1; }

echo "======================="
echo "Layout prepared in src/"
echo "======================="

exit 0
