HTML5 Player for Materials Informatics
======
[![DOI](https://zenodo.org/badge/18811/tilde-lab/player.html.svg)](https://zenodo.org/badge/latestdoi/18811/tilde-lab/player.html)

In-browser ultra-fast and lightweight renderer of the [crystallographic information files (CIF)](https://en.wikipedia.org/wiki/Crystallographic_Information_File) and VASP POSCAR structures, written in a pure JavaScript.

In a compiled form it is only one file ```player.html``` less than 300 Kb (90 Kb gzipped). See it [online](http://tilde-lab.github.io/player.html). Only browser is required. After the code is loaded, no internet connection is needed.

Technical details
------

The modular JavaScript approach based on [require.js](http://requirejs.org) is employed. Development layout is inside ```src``` folder. Dependencies are [three.js](https://github.com/mrdoob/three.js) and [math.js](http://mathjs.org), as manifested in ```deps``` folder. They are downloaded with the aid of Unix shell script ```prepare.sh```, and the needed parts are saved in the development layout. Compilation is done using ```build.sh``` script, invoking Google's Closure Compiler (which is shipped with [three.js](https://github.com/mrdoob/three.js), requires JVM).

Integration in the other software
------

The file ```player.html``` can be embedded into the **iframe** HTML element. In this case, the parent webpage is checked, if it contains the supported file in the global variable **playerdata** as a string. If found, it is loaded and rendered. Additionally, supported files from anywhere on the web can be displayed. A file URL must be then passed via **_document.location.hash_** property (browser's address bar, after sharp symbol). However if the file is served from another domain, PHP or Python proxy for remote requests should be used. There are examples of PHP and Python proxies (not for production use) in ```src``` folder. Obviously, it is safer to serve supported files from the same domain.

Comparison with the other open-source plugin-free engines
------

See the [blog post](https://blog.tilde.pro/in-browser-plugin-free-cif-visualization-comparison-of-open-source-engines-a3d0b4098660).

_Let's cooperate on the further development!_
