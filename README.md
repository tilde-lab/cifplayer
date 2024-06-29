HTML5 CIF player
======
[![DOI](https://zenodo.org/badge/18811/tilde-lab/cifplayer.svg)](https://doi.org/10.5281/zenodo.7692709)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer?ref=badge_shield)

In-browser ultra-fast and lightweight renderer of the [crystallographic information files (CIF)](https://en.wikipedia.org/wiki/Crystallographic_Information_File), [OPTIMADE JSON](https://github.com/Materials-Consortia/OPTIMADE/blob/master/optimade.rst#entry-list), and VASP [POSCAR](https://www.vasp.at/wiki/index.php/POSCAR) atomic structures, written in a pure JavaScript.

In a compiled form it is only one standalone embeddable file `web.js` of 300 Kb (gzipped). See it [online](https://tilde-lab.github.io/cifplayer). Only a web-browser is required. After the code is loaded, no internet connection is needed.


Technical details
------

This app is written in the `$mol` framework and employs [three.js](https://github.com/mrdoob/three.js) for 3d-rendering and [tween.js](https://github.com/tweenjs/tween.js) for phonon animation. Scientific formats conversion is done with `matinfio.js`.

Compilation is done as follows. Note that, unlike many other frontend frameworks, `$mol` provides the same single environment for all its projects, under the standard namespace scheme. That is, all your `$mol`-based code lives inside the same directory `$MOL_HOME`. So if you don't have `$MOL_HOME` yet, please create it and navigate there:

```bash
mkdir $MOL_HOME && cd $MOL_HOME
```

Then build with

```bash
npm exec mam optimade/cifplayer/player
```

This will fetch the MAM server (MAM stands for the `$mol` abstract modules), clone this project, and compile it inside `optimade/cifplayer/player/-/` subfolder. You will need the `web.js` bundle, that's it.

Development is similar to above: inside the `$MOL_HOME`, start the MAM dev-server with

```bash
npm exec mam
```

and navigate to http://localhost:9080, there select `optimade` namespace, then `cifplayer`, then `app`. As you go through the folder structure, the selected project is being cloned and compiled on the fly, inside the corresponding subfolder of `$MOL_HOME`.


Integration with the other software
------

The compiled bundle `web.js` defines a web-component `optimade-cifplayer-player`. It can be controlled in a standard way with e.g.

```js
const player = document.getElementsByTagName('optimade-cifplayer-player')[0].view;
player.data(structure);
```


Comparison with the other open-source plugin-free engines
------

See a detailed [comparison](https://github.com/blokhin/cif-js-engines) as well as the [blog post](https://blog.tilde.pro/in-browser-plugin-free-cif-visualization-comparison-of-open-source-engines-a3d0b4098660), written in 2015. As of now, it is unfortunately severely outdated.


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ftilde-lab%2Fcifplayer?ref=badge_large)
