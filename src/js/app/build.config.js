var path = require('path');

module.exports = {
    resolve: {
    root: path.resolve('.'),
    extensions: ['', '.js'],
    alias: {
        'libs/matinfio': '../libs/matinfio',
        'libs/math.custom': '../libs/math.custom',
        'libs/three.custom': '../libs/three.custom',
        'libs/tween.umd': '../libs/tween.umd'
        }
    },
    output: {
        library: 'player',
        libraryTarget: 'var'
    }
}
