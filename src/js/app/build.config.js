var path = require('path');

module.exports = {
    resolve: {
    root: path.resolve('.'),
    extensions: ['', '.js'],
    alias: {
        'libs/math.custom': '../libs/math.custom',
        'libs/three.custom': '../libs/three.custom',
        'libs/domReady': '../libs/domReady'
        }
    },
    output: {
        library: 'player',
        libraryTarget: 'var'
    }
}
