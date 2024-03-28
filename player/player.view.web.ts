namespace $.$$ {

	const THREE = $mpds_cifplayer_lib_three
	type THREE = typeof THREE

	const TWEEN = $mpds_cifplayer_lib_tween.TWEEN
	type TWEEN = typeof TWEEN

	export class $mpds_cifplayer_player extends $.$mpds_cifplayer_player {

		@ $mol_mem
		available_overlays() {
			try {
				this.structure_3d_data()
			} catch (error) {
				return {}
			}

			return {
				...super.available_overlays(),
				...this.structure_3d_data().overlayed
			}
		}

		@ $mol_mem
		symlabel(): string {
			return this.structure_3d_data().mpds_data
				? ''
				: (this.structure_3d_data().descr.symlabel)
					? 'SG ' + this.structure_3d_data().descr.symlabel
					: ''
		}

		@ $mol_mem
		descr_a(): string {
			return `a=${ parseFloat( this.structure_3d_data().descr.a ).toFixed( 3 ) }Å`
		}

		@ $mol_mem
		descr_b(): string {
			return `b=${ parseFloat( this.structure_3d_data().descr.b ).toFixed( 3 ) }Å`
		}

		@ $mol_mem
		descr_c(): string {
			return `c=${ parseFloat( this.structure_3d_data().descr.c ).toFixed( 3 ) }Å`
		}

		@ $mol_mem
		descr_alpha(): string {
			return `α=${ parseFloat( this.structure_3d_data().descr.alpha ).toFixed( 3 ) }°`
		}

		@ $mol_mem
		descr_beta(): string {
			return `β=${ parseFloat( this.structure_3d_data().descr.beta ).toFixed( 3 ) }°`
		}

		@ $mol_mem
		descr_gamma(): string {
			return `γ=${ parseFloat( this.structure_3d_data().descr.gamma ).toFixed( 3 ) }°`
		}

		@ $mol_mem
		color_a(): string {
			return this.$.$mol_lights() ? this.colors_light().a : this.colors_dark().a
		}

		@ $mol_mem
		color_b(): string {
			return this.$.$mol_lights() ? this.colors_light().b : this.colors_dark().b
		}

		@ $mol_mem
		color_c(): string {
			return this.$.$mol_lights() ? this.colors_light().c : this.colors_dark().c
		}

		@ $mol_mem
		camera_distance() {
			return this.camera().position.clone().sub( this.controls().target )
		}

		@ $mol_action
		zoom_up() {
			this.camera().position.sub( this.camera_distance().multiplyScalar( this.zoom_scale_step() ) )
		}

		@ $mol_action
		zoom_down() {
			this.camera().position.add( this.camera_distance().multiplyScalar( this.zoom_scale_step() ) )
		}

		@ $mol_mem
		message_visible() {
			return this.message() ? super.message_visible() : []
		}

		@ $mol_mem
		message(): string {
			try {
				this.structure_3d_data()
				return ''

			} catch ( error: any ) {
				return error.message || error
			}
		}

		@ $mol_mem
		structure_3d_data() {
			return new $mpds_cifplayer_matinfio( this.data() ).player()
		}

		@ $mol_mem_key
		text_canvas( text: string ) {
			const canvas = document.createElement( 'canvas' )

			const context = canvas.getContext( '2d' )!

			const metrics = context.measureText( text )
			canvas.width = metrics.width * 3.5
			canvas.height = 30

			context.font = "italic 28px sans-serif"
			context.textAlign = "center"
			context.textBaseline = "middle"
			context.fillStyle = this.$.$mol_lights() ? "#000" : "#fff"
			context.fillText( text, canvas.width / 2, canvas.height / 2 )

			return canvas
		}

		create_sprite( text: string ) {
			const canvas = this.text_canvas( text )
			const texture = new THREE.Texture( canvas )
			texture.needsUpdate = true

			const material = new THREE.SpriteMaterial( { map: texture, depthTest: false } )
			const sprite = new THREE.Sprite( material )
			sprite.renderOrder = 1
			sprite.scale.set( canvas.width / 100, 0.3, 1 )

			return sprite
		}

		@ $mol_mem
		axis_vectors() {
			return this.structure_3d_data().cell_matrix?.map( vec => new THREE.Vector3( ...vec ) )
		}

		@ $mol_mem
		controls_target() {
			const cell_center = this.cell_center()

			if( !cell_center ) {
				const atoms = this.structure_3d_data().atoms

				return atoms.reduce(( acc: InstanceType< THREE["Vector3"] >, atom ) => {
					const { x, y, z } = atom
					return acc.add( new THREE.Vector3( x, y, z ) )
				}, new THREE.Vector3() ).divideScalar( atoms.length )
			}

			return this.centered() ? cell_center.clone() : new THREE.Vector3()
		}

		@ $mol_mem
		spacegroup() {
			const { sg_name, ng_name } = this.structure_3d_data()

			return $mpds_cifplayer_matinfio_spacegroup.by_name_or_num( sg_name, ng_name )
		}

		@ $mol_mem
		sym_checks() {
			return this.spacegroup().symmetry_list().map( name => this.Sym_check( name ) )
		}

		sym_name( id: any ): string {
			return id
		}

		@$mol_action
		toogle_all_symmetry() {
			const checked = this.all_symmetry_enabled() ? false : true

			this.sym_checks().forEach( Check => Check.checked( checked ) )
		}

		@ $mol_mem
		all_symmetry_enabled() {

			for( const Check of this.sym_checks() ) {

				if( Check.checked() == false ) return false
			}

			return true
		}

		@ $mol_mem_key
		symmetry_visible(id: any, next?: any) {
			if ( next !== undefined ) return next as never

			return id == 'x,y,z' ? true : false
		}

		@ $mol_mem
		Toogle_all_title(): string {
			return this.all_symmetry_enabled() ? 'Disable all' : 'Enable all'
		}

		@ $mol_mem_key
		symmetry_atoms( symmetry: string ){

			const structure = this.structure_3d_data()
			const cell_matrix = structure.cell_matrix
			if( !cell_matrix ) return

			return structure.atoms.map(
				( data: any ) => this.spacegroup().symmetric_atom( symmetry, data, cell_matrix )
			)
		}

		@ $mol_mem
		visible_atoms(){
			const structure = this.structure_3d_data()

			if( !structure.cell_matrix ) return structure.atoms

			const atoms: $mpds_cifplayer_matinfio_internal_obj_atom[] = []

			const symmetries_enabled = this.spacegroup().symmetry_list().filter( name => this.symmetry_visible( name ) )

			symmetries_enabled.forEach( symmetry => {

				const next_symmetries = symmetries_enabled.slice( 0, symmetries_enabled.indexOf( symmetry ) )

				this.symmetry_atoms( symmetry )!.forEach( ( data: any ) => {

					for (const name of next_symmetries) {

						const atoms = this.symmetry_atoms( name )!
						if( is_overlap( data, atoms, 0.01 ) ) {
							return
						}
					}

					atoms.push( data )
				} )

			} )

			return atoms
		}

		@ $mol_mem
		atom_box() {
			const atom_box = this.Three().new_object( `atom_box`, ()=> new THREE.Object3D() )

			this.visible_atoms().forEach( ( data: any ) => {

				const atom = new THREE.Mesh(
					new THREE.SphereGeometry( data.r * this.atom_radius_scale(), 10, 8 ),
					new THREE.MeshLambertMaterial( { color: data.c } )
				)
				atom.position.set( data.x, data.y, data.z )

				atom_box.add( atom )
			} )

			return atom_box
		}

		@ $mol_mem
		overlay_changed() {
			const overlay = this.overlay()

			const atom_datas = this.visible_atoms()

			this.overlay_box().children.forEach( ( label: InstanceType< THREE["Object3D"] >, i: number ) => {

				label.children.forEach( ( sprite: InstanceType< THREE["Object3D"] > ) => label.remove( sprite ) )

				if( overlay ) {
					const sprite = this.create_sprite( String( atom_datas[ i ].overlays[ overlay ] ) )
					label.add( sprite )
				}
			} )
		}

		@ $mol_mem
		overlay_box() {
			const overlay_box = this.Three().new_object( `overlay_box`, ()=> new THREE.Object3D() )

			this.visible_atoms().forEach( ( data ) => {
				const label = new THREE.Object3D()
				label.position.set( data.x, data.y, data.z )

				overlay_box.add( label )
			} )

			return overlay_box
		}

		@ $mol_mem
		dir_light(): InstanceType< THREE["DirectionalLight"] >  {
			const intensity = this.$.$mol_lights() ? 1.5 : 0.5

			const dir_light = this.Three().object( 'dir_light', ()=> new THREE.DirectionalLight( 0xffffff, intensity ) )
			dir_light.intensity = intensity
			dir_light.position.set( 1, 1.5, 2 )

			return dir_light
		}

		@ $mol_mem
		ambient_light(): InstanceType< THREE["AmbientLight"] > {
			const intensity = this.$.$mol_lights() ? 5 : 1.5

			const ambient_light = this.Three().object( 'ambient_light', ()=> new THREE.AmbientLight( 0x999999, intensity ) )
			ambient_light.intensity = intensity

			return ambient_light
		}

		@ $mol_mem
		cell_center() {
			const axis = this.axis_vectors()
			if( !axis ) return

			const [ a, b, c ] = axis
			const origin = a.clone().add( b ).add( c ).multiplyScalar( 0.5 )

			return origin
		}

		@ $mol_mem
		axes_box() {
			const axes_box = this.Three().new_object( 'axes_box', ()=> new THREE.Object3D() )

			const axis = this.axis_vectors()
			if( !axis ) return

			const origin = new THREE.Vector3( 0, 0, 0 )

			const arrows = axis.map( ( axis, i ) =>
				new THREE.ArrowHelper(
					axis.clone().normalize(),
					origin,
					axis.length(),
					this.axcolor()[ i ],
					0.75,
					0.1
				)
			)

			arrows.forEach( arrow => axes_box.add( arrow ) )

			return axes_box
		}

		@ $mol_mem
		cell_box() {
			const cell_box = this.Three().new_object( 'cell_box', ()=> new THREE.Object3D() )

			const axis = this.axis_vectors()
			if( !axis ) return

			if( ! this.structure_3d_data().cell_matrix?.length ) return

			const color = this.cell_lines_color()

			const add_line = ( start: InstanceType< THREE["Vector3"] >, end: InstanceType< THREE["Vector3"] > )=> {
				const geometry = new THREE.BufferGeometry().setFromPoints( [ start, end ] );
				const material = new THREE.LineBasicMaterial( { color } )
				cell_box.add( new THREE.Line( geometry, material ) )
			}

			const [ a, b, c ] = axis

			const ab = a.clone().add( b )
			const ac = a.clone().add( c )
			const bc = b.clone().add( c )
			const abc = ab.clone().add( c )

			add_line( ab, a )
			add_line( ab, b )
			add_line( ab, abc )

			add_line( ac, a )
			add_line( ac, c )
			add_line( ac, abc )

			add_line( bc, b )
			add_line( bc, c )
			add_line( bc, abc )

			const cell_center = this.cell_center()
			if( this.centered() && cell_center ) {
				const axes_helper = new THREE.AxesHelper( 2 )
				axes_helper.position.fromArray( cell_center.toArray() )
				cell_box.add( axes_helper )
			}

			return cell_box
		}

		tweens = new TWEEN.Group()
		on_render() {
			this.tweens.update()
		}

		@ $mol_action
		vibrate( phonon: number[][] ) {
			$mol_wire_sync( this ).unvibrate()

			const atoms = this.atom_box().children
			const labels = this.overlay_box().children

			if( phonon.length !== atoms.length) {
				this.$.$mol_fail( new $mol_data_error(`Internal error: phonon length does not match number of atoms`) )
			}

			atoms.forEach( ( atom: InstanceType< THREE["Object3D"] >, i: number ) => {
				const start = atom.position.toArray()
				const [ x, y, z ] = phonon[ i ].map( ( v, i ) => start[ i ] + v * 6 )

				this.tweens.add( new TWEEN.Tween( atom.position ).to( { x, y, z }, 750 )
					.easing( TWEEN.Easing.Cubic.InOut ).repeat( Infinity ).yoyo( true ).start()
				)
				this.tweens.add( new TWEEN.Tween( labels[ i ].position ).to( { x, y, z }, 750 )
					.easing( TWEEN.Easing.Cubic.InOut ).repeat( Infinity ).yoyo( true ).start()
				)
			} )
		}

		@ $mol_action
		unvibrate() {
			if( this.tweens.getAll().length == 0 ) return

			this.tweens.removeAll()

			const atom_datas = this.visible_atoms()
			const atoms = this.atom_box().children
			const labels = this.overlay_box().children

			atoms.forEach( ( atom: InstanceType< THREE["Object3D"] >, i: number ) => {
				this.tweens.add( new TWEEN.Tween( atom.position ).to( atom_datas[ i ], 250 ).start() )
				this.tweens.add( new TWEEN.Tween( labels[ i ].position ).to( atom_datas[ i ], 250 ).start() )
			} )

			this.$.$mol_wait_timeout( 250 )

			this.tweens.removeAll()

			return
		}

		@ $mol_mem
		left_panel(): readonly any[] {

			if (this.externals()?.skip_panel) return []

			try {
				this.structure_3d_data()
			} catch (error) {
				return []
			}

			return this.structure_3d_data().cell_matrix ? super.left_panel() : []
		}

	}

	$mol_view_component( $mpds_cifplayer_player )

	function is_overlap( check: $mpds_cifplayer_matinfio_internal_obj_atom, atoms: $mpds_cifplayer_matinfio_internal_obj_atom[], delta: number ) {
		for (const atom of atoms) {
			if ( check.x < atom.x - delta || check.x > atom.x + delta ) continue
			if ( check.y < atom.y - delta || check.y > atom.y + delta ) continue
			if ( check.z < atom.z - delta || check.z > atom.z + delta ) continue
			return true
		}
		return false
	}

}
