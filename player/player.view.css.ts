namespace $.$$ {

	$mol_style_define( $mpds_cifplayer_player, {

		background: {
			color: $mol_theme.back,
		},

		'@': {
			fullscreen: {
				'true': {
					position: 'fixed',
					zIndex: 9999,
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
				},
			},
		},

		Descr_a: {
			color: $mol_style_func.vary('--color_a')
		},

		Descr_b: {
			color: $mol_style_func.vary('--color_b')
		},

		Descr_c: {
			color: $mol_style_func.vary('--color_c')
		},

		Left_panel: {
			position: 'absolute',
			zIndex: 1,
			flex: {
				direction: 'column',
			},
			align: {
				items: 'flex-start',
			},
		},

		Info: {
			padding: $mol_gap.block,
			gap: $mol_gap.space,
			flex: {
				direction: 'column',
			},
		},

		Toogle_all: {
			boxShadow: `0 0.5rem 0.5rem -0.5rem hsla(0,0%,0%,.5)`,	
		},

		Overlays: {
			position: 'absolute',
			bottom: 0,
			width: '100%',
			align: {
				items: 'center',
			},
			zIndex: 1,
		},

		Switch_overlay: {
			justify: {
				content: 'center'
			},
		},

		Tools: {
			position: 'absolute',
			right: 0,
			zIndex: 1,
			flex: {
				direction: 'column',
			},
			align: {
				items: 'flex-end',
			},
		},

		Zoom_section: {
			padding: {
				top: '2rem',
				bottom: '2rem',
			},
		},

		Zoom_up_icon: {
			width: '2rem',
			height: '2rem',
		},

		Zoom_down_icon: {
			width: '2rem',
			height: '2rem',
		},

		Message: {
			background: {
				color: $mol_theme.back,
			},
			position: 'absolute',
			zIndex: 1,
			top: '6rem',
			left: '50%',
			transform: 'translateX(-50%)',
		},

	} )

}
