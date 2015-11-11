
// Custom math.js build:
// webpack math.custom.js math.custom.webpack.js
// java -jar utils/compiler.jar --jscomp_off checkTypes --language_in ECMASCRIPT5_STRICT --js math.custom.webpack.js --js_output_file math.custom.min.js

var core = require('mathjs/core');
var math = core.create();

math.import(require('mathjs/lib/type/matrix/Matrix'));
math.import(require('mathjs/lib/type/matrix/DenseMatrix'));
math.import(require('mathjs/lib/function/trigonometry/sin'));
math.import(require('mathjs/lib/function/trigonometry/cos'));
math.import(require('mathjs/lib/function/arithmetic/sqrt'));
math.import(require('mathjs/lib/function/arithmetic/norm'));
math.import(require('mathjs/lib/function/arithmetic/divide'));
math.import(require('mathjs/lib/function/arithmetic/multiply'));
math.import(require('mathjs/lib/function/arithmetic/subtract'));
math.import(require('mathjs/lib/function/matrix/cross'));
math.import(require('mathjs/lib/function/matrix/dot'));

module.exports = math;
