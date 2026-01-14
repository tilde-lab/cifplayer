namespace $.$$ {
	export class $optimade_cifplayer_absolidix_embed extends $.$optimade_cifplayer_absolidix_embed {

		open_popup( next?: any ) {

			const popup = window.open( '/popup.html', 'transferPopup', 'width=400,height=300' )
			window.addEventListener( 'message', ( event ) => {
				if( event.origin === window.location.origin ) {
					if( event.data.status === 'success' ) {
						console.log( 'Token transfer successful' )
					} else {
						console.log( 'Token transfer failed' )
					}
				}
			} )
			
		}

	}
}
