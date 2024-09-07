const Application = require ('./lib/Application.js')
const {getResponse} = require ('./lib/MockServer.js')
const {CookieRedis} = require ('..')
const redis = require ('redis')
 
const DB_NAME = 'redis'
const PREFIX = 'session'

let c

beforeAll (async () => {

	c = redis.createClient ({
		url: process.env.REDIS_CONN_STRING
	})

	await c.connect ()

})
	
afterAll (async () => {

	await c.quit ()

})

const newApp = () => {

	jest.resetModules ()

	const app = new Application ()

	app.globals.set (DB_NAME, c)

	return app

}

const newSvc = app => {

	const svc = app.createBackService ()

	new CookieRedis ({ttl: 10, name: 'sid', db: DB_NAME, prefix: PREFIX}).plugInto (svc)

	return svc

}

async function getResponseFromWebService (svc, path, requestOptions, port) {

	return getResponse ({service: [svc], path, requestOptions, listen: {port}})

}

test ('constructor', async () => {

	const c = new CookieRedis ({name: 'sid', ttl: 1})

	expect (c.prefix).toBe ('')

})

test ('auth', async () => {	

	const app = newApp (), svc = newSvc (app), db = app.globals.get ('redis')

	const rp = await getResponseFromWebService (svc, '/?type=sessions&action=create', {method: 'POST', body: '{}'}, 8021)

	const sid = rp.headers ['set-cookie'] [0].slice (4, 40)
	
	const s = JSON.parse (await db.get (PREFIX + sid))
	
	expect (s.id).toBe (1)

	const rp1 = await getResponseFromWebService (svc, '/?type=users&part=current', {method: 'POST', body: '{}', headers: {Cookie: `sid=${sid}`}}, 8022)

	expect (rp1.responseJson.content.id).toBe (1)
	
	const rp2 = await getResponseFromWebService (svc, '/?type=sessions&action=delete', {method: 'POST', body: '{}', headers: {Cookie: `sid=${sid}`}}, 8023)

	expect (rp2.headers ['set-cookie'] [0]).toMatch ('sid=;')

	const rp3 = await getResponseFromWebService (svc, '/?type=users&part=current', {method: 'POST', body: '{}', headers: {Cookie: `sid=${sid}`}}, 8024)

	expect (rp3.responseJson.content).toBeNull ()
	
})
