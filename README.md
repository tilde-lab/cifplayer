Materials Informatics Player
======

In-browser ultra-fast and lightweight renderer of the [crystallographic information files (CIF)](https://en.wikipedia.org/wiki/Crystallographic_Information_File) written in a pure javascript.

In a compiled form it's only one file **_player.html_** about 260 Kb (without GZip compression). See [online](https://tilde.pro/player.html#http://www.nwchem-sw.org/images/Diamond.opt.cif).

CIF files from anywhere on the web can be displayed. A CIF file address is passed via **_document.location.hash_** property (browser's address bar, after sharp symbol). If served from another domain, PHP or Python proxy for remote requests should be then used (non-production examples are in **_src/_** folder).

Dependencies are [three.js](https://github.com/mrdoob/three.js) and [math.js](http://mathjs.org). They are prepared with the helper Unix shell script **_prepare.sh_**. Compilation is done using Google's Closure Compiler (used that one shipped with [three.js](https://github.com/mrdoob/three.js), requires JVM).
