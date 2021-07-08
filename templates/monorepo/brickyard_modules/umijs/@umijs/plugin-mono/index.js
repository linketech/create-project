// ref:
// - https://umijs.org/plugins/api

import { join } from 'path'
import { readdirSync } from 'fs'

const extraBabelIncludes = readdirSync(join(__dirname, '..', '..', '..'), { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory())
	.map((dirent) => join(__dirname, '..', '..', '..', dirent.name))

export default (api) => {
	api.logger.info('using @umijs/plugin-mono', extraBabelIncludes)

	api.modifyConfig((memo) => ({
		...memo,
		extraBabelIncludes,
	}))
}
