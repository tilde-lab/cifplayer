/**
 * CIF renderer
 * Author: Evgeny Blokhin
 * Web: http://tilde.pro
 * Email: eb@tilde.pro
 * License: MIT
 */
require.config({ baseUrl: 'js/app', paths: { libs: '../libs' }});
require(['polyfills', 'chemical_elements', 'libs/three.custom', 'libs/math.custom', 'libs/domReady'], function(polyfills, chemical_elements, th, math, domReady){

var player = {};
player.loaded = false;
player.container = null;
player.stats = null;
player.camera = null;
player.scene = null;
player.renderer = null;
player.controls = null;
player.atombox = null;
player.available_overlays = ["S", "N"];
player.current_overlay = "S"; // default overlay
player.obj3d = false;
player.webproxy = 'proxy.php'; // to display and download remote files; must support url get param
player.sample = "data_player_html\n_cell_length_a 24\n_cell_length_b 5.91\n_cell_length_c 5.85\n_cell_angle_alpha 90\n_cell_angle_beta 90\n_cell_angle_gamma 90\n_symmetry_space_group_name_H-M 'P1'\nloop_\n_symmetry_equiv_pos_as_xyz\nx,y,z\nloop_\n_atom_site_label\n_atom_site_type_symbol\n_atom_site_fract_x\n_atom_site_fract_y\n_atom_site_fract_z\nO1 O 0.425 0.262 0.009\nO2 O -0.425 0.262 0.009\nH3 H 0.444 0.258 0.154\nH4 H -0.444 0.258 0.154\nH5 H 0.396 0.124 0.012\nH6 H -0.396 0.124 0.012\nO7 O 0.425 0.236 0.510\nO8 O -0.425 0.236 0.510\nH9 H 0.444 0.239 0.656\nH10 H -0.444 0.239 0.656\nH11 H 0.396 0.374 0.512\nH12 H -0.396 0.374 0.512\nSr13 Sr 0.342 0.964 0.467\nSr14 Sr -0.342 0.964 0.467\nSr15 Sr 0.342 0.535 0.967\nSr16 Sr -0.342 0.535 0.967\nO17 O 0.348 0.971 0.019\nO18 O -0.348 0.971 0.019\nO19 O 0.348 0.528 0.519\nO20 O -0.348 0.528 0.519\nO21 O 0.263 0.803 0.701\nO22 O -0.263 0.803 0.701\nO23 O 0.264 0.695 0.200\nO24 O -0.264 0.695 0.200\nZr25 Zr 0.261 0.000 0.998\nZr26 Zr -0.261 0.000 0.998\nZr27 Zr 0.261 0.499 0.498\nZr28 Zr -0.261 0.499 0.498\nO29 O 0.257 0.304 0.806\nO30 O -0.257 0.304 0.806\nO31 O 0.257 0.195 0.306\nO32 O -0.257 0.195 0.306\nSr33 Sr 0.173 0.993 0.524\nSr34 Sr -0.173 0.993 0.524\nSr35 Sr 0.173 0.506 0.024\nSr36 Sr -0.173 0.506 0.024\nO37 O 0.173 0.947 0.986\nO38 O -0.173 0.947 0.986\nO39 O 0.173 0.551 0.486\nO40 O -0.173 0.551 0.486\nO41 O 0.098 0.204 0.295\nO42 O -0.098 0.204 0.295\nO43 O 0.098 0.295 0.795\nO44 O -0.098 0.295 0.795\nZr45 Zr 0.086 0.004 0.998\nZr46 Zr -0.086 0.004 0.998\nZr47 Zr 0.086 0.495 0.498\nZr48 Zr -0.086 0.495 0.498\nO49 O 0.074 0.709 0.211\nO50 O -0.074 0.709 0.211\nO51 O 0.074 0.790 0.711\nO52 O -0.074 0.790 0.711\nSr53 Sr 0 0.991 0.467\nSr54 Sr 0 0.508 0.967\nO55 O 0 0.076 0.020\nO56 O 0 0.423 0.520";

var THREE = th.THREE || th;

function unit(vec){
    return math.divide(vec, math.norm(vec));
}

function jsobj2player(crystal){
    var pi = 3.141592653589793;
    var ab_norm = [0, 0, 1];
    var a_dir = [1, 0, 0];
    var Z = unit(ab_norm);
    var X = unit( math.subtract( a_dir, math.multiply( math.dot(a_dir, Z), Z ) ) );
    var Y = math.cross(Z, X);
    //console.log("X", X);
    //console.log("Y", Y);
    //console.log("Z", Z);
    var alpha = crystal.cell.alpha * pi/180, beta = crystal.cell.beta * pi/180, gamma = crystal.cell.gamma * pi/180;
    var a = crystal.cell.a, b = crystal.cell.b, c = crystal.cell.c;
    //console.log("alpha", alpha);
    //console.log("beta", beta);
    //console.log("gamma", gamma);
    //console.log("a", a);
    //console.log("b", b);
    //console.log("c", c);
    var va = math.multiply(a, [1, 0, 0]);
    var vb = math.multiply(b, [math.cos(gamma), math.sin(gamma), 0]);
    var cx = math.cos(beta);
    var cy = math.divide( math.subtract( math.cos(alpha), math.multiply( math.cos(beta), math.cos(gamma) ) ), math.sin(gamma) );
    var cz = math.sqrt( math.subtract( math.subtract(1, math.multiply(cx, cx)), math.multiply(cy, cy) ) );
    var vc = math.multiply(c, [cx, cy, cz]);
    //console.log("va", va);
    //console.log("vb", vb);
    //console.log("vc", vc);
    //console.log("cx", cx);
    //console.log("cy", cy);
    //console.log("cz", cz);
    var abc = [va, vb, vc];
    var t = [X, Y, Z];
    //console.log("abc", abc);
    //console.log("t", t);
    var cell = math.dotMultiply(abc, t);
    //console.log("cell", cell);
    var scpositions = [];
    var i, len = crystal.atoms.length;
    for (i = 0; i < len; i++){
        scpositions.push([ crystal.atoms[i].x, crystal.atoms[i].y, crystal.atoms[i].z ]);
    }
    var positions = math.multiply(scpositions, cell);
    //console.log("positions", positions);
    var player_output = {"atoms": [], "cell": cell, "descr": crystal.cell, "overlayed": null};
    var color, radius;
    var i, len = crystal.atoms.length;
    for (i = 0; i < len; i++){
        color = (chemical_elements.JmolColors[ crystal.atoms[i].symbol ]) ? chemical_elements.JmolColors[ crystal.atoms[i].symbol ] : '0xffff00';
        radius = (chemical_elements.AseRadii[ crystal.atoms[i].symbol ]) ? chemical_elements.AseRadii[ crystal.atoms[i].symbol ] : 0.66;
        player_output.atoms.push( {"x": positions[i][0], "y": positions[i][1], "z": positions[i][2], "c": color, "r": radius, "overlays": {"S": crystal.atoms[i].symbol, "N": i+1}} )
    }
    //console.log(player_output);
    return player_output;
}

function cif2player(str){
    var structures = [], lines = str.split("\n"), cur_structure = {'cell':{}, 'atoms':[]}, loop_active = false;
    var i = 0, s = [], ss = [], new_structure = false;
    var cell_props = ['a', 'b', 'c', 'alpha', 'beta', 'gamma'];
    var atom_vals = ['_atom_site_label', '_atom_site_type_symbol', '_atom_site_fract_x', '_atom_site_fract_y', '_atom_site_fract_z'];
    var atom_props = ['label', 'symbol', 'x', 'y', 'z'];
    var atprop_seq = [];
    var i, len = lines.length;
    for (i = 0; i < len; i++){
        if (lines[i].startswith('#')) continue;
        lines[i] = lines[i].toLowerCase().trim();

        if (!lines[i]){
            loop_active = false, atprop_seq = [];
            continue;
        }
        new_structure = false;

        if (lines[i].startswith('data_')) new_structure = true, loop_active = false, atprop_seq = [];
        else if (lines[i].startswith('_cell_')){

            loop_active = false, atprop_seq = [];
            s = lines[i].split(" ");
            ss = s[0].split("_");
            var cell_value = ss[ ss.length-1 ];
            if (cell_props.indexOf(cell_value) !== -1 && s[ s.length-1 ]){
                cur_structure.cell[cell_value] = parseFloat(s[ s.length-1 ]);
            }
            continue;

        } else if (lines[i].startswith('_symmetry_')){

            loop_active = false, atprop_seq = [];
            continue;
            // todo

        } else if (lines[i].startswith('loop_')){
            loop_active = true, atprop_seq = [];
            continue;
        }

        if (loop_active){
            if (lines[i].startswith('_')){
                atprop_seq.push(lines[i]);
            } else {
                var atom = {};
                s = lines[i].replace(/\t/g, " ").split(" ").filter(function(o){ return o ? true : false });
                var j, len2 = atprop_seq.length;
                for (j = 0; j < len2; j++){
                    var atom_index = atom_vals.indexOf(atprop_seq[j]);
                    if (atom_index !== -1 && s[j]){
                        if (['x', 'y', 'z'].indexOf(atom_props[atom_index]) !== -1) s[j] = parseFloat(s[j]);
                        else s[j] = s[j].charAt(0).toUpperCase() + s[j].slice(1);
                        atom[ atom_props[atom_index] ] = s[j];
                    }
                }
                if (atom.x !== undefined && atom.y !== undefined && atom.z !== undefined){ // NB zero coord
                    if (!atom.symbol && !!atom.label) atom.symbol = atom.label.replace(/[0-9]/g, '');
                    if (!chemical_elements.JmolColors[atom.symbol] && atom.symbol.length > 2) atom.symbol = atom.symbol.substr(0, atom.symbol.length-1);
                    if (!chemical_elements.JmolColors[atom.symbol] && atom.symbol.length > 1) atom.symbol = atom.symbol.substr(0, atom.symbol.length-1);
                    if (!!atom.symbol) cur_structure.atoms.push(atom);
                }
            }
            continue;
        }

        if (new_structure && cur_structure.atoms.length){
            structures.push(cur_structure);
            cur_structure = {'cell':{}, 'atoms':[]};
        }
    }
    if (cur_structure.atoms.length) structures.push(cur_structure);
    //console.log(structures);

    if (structures.length) return jsobj2player(structures[ structures.length-1 ]);
    else return false;
}

function draw_3d_line(start_arr, finish_arr, color){
    if (!color) var color = 0xEEEEEE;
    var vector = new THREE.Geometry();
    vector.vertices.push(new THREE.Vector3( start_arr[0], start_arr[1], start_arr[2] ));
    vector.vertices.push(new THREE.Vector3( finish_arr[0], finish_arr[1], finish_arr[2] ));
    var material = new THREE.LineBasicMaterial({color: color});
    player.atombox.add(new THREE.Line(vector, material));
}

function create_sprite(text){
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var metrics = context.measureText(text);
    var w = metrics.width * 3.5; // to be adjusted

    canvas.width = w;
    canvas.height = 32; // to be adjusted
    context.font = "normal 32px Arial"; // to be adjusted
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#000000";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var material = new THREE.SpriteMaterial({map: texture, useScreenCoordinates: false});
    var sprite = new THREE.Sprite(material);
    var txt = new THREE.Object3D();
    sprite.scale.set(w, 32, 1); // to be adjusted
    txt.add(sprite);
    txt.name = "label";
    return txt;
}

function render_3D(){
    var old = player.scene.getObjectByName("atoms3d");
    if (!!old) player.scene.remove(old);
    player.atombox = new THREE.Object3D();

    var descr = player.obj3d.descr;
    var test = document.getElementById('infopanel');
    if (!!test) test.parentNode.removeChild(test);
    var infopanel = document.createElement('div');
    infopanel.setAttribute('id', 'infopanel');
    infopanel.innerHTML = '<span style=color:#900>a = '+descr['a']+' &#8491;</span><br /><span style=color:#090>b = '+descr['b']+' &#8491;</span><br /><span style=color:#009>c = '+descr['c']+' &#8491;</span><br />&#945; = '+descr['alpha']+'&deg;<br />&#946; = '+descr['beta']+'&deg;<br />&#947; = '+descr['gamma']+'&deg;<br />';
    document.body.appendChild(infopanel);

    var test = document.getElementById('optionpanel');
    if (!!test) test.parentNode.removeChild(test);
    var optionpanel = document.createElement('div');
    optionpanel.setAttribute('id', 'optionpanel');
    optionpanel.innerHTML = '<input type=radio name=optionpanel id=optionpanel_none /><label for=optionpanel_none>none</label>';
    optionpanel.innerHTML += ' <input type=radio name=optionpanel id=optionpanel_S checked=checked /><label for=optionpanel_S>chemical elements</label>';
    optionpanel.innerHTML += ' <input type=radio name=optionpanel id=optionpanel_N /><label for=optionpanel_N>id\'s</label>';
    if (player.obj3d.overlayed){
        for (var prop in player.obj3d.overlayed){
            optionpanel.innerHTML += ' <input type=radio name=optionpanel id=optionpanel_'+prop+' /><label for=optionpanel_'+prop+'>'+player.obj3d.overlayed[prop]+'</label>';
        }
    }
    document.body.appendChild( optionpanel );
    optionpanel.onclick = function(evt){
        evt = evt || window.event;
        player.current_overlay = (evt.target || evt.srcElement).id.replace('optionpanel_', '');
        var obj = player.scene.getObjectByName("atoms3d");
        obj = obj.children;
        var labels = obj.filter(function(item){ return item.name == 'label' })
        var i, len = labels.length;
        for (i = 0; i < len; i++){
            player.atombox.remove(labels[i]);
            player.scene.remove(labels[i]);
        }
        if (player.available_overlays.indexOf(player.current_overlay) !== -1){
            var balls = obj.filter(function(item){ return item.name == 'atom' });
            var len = balls.length;
            for (i = 0; i < len; i++){
                var label = create_sprite(balls[i].overlays[player.current_overlay]);
                label.position.set(balls[i].position.x, balls[i].position.y, balls[i].position.z);
                player.atombox.add(label);
            }
        }
        player.renderer.render(player.scene, player.camera);
    }

    player.current_overlay = "S";

    var actd, sphd = {lodim:{w:6, h:6}, hidim:{w:10, h:8}};
    player.obj3d.atoms.length > 50 ? actd = sphd.lodim : actd = sphd.hidim;

    var i, len = player.obj3d.atoms.length;
    for (i = 0; i < len; i++){
        var x = parseInt( player.obj3d.atoms[i].x*100 ), y = parseInt( player.obj3d.atoms[i].y*100 ), z = parseInt( player.obj3d.atoms[i].z*100 );

        var atom = new THREE.Mesh( new THREE.SphereBufferGeometry( player.obj3d.atoms[i].r*65, actd.w, actd.h ), new THREE.MeshLambertMaterial( { color: player.obj3d.atoms[i].c, shading: THREE.FlatShading, overdraw: 0.25 } ) );
        atom.position.set(x, y, z);
        atom.name = "atom";
        atom.overlays = player.obj3d.atoms[i].overlays;
        player.atombox.add(atom);

        var label = create_sprite(atom.overlays[player.current_overlay]);
        label.position.set(x, y, z);
        player.atombox.add(label);
    }

    if (player.obj3d.cell.length){
        var tempcolor, ortes = [];
        for (var i = 0; i < 3; i++){
            var a = Math.round(parseFloat(player.obj3d.cell[i][0])*1000)/10;
            var b = Math.round(parseFloat(player.obj3d.cell[i][1])*1000)/10;
            var c = Math.round(parseFloat(player.obj3d.cell[i][2])*1000)/10;
            ortes.push([a, b, c]);
            var trans_vector = new THREE.Geometry();
            trans_vector.vertices.push(new THREE.Vector3(0, 0, 0));
            trans_vector.vertices.push(new THREE.Vector3( a, b, c ));
            if (i==0) tempcolor = 0x990000;
            if (i==1) tempcolor = 0x009900;
            if (i==2) tempcolor = 0x000099;
            player.atombox.add(new THREE.Line(trans_vector, new THREE.LineBasicMaterial({color: tempcolor })));
        }

        var material = new THREE.LineBasicMaterial({color: 0xCCCCCC });
        var plane_point1 = [ortes[0][0]+ortes[1][0], ortes[0][1]+ortes[1][1], ortes[0][2]+ortes[1][2]]
        var plane_point2 = [ortes[0][0]+ortes[2][0], ortes[0][1]+ortes[2][1], ortes[0][2]+ortes[2][2]]
        var plane_point3 = [plane_point1[0]+ortes[2][0], plane_point1[1]+ortes[2][1], plane_point1[2]+ortes[2][2]]
        var dpoint = [ortes[1][0]+ortes[2][0], ortes[1][1]+ortes[2][1], ortes[1][2]+ortes[2][2]]
        var drawing_cell = [];

        drawing_cell.push([ortes[0], plane_point1]);
        drawing_cell.push([ortes[0], plane_point2]);
        drawing_cell.push([ortes[1], dpoint]);
        drawing_cell.push([ortes[1], plane_point1]);
        drawing_cell.push([ortes[2], dpoint]);
        drawing_cell.push([ortes[2], plane_point2]);
        drawing_cell.push([plane_point1, plane_point3]);
        drawing_cell.push([plane_point2, plane_point3]);
        drawing_cell.push([plane_point3, dpoint]);

        var i, len = drawing_cell.length;
        for (i = 0; i < len; i++){
            draw_3d_line(drawing_cell[i][0], drawing_cell[i][1]);
        }
    }
    player.atombox.name = "atoms3d";
    player.scene.add(player.atombox);
    //TWEEN.removeAll();
    play();
    //var fake_phonon = ''; for (var i=0; i<player.obj3d.atoms.length; i++){ fake_phonon += '1,1,1, ' } // debug phonon animation
    //vibrate_3D( '[' + fake_phonon.substr(0, fake_phonon.length-2) + ']' );
}

function init_3D(){
    player.loaded = true;

    player.container = document.createElement('div');
    player.container.style.backgroundColor = '#ffffff';
    document.body.appendChild(player.container);

    player.scene = new THREE.Scene();
    player.camera = new THREE.OrthographicCamera(-window.innerWidth*1.5, window.innerWidth*1.5, -window.innerHeight*1.5, window.innerHeight*1.5, -2000, 2000);
    player.camera.position.set(0, 0, 1);

    var AmbientLight = new THREE.AmbientLight(0x999999);
    player.scene.add(AmbientLight);
    var PointLight = new THREE.PointLight(0x666666, 1);
    PointLight.position.set(500, 500, 500);
    player.scene.add(PointLight);

    player.renderer = new THREE.CanvasRenderer();
    player.renderer.setClearColor(0xffffff, 1);
    player.renderer.setSize(window.innerWidth, window.innerHeight);
    player.container.appendChild(player.renderer.domElement);

    //player.stats = new Stats();
    //player.stats.domElement.style.position = 'absolute';
    //player.stats.domElement.style.top = '0px';
    //document.body.appendChild( player.stats.domElement );

    var zoompanel = document.createElement('div');
    zoompanel.setAttribute('id', 'zoompanel');
    document.body.appendChild(zoompanel);
    zoompanel.onclick = function(evt){
        evt = evt || window.event;
        if (evt.cancelBubble) evt.cancelBubble = true;
        else {
            evt.stopPropagation();
            evt.preventDefault();
        }
        var y = (evt.pageY) ? evt.pageY : evt.clientY;
        var fov = ((y > 79) ? -1 : 1) * 333, c = window.innerHeight/window.innerWidth;
        player.camera.left += fov;
        player.camera.right -= fov;
        player.camera.top += fov*c;
        player.camera.bottom -= fov*c;
        player.camera.updateProjectionMatrix();
    }

    player.controls = new THREE.OrthographicTrackballControls(player.camera);

    render_3D();
}

function play(){
    //if (!!player.active_renderer) requestAnimationFrame(play);
    requestAnimationFrame(play);
    player.renderer.render(player.scene, player.camera);
    player.controls.update();
    //TWEEN.update();
    //player.stats.update();
}

function url_redraw_react(){
    var url = document.location.hash.substr(1);
    if (url.indexOf('://') == -1) return alert('Error: not a valid url!');

    ajax_download(url);
}

function display_startup(){
    if (window.FileReader){
        var test = document.getElementById('landing');
        if (!!test) test.parentNode.removeChild(test);
        var panel = document.createElement('div');
        panel.setAttribute('id', 'landing');
        panel.innerHTML = 'Please drag & drop a file here<br>or <a href=/ id=play_demo>display example</a>.';
        document.body.appendChild(panel);
        var demo = document.getElementById('play_demo');
        demo.onclick = play_demo;
    } else play_demo();
}

function play_demo(evt){
    evt = evt || window.event;
    if (evt.cancelBubble) evt.cancelBubble = true;
    else {
        evt.stopPropagation();
        evt.preventDefault();
    }
    accept_data(player.sample, false);
}

function direct_download(){
    var url = document.location.hash.substr(1);
    if (url.indexOf('://') == -1) return;
    window.open(url, 'd_' + Math.random());
}

function ajax_download(url){
    var parser = document.createElement('a');
    parser.href = url;
    if (parser.hostname !== window.location.hostname){
        url = player.webproxy + '?url=' + url;
    }
    var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4){
            if (xmlhttp.status == 200) accept_data(xmlhttp.responseText, true);
            else {
                alert("Error: HTTP " + xmlhttp.status + " status received during retrieving data from the server");
                if (!player.loaded) display_startup();
            }
        }
    }
    xmlhttp.open("GET", url);
    xmlhttp.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
    xmlhttp.send(1);
}

function accept_data(str, allow_download){
    //console.log("Data:", str);
    var dpanel_ready = document.getElementById('dpanel');
    if (!!dpanel_ready) dpanel_ready.style.display = 'none';

    if (str.indexOf("_cell_angle_gamma ") > -1){

        var obj = cif2player(str);
        if (!obj) return alert("Error: the file has invalid format!");

    } else return alert("Error: the file format is not supported!");

    player.obj3d = obj;

    var test = document.getElementById('landing');
    if (!!test) test.parentNode.removeChild(test);

    if (allow_download){
        if (!dpanel_ready){
            var dpanel = document.createElement('div');
            dpanel.setAttribute('id', 'dpanel');
            document.body.appendChild(dpanel);
            dpanel.onclick = direct_download;
        } else dpanel_ready.style.display = 'block';
    }

    player.loaded ? render_3D() : init_3D();
}

function handleFileSelect(evt){
    evt.stopPropagation();
    evt.preventDefault();

    if (evt.dataTransfer.files.length > 1) return alert("Error: only one file at the time may be rendered!");
    var file = evt.dataTransfer.files[0];
    if (!file || !file.size) return alert("Error: file cannot be read (unaccessible?)");

    var reader = new FileReader();

    reader.onloadend = function(evt){
        accept_data(evt.target.result, false);
    }
    reader.abort = function(){ alert("Error: file reading has been cancelled!") }
    reader.onerror = function(evt){ alert("Error: file reading has been cancelled: " + evt.target.error.name) }

    reader.readAsText(file);
}

function handleDragOver(evt){
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

domReady(function(){
    window.addEventListener('hashchange', url_redraw_react, false);

    if (window.FileReader){
        window.addEventListener('dragover', handleDragOver, false);
        window.addEventListener('drop', handleFileSelect, false);
    }

    if (document.location.hash.length) url_redraw_react();
    else display_startup();
});

});
