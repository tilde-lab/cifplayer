/**
 * IO for materials informatics
 * Author: Evgeny Blokhin
 * License: MIT
 * Version: 0.4.0
 *
 * Usage: initialize with the math.js and logger objects, e.g.:
 *
 * var logger = {warning: alert.bind(window), error: alert.bind(window)};
 * (global) MatinfIO = MatinfIO(math, logger);
 *
 * Using this library CIF and POSCAR formats can be detected and parsed.
 * "to_player" and "to_flatten" are public methods,
 * they return objects to be used in either
 * player.html (to visualize) or spglibjs (to detect symmetry),
 * respectively:
 *
 * player.obj3d = MatinfIO.to_player(file_as_str);
 * init();
 *
 * var symobj = MatinfIO.to_flatten(file_as_str);
 * get_spacegroup(symobj);
 */

"use strict";

String.prototype.startswith = function(prefix){
    return this.indexOf(prefix) === 0;
}
String.prototype.endswith = function(searchString, position){
    var subjectString = this.toString();
    if (position === undefined || position > subjectString.length) position = subjectString.length;
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
}
String.prototype.trim = function(){
    return this.replace(/^\s+|\s+$/g, '');
}

String.prototype.isnumeric = function(){
    return !isNaN(parseFloat(this)) && isFinite(this);
}

var MatinfIO = function(Mimpl, logger){

var version = '0.4.0';

var chemical_elements = {

JmolColors: { "D": "#FFFFC0", "H": "#FFFFFF", "He": "#D9FFFF", "Li": "#CC80FF", "Be": "#C2FF00", "B": "#FFB5B5", "C": "#909090", "N": "#3050F8", "O": "#FF0D0D", "F": "#90E050", "Ne": "#B3E3F5", "Na": "#AB5CF2", "Mg": "#8AFF00", "Al": "#BFA6A6", "Si": "#F0C8A0", "P": "#FF8000", "S": "#FFFF30", "Cl": "#1FF01F", "Ar": "#80D1E3", "K": "#8F40D4", "Ca": "#3DFF00", "Sc": "#E6E6E6", "Ti": "#BFC2C7", "V": "#A6A6AB", "Cr": "#8A99C7", "Mn": "#9C7AC7", "Fe": "#E06633", "Co": "#F090A0", "Ni": "#50D050", "Cu": "#C88033", "Zn": "#7D80B0", "Ga": "#C28F8F", "Ge": "#668F8F", "As": "#BD80E3", "Se": "#FFA100", "Br": "#A62929", "Kr": "#5CB8D1", "Rb": "#702EB0", "Sr": "#00FF00", "Y": "#94FFFF", "Zr": "#94E0E0", "Nb": "#73C2C9", "Mo": "#54B5B5", "Tc": "#3B9E9E", "Ru": "#248F8F", "Rh": "#0A7D8C", "Pd": "#006985", "Ag": "#C0C0C0", "Cd": "#FFD98F", "In": "#A67573", "Sn": "#668080", "Sb": "#9E63B5", "Te": "#D47A00", "I": "#940094", "Xe": "#429EB0", "Cs": "#57178F", "Ba": "#00C900", "La": "#70D4FF", "Ce": "#FFFFC7", "Pr": "#D9FFC7", "Nd": "#C7FFC7", "Pm": "#A3FFC7", "Sm": "#8FFFC7", "Eu": "#61FFC7", "Gd": "#45FFC7", "Tb": "#30FFC7", "Dy": "#1FFFC7", "Ho": "#00FF9C", "Er": "#00E675", "Tm": "#00D452", "Yb": "#00BF38", "Lu": "#00AB24", "Hf": "#4DC2FF", "Ta": "#4DA6FF", "W": "#2194D6", "Re": "#267DAB", "Os": "#266696", "Ir": "#175487", "Pt": "#D0D0E0", "Au": "#FFD123", "Hg": "#B8B8D0", "Tl": "#A6544D", "Pb": "#575961", "Bi": "#9E4FB5", "Po": "#AB5C00", "At": "#754F45", "Rn": "#428296", "Fr": "#420066", "Ra": "#007D00", "Ac": "#70ABFA", "Th": "#00BAFF", "Pa": "#00A1FF", "U": "#008FFF", "Np": "#0080FF", "Pu": "#006BFF", "Am": "#545CF2", "Cm": "#785CE3", "Bk": "#8A4FE3", "Cf": "#A136D4", "Es": "#B31FD4", "Fm": "#B31FBA", "Md": "#B30DA6", "No": "#BD0D87", "Lr": "#C70066", "Rf": "#CC0059", "Db": "#D1004F", "Sg": "#D90045", "Bh": "#E00038", "Hs": "#E6002E", "Mt": "#EB0026" },

// NB starting from Bk the radii data are incorrect
AseRadii: { "X": 0.66, "H": 0.31, "He": 0.28, "Li": 1.28, "Be": 0.96, "B": 0.84, "C": 0.76, "N": 0.71, "O": 0.66, "F": 0.57, "Ne": 0.58, "Na": 1.66, "Mg": 1.41, "Al": 1.21, "Si": 1.11, "P": 1.07, "S": 1.05, "Cl": 1.02, "Ar": 1.06, "K": 2.03, "Ca": 1.76, "Sc": 1.70, "Ti": 1.60, "V": 1.53, "Cr": 1.39, "Mn": 1.39, "Fe": 1.32, "Co": 1.26, "Ni": 1.24, "Cu": 1.32, "Zn": 1.22, "Ga": 1.22, "Ge": 1.20, "As": 1.19, "Se": 1.20, "Br": 1.20, "Kr": 1.16, "Rb": 2.20, "Sr": 1.95, "Y": 1.90, "Zr": 1.75, "Nb": 1.64, "Mo": 1.54, "Tc": 1.47, "Ru": 1.46, "Rh": 1.42, "Pd": 1.39, "Ag": 1.45, "Cd": 1.44, "In": 1.42, "Sn": 1.39, "Sb": 1.39, "Te": 1.38, "I": 1.39, "Xe": 1.40, "Cs": 2.44, "Ba": 2.15, "La": 2.07, "Ce": 2.04, "Pr": 2.03, "Nd": 2.01, "Pm": 1.99, "Sm": 1.98, "Eu": 1.98, "Gd": 1.96, "Tb": 1.94, "Dy": 1.92, "Ho": 1.92, "Er": 1.89, "Tm": 1.90, "Yb": 1.87, "Lu": 1.87, "Hf": 1.75, "Ta": 1.70, "W": 1.62, "Re": 1.51, "Os": 1.44, "Ir": 1.41, "Pt": 1.36, "Au": 1.36, "Hg": 1.32, "Tl": 1.45, "Pb": 1.46, "Bi": 1.48, "Po": 1.40, "At": 1.50, "Rn": 1.50, "Fr": 2.60, "Ra": 2.21, "Ac": 2.15, "Th": 2.06, "Pa": 2.00, "U": 1.96, "Np": 1.90, "Pu": 1.87, "Am": 1.80, "Cm": 1.69, "Bk": 3.0, "Cf": 3.0, "Es": 3.0, "Fm": 3.0, "Md": 3.0, "No": 3.0, "Lr": 3.0, "Rf": 3.0, "Db": 3.0, "Sg": 3.0, "Bh": 3.0, "Hs": 3.0, "Mt": 3.0 }
};

// These non-obligatory CIF props are stored
// in the atom's "overlays" sub-object
var custom_atom_loop_props = {
    '_atom_site_occupancy': 'site occupancies',
    '_atom_site_charge': 'formal charges',

    // Special custom overlay for "_atom_site_label" CIF loop tag;
    // it is however used in the parsing of the obligatory loop props.
    // If present, it will be included in the custom overlays
    'label': 'labels'
};

/**
*
* Guessing what to do
*
*/
function detect_format(str){
    if (str.indexOf("_cell_angle_gamma ") > 0 && str.indexOf("loop_") > 0)
        return 'CIF';
    else if (str.indexOf('"links"') > 0 && str.indexOf('"immutable_id"') > 0 && str.indexOf('"cartesian_site_positions"') > 0)
        return 'OPTIMADE';

    var lines = str.toString().replace(/(\r\n|\r)/gm, "\n").split("\n");

    for (var i = 6; i < 9; i++){
        if (!lines[i]) break;
        if (lines[i].trim().toLowerCase().substr(0, 6) == 'direct') return 'POSCAR';
    }
    return 'unknown';
}

/**
*
* Get direction
*
*/
function unit(vec){
    return Mimpl.divide(vec, Mimpl.norm(vec));
}

/**
*
* Params to 3x3 matrix
*
*/
function cell2vec(a, b, c, alpha, beta, gamma){
    if (!a || !b || !c || !alpha || !beta || !gamma){
        logger.error("Error: invalid cell definition!");
        return false;
    }
    alpha = alpha * Math.PI/180, beta = beta * Math.PI/180, gamma = gamma * Math.PI/180;
    var ab_norm = [0, 0, 1], // TODO
        a_dir = [1, 0, 0], // TODO
        Z = unit(ab_norm),
        X = unit( Mimpl.subtract( a_dir, Mimpl.multiply( Mimpl.dot(a_dir, Z), Z ) ) ),
        Y = Mimpl.cross(Z, X);
    //console.log("X", X);
    //console.log("Y", Y);
    //console.log("Z", Z);
    var va = Mimpl.multiply(a, [1, 0, 0]);
    var vb = Mimpl.multiply(b, [Mimpl.cos(gamma), Mimpl.sin(gamma), 0]);
    var cx = Mimpl.cos(beta);
    var cy = Mimpl.divide( Mimpl.subtract( Mimpl.cos(alpha), Mimpl.multiply( Mimpl.cos(beta), Mimpl.cos(gamma) ) ), Mimpl.sin(gamma) );
    var cz = Mimpl.sqrt( Mimpl.subtract( Mimpl.subtract(1, Mimpl.multiply(cx, cx)), Mimpl.multiply(cy, cy) ) );
    var vc = Mimpl.multiply(c, [cx, cy, cz]);
    //console.log("va", va);
    //console.log("vb", vb);
    //console.log("vc", vc);
    //console.log("cx", cx);
    //console.log("cy", cy);
    //console.log("cz", cz);
    var abc = [va, vb, vc],
        t = [X, Y, Z];
    //console.log("abc", abc);
    //console.log("t", t);
    return Mimpl.multiply(abc, t);
}

/**
*
* Prepare internal repr for visualization in three.js
*
*/
function jsobj2player(crystal){
    var cell,
        descr = false;

    if (Object.keys(crystal.cell).length == 6){ // for CIF
        cell = cell2vec(crystal.cell.a, crystal.cell.b, crystal.cell.c, crystal.cell.alpha, crystal.cell.beta, crystal.cell.gamma);
        //console.log("cell", cell);
        descr = crystal.cell;
        var symlabel = (crystal.sg_name || crystal.ng_name) ? ((crystal.sg_name ? crystal.sg_name : "") + (crystal.ng_name ? (" (" + crystal.ng_name + ")") : "")) : false;
        if (symlabel) descr.symlabel = symlabel;
    }
    else cell = crystal.cell; // for POSCAR and OPTIMADE

    if (!crystal.atoms.length) logger.warning("Note: no atomic coordinates supplied");

    var render = {"atoms": [], "cell": cell, "descr": descr, "overlayed": {}, "info": crystal.info, "mpds_data": crystal.mpds_data, "mpds_demo": crystal.mpds_demo},
        color,
        radius,
        oprop,
        optionpanel = {},
        i = 0,
        len = crystal.atoms.length,
        pos2els = {},
        hashes = {};

    for (; i < len; i++){
        var pos = [ crystal.atoms[i].x, crystal.atoms[i].y, crystal.atoms[i].z ],
            hash = pos.map(function(item){ return item.toFixed(2) }).join(',');
        // make atoms unique, i.e. remove collisions;
        // makes special sense for partial occupancies
        if (hashes.hasOwnProperty(hash)){
            var update = "";
            for (oprop in render.atoms[ hashes[hash] ].overlays){
                if (oprop == 'S'){
                    if (pos2els[hash].indexOf(crystal.atoms[i].symbol) == -1){
                        update = " " + crystal.atoms[i].symbol;
                        pos2els[hash].push(crystal.atoms[i].symbol);
                    }
                }
                else if (oprop == 'N')
                    update = ", " + (i + 1);
                else if (oprop == '_atom_site_occupancy')
                    update = "+" + crystal.atoms[i].overlays[oprop];
                else
                    update = " " + crystal.atoms[i].overlays[oprop];

                render.atoms[ hashes[hash] ].overlays[oprop] += update;
            }
        } else {
            color = (chemical_elements.JmolColors[ crystal.atoms[i].symbol ]) ? chemical_elements.JmolColors[ crystal.atoms[i].symbol ] : '0xffff00';
            radius = (chemical_elements.AseRadii[ crystal.atoms[i].symbol ]) ? chemical_elements.AseRadii[ crystal.atoms[i].symbol ] : 0.66;
            optionpanel = {"S": crystal.atoms[i].symbol, "N": i + 1};
            for (oprop in crystal.atoms[i].overlays){
                optionpanel[oprop] = crystal.atoms[i].overlays[oprop];
            }
            // CIF and POSCAR have fractional positions, OPTIMADE has cartesian positions
            var cpos = crystal.cartesian ? pos : Mimpl.multiply(pos, cell);
            render.atoms.push( {"x": cpos[0], "y": cpos[1], "z": cpos[2], "c": color, "r": radius, "overlays": optionpanel} );
            hashes[hash] = render.atoms.length - 1;
            pos2els[hash] = [crystal.atoms[i].symbol];
        }
    }
    for (var opt in optionpanel){
        if (opt !== "S" && opt !== "N") render.overlayed[opt] = custom_atom_loop_props[opt];
    }

    //console.log(render);
    return render;
}

/**
*
* Convert internal repr into a flattened C-alike structure
*
*/
function jsobj2flatten(crystal){
    if (crystal.symops) logger.warning("Warning! Reading of symmetry operations is not yet implemented, expect error now.");

    var cell;
    if (Object.keys(crystal.cell).length == 6){ // for CIF
        cell = cell2vec(crystal.cell.a, crystal.cell.b, crystal.cell.c, crystal.cell.alpha, crystal.cell.beta, crystal.cell.gamma);
    } else cell = crystal.cell; // for POSCAR

    var tcell = [],
        fcell = [],
        fatoms = [],
        xyzatoms = [];

    tcell = cell[0].map(function(col, i){
        return cell.map(function(row){ return row[i] });
    });
    fcell = fcell.concat.apply(fcell, tcell);

    var i = 0,
        len = crystal.atoms.length;

    if (crystal.types){
        for (; i < len; i++){
            xyzatoms.push([crystal.atoms[i].x, crystal.atoms[i].y, crystal.atoms[i].z]);
        }
    } else {
        var types = [],
            atoms_types = {};

        for (; i < len; i++){
            if (Object.keys(atoms_types).indexOf(crystal.atoms[i].symbol) == -1)
                atoms_types[crystal.atoms[i].symbol] = [ [crystal.atoms[i].x, crystal.atoms[i].y, crystal.atoms[i].z] ];
            else
                atoms_types[crystal.atoms[i].symbol].push([crystal.atoms[i].x, crystal.atoms[i].y, crystal.atoms[i].z]);
        }
        var seq = 1;
        for (var type in atoms_types){
            for (var j = 0; j < atoms_types[type].length; j++){
                xyzatoms.push(atoms_types[type][j]);
                types.push(seq);
            }
            seq++;
        }
    }
    fatoms = fatoms.concat.apply(fatoms, xyzatoms);

    var symlabel = (crystal.sg_name || crystal.ng_name) ? ((crystal.sg_name ? crystal.sg_name : "") + (crystal.ng_name ? (" (" + crystal.ng_name + ")") : "")) : false;

    return {'cell': fcell, 'atoms': fatoms, 'types': types || crystal.types, 'symlabel': symlabel};
}

/**
*
* Handle CIF fmt
*
*/
function cif2jsobj(str){
    var structures = [],
        symops = [],
        atprop_seq = [],
        lines = str.toString().replace(/(\r\n|\r)/gm, "\n").split("\n"),
        cur_structure = {'cell': {}, 'atoms': []},
        loop_active = false,
        new_structure = false,
        symops_active = false,
        data_info = "",
        cur_line = "",
        fingerprt = "",
        line_data = [],
        symmetry_seq = [],
        cell_props = ['a', 'b', 'c', 'alpha', 'beta', 'gamma'],
        loop_vals = ['_atom_site_label', '_atom_site_type_symbol', '_atom_site_fract_x', '_atom_site_fract_y', '_atom_site_fract_z'],
        atom_props = ['label', 'symbol', 'x', 'y', 'z'],
        chem_element_idxs = [0, 1],
        overlayed_idxs = [];

    for (var oprop in custom_atom_loop_props){
        overlayed_idxs.push(loop_vals.length);
        loop_vals.push(oprop);
    }

    var i = 0,
        len = lines.length;

    for (; i < len; i++){
        if (lines[i].startswith('#')) continue;
        cur_line = lines[i].trim();
        if (!cur_line){
            loop_active = false, atprop_seq = [], symops_active = false;
            continue;
        }
        fingerprt = cur_line.toLowerCase();
        new_structure = false;

        if (fingerprt.startswith('data_')){
            new_structure = true,
            loop_active = false,
            atprop_seq = [],
            symops_active = false,
            data_info = cur_line.substr(5);

        } else if (fingerprt.startswith('_cell_')){
            loop_active = false;
            line_data = cur_line.split(" ");
            var cell_data = line_data[0].split("_"),
                cell_value = cell_data[ cell_data.length - 1 ];
            if (cell_props.indexOf(cell_value) !== -1 && line_data[ line_data.length - 1 ]){

                if (cell_value == 'a'){ // MPDS demo check
                    var digits = line_data[ line_data.length - 1 ].split('.');
                    if (digits[digits.length - 1].length == 2)
                        cur_structure.mpds_demo = true;
                }
                cur_structure.cell[cell_value] = parseFloat(line_data[ line_data.length - 1 ]);
            }
            continue;

        } else if (fingerprt.startswith('_symmetry_space_group_name_h-m') || fingerprt.startswith('_space_group.patterson_name_h-m')){
            loop_active = false;
            cur_structure.sg_name = lines[i].substr(31).replace(/"/g, '').replace(/'/g, '').trim();
            continue;

        } else if (fingerprt.startswith('_space_group.it_number') || fingerprt.startswith('_space_group_it_number') || fingerprt.startswith('_symmetry_int_tables_number')){
            loop_active = false;
            line_data = cur_line.split(" ");
            cur_structure.ng_name = line_data[line_data.length - 1].trim();
            continue;

        } else if (fingerprt.startswith('_cif_error')){ // custom tag
            logger.error(cur_line.substr(12, cur_line.length - 13));
            return false;

        } else if (fingerprt.startswith('_pauling_file_entry')){ // custom tag
            cur_structure.mpds_data = true;
            continue;

        } else if (fingerprt.startswith('loop_')){
            loop_active = true,
            atprop_seq = [],
            symops_active = false;
            continue;
        }

        if (loop_active){
            if (cur_line.startswith('_symmetry_equiv') || cur_line.startswith('_space_group')){
                symops_active = true
            } else if (cur_line.startswith('_')){
                atprop_seq.push(cur_line);
            } else {
                if (symops_active){
                    symops.push(cur_line.replace(/"/g, '').replace(/'/g, ''));
                    continue;
                }
                line_data = cur_line.replace(/\t/g, " ").split(" ").filter(function(o){ return o ? true : false });

                var atom = {'overlays': {}},
                    j = 0,
                    len2 = atprop_seq.length; // TODO handle in-loop mismatch

                for (; j < len2; j++){
                    var atom_index = loop_vals.indexOf(atprop_seq[j]);
                    if (atom_index == -1) continue;
                    var pos = chem_element_idxs.indexOf(atom_index);

                    // NB label != symbol
                    if (pos == 1) line_data[j] = line_data[j].charAt(0).toUpperCase() + line_data[j].slice(1).toLowerCase();
                    else if (pos < 0) line_data[j] = parseFloat(line_data[j]); // TODO: custom non-float props in loop

                    // TODO: simplify this
                    if (overlayed_idxs.indexOf(atom_index) > -1) atom.overlays[ loop_vals[atom_index] ] = line_data[j];
                    else                                         atom[ atom_props[atom_index] ] = line_data[j];
                }
                if (atom.x !== undefined && atom.y !== undefined && atom.z !== undefined){ // NB zero coord // TODO multiple relative loops with props
                    if (atom.label){
                        atom.overlays.label = atom.label;
                        if (!atom.symbol) atom.symbol = atom.label.replace(/[0-9]/g, '');
                    }
                    if (!chemical_elements.JmolColors[atom.symbol] && atom.symbol && atom.symbol.length > 1) atom.symbol = atom.symbol.substr(0, atom.symbol.length - 1);
                    if (!!atom.symbol) cur_structure.atoms.push(atom);
                }
            }
            continue;
        }

        if (new_structure && cur_structure.atoms.length){
            cur_structure.info = data_info;
            if (symops.length > 1) cur_structure.symops = symops;
            structures.push(cur_structure);
            cur_structure = {'cell': {}, 'atoms': []}, symops = [];
        }
    }
    if (cur_structure.cell.gamma){
        cur_structure.info = data_info;
        if (symops.length > 1) cur_structure.symops = symops;
        structures.push(cur_structure);
    }
    //console.log(structures);

    if (structures.length) return structures[ structures.length-1 ]; // TODO switch between frames
    else {
        logger.error("Error: unexpected CIF format!");
        return false;
    }
}

/**
*
* Handle POSCAR fmt
*
*/
function poscar2jsobj(str){
    var lines = str.toString().replace(/(\r\n|\r)/gm, "\n").split("\n"),
        cell = [],
        atoms = [],
        factor = 1.0,
        atindices = [],
        atvals = [],
        elems = [],
        types = [],
        atom_props = ['x', 'y', 'z', 'symbol'],
        i = 0,
        j = 0,
        len = lines.length,
        line_data = [],
        atidx = 0,
        tryarr = [],
        periodic_table = [];

    loop_poscar_parse:
    for (; i < len; i++){
        if (i == 0){
            tryarr = lines[i].split(" ").filter(function(o){ return o ? true : false });
            periodic_table = Object.keys(chemical_elements.AseRadii);
            for (var k = 0; k < tryarr.length; k++){
                if (periodic_table.indexOf(tryarr[k]) == -1) continue loop_poscar_parse;
            }
            atvals = tryarr;
        }
        else if (i == 1) factor = parseFloat(lines[i]);
        else if ([2, 3, 4].indexOf(i) !== -1){
            cell.push( lines[i].split(" ").filter(function(o){ return o ? true : false }).map(Number) );
        }
        else if (i == 5){
            tryarr = lines[i].split(" ").filter(function(o){ return o ? true : false });
            if (tryarr[0].isnumeric()){
                atindices = tryarr.map(Number);
                for (var k = 0; k < atindices.length; k++){
                    for (var m = 0; m < atindices[k]; m++){ types.push((k + 1)) }
                }
            } else atvals = tryarr;
        }
        else if (i == 6){
            if (lines[i].trim().toLowerCase().substr(0, 6) == 'direct') continue loop_poscar_parse;

            tryarr = lines[i].split(" ").filter(function(o){ return o ? true : false });
            if (tryarr[0].isnumeric()){
                atindices = tryarr.map(Number);
                for (var k = 0; k < atindices.length; k++){
                    for (var m = 0; m < atindices[k]; m++){ types.push((k + 1)) }
                }
            } else atvals = tryarr;
        }
        else if (i > 6){
            if (i < 9){
                if (atvals.length && !elems.length){
                    for (var k = 0; k < atvals.length; k++){
                        for (var m = 0; m < atindices[k]; m++){ elems.push(atvals[k]) }
                    }
                }
                if (['direct', 'select'].indexOf(lines[i].trim().toLowerCase().substr(0, 6)) !== -1) continue loop_poscar_parse;
            }

            var atom = {};
            line_data = lines[i].replace('#', '').replace('!', '').split(" ").filter(function(o){ return o ? true : false });
            //console.log(line_data);
            if (!line_data.length) break;
            else if (line_data.length == 3) elems.length ? line_data.push(elems[atidx]) : line_data.push('Xx');
            else if (line_data.length < 3){
                logger.error("Error: invalid atom definition!");
                return false;
            }
            for (j = 0; j < 4; j++){
                if (j < 3) atom[atom_props[j]] = parseFloat(line_data[j]);
                else atom[atom_props[j]] = line_data[j];
            }
            atom.symbol = atom.symbol.replace(/\W+/, '').replace(/\d+/, '');
            if (!atom.symbol.length) atom.symbol = 'Xx';
            atoms.push(atom);
            atidx++;
        }
    }
    cell = Mimpl.multiply(cell, factor);
    //console.log(cell);
    if (atoms.length) return {'cell': cell, 'atoms': atoms, 'types': types};
    else {
        logger.error("Error: unexpected POSCAR format!");
        return false;
    }
}

/**
*
* Handle OPTIMADE fmt
*
*/
function optimade2jsobj(str){
    var payload = JSON.parse(str),
        atoms = [];

    if (!payload.data || !payload.data.length || !payload.data[0].attributes){
        logger.error("Error: unexpected OPTIMADE format!");
        return false;
    }

    payload.data[0].attributes.cartesian_site_positions.forEach(function(item, idx){
        atoms.push({
            'x': item[0],
            'y': item[1],
            'z': item[2],
            'symbol': payload.data[0].attributes.species[idx].chemical_symbols[0],
            'overlays': payload.data[0].attributes.species[idx].name ? {'label': payload.data[0].attributes.species[idx].name} : {}
        }); // NB chemical_symbols.length > 1 ?
    });

    return {
        'cell': payload.data[0].attributes.lattice_vectors,
        'atoms': atoms,
        'info': 'id = ' + payload.data[0].id,
        'cartesian': true
    };
}

/**
*
* Public API
*
*/
return {

    to_player: function(str){
        var structure,
            format = detect_format(str);

        switch (format){
            case 'CIF': structure = cif2jsobj(str); break;
            case 'POSCAR': structure = poscar2jsobj(str); break;
            case 'OPTIMADE': structure = optimade2jsobj(str); break;
            default: logger.error("Error: file format cannot be recognized!");
        }
        if (!structure) return false;
        return jsobj2player(structure);
    },

    to_flatten: function(str){
        var structure,
            format = detect_format(str);

        switch (format){
            case 'CIF': structure = cif2jsobj(str); break;
            case 'POSCAR': structure = poscar2jsobj(str); break;
            case 'OPTIMADE': logger.error("OPTIMADE not supported!"); break;
            default: logger.error("Error: file format cannot be recognized!");
        }
        if (!structure) return false;
        return jsobj2flatten(structure);
    },

    version: version
}

}

/**
*
* Old-fashioned modularization
*
*/
if (typeof module !== 'undefined' && module.exports){
    module.exports = MatinfIO;
} else if (typeof require === 'function' && typeof require.specified === 'function'){
    define(function(){ return MatinfIO });
}
