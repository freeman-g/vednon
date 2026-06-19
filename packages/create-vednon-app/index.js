#!/usr/bin/env node
'use strict';

/*
 * create-vednon-app — scaffold a new Vednon workspace from a template.
 *
 * Modeled on create-vite: copy a real template folder into the target directory and do a
 * couple of string replacements. No templating engine, no remote download, no git init,
 * no package-manager detection (v1 scope).
 */

const fs = require('fs');
const path = require('path');
const { parseArgs } = require('node:util');
const prompts = require('prompts');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const PROJECT_NAME_TOKEN = /__PROJECT_NAME__/g;

// Files whose contents get token replacement (everything else is copied byte-for-byte).
const TEXT_FILE_EXTENSIONS = new Set([
	'.json', '.jsonc', '.md', '.txt', '.js', '.ts', '.css', '.html'
]);
// Template files renamed on copy (mirrors the create-vite `_gitignore` convention so the
// dotfile survives any future npm packaging).
const RENAME_ON_COPY = { _gitignore: '.gitignore' };

function listTemplates() {
	if (!fs.existsSync(TEMPLATES_DIR)) {
		return [];
	}
	return fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.map(entry => entry.name)
		.sort();
}

function isValidProjectName(name) {
	return typeof name === 'string'
		&& name.length > 0
		&& !name.startsWith('.')
		&& /^[A-Za-z0-9._-]+$/.test(name);
}

function isTextFile(fileName) {
	if (fileName === '_gitignore' || fileName === '.gitignore') {
		return true;
	}
	return TEXT_FILE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function copyTemplate(srcDir, destDir, projectName) {
	fs.mkdirSync(destDir, { recursive: true });
	for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
		const srcPath = path.join(srcDir, entry.name);
		const destName = RENAME_ON_COPY[entry.name] ?? entry.name;
		const destPath = path.join(destDir, destName);

		if (entry.isDirectory()) {
			copyTemplate(srcPath, destPath, projectName);
		} else if (isTextFile(entry.name)) {
			const content = fs.readFileSync(srcPath, 'utf8').replace(PROJECT_NAME_TOKEN, projectName);
			fs.writeFileSync(destPath, content, 'utf8');
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

function printHelp() {
	const templates = listTemplates();
	console.log(`
create-vednon-app — scaffold a new Vednon workspace

Usage:
  node index.js [project-name] [--template <name>]

Options:
  -t, --template <name>   Template to use (${templates.join(', ') || 'none found'})
  -h, --help              Show this help

With no arguments you'll be prompted for a project name and template.
`);
}

function fail(message) {
	console.error(`\nError: ${message}\n`);
	process.exit(1);
}

async function main() {
	let parsed;
	try {
		parsed = parseArgs({
			allowPositionals: true,
			options: {
				template: { type: 'string', short: 't' },
				help: { type: 'boolean', short: 'h' }
			}
		});
	} catch (err) {
		fail(`${err.message}\nRun with --help for usage.`);
	}

	if (parsed.values.help) {
		printHelp();
		return;
	}

	const templates = listTemplates();
	if (templates.length === 0) {
		fail(`No templates found in ${TEMPLATES_DIR}`);
	}

	let projectName = parsed.positionals[0];
	let template = parsed.values.template;

	// Prompt only for what wasn't supplied on the command line.
	const questions = [];
	if (!projectName) {
		questions.push({
			type: 'text',
			name: 'projectName',
			message: 'Project name:',
			initial: 'my-vednon-app',
			validate: value => isValidProjectName(value)
				? true
				: 'Use letters, numbers, dot, dash or underscore (and not starting with a dot).'
		});
	}
	// Only prompt for a template when there's a real choice; otherwise use the only one.
	if (!template && templates.length > 1) {
		questions.push({
			type: 'select',
			name: 'template',
			message: 'Select a template:',
			choices: templates.map(name => ({ title: name, value: name })),
			initial: 0
		});
	} else if (!template) {
		template = templates[0];
	}

	if (questions.length > 0) {
		const answers = await prompts(questions, {
			onCancel: () => {
				console.log('\nAborted.');
				process.exit(1);
			}
		});
		projectName = projectName || answers.projectName;
		template = template || answers.template;
	}

	if (!isValidProjectName(projectName)) {
		fail(`Invalid project name: "${projectName}"`);
	}
	if (!templates.includes(template)) {
		fail(`Unknown template "${template}". Available: ${templates.join(', ')}`);
	}

	const destDir = path.resolve(process.cwd(), projectName);
	if (fs.existsSync(destDir) && fs.readdirSync(destDir).length > 0) {
		fail(`Target directory "${projectName}" already exists and is not empty.`);
	}

	copyTemplate(path.join(TEMPLATES_DIR, template), destDir, projectName);

	const rel = path.relative(process.cwd(), destDir) || projectName;
	const codeScript = path.resolve(__dirname, '..', '..', 'scripts', 'code.sh');

	console.log(`\nScaffolded "${projectName}" from template "${template}".`);
	console.log(`\nNext steps:`);
	console.log(`  cd ${rel}`);
	console.log(`  npm install`);
	console.log(`  export VEDNON_BIN="${codeScript}"   # your Vednon launcher (set once)`);
	console.log(`  npm run dev`);
	console.log(`\n(or open the folder in Vednon and press F5 to run the extension)`);
	console.log('');
}

main().catch(err => fail(err && err.stack ? err.stack : String(err)));
