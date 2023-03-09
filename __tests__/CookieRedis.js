const CookieRedis = require ('../lib/CookieRedis')

const SESSION = Symbol.for ('session')
const SID = '00000000-0000-0000-0000-000000000000'

const c = new CookieRedis ({
	name: 'sid',
	ttl: 60,
	prefix: 'session_',
	db: {
		host: "127.0.0.1",
		port: 6379,
	},
	getRaw: () => SID
})

const USER = {
	uuid  : '00000000-0000-0000-0000-000000000001',
	label : 'John Doe'
}

const JOB = {
	user: USER,
	[SESSION]: SID,
	http: {response: {
		setHeader: () => {}
	}}
}

let db = null

beforeAll(async () => {
	db = await c.getDb ()
})

test ('save', async () => {

	await c.save (JOB)

	const key = c.prefix + SID

	const user = await db.get (key)

	expect (user).toStrictEqual (JSON.stringify (USER))
})

afterAll(async () => {
	await db.disconnect ()
})