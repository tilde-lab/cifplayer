namespace $ {

	export function $optimade_cifplayer_matinfio_optimade_str_to_obj( this: $, str: string ) {
		const payload = JSON.parse( str )

		return this.$optimade_cifplayer_matinfio_optimade_to_obj( payload )
	}

	export function $optimade_cifplayer_matinfio_optimade_to_obj( this: $, payload: Record< string, any > ) {

		const atoms: any[] = []
		const src = payload?.data?.[ 0 ] ?? payload

		if( !src || !src.attributes ) {
			return this.$mol_fail( new $mol_data_error('Error: unexpected OPTIMADE format') )
		}

		var n_atoms = src.attributes.cartesian_site_positions.length
		if( !n_atoms ) {
			return this.$mol_fail( new $mol_data_error('Error: no atomic positions found') )
		}

		if( src.attributes.species && src.attributes.species[ n_atoms - 1 ] && src.attributes.species[ n_atoms - 1 ].chemical_symbols ) {
			src.attributes.species.forEach( function( item: any, idx: any ) {
				atoms.push( {
					'x': src.attributes.cartesian_site_positions[ idx ][ 0 ],
					'y': src.attributes.cartesian_site_positions[ idx ][ 1 ],
					'z': src.attributes.cartesian_site_positions[ idx ][ 2 ],
					'symbol': item.chemical_symbols[ 0 ] // NB chemical_symbols.length > 1 ?
				} )
			} )
		} else if( src.attributes.species_at_sites ) { // TODO support *elements*
			src.attributes.species_at_sites.forEach( function( item: any, idx: any ) {
				atoms.push( {
					'x': src.attributes.cartesian_site_positions[ idx ][ 0 ],
					'y': src.attributes.cartesian_site_positions[ idx ][ 1 ],
					'z': src.attributes.cartesian_site_positions[ idx ][ 2 ],
					'symbol': item.replace( /\W+/, '' ).replace( /\d+/, '' ),
					'overlays': { 'label': item }
				} )
			} )
		} else {
			return this.$mol_fail( new $mol_data_error('Error: no atomic data found') )
		}

		return {
			'cell_matrix': src.attributes.lattice_vectors,
			'atoms': atoms,
			'info': 'id=' + src.id,
			'cartesian': true
		}
	}

}
