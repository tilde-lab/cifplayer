var path = require('path');

module.exports = {
    resolve: {
    root: path.resolve('.'),
    extensions: ['', '.js'],
    alias: {
        'deps/math.custom': '../deps/math.custom',
        'deps/three.custom': '../deps/three.custom'
        }
    }
}
