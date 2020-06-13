/**
 * Author: Evgeny Blokhin
 * License: MIT
 * Version: 0.17.0
 */
"use strict";
require.config({ baseUrl: 'js/app', paths: { libs: '../libs' }});
require(['libs/matinfio', 'libs/math.custom', 'libs/three.custom'], function(MatinfIO, mathjs, th){

var player = {};
player.version = '0.17.0';
player.loaded = false;
player.container = null;
player.stats = null;
player.camera = null;
player.scene = null;
player.renderer = null;
player.controls = null;
player.atombox = null;
player.available_overlays = ["empty", "S", "N"];
player.default_overlay = "S"; // TODO radio checked=checked
player.current_overlay = player.default_overlay;
player.obj3d = false;
player.local_supported = window.File && window.FileReader && window.FileList && window.Blob;
player.mpds_integration = window.parent && window.parent.wmgui;
//player.webproxy = 'proxy.php'; // to display and download remote files; must support url get param
player.webgl = (function(){
try {
var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
} catch ( e ) {
return false;
}
})();
player.colorset = 'W';
player.sample = "data_example\n_cell_length_a 24\n_cell_length_b 5.91\n_cell_length_c 5.85\n_cell_angle_alpha 90\n_cell_angle_beta 90\n_cell_angle_gamma 90\n_symmetry_space_group_name_H-M 'P1'\nloop_\n_symmetry_equiv_pos_as_xyz\nx,y,z\nloop_\n_atom_site_label\n_atom_site_type_symbol\n_atom_site_fract_x\n_atom_site_fract_y\n_atom_site_fract_z\n_atom_site_charge\nO1 O 0.425 0.262 0.009 -2.0\nO2 O -0.425 0.262 0.009 -2.0\nH3 H 0.444 0.258 0.154 1.0\nH4 H -0.444 0.258 0.154 1.0\nH5 H 0.396 0.124 0.012 1.0\nH6 H -0.396 0.124 0.012 1.0\nO7 O 0.425 0.236 0.510 -2.0\nO8 O -0.425 0.236 0.510 -2.0\nH9 H 0.444 0.239 0.656 1.0\nH10 H -0.444 0.239 0.656 1.0\nH11 H 0.396 0.374 0.512 1.0\nH12 H -0.396 0.374 0.512 1.0\nSr13 Sr 0.342 0.964 0.467 2.0\nSr14 Sr -0.342 0.964 0.467 2.0\nSr15 Sr 0.342 0.535 0.967 2.0\nSr16 Sr -0.342 0.535 0.967 2.0\nO17 O 0.348 0.971 0.019 -2.0\nO18 O -0.348 0.971 0.019 -2.0\nO19 O 0.348 0.528 0.519 -2.0\nO20 O -0.348 0.528 0.519 -2.0\nO21 O 0.263 0.803 0.701 -2.0\nO22 O -0.263 0.803 0.701 -2.0\nO23 O 0.264 0.695 0.200 -2.0\nO24 O -0.264 0.695 0.200 -2.0\nZr25 Zr 0.261 0.000 0.998 4.0\nZr26 Zr -0.261 0.000 0.998 4.0\nZr27 Zr 0.261 0.499 0.498 4.0\nZr28 Zr -0.261 0.499 0.498 4.0\nO29 O 0.257 0.304 0.806 -2.0\nO30 O -0.257 0.304 0.806 -2.0\nO31 O 0.257 0.195 0.306 -2.0\nO32 O -0.257 0.195 0.306 -2.0\nSr33 Sr 0.173 0.993 0.524 2.0\nSr34 Sr -0.173 0.993 0.524 2.0\nSr35 Sr 0.173 0.506 0.024 2.0\nSr36 Sr -0.173 0.506 0.024 2.0\nO37 O 0.173 0.947 0.986 -2.0\nO38 O -0.173 0.947 0.986 -2.0\nO39 O 0.173 0.551 0.486 -2.0\nO40 O -0.173 0.551 0.486 -2.0\nO41 O 0.098 0.204 0.295 -2.0\nO42 O -0.098 0.204 0.295 -2.0\nO43 O 0.098 0.295 0.795 -2.0\nO44 O -0.098 0.295 0.795 -2.0\nZr45 Zr 0.086 0.004 0.998 4.0\nZr46 Zr -0.086 0.004 0.998 4.0\nZr47 Zr 0.086 0.495 0.498 4.0\nZr48 Zr -0.086 0.495 0.498 4.0\nO49 O 0.074 0.709 0.211 -2.0\nO50 O -0.074 0.709 0.211 -2.0\nO51 O 0.074 0.790 0.711 -2.0\nO52 O -0.074 0.790 0.711 -2.0\nSr53 Sr 0 0.991 0.467 2.0\nSr54 Sr 0 0.508 0.967 2.0\nO55 O 0 0.076 0.020 -2.0\nO56 O 0 0.423 0.520 -2.0";

var THREE = th.THREE || th;

/* Polyfills */
function cancel_event(evt){
    evt = evt || window.event;
    if (evt.cancelBubble) evt.cancelBubble = true;
    else {
        if (evt.stopPropagation) evt.stopPropagation();
        if (evt.preventDefault) evt.preventDefault();
    }
}
var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(cb){ return setTimeout(cb, 1000/60) }

function notify(msg){
    if (player.mpds_integration){
        window.parent.wmgui.notify(msg);
        window.parent.close_vibox();
    } else {
        var notifybox = document.getElementById('notifybox'),
            message = document.getElementById('message');
        notifybox.style.display = 'block';
        message.innerHTML = '';
        setTimeout(function(){ message.innerHTML = msg }, 250);
    }
}

function advise(msg){
    if (player.mpds_integration){
        window.parent.wmgui.notify(msg);
    } else alert(msg);
}

function create_box(id, html){
    var elem = document.createElement('div');
    elem.setAttribute('id', id);
    if (!!html) elem.innerHTML = html;
    document.body.appendChild(elem);
    return elem;
}

function draw_3d_line(start_arr, finish_arr, color){
    if (!color) var color = 0xDDDDDD;
    var vector = new THREE.Geometry();
    vector.vertices.push(new THREE.Vector3( start_arr[0], start_arr[1], start_arr[2] ));
    vector.vertices.push(new THREE.Vector3( finish_arr[0], finish_arr[1], finish_arr[2] ));
    var material = new THREE.LineBasicMaterial({color: color});
    player.atombox.add(new THREE.Line(vector, material));
}

function create_sprite(text){
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        metrics = context.measureText(text), w = metrics.width * 3.5;

    canvas.width = w;
    canvas.height = 30;
    context.font = "normal 30px Palatino";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = (player.colorset == "W") ? "#000" : "#fff";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var material = new THREE.SpriteMaterial({map: texture, depthTest: false});
    var sprite = new THREE.Sprite(material);
    sprite.renderOrder = 1;
    var txt = new THREE.Object3D();
    sprite.scale.set(w, 30, 1);
    txt.add(sprite);
    txt.name = "label";
    return txt;
}

function init(){
    player.loaded = true;
    player.container = create_box('player');

    player.scene = new THREE.Scene();
    player.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 20000);
    player.camera.position.set(0, 0, 1800);

    var AmbientLight = new THREE.AmbientLight(0x999999);
    player.scene.add(AmbientLight);
    var PointLight = new THREE.PointLight(0x666666, 1);
    PointLight.position.set(1500, 1500, 1500);
    player.scene.add(PointLight);

    player.renderer = player.webgl ? new THREE.WebGLRenderer({antialias:true, alpha: true}): new THREE.CanvasRenderer();
    (player.colorset == "W") ? player.renderer.setClearColor(0xffffff, 1) : player.renderer.setClearColor(0x000000, 1);
    player.renderer.setPixelRatio( window.devicePixelRatio );
    player.renderer.setSize(window.innerWidth, window.innerHeight);
    player.container.appendChild(player.renderer.domElement);

    //player.stats = new Stats();
    //player.stats.domElement.style.position = 'absolute';
    //player.stats.domElement.style.top = '0px';
    //document.body.appendChild( player.stats.domElement );

    var zoompanel = create_box('zoompanel');
    zoompanel.onclick = function(evt){
        cancel_event(evt);
        var y = (evt.pageY) ? evt.pageY : evt.clientY,
            ey = document.getElementById('zoompanel').offsetTop,
            fov = ((y-ey < 50) ? 1 : -1) * 7.5;
        player.camera.fov -= fov;
        player.camera.updateProjectionMatrix();
    }

    if (player.mpds_integration){
        var exitpanel = create_box('exitpanel');
        exitpanel.onclick = function(){
            window.parent.close_vibox();
        }
    }

    player.controls = new THREE.TrackballControls(player.camera);
    player.controls.rotateSpeed = 7.5;
    player.controls.staticMoving = true;

    render();
}

function render(){
    var old = player.scene.getObjectByName("atombox");
    if (old){
        player.scene.remove(old);
        var u = old.children.length - 1;
        for (; u >= 0; u--){
            var child = old.children[u];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            if (child.dispose) child.dispose();
        }
        player.controls.reset();
    }
    player.atombox = new THREE.Object3D();

    var test = document.getElementById('infopanel');
    if (test) test.parentNode.removeChild(test);

    if (player.obj3d.descr){
        var symlabel = player.obj3d.mpds_data ? '' : ((player.obj3d.descr.symlabel) ? '<i>SG</i> ' + player.obj3d.descr.symlabel : '');

        create_box('infopanel', '<span style=color:#900><i>a</i>='+(Math.round(parseFloat(player.obj3d.descr.a) * 1000)/1000).toFixed(3)+'&#8491;</span><br /><span style=color:#090><i>b</i>='+(Math.round(parseFloat(player.obj3d.descr.b) * 1000)/1000).toFixed(3)+'&#8491;</span><br /><span style=color:#09f><i>c</i>='+(Math.round(parseFloat(player.obj3d.descr.c) * 1000)/1000).toFixed(3)+'&#8491;</span><br /><i>&#945;</i>='+(Math.round(parseFloat(player.obj3d.descr.alpha) * 100)/100).toFixed(2)+'&deg;<br /><i>&#946;</i>='+(Math.round(parseFloat(player.obj3d.descr.beta) * 100)/100).toFixed(2)+'&deg;<br /><i>&#947;</i>='+(Math.round(parseFloat(player.obj3d.descr.gamma) * 100)/100).toFixed(2)+'&deg;<br />' + symlabel);
    }

    var test = document.getElementById('optionpanel');
    if (test) test.parentNode.removeChild(test);

    var optionpanel = create_box('optionpanel', '<input type=radio name=optionpanel class=optionpanel id=optionpanel_empty /><label for=optionpanel_empty>none</label>  <input type=radio name=optionpanel class=optionpanel id=optionpanel_S checked=checked /><label for=optionpanel_S>elements</label>');
    if (Object.keys(player.obj3d.overlayed).length){
        for (var prop in player.obj3d.overlayed){
            optionpanel.innerHTML += '  <input type=radio name=optionpanel class=optionpanel id=optionpanel_'+prop+' /><label for=optionpanel_'+prop+'>'+player.obj3d.overlayed[prop]+'</label>';
            player.available_overlays.push(prop); // TODO redesign?
        }
    }
    var ob = document.getElementsByClassName("optionpanel");
    for (var i = ob.length - 1; i >= 0; i--){
        ob[i].onclick = function(){
            var clicked = this.id.replace('optionpanel_', '');
            if (player.available_overlays.indexOf(clicked) !== -1){
                var obj = player.scene.getObjectByName("atombox");
                obj = obj.children;
                var labels = obj.filter(function(item){ return item.name == 'label' }),
                    i = 0,
                    len = labels.length;

                for (; i < len; i++){
                    player.atombox.remove(labels[i]);
                    player.scene.remove(labels[i]);
                }
                if (clicked !== 'empty'){
                    var balls = obj.filter(function(item){ return item.name == 'atom' }),
                        len = balls.length;
                    for (i = 0; i < len; i++){
                        var label = create_sprite(balls[i].overlays[clicked]);
                        label.position.set(balls[i].position.x, balls[i].position.y, balls[i].position.z);
                        player.atombox.add(label);
                    }
                    player.current_overlay = clicked;
                }
            }
            player.renderer.render(player.scene, player.camera);
        }
    }
    player.current_overlay = player.default_overlay;
    var resolution = player.webgl ? {w: 10, h: 8} : {w: 8, h: 6},
        i = 0,
        len = player.obj3d.atoms.length;
    for (; i < len; i++){
        var x = parseInt( player.obj3d.atoms[i].x*100 ),
            y = parseInt( player.obj3d.atoms[i].y*100 ),
            z = parseInt( player.obj3d.atoms[i].z*100 ),
            r = player.obj3d.atoms[i].r*65,
            atom = new THREE.Mesh( new THREE.SphereBufferGeometry( r, resolution.w, resolution.h ), new THREE.MeshLambertMaterial( { color: player.obj3d.atoms[i].c, overdraw: 0.75 } ) );
        atom.position.set(x, y, z);
        atom.name = "atom";
        atom.overlays = player.obj3d.atoms[i].overlays;
        player.atombox.add(atom);

        if (player.current_overlay !== 'empty'){
            var label = create_sprite(atom.overlays[player.current_overlay]);
            label.position.set(x, y, z);
            player.atombox.add(label);
        }
    }

    if (player.obj3d.cell.length){
        var axcolor,
            ortes = [],
            i = 0;
        for (; i < 3; i++){
            var a = Math.round(parseFloat(player.obj3d.cell[i][0])*1000)/10,
                b = Math.round(parseFloat(player.obj3d.cell[i][1])*1000)/10,
                c = Math.round(parseFloat(player.obj3d.cell[i][2])*1000)/10;
            ortes.push([a, b, c]);
            if (i==0) axcolor = 0x990000;
            else if (i==1) axcolor = 0x009900;
            else if (i==2) axcolor = 0x0099FF;
            player.atombox.add(new THREE.ArrowHelper(new THREE.Vector3(a, b, c).normalize(), new THREE.Vector3(0, 0, 0), Math.sqrt(a*a+b*b+c*c), axcolor, 75, 10));
        }

        var plane_point1 = [ortes[0][0]+ortes[1][0], ortes[0][1]+ortes[1][1], ortes[0][2]+ortes[1][2]],
            plane_point2 = [ortes[0][0]+ortes[2][0], ortes[0][1]+ortes[2][1], ortes[0][2]+ortes[2][2]],
            plane_point3 = [plane_point1[0]+ortes[2][0], plane_point1[1]+ortes[2][1], plane_point1[2]+ortes[2][2]],
            dpoint = [ortes[1][0]+ortes[2][0], ortes[1][1]+ortes[2][1], ortes[1][2]+ortes[2][2]],
            drawing_cell = [];

        drawing_cell.push([ortes[0], plane_point1]);
        drawing_cell.push([ortes[0], plane_point2]);
        drawing_cell.push([ortes[1], dpoint]);
        drawing_cell.push([ortes[1], plane_point1]);
        drawing_cell.push([ortes[2], dpoint]);
        drawing_cell.push([ortes[2], plane_point2]);
        drawing_cell.push([plane_point1, plane_point3]);
        drawing_cell.push([plane_point2, plane_point3]);
        drawing_cell.push([plane_point3, dpoint]);

        var i = 0,
            len = drawing_cell.length;
        for (; i < len; i++){
            draw_3d_line(drawing_cell[i][0], drawing_cell[i][1]);
        }
    }
    player.atombox.name = "atombox";
    player.scene.add(player.atombox);
    //TWEEN.removeAll();
    play();
    //var fake_phonon = ''; for (var i=0; i<player.obj3d.atoms.length; i++){ fake_phonon += '1,1,1, ' } // debug phonon animation
    //vibrate_3D( '[' + fake_phonon.substr(0, fake_phonon.length-2) + ']' );
}

function resize(){
    if (!player.loaded) return;
    player.camera.aspect = window.innerWidth / window.innerHeight;
    player.camera.updateProjectionMatrix();
    player.renderer.setSize(window.innerWidth, window.innerHeight);
    player.controls.handleResize();
    play();
}

function play(){
    //if (player.active_renderer) requestAnimationFrame(play);
    requestAnimationFrame(play);
    player.renderer.render(player.scene, player.camera);
    player.controls.update();
    //TWEEN.update();
    //player.stats.update();
}

function url_redraw_react(){
    var url = document.location.hash.substr(1);
    if (url.indexOf('://') == -1){
        if (!player.loaded) display_landing();
        return notify('Error: not a valid url!');
    }
    ajax_download(url);
}

function display_landing(){
    if (player.local_supported){
        var landing = document.getElementById('landing');
        if (player.colorset == 'B') landing.style.background = '#222';
        landing.style.display = 'block';
    } else play_demo();
}

function play_demo(evt){
    cancel_event(evt);
    accept_data(player.sample, false);
}

function direct_download(){
    var url = document.location.hash.substr(1);
    if (url.indexOf('://') == -1) return;
    window.open(url, 'd_' + Math.random());
}

function ajax_download(url){
    /*var parser = document.createElement('a');
    parser.href = url;
    if (parser.hostname + ':' + parser.port != window.location.hostname + ':' + window.location.port){
        //console.log('Proxy in use');
        url = player.webproxy + '?url=' + url;
    }*/
    var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4){
            if (xmlhttp.status == 200) accept_data(xmlhttp.responseText, true);
            else {
                notify("Error: HTTP " + xmlhttp.status + " status received during retrieving data from the server");
                if (!player.loaded) display_landing();
            }
        }
    }
    xmlhttp.open("GET", url);
    //xmlhttp.setRequestHeader("If-Modified-Since", "Sat, 01 Jan 2000 00:00:00 GMT");
    xmlhttp.send(1);
}

function accept_data(str, allow_download){
    //console.log("Data:", str);
    //var dpanel_ready = document.getElementById('dpanel');
    //if (dpanel_ready) dpanel_ready.style.display = 'none';

    player.obj3d = MatinfIO.to_player(str);
    if (player.obj3d){
        document.getElementById('landing').style.display = 'none';

        /*if (allow_download){
            if (!dpanel_ready){
                var dpanel = create_box('dpanel');
                dpanel.onclick = direct_download;
            } else dpanel_ready.style.display = 'block';
        }*/
        player.loaded ? render() : init();
        if (player.obj3d.info) document.title = player.obj3d.info;

        document.getElementById('demobox').style.display = (player.obj3d.mpds_data && player.obj3d.mpds_demo) ? 'block' : 'none';

    } else if (!player.loaded) display_landing();
}

function handleFileSelect(evt){
    cancel_event(evt);

    if (evt.dataTransfer.files.length > 1) return notify("Error: only one file at the time may be rendered!");
    var file = evt.dataTransfer.files[0];
    if (!file || !file.size) return notify("Error: file cannot be read (unaccessible?)");

    var reader = new FileReader();

    reader.onloadend = function(evt){
        accept_data(evt.target.result, false);
    }
    reader.abort = function(){ notify("Error: file reading has been cancelled!") }
    reader.onerror = function(evt){ notify("Error: file reading has been cancelled: " + evt.target.error.name) }

    reader.readAsText(file);
}

function handleDragOver(evt){
    cancel_event(evt);
    evt.dataTransfer.dropEffect = 'copy';
}

(function(){
    player.webgl = true;

    var notifybox = create_box('notifybox', '<div id="cross"></div><div id="message"></div>'),
        crossbox = document.getElementById('cross');
    crossbox.onclick = function(){ notifybox.style.display = 'none' }

    create_box('landing', '<h1>3d-crystals web-viewer</h1><div id="legend">Choose a <b>CIF</b>, <b>POSCAR</b>, or <b>OPTIMADE JSON</b> file (drag and drop is supported). Files are processed offline in the browser, no remote server is used. <a href=/ id="play_demo">Example</a>.</div><div id="triangle"></div><input type="file" id="fileapi" />');
    document.getElementById('play_demo').onclick = play_demo;

    var logger = {warning: advise, error: notify};
    MatinfIO = MatinfIO(mathjs, logger);

    window.addEventListener('resize', resize, false );
    window.addEventListener('hashchange', url_redraw_react, false);

    if (player.local_supported){
        window.addEventListener('dragover', handleDragOver, false);
        window.addEventListener('drop', handleFileSelect, false);
        var fileapi = document.getElementById('fileapi'),
            reader = new FileReader();
        fileapi.onchange = function(){
            if (!this.files[0] || !this.files[0].size) return notify("Error: file cannot be read (unaccessible?)");
            reader.currentFilename = this.files[0].name;
            reader.readAsText(this.files[0]);
        }
        reader.onloadend = function(evt){
            accept_data(evt.target.result, false);
        }
    }

    // iframe integration:
    // (1) via parent.playerdata object / location.search key
    // (2) via parent.playerdata string
    if (window.parent && window.parent.playerdata){
        var target_data;
        if (typeof window.parent.playerdata === 'object' && document.location.search) target_data = window.parent.playerdata[document.location.search.substr(1)];
        else target_data = window.parent.playerdata;
        accept_data(target_data, false);
    } else {
        if (document.location.hash.length) url_redraw_react();
        else display_landing();
    }
})();

});
