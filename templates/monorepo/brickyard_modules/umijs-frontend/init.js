const fs = require('fs')
const path = require('path')
const child_process = require('child_process')

function rmTemp() {
	if (fs.existsSync('temp')) {
		fs.rmdirSync('temp', { recursive: true, force: true })
	}
}

rmTemp()
child_process.execSync('npm create umi temp', { stdio: 'inherit' })
if (process.platform === 'win32') {
	child_process.execSync('powershell -c "cp -force -r temp/* ."', { stdio: 'inherit' })
} else {
	child_process.execSync('powershell -c "mv -f temp/* ."', { stdio: 'inherit' })
}

const pj = require('./package.json')
pj.name = path.basename(__dirname)
pj.devDependencies = pj.devDependencies || {}
pj.devDependencies['@umijs/plugin-mono'] = 'workspace:*'
delete pj.devDependencies['@umijs/preset-dumi']
fs.writeFileSync('package.json', `${JSON.stringify(pj, null, 2)}\n`)

child_process.execSync('yarn workspaces focus', { stdio: 'inherit' })
rmTemp()

fs.mkdirSync('node_modules/umi_open_api', { recursive: true })
