#!/bin/sh

test npm || { echo "npm should be installed" ; exit 1 }

npm install webpack
npm install mathjs

#wget --output-document r72.zip https://github.com/mrdoob/three.js/archive/r72.zip
wget --output-document dev.zip https://github.com/mrdoob/three.js/archive/dev.zip
#unzip r72.zip -d three.js
unzip dev.zip -d three.js

cp player.html.threejs.json three.js/utils/build/includes
cd three.js/utils/build
python build.py --include player.html.threejs --amd --output ../../../src/js/libs/three.custom.js

cd ../../../
webpack --config player.html.math.config.js player.html.math.js src/js/libs/math.custom.js

echo "Development layout prepared"

exit 0
