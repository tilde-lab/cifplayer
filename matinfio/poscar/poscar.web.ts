namespace $ {

	const math = $optimade_cifplayer_lib_math

	const is_numeric = function( v: any ) {
		return !isNaN( parseFloat( v ) ) && isFinite( v )
	}

	export function $optimade_cifplayer_matinfio_poscar_to_obj( this: $, str: string ) {
		var lines = str.toString().replace( /(\r\n|\r)/gm, "\n" ).split( "\n" ),
			cell_matrix = [],
			atoms = [],
			factor = 1.0,
			atindices: any[] = [],
			atvals: any[] = [],
			elems = [],
			types = [],
			atom_props = [ 'x', 'y', 'z', 'symbol' ],
			j = 0,
			line_data = [],
			atidx = 0,
			tryarr = [],
			periodic_table = [],
			marker = '',
			cartesian = false

		loop_poscar_parse:
		for( let i = 0; i < lines.length; i++ ) {
			if( i == 0 ) {
				tryarr = lines[ i ].split( " " ).filter( function( o ) { return o ? true : false } )
				periodic_table = Object.keys( $optimade_cifplayer_matinfio_chemical_elements.AseRadii )
				for( let k = 0; k < tryarr.length; k++ ) {
					if( periodic_table.indexOf( tryarr[ k ] ) == -1 ) continue loop_poscar_parse
				}
				atvals = tryarr
			}
			else if( i == 1 ) factor = parseFloat( lines[ i ] )
			else if( [ 2, 3, 4 ].indexOf( i ) !== -1 ) {
				cell_matrix.push( lines[ i ].split( " " ).filter( function( o ) { return o ? true : false } ).map( Number ) )
			}
			else if( i == 5 ) {
				tryarr = lines[ i ].split( " " ).filter( function( o ) { return o ? true : false } )
				if( is_numeric( tryarr[ 0 ] ) ) {
					atindices = tryarr.map( Number )
					for( let k = 0; k < atindices.length; k++ ) {
						for( let m = 0; m < atindices[ k ]; m++ ) { types.push( ( k + 1 ) ) }
					}
				} else atvals = tryarr
			}
			else if( i == 6 ) {
				marker = lines[ i ].trim().toLowerCase().substr( 0, 6 )
				if( marker == 'direct' ) continue loop_poscar_parse
				else if( marker == 'cartes' ) {
					cartesian = true
					continue loop_poscar_parse
				}

				tryarr = lines[ i ].split( " " ).filter( function( o ) { return o ? true : false } )
				if( is_numeric( tryarr[ 0 ] ) ) {
					atindices = tryarr.map( Number )
					for( let k = 0; k < atindices.length; k++ ) {
						for( let m = 0; m < atindices[ k ]; m++ ) { types.push( ( k + 1 ) ) }
					}
				} else atvals = tryarr
			}
			else if( i > 6 ) {
				marker = lines[ i ].trim().toLowerCase().substr( 0, 6 )
				if( i < 9 ) {
					if( atvals.length && !elems.length ) {
						for( let k = 0; k < atvals.length; k++ ) {
							for( let m = 0; m < atindices[ k ]; m++ ) { elems.push( atvals[ k ] ) }
						}
					}
					if( [ 'direct', 'select' ].indexOf( marker ) !== -1 ) continue loop_poscar_parse
					else if( marker == 'cartes' ) {
						cartesian = true
						continue loop_poscar_parse
					}
				}

				const atom: any = {}
				line_data = lines[ i ].replace( '#', '' ).replace( '!', '' ).split( " " ).filter( function( o ) { return o ? true : false } )
				//console.log(line_data);
				if( !line_data.length )
					break
				else if( line_data.length == 3 ) elems.length ? line_data.push( elems[ atidx ] ) : line_data.push( 'Xx' )
				else if( line_data.length < 3 ) {
					this.$optimade_cifplayer_matinfio_log.error( "Error: unknown atom definition" )
					return false
				}

				for( let j = 0; j < 4; j++ ) {
					if( j < 3 ) atom[ atom_props[ j ] ] = parseFloat( line_data[ j ] )
					else atom[ atom_props[ j ] ] = line_data[ j ]
				}
				//console.log(atom);
				if( !atom.symbol ) {
					this.$optimade_cifplayer_matinfio_log.error( "Error: unknown data lines order" )
					return false
				}
				atom.symbol = atom.symbol.replace( /\W+/, '' ).replace( /\d+/, '' )
				if( !atom.symbol.length ) atom.symbol = 'Xx'
				atoms.push( atom )
				atidx++
			}
		}

		math.multiply( cell_matrix, factor )

		if( atoms.length )
			return {
				'cell_matrix': cell_matrix,
				'atoms': atoms,
				'types': types,
				'cartesian': cartesian
			}
		else {
			this.$optimade_cifplayer_matinfio_log.error( "Error: unexpected POSCAR format" )
			return false
		}
	}
}
