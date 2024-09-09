# `$optimade_cifplayer_matinfio`

The module parses CIF, POSCAR or OPTIMADE structures and prepares them for visualisation.


## Building

```bash
npm exec mam@latest optimade/cifplayer/matinfio
```

The web module bundle will be in `optimade/cifplayer/matinfio/-/web.js`


## Usage example

```js
const structure = new $optimade_cifplayer_matinfio( data ).player()
```

### Parameter

**`data`** 

- An object or string containing a structure in CIF, POSCAR or OPTIMADE format. The format will be determined automatically.

### Result

**`structure`** 

- An object of the following type:

	```ts
	type $optimade_cifplayer_matinfio_player_obj = {
		cell_matrix?: number[][],
		descr: {
			a: number,
			b: number,
			c: number,
			alpha: number,
			beta: number,
			gamma: number,
			symlabel?: string,
		},
		overlayed: Record< string, string >,
		atoms: {
			fract: {
				x: number,
				y: number,
				z: number,
			} | null,
			x: number,
			y: number,
			z: number,
			c: string, //color
			r: number, //radius
			symbol: string,
			label: string,
			overlays: Record< string, string | number >,
		}[]
		sg_name: string,
		ng_name: number,
		info: string,
		mpds_demo: boolean,
		mpds_data: boolean,
	}
	```
