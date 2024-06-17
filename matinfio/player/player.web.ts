namespace $ {

	const math = $optimade_cifplayer_lib_math

	/** Prepare internal repr for visualization in three.js */
	export function $optimade_cifplayer_matinfio_player_from_obj( this: $, crystal: $optimade_cifplayer_matinfio_internal_obj ) {
		let cell_matrix: number[][] | undefined
		let descr: any = false

		if( crystal.cell && Object.keys( crystal.cell ).length == 6 ) { // for CIF

			cell_matrix = this.$optimade_cifplayer_matinfio_cell_to_matrix( crystal.cell )
			descr = crystal.cell
			var symlabel = ( crystal.sg_name || crystal.ng_name ) ? ( ( crystal.sg_name ? crystal.sg_name : "" ) + ( crystal.ng_name ? ( " (" + crystal.ng_name + ")" ) : "" ) ) : false
			if( symlabel ) descr.symlabel = symlabel

		} else {
			
			cell_matrix = crystal.cell_matrix // for POSCAR and OPTIMADE
			if( cell_matrix ) {
				const [ a, b, c, alpha, beta, gamma ] = $optimade_cifplayer_matinfio_cell_params_from_matrix( cell_matrix )
				descr = { a, b, c, alpha, beta, gamma }
			}
		}

		if( !crystal.atoms.length ) this.$optimade_cifplayer_matinfio_log.warning( "Note: no atomic coordinates supplied" )

		const render: $optimade_cifplayer_matinfio_player_obj = {
			atoms: [] as any[],
			cell_matrix: cell_matrix,
			cell: descr,
			descr: descr,
			overlayed: {} as Record< string, string >,
			sg_name: crystal.sg_name,
			ng_name: parseInt( crystal.ng_name ),
			info: crystal.info,
			mpds_data: crystal.mpds_data,
			mpds_demo: crystal.mpds_demo
		}
		const pos2els: any = {}
		const hashes: any = {}

		for( let i = 0; i < crystal.atoms.length; i++ ) {
			const pos = [ crystal.atoms[ i ].x, crystal.atoms[ i ].y, crystal.atoms[ i ].z ]
			const hash = pos.map( function( item ) { return item.toFixed( 2 ) } ).join( ',' )
			// make atoms unique, i.e. remove collisions;
			// makes special sense for partial occupancies
			if( hashes.hasOwnProperty( hash ) ) {
				var update = ""
				for( let oprop in render.atoms[ hashes[ hash ] ].overlays ) {
					if( oprop == 'S' ) {
						if( pos2els[ hash ].indexOf( crystal.atoms[ i ].symbol ) == -1 ) {
							update = " " + crystal.atoms[ i ].symbol
							pos2els[ hash ].push( crystal.atoms[ i ].symbol )
						}
					}
					else if( oprop == 'N' )
						update = ", " + ( i + 1 )
					else if( oprop == '_atom_site_occupancy' )
						update = "+" + crystal.atoms[ i ].overlays[ oprop ]
					else
						update = " " + crystal.atoms[ i ].overlays[ oprop ]

					render.atoms[ hashes[ hash ] ].overlays[ oprop ] += update
				}
			} else {
				const color = ($optimade_cifplayer_matinfio_chemical_elements.JmolColors as any)[ crystal.atoms[ i ].symbol ] || '#FFFF00'
				const radius = ($optimade_cifplayer_matinfio_chemical_elements.AseRadii as any)[ crystal.atoms[ i ].symbol ] || 0.66
				
				const overlays: Record< string, string | number > = {
					"S": crystal.atoms[ i ].symbol,
					"N": i + 1,
				}
				for( let oprop in crystal.atoms[ i ].overlays ) {
					overlays[ oprop ] = crystal.atoms[ i ].overlays[ oprop ]
				}

				// CIF has fractional positions
				// OPTIMADE has cartesian positions
				// POSCAR may have either of two
				const cpos = crystal.cartesian ? pos : math.multiply( pos, cell_matrix )
				const fpos = !crystal.cartesian ? pos : cell_matrix ? math.divide( pos, cell_matrix ) : null
				const fract = fpos ? { 'x': fpos[ 0 ], 'y': fpos[ 1 ], 'z': fpos[ 2 ] } : null
				
				render.atoms.push( { 
					'fract': fract,
					'x': cpos[ 0 ],
					'y': cpos[ 1 ],
					'z': cpos[ 2 ],
					'c': color,
					'r': radius,
					'overlays': overlays
				} )
				hashes[ hash ] = render.atoms.length - 1
				pos2els[ hash ] = [ crystal.atoms[ i ].symbol ]
			}
		}

		for( let oprop in crystal.atoms.at(-1)!.overlays ) {
			render.overlayed[ oprop ] = $optimade_cifplayer_matinfio_custom_atom_loop_props[ oprop ]
		}
		
		return render
	}

}
