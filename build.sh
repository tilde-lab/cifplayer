#!/bin/sh

if [[ ! -d "node_modules" ]]; then
    sh prepare.sh
fi

#ARCFOLDER="three.js-r72"
ARCFOLDER="three.js-dev"

cd src/js/app
webpack --config build.config.js --optimize-max-chunks 1 main.js ../../../player.dist.js > /dev/null 2>&1 || { echo >&2 "Failed to compile sources"; rm ../../../player.dist.js; exit 1; }

cd ../../../
java -jar $ARCFOLDER/utils/build/compiler/compiler.jar --jscomp_off checkTypes --language_in ECMASCRIPT5_STRICT --js player.dist.js > player.js || { echo >&2 "Failed to make distribution"; exit 1; }

# insert one file into another file instead of pattern
NPATT=$(grep -n 'REPLACED_IN_PRODUCTION' src/index.html | cut -d ":" -f 1)
{ head -n $(($NPATT-1)) src/index.html; echo '<script type="text/javascript">'; cat player.js; echo '</script>'; tail -n +$(($NPATT+1)) src/index.html; } > player.html

rm player.dist.js player.js

echo "====================================================================="
echo "Compiled successfully as player.html"
echo "This standalone file may be copied and used at the destination server"
echo "====================================================================="

exit 0
