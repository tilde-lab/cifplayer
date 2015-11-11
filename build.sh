#!/bin/sh

if [[ ! -d "node_modules" ]]; then
    sh prepare.sh
fi

THREEJSFOLDER="three.js-r72"

./node_modules/webpack/bin/webpack.js --display-error-details --display-reasons --config src/js/app/build.config.js --optimize-max-chunks 1 src/js/app/main.js player.dist.js

java -jar $THREEJSFOLDER/utils/build/compiler/compiler.jar --jscomp_off checkTypes --language_in ECMASCRIPT5_STRICT --js player.dist.js > player.js || { echo >&2 "Failed to make distribution"; exit 1; }

NPATT=$(grep -n 'REPLACED_IN_PRODUCTION' src/index.html | cut -d ":" -f 1)
{ head -n $(($NPATT-1)) src/index.html; echo '<script type="text/javascript">'; cat player.js; echo '</script>'; tail -n +$(($NPATT+1)) src/index.html; } > player.html

rm player.dist.js player.js

echo "=============================================="
echo "Compiled successfully as player.html"
echo "This standalone file may be used in production"
echo "=============================================="

exit 0
