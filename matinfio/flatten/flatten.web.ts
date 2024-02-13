namespace $ {

	/** Convert internal repr into a flattened C-alike structure */
	export function $mpds_cifplayer_matinfio_flatten_from_obj( this: $, crystal: any ) {
		if( crystal.symops ) this.$mpds_cifplayer_matinfio_log.warning( "Reading of symmetry operations is not implemented, expect errors" )

		const cell = Object.keys( crystal.cell ).length == 6
			? this.$mpds_cifplayer_matinfio_cell_to_matrix( crystal.cell ) // for CIF
			: crystal.cell // for POSCAR

		const xyzatoms = []

		const tcell = cell[ 0 ].map( function( col: number, i: number ) {
			return cell.map( function( row: number[] ) { return row[ i ] } )
		} )

		const types = []
		if( crystal.types ) {
			for( let i = 0; i < crystal.atoms.length; i++ ) {
				xyzatoms.push( [ crystal.atoms[ i ].x, crystal.atoms[ i ].y, crystal.atoms[ i ].z ] )
			}
		} else {
			const atoms_types: any = {}

			for( let i = 0; i < crystal.atoms.length; i++ ) {
				if( Object.keys( atoms_types ).indexOf( crystal.atoms[ i ].symbol ) == -1 )
					atoms_types[ crystal.atoms[ i ].symbol ] = [ [ crystal.atoms[ i ].x, crystal.atoms[ i ].y, crystal.atoms[ i ].z ] ]
				else
					atoms_types[ crystal.atoms[ i ].symbol ].push( [ crystal.atoms[ i ].x, crystal.atoms[ i ].y, crystal.atoms[ i ].z ] )
			}
			var seq = 1
			for( var type in atoms_types ) {
				for( var j = 0; j < atoms_types[ type ].length; j++ ) {
					xyzatoms.push( atoms_types[ type ][ j ] )
					types.push( seq )
				}
				seq++
			}
		}
		/// const fatoms = fatoms.concat.apply( fatoms, xyzatoms )
		const fatoms = xyzatoms
		/// const fcell = fcell.concat.apply( fcell, tcell )
		const fcell = tcell

		const symlabel = ( crystal.sg_name || crystal.ng_name ) 
			? ( ( crystal.sg_name ? crystal.sg_name : "" ) + ( crystal.ng_name ? ( " (" + crystal.ng_name + ")" ) : "" ) ) 
			: false

		return { 'cell': fcell, 'atoms': fatoms, 'types': types || crystal.types, 'symlabel': symlabel }
	}

}
