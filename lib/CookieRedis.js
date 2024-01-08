const {CookieSession} = require ('doix-http')

class CookieRedis extends CookieSession {

	constructor (o) {
	
		super (o)
		
		this.prefix = o.prefix || ''
		
		this.db = o.db
		
		this.setOptions = {EX: 60 * parseInt (this.ttl)}
	
	}

	getDb (job) {

		return job [this.db]

	}

	async getUserBySessionId (id, db) {

		const json = await db.get (this.prefix + id)

		return json ? JSON.parse (json) : null

	}

	async storeUser (id, user, db) {

		await db.set (this.prefix + id, JSON.stringify (user), this.setOptions)

	}

	async finishSession (id, db) {

		await db.del (this.prefix + id)

	}

}

module.exports = CookieRedis