const fs = require('fs')
const path = require('path')
const child_process = require('child_process')

child_process.execSync('yarn workspaces focus', { stdio: 'inherit' })

child_process.execSync('yarn create @umijs/umi-app', { stdio: 'inherit' })

const pj = require('./package.json')
pj.name = path.basename(__dirname)
pj.devDependencies = pj.devDependencies || {}
pj.devDependencies['@umijs/plugin-mono'] = 'workspace:*'
fs.writeFileSync('package.json', `${JSON.stringify(pj, null, 2)}\n`)

child_process.execSync('yarn workspaces focus', { stdio: 'inherit' })
