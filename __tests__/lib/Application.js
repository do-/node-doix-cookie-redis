const {Application, ConsoleLogger} = require ('doix')

const {Writable} = require ('stream')
const winston = require ('winston')
const logger = winston.createLogger({
	transports: [
//	  new winston.transports.Console (),
	  new winston.transports.Stream ({stream: new Writable ({write(){}})})
	]
})

const BackService = require ('./BackService.js')

module.exports = class extends Application {

	constructor (conf) {
					
	    super ({
	    	
	    	logger,

			modules: {
				dir: {
					root: [__dirname],
					filter: (str, arr) => arr.at (-1) === 'Content',
				},
			},

	    })

		this.sessions = {}

	}
	
	createBackService (o = {}) {

		return new BackService (this, o)
	
	}

}