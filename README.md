Materials Informatics Player
======

Browser-based renderer of the [crystallographic information files (CIF)](https://en.wikipedia.org/wiki/Crystallographic_Information_File) written in a pure javascript.
Requires some web-server to run.

E.g. if Python available:
```shell
python proxy.py 7777
```

Or using an internal web-server in PHP:
```shell
php -S localhost:7777
```

GUI is then accessible via the local address http://localhost:7777/ in the browser (or other address, depending on used server).
To display a local CIF file, drag and drop it inside the browser window.
To display a CIF file on the web, paste its web address in the browser's address bar, after sharp (#) symbol and hit enter. (PHP or Python proxy for javascript requests should be then used.)

Two external javascript libraries ([three.js](https://github.com/mrdoob/three.js) and [math.js](http://mathjs.org)) are embedded.
