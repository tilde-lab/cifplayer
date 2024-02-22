HTML5 CIF player
======
[![DOI](https://zenodo.org/badge/18811/tilde-lab/cifplayer.svg)](https://doi.org/10.5281/zenodo.7692709)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer?ref=badge_shield)

In-browser ultra-fast and lightweight renderer of the [crystallographic information files (CIF)](https://en.wikipedia.org/wiki/Crystallographic_Information_File), [OPTIMADE JSON](https://github.com/Materials-Consortia/OPTIMADE/blob/master/optimade.rst#entry-list), and VASP [POSCAR](https://www.vasp.at/wiki/index.php/POSCAR) atomic structures, written in a pure JavaScript.

In a compiled form it is only one **standalone** file `player.html` of 500 Kb (100 Kb gzipped). See it [online](http://tilde-lab.github.io/cifplayer). Only a web-browser is required. After the code is loaded, no internet connection is needed.


Technical details
------

This app is written in the [$mol](https://github.com/hyoo-ru) framework and employs [three.js](https://github.com/mrdoob/three.js) for 3d-rendering and [tween.js](https://github.com/tweenjs/tween.js) for phonon animation. Scientific formats conversion is done with `matinfio.js`.


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
