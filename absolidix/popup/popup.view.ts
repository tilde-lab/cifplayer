namespace $.$$ {
	export class $optimade_cifplayer_absolidix_popup extends $.$optimade_cifplayer_absolidix_popup {

		login() {
			try {
				//auth
				window.opener.postMessage( { status: 'success' }, window.location.origin )
			} catch( error ) {
				window.opener.postMessage( { status: 'failed', error: '' }, window.location.origin )
			}
		}

	}
}
