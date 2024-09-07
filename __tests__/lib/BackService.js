const {WebService} = require ('doix-http')

module.exports = class extends WebService {

	constructor (app, o) {
		
	    super (app, {
	    
			methods: ['POST'],

			name: 'webBackEnd',

			on: {

				error : function (error) {

					if (typeof error === 'string') error = Error (error)
					
					while (error.cause) error = error.cause
					
					this.error = error

				},

			},

				stringify: content => {
				
					return JSON.stringify ({
						success: true, 
						content, 
					})
				
				},
			
			...o

	    })

	}

}