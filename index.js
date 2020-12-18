#!/usr/bin/env node
const path = require('path')
const cp = require('child_process')
const fs = require('fs-extra')
const { Command } = require('commander')
const updateNotifier = require('update-notifier')
const pkg = require('./package.json')

updateNotifier({ pkg, updateCheckInterval: 3600 }).notify()

const templates = fs.readdirSync(path.join(__dirname, 'templates'))

const program = new Command()
program
	.version(pkg.version)

program
	.command('ls', { isDefault: true })
	.alias('list')
	.description('list available project templates')
	.action(() => {
		console.log('Available project templates:')
		templates.forEach((e) => console.log(`    ${e}`))
	})

templates.forEach((template) => {
	program
		.command(`${template} <name>`, { executableFile: path.join(__dirname, 'templates', 'eslint', 'index.js') })
		.description(`Create a project with ${template} config`)
		.option('-i, --install', 'run npm install after creation', false)
		.action(async (name, options) => {
			try {
				const distDir = path.join(process.cwd(), name)
				console.log('creating eslint project to', distDir)
				await fs.ensureDir(distDir)
				await fs.copy(path.join(__dirname, 'templates', template), distDir)

				const packageJsonFilePath = path.join(distDir, 'package.json')
				const packageJson = JSON.parse(await fs.readFile(packageJsonFilePath))
				packageJson.name = name
				const packageJsonContent = `${JSON.stringify(packageJson, null, 4)}\n`
				await fs.writeFile(packageJsonFilePath, packageJsonContent)

				if (options.install) {
					cp.execSync('npm i', { cwd: distDir, stdio: 'inherit' })
				}
			} catch (e) {
				console.error(e)
			}
		})
})

program.parse(process.argv)
