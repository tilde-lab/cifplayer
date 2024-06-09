namespace $ {

	const math = $mpds_cifplayer_lib_math

	function unit( vec: number[] ): number[] {
		return math.divide( vec, math.norm( vec ) )
	}

	export type $mpds_cifplayer_matinfio_cell = {
		a: number,
		b: number,
		c: number,
		alpha: number,
		beta: number,
		gamma: number,
	}

	/** Crystalline cell parameters to 3x3 matrix */
	export function $mpds_cifplayer_matinfio_cell_to_matrix( this : $, cell: $mpds_cifplayer_matinfio_cell ): number[][] {
		const { a, b, c, alpha, beta, gamma } = cell
		if( !a || !b || !c || !alpha || !beta || !gamma ) {
			return this.$mol_fail( new $mol_data_error('Error: invalid cell definition') )
		}

		const alpha_rad = alpha * Math.PI / 180
		const beta_rad = beta * Math.PI / 180
		const gamma_rad = gamma * Math.PI / 180

		const ab_norm = [ 0, 0, 1 ] // TODO
		const a_dir = [ 1, 0, 0 ] // TODO
		const Z = unit( ab_norm )
		const X = unit( math.subtract( a_dir, math.multiply( math.dot( a_dir, Z ), Z ) ) )
		const Y: number[] = math.cross( Z, X )
		const va: number[] = math.multiply( a, [ 1, 0, 0 ] )
		const vb: number[] = math.multiply( b, [ math.cos( gamma_rad ), math.sin( gamma_rad ), 0 ] )
		const cx: number = math.cos( beta_rad )
		const cy = math.divide( math.subtract( math.cos( alpha_rad ), math.multiply( math.cos( beta_rad ), math.cos( gamma_rad ) ) ), math.sin( gamma_rad ) )
		const cz = math.sqrt( math.subtract( math.subtract( 1, math.multiply( cx, cx ) ), math.multiply( cy, cy ) ) )
		const vc = math.multiply( c, [ cx, cy, cz ] )
		const abc = [ va, vb, vc ]
		const t = [ X, Y, Z ]
		return math.multiply( abc, t )
	}

	/** 3x3 matrix to crystalline cell parameters */
	export function $mpds_cifplayer_matinfio_cell_params_from_matrix( matrix: number[][] ) {
		const norms: number[] = matrix.map( vec => math.norm( vec ) )
		const angles = []
		let j = -1
		let k = -2
		for( let i = 0; i < 3; i++ ) {
			j = i - 1
			k = i - 2
			const lenmult = norms[ j ] * norms[ k ]
			const tau = lenmult > 1e-16 
				? 180 / Math.PI * Math.acos( math.dot( matrix[ j ], matrix[ k ] ) / lenmult )
				: 90.0
			angles.push( tau )
		}
		return norms.concat( angles )
	}
	
}
