namespace $.$$ {

	$mol_style_define( $optimade_cifplayer_player, {

		background: {
			color: $mol_theme.back,
		},

		position: 'relative',
		height: '100%',

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

		Translate_label_a: {
			color: $mol_style_func.vary('--color_a'),
			padding: $mol_gap.text,
		},

		Translate_label_b: {
			color: $mol_style_func.vary('--color_b'),
			padding: $mol_gap.text,
		},

		Translate_label_c: {
			color: $mol_style_func.vary('--color_c'),
			padding: $mol_gap.text,
		},

		Translate_cells: {
			pointerEvents: 'auto',
			Bubble: {
				display: 'grid',
				gridTemplateColumns: 'auto auto',
			},
		},

		Left_panel: {
			userSelect: 'none',
			pointerEvents: 'none',
			position: 'absolute',
			zIndex: 1,
			fontSize: '13px',
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

		Symlabel: {
			pointerEvents: 'auto',
		},

		Center: {
			pointerEvents: 'auto',
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
				bottom: '1rem',
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
			position: 'absolute',
			zIndex: 1,
			top: '6rem',
			left: 0,
			right: 0,
		},

		Message_card: {
			background: {
				color: $mol_theme.back,
			},
			margin: 'auto',
		},

		Three: {
			cursor: 'move',
		},

	} )

}
