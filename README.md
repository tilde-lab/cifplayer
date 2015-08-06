Materials Informatics Player
======

In-browser ultra-fast and lightweight renderer of the [crystallographic information files (CIF)](https://en.wikipedia.org/wiki/Crystallographic_Information_File) written in a pure javascript.

In a compiled form it's only one file (**_player.html_**) less than 300 Kb. See [online](https://tilde.pro/player.html).

CIF files from anywhere on the web can be displayed. A CIF file address is passed via **_document.location.hash_** property (browser's address bar, after sharp symbol). If served from another domain, PHP or Python proxy for remote requests should be used (please, refer to **_src/_** folder).

Two external javascript libraries ([three.js](https://github.com/mrdoob/three.js) and [math.js](http://mathjs.org)) are embedded.
