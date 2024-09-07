![workflow](https://github.com/do-/node-doix-http-cookie-redis/actions/workflows/main.yml/badge.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

`node-doix-http-cookie-redis` is a plug in for the [`doix`](https://github.com/do-/node-doix) framework providing an HTTP cookie based session mechanism using [Redis](https://redis.io) for state storage.

# Installation
```
npm install doix-http-cookie-redis
```
# Usage
In your [WebService](https://github.com/do-/node-doix-http/wiki/WebService) descendant:

```js
const {WebService} = require ('doix-http')
const {CookieRedis} = require ('doix-http-cookie-redis')

module.exports = class extends WebService {
  constructor (app, o) {
    super (/*...*/)
    new CookieRedis ({
//      name: 'sid',
//      ttl: 60,
//      prefix: 'session_',
        db: {
          host: "127.0.0.1",
          port: 6379,
        },
    }).plugInto (this)
  }
}
```

After that for each [`job`](https://github.com/do-/node-doix/wiki/Job) produced with that WebService:
* if the incoming HTTP request has the cookie `name` set, its value will be considered the session ID and `job.user` will be fetched from the Redis cache by the key `prefix + ID`;
* if by the `end` event the `job.user` property is defined an not `null`, the Redis cache will contain the JSON serialized `job.user` value stored by the corresponding key to be expired in `ttl` minutes;
* if `job.user` is null or undefined on `start` but defined and not `null` by the `end`, a new session ID will be generated (as [crypto.randomUUID](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)) and the `Set-Cookie` HTTP header will be issued to store it on the client;
* if `job.user` defined and not `null` on `start` but is null or undefined by the `end` the `Set-Cookie` HTTP header will be issued to erase the previously used session ID.

# Options
| Name | Type | Default | Description | Note
| ---- | -- | -- | -- | -- |
| `name` | String |  | name of the cookie |
| `ttl` | int |  | time to live, in minutes | multiplied by 60, passed to the Redis [set](https://redis.io/commands/set/) command as the `EX` option
| `db` | String | `undefined` | Redis connection name | the Redis [connection](https://github.com/redis/node-redis) must be available as `this [options.db]` in a [Job](https://github.com/do-/node-doix/wiki/Job) instance
| `prefix` | String |  `''` | prepended to the session ID to form the key for Redis cache |
