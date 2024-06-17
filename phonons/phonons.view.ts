namespace $.$$ {
	export class $optimade_cifplayer_phonons extends $.$optimade_cifplayer_phonons {

		@ $mol_action
		set_example() {

			this.data_str( '# Copyright Material Phases Data System, Switzerland & NIMS, Japan, 2024\ndata_S1822639\n_cell_length_a    3.666000\n_cell_length_b    3.666000\n_cell_length_c    3.666000\n_cell_angle_alpha 90.000000\n_cell_angle_beta  90.000000\n_cell_angle_gamma 90.000000\n_symmetry_Int_Tables_number    221\n_symmetry_space_group_name_H-M Pm-3m\n_space_group_crystal_system    cubic\n_pauling_file_chemical_formula ScSn\n_pauling_file_object_repr      S-MPDS\n_pauling_file_object_version   1.2.0\n_pauling_file_entry            S1822639\n_pauling_file_entry_reference  https://mpds.io/entry/S1822639\n_pauling_file_phase            ScSn/221/cP2\n_pauling_file_phase_reference  https://mpds.io/phase/ScSn/221/cP2\n_pauling_file_editors_comments\n;\n atom coordinates, structure type assigned\n;\nloop_\n _symmetry_equiv_pos_site_id\n _symmetry_equiv_pos_as_xyz\n 1 -x,-y,-z\n 2 -x,-y,z\n 3 -x,-z,-y\n 4 -x,-z,y\n 5 -x,y,-z\n 6 -x,y,z\n 7 -x,z,-y\n 8 -x,z,y\n 9 -y,-x,-z\n 10 -y,-x,z\n 11 -y,-z,-x\n 12 -y,-z,x\n 13 -y,x,-z\n 14 -y,x,z\n 15 -y,z,-x\n 16 -y,z,x\n 17 -z,-x,-y\n 18 -z,-x,y\n 19 -z,-y,-x\n 20 -z,-y,x\n 21 -z,x,-y\n 22 -z,x,y\n 23 -z,y,-x\n 24 -z,y,x\n 25 x,-y,-z\n 26 x,-y,z\n 27 x,-z,-y\n 28 x,-z,y\n 29 x,y,-z\n 30 x,y,z\n 31 x,z,-y\n 32 x,z,y\n 33 y,-x,-z\n 34 y,-x,z\n 35 y,-z,-x\n 36 y,-z,x\n 37 y,x,-z\n 38 y,x,z\n 39 y,z,-x\n 40 y,z,x\n 41 z,-x,-y\n 42 z,-x,y\n 43 z,-y,-x\n 44 z,-y,x\n 45 z,x,-y\n 46 z,x,y\n 47 z,y,-x\n 48 z,y,x\nloop_\n _atom_site_label\n _atom_site_type_symbol\n _atom_site_atomic_num\n _atom_site_periodic_num\n _atom_site_linus_pauling_num\n _atom_site_fract_x\n _atom_site_fract_y\n _atom_site_fract_z\n _atom_site_occupancy\n _atom_site_Wyckoff_symbol\n _pauling_file_site_symmetry\n Sn_a      Sn     50   91    1  0.5000  0.5000  0.5000  1.0000  1b  m-3m\n Sc_a      Sc     21   14    1  0.0000  0.0000  0.0000  1.0000  1a  m-3m\n#\n# end of data item S1822639\n#\n' )

		}

		@ $mol_mem
		phonon( next?: string ): string {

			if( next === '' ) this.unvibrate()

			if( !next ) return next ?? ''

			this.vibrate( this.phonons()[ next ] )
			return next

		}

		@ $mol_mem
		phonons(): Record< string, number[][] > {
			return {
				'Phonon #1': [
					[1, 1, 1],
					[1, 1, 1],
				],
				'Phonon #2': [
					[1, -1, 0],
					[-1, 1, 0],
				],
				'Phonon #3': [
					[0, 0, 1],
					[0, 0, -1],
				],
			}
		}

		@ $mol_mem
		phonon_options(): Record<string, any> {

			return Object.fromEntries( Object.keys( this.phonons() ).map( p => [ p, p ] ) )

		}

	}

}
