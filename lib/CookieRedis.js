const {randomUUID} = require ('crypto')
const {Cookie} = require ('doix-http')
const redis = require ('redis')

const SESSION = Symbol ('session')

class CookieRedis extends Cookie {

	constructor (o) {
	
		super (o)
		
		this.prefix = o.prefix || ''
		
		this.db = redis.createClient (o.db)
		
		this.setOptions = {EX: 60 * parseInt (this.ttl)}
	
	}
	
	newId () {
		
		return randomUUID ()
		
	}
	
	async getDb () {

		const {db} = this; if (!db.isOpen) await db.connect ()
		
		return db

	}

	async read (job) {

		const sid = this.getRaw (job.http.request); if (!sid) return

		job [SESSION] = sid
		
		const db = await this.getDb ()

		const json = await db.get (this.prefix + sid)

		job.user = JSON.parse (json)

	}
	
	async save (job) {

		const {user, http: {response}} = job; 
		
		const db = await this.getDb ()
		
		let sid = job [SESSION]

		if (user) {

			if (!sid) this.setRaw (response, sid = this.newId ())

			await db.set (this.prefix + sid, JSON.stringify (user), this.setOptions)

		}
		else {

			if (!sid) return

			await db.del (this.prefix + sid)

			this.setRaw (response, '')

		}

	}
	
	plugInto (ws) {

		ws.addHandler ('start', job => job.waitFor (this.read (job)))

		ws.addHandler ('end', job => job.waitFor (this.save (job)))

	}

}

module.exports = CookieRedis