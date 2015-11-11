Materials Informatics HTML5 Player
======

In-browser ultra-fast and lightweight renderer of the [crystallographic information files (CIF)](https://en.wikipedia.org/wiki/Crystallographic_Information_File) and VASP POSCAR structures, written in a pure JavaScript.

In a compiled form it is only one file ```player.html``` about 300 Kb (90 Kb gzipped). See it [online](https://tilde.pro/player.html#http://www.nwchem-sw.org/images/Diamond.opt.cif).

Development layout is inside ```src``` folder. The modular approach based on [require.js](http://requirejs.org) is employed. Dependencies are [three.js](https://github.com/mrdoob/three.js) and [math.js](http://mathjs.org), as manifested in ```deps``` folder. They are downloaded with the aid of Unix shell script ```prepare.sh``` and the needed parts are placed inside the development layout. Compilation is done using ```build.sh``` script, invoking Google's Closure Compiler (shipped with [three.js](https://github.com/mrdoob/three.js), requires JVM).

CIF files from anywhere on the web can be displayed. A CIF file address is passed via **_document.location.hash_** property (browser's address bar, after sharp symbol). If served from another domain, PHP or Python proxy for remote requests should be then used. There are examples of PHP and Python proxies (not for production use) in ```src``` folder. Obviously, it is safer to serve CIF files from the same server.

_Let's cooperate! Your contribution will be very much appreciated._
