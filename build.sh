#!/bin/sh

if [[! -d "three.js" ]]; then
    sh prepare.sh
fi

cd src/js/app
webpack --config build.config.js main.js ../../../player.dist.js
cd ../../../
java -jar three.js/utils/build/compiler/compiler.jar --jscomp_off checkTypes --language_in ECMASCRIPT5_STRICT --js player.dist.js --js_output_file player.min.js
rm player.dist.js
cp src/index.html index.html

echo "Compiled successfully"

exit 0
