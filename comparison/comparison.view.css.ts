namespace $.$$ {

	$mol_style_define( $mpds_cifplayer_comparison, {

		contain: 'none', //otherwise in fullscreen 'fixed' positions plot relative to parent not to the viewport

		Menu: {
			flex: {
				basis: '20rem',
			},
		},

		Player_page: {
			flex: {
				grow: 1,
				basis: '30rem',
			},
			Body: {
				contain: 'none', //otherwise in fullscreen 'fixed' positions plot relative to parent not to the viewport
				transform: 'none',
			},
		},

		Row: {
			padding: {
				bottom: '2rem',
			},
		},

		Cif_page: {
			Head: {
				flex: {
					direction: 'column',
				},
			},
		},

	} )

}
