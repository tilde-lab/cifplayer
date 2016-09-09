#!/bin/sh

THREEJSFOLDER="three.js-r76"

COMPONENTS=( \
    'js/libs/gl-matrix.js' \
    'js/libs/matinfio.js' \
    'js/libs/docready.js' \
    'js/libs/phoria.js' \
    'js/app/main.js' \
)

cd src

rm ../player.dist.js
touch ../player.dist.js

for i in "${COMPONENTS[@]}"
do
    cat $i >> ../player.dist.js
done

cd ..

java -jar $THREEJSFOLDER/utils/build/compiler/compiler.jar --jscomp_off checkTypes --language_in ECMASCRIPT5_STRICT --js player.dist.js > player.js || { echo >&2 "Failed to make distribution"; exit 1; }

NPATT=$(grep -n 'REPLACED_IN_PRODUCTION' src/index.html | cut -d ":" -f 1)
{ head -n $(($NPATT-1)) src/index.html; echo '<script type="text/javascript">'; cat player.js; echo '</script>'; tail -n +$(($NPATT+1)) src/index.html; } > player.html

rm player.dist.js player.js

echo "=============================================="
echo "Compiled successfully as player.html"
echo "This standalone file may be used in production"
echo "=============================================="

exit 0
