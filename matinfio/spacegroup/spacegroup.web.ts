namespace $ {

	const math = $mpds_cifplayer_lib_math

	export class $mpds_cifplayer_matinfio_spacegroup extends $mol_object2 {

		protected constructor( public readonly data: $mpds_cifplayer_lib_spacegroups_info ) {
			super()
		}

		static by_name_or_num( name: string, num: number ) {
			const spacegroup = num
				? $mpds_cifplayer_matinfio_spacegroup.by_num( num )
				: name ? $mpds_cifplayer_matinfio_spacegroup.by_name( name ) : null
			return spacegroup ? spacegroup : $mpds_cifplayer_matinfio_spacegroup.unknown()
		}

		@ $mol_mem_key
		static by_name( name: string ) {
			const name_fixed = name.charAt( 0 ).toUpperCase() + name.slice( 1 )
			const data = $mpds_cifplayer_lib_spacegroups.SpaceGroup.getByHMName( name_fixed )
			return data ? new $mpds_cifplayer_matinfio_spacegroup( data ) : null
		}

		@ $mol_mem_key
		static by_num( num: number ) {
			const data = $mpds_cifplayer_lib_spacegroups.SpaceGroup.getById( num )
			return data ? new $mpds_cifplayer_matinfio_spacegroup( data ) : null
		}

		@ $mol_mem
		static unknown() {
			return new $mpds_cifplayer_matinfio_spacegroup( $mpds_cifplayer_lib_spacegroups.SpaceGroup.getById( 1 ) )
		}

		@ $mol_mem
		symmetry_list(): string[] {
			return this.data.s
		}

		symmetric_atom( symmetry: string, atom: $mpds_cifplayer_matinfio_internal_obj_atom, cell: number[][] ): $mpds_cifplayer_matinfio_internal_obj_atom {
			const spans = symmetry.split( ',' )

			const fract = {
				x: fract_cord_norm( calc_symmetry_span( spans[ 0 ], atom.fract ) ),
				y: fract_cord_norm( calc_symmetry_span( spans[ 1 ], atom.fract ) ),
				z: fract_cord_norm( calc_symmetry_span( spans[ 2 ], atom.fract ) ),
			}

			const [ x, y, z ] = math.multiply( [ fract.x, fract.y, fract.z ], cell )

			return { ...atom, fract, x, y, z }
		}

		@ $mol_mem_key
		symmetric_atoms( atom: $mpds_cifplayer_matinfio_internal_obj_atom, cell_matrix: number[][] ) {
			return this.symmetry_list().map( name => this.symmetric_atom( name, atom, cell_matrix ) )
		}

	}

	function calc_symmetry_span( symmetry_span: string, fract: { x: number, y: number, z: number } ) {
		let res = 0

		let sign: -1 | 1 = 1
		let coef_sign = 1
		let coef = ''

		for( const char of symmetry_span ) {
			switch( char ) {

				case 'x': case 'y': case 'z': 
					res += sign * fract[ char ]
					break

				case '+':
					sign = 1
					break
				case '-':
					sign = -1
					break

				default:
					coef_sign = sign
					coef += char
					break
			}
		}

		const coef_split = coef.split( '/' )
		const coef_num = parseInt( coef_split[ 0 ] ) / ( coef_split[ 1 ] ? parseInt( coef_split[ 1 ] ) : 1 )

		if( coef ) res += coef_sign * coef_num

		return res
	}

	function fract_cord_norm( cord: number ){
		let res = cord % 1
		if( res < 0 ) res = res + 1
		return res
	}

}
