/* eslint-disable import/no-unresolved */
const path = require('path')
const Koa = require('koa')
const cors = require('@koa/cors')
const Router = require('koa-router')
const koaBody = require('koa-body')
const qs = require('koa-qs')
const compress = require('koa-compress')
const logger = require('@brickyard/logger')
/* eslint-enable import/no-unresolved */

class CommonError extends Error {
	constructor(code, msg) { super(msg); this.code = code }

	get StatusCode() { return this.code }
}
// class InvalidParamError extends CommonError { constructor(msg = 'Invalid param(s)') { super(400, msg) } }
// class InternalError extends CommonError { constructor(msg = 'Internal server error') { super(500, msg) } }

logger.hackConsole()

const app = new Koa()
const router = new Router()

// todo
router.get('/', async (ctx) => {
	ctx.body = 'hello koa server'
})

app.proxy = true
app.use(cors({ credentials: true }))
qs(app)
app.use(compress())
app.use(koaBody({
	parsedMethods: ['POST', 'PUT', 'PATCH'],
	jsonLimit: '10mb',
	multipart: true,
	formidable: {
		onFileBegin: (name, file) => {
			// eslint-disable-next-line no-param-reassign
			file.path = path.join(path.dirname(file.path), file.name)
		},
	},
}))

app.use(async (ctx, next) => {
	try {
		await next()
	} catch (e) {
		console.error(e)
		if (e instanceof CommonError) {
			ctx.throw(e.StatusCode, e.message, { expose: true })
		} else {
			ctx.throw(500, e, { expose: true })
		}
	}
})
app.use(async (ctx, next) => {
	ctx.data = { ...ctx.request.query, ...ctx.request.body }
	ctx.method = (ctx.data.method || ctx.method).toUpperCase()
	await next()
})
const limitString = (str = '', limit = 512) => (str.length > limit ? `${str.substring(0, limit)}...` : str)
app.use(async (ctx, next) => {
	try {
		console.log(`${ctx.ip} ${ctx.method} ${ctx.path} >> ${limitString(JSON.stringify(ctx.data))}`)
		await next()
		console.log(`${ctx.ip} ${ctx.method} ${ctx.path} << ${ctx.status} ${limitString(JSON.stringify(ctx.body))}`)
	} catch (e) {
		console.log(`${ctx.ip} ${ctx.method} ${ctx.path} << ${ctx.status} ${e.message}`)
		throw e
	}
})

app.use(router.routes())
app.use(router.allowedMethods())

const port = Number(process.env.port) || 8080
app.listen(port, () => {
	console.log('server start', port)
})
