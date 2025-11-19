const fs = require('fs');
const path = require('path');

function error(msg) {
	console.error('Error: ' + msg);
	process.exit(1);
}

const dir = process.argv[2];
if (!dir) { error('no directory argument provided'); }

const stats = fs.statSync(dir);
if (!stats.isDirectory()) { error(`"${dir}" is not a directory`); }

const entries = fs.readdirSync(dir);

const mdFiles = entries
	.sort((a, b) => a.localeCompare(b))
	.filter((name) => path.extname(name).toLowerCase() === '.md')
;

for (const name of mdFiles) {
	const fullPath = path.join(dir, name);
	const content = fs.readFileSync(fullPath, 'utf8');
	console.log(`\n--- ${name} ---\n${content}`);
}
