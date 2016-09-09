

var to_load = [
    'js/libs/gl-matrix.js',
    'js/libs/matinfio.js',
    'js/libs/ready.js',
    'js/libs/phoria.js',
    'js/app/main.js'
];

var head = document.getElementsByTagName('head')[0];

for (var i = 0; i < to_load.length; i++){

   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.src = to_load[i];
   script.async = false;
   head.appendChild(script);

}
