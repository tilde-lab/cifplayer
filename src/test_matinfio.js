#!/usr/bin/env node

var fs = require('fs');
var matinf = require('./js/libs/MatinfIO');
var math = require('./js/libs/math.custom');

var logger = {warning: console.error, error: console.error};
MatinfIO = matinf(math, logger);

if (process.argv.length < 3){
    console.error("Path/file must be given.");
    process.exit();
}

var walk = function(dir, done){
    var results = [];
    fs.readdir(dir, function(err, list){
        if (err) return done(err);
        var i = 0;
        (function next(){
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat){
                if (stat && stat.isDirectory()){
                    walk(file, function(err, res){
                    results = results.concat(res);
                    next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

var examine = function(file){
    fs.readFile(file, function(err, data){
        if (err) {
            return console.log(err);
        }

        try {
            var repr = MatinfIO.to_player(data);
        } catch (ex) {
            return console.log(ex.message);
        }

        console.log("======================");
        console.log(file);
        console.log("======================");
        console.log(JSON.stringify(repr));
    });
};

var target = process.argv[process.argv.length-1];

if (fs.lstatSync(target).isDirectory()){
    walk(target, function(err, results){
        if (err) throw err;
        results.forEach(examine);
    });
} else examine(target);
