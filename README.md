HTML5 CIF player
======
[![DOI](https://zenodo.org/badge/18811/tilde-lab/cifplayer.svg)](https://zenodo.org/badge/latestdoi/18811/tilde-lab/cifplayer)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer?ref=badge_shield)

In-browser ultra-fast and lightweight renderer of the [crystallographic information files (CIF)](https://en.wikipedia.org/wiki/Crystallographic_Information_File), OPTIMADE JSON, and VASP POSCAR structures, written in a pure JavaScript.

In a compiled form it is only one **standalone** file `player.html` of 500 Kb (100 Kb gzipped). See it [online](http://tilde-lab.github.io/cifplayer). Only a web-browser is required. After the code is loaded, no internet connection is needed.

Technical details
------

The modular JavaScript approach based on [require.js](http://requirejs.org) is employed. Development layout is inside `src` folder. Dependencies are [three.js](https://github.com/mrdoob/three.js) and [math.js](http://mathjs.org), as manifested in `deps` folder. They are downloaded with the aid of Unix shell script `prepare.sh`, and the needed parts are saved in the development layout. Compilation is done using `build.sh` script, invoking Google's Closure Compiler (which is shipped with [three.js](https://github.com/mrdoob/three.js), requires JVM).

Integration with the other software
------

The file `player.html` can be embedded into the **iframe** HTML element. In this case, the parent webpage is checked for the content to be rendered (as a string) in the global variable `playerdata`. If found, the content is loaded and rendered. The browser domain policies must apply.

Additionally, the content from anywhere on the web can be rendered, if the domain policies apply. A file URL must be given via the `document.location.hash` property (browser's address bar, after **#** symbol). To bypass CORS, the proxy for the remote requests could be used. There are examples of PHP and Python proxies (**not for production use!**) in `src` folder. Obviously, it is safer to serve supported files from the same domain.

Finally, the **postMessage** interface is supported. The parent webpage should call `iframe.postMessage(payload, '*')` providing the content as the **payload**.

Comparison with the other open-source plugin-free engines
------

See a detailed [comparison](https://github.com/blokhin/cif-js-engines) as well as the [blog post](https://blog.tilde.pro/in-browser-plugin-free-cif-visualization-comparison-of-open-source-engines-a3d0b4098660).


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer?ref=badge_large)
