namespace $ {

	export class $optimade_cifplayer_lib_cif extends $mol_object2 {

		@ $mol_mem
		static all() {
			return require( '../optimade/cifplayer/lib/cif/_cif.js' ) as typeof import( './_cif' )
		}

		@ $mol_mem
		static loader() {
			$mol_wire_solid()
			const CIFLoader = this.all().CIFLoader
			const loader = new CIFLoader()
			return loader
		}

	}

}
