Materials Informatics Player
======

In-browser ultra-fast and lightweight renderer of the [crystallographic information files (CIF)](https://en.wikipedia.org/wiki/Crystallographic_Information_File) written in a pure javascript.

In a compiled form it is only one file **_player.html_** about 270 Kb (without GZip compression). See [online](https://tilde.pro/player.html#http://www.nwchem-sw.org/images/Diamond.opt.cif).

CIF files from anywhere on the web can be displayed. A CIF file address is passed via **_document.location.hash_** property (browser's address bar, after sharp symbol). If served from another domain, PHP or Python proxy for remote requests should be then used. There are PHP and Python examples (not for production use) in **_src/_** folder.

Dependencies are [three.js](https://github.com/mrdoob/three.js) and [math.js](http://mathjs.org), as defined in **_deps_** folder. They are downloaded and prepared with the aid of Unix shell script **_prepare.sh_**. Compilation is done using **_build.sh_** script, invoking Google's Closure Compiler (shipped with [three.js](https://github.com/mrdoob/three.js), requires JVM).
