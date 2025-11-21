const fs = require('fs');
const path = require('path');

function error(msg) {
	console.error('Error: ' + msg);
	process.exit(1);
}

// TODO: rm debug dir
const dir = process.argv[2] ?? '/home/cxrvus/obsidian/Cxrvus/Material/Test';
if (!dir) { error('no directory argument provided'); }

const stats = fs.statSync(dir);
if (!stats.isDirectory()) { error(`"${dir}" is not a directory`); }

const dirFileNames = fs.readdirSync(dir);

const tocName = `+TOC.md`;
const tocLink = aliasLink(tocName, 'TOC');

const mdFiles = dirFileNames
	.sort((a, b) => a.localeCompare(b))
	.filter(name => path.extname(name).toLowerCase() === '.md')
	.map(name => ({
		name,
		id: String(Math.floor(Math.random() * 1000000)).padStart(6, '0'),
		fullPath: path.join(dir, name),
	}))
	.map(file => ({
		...file,
		content: fs.readFileSync(file.fullPath, 'utf8'),

	}))
	.map(file => ({
		...file,
		outlinks: fetchLinks(file.content),
		backlinks: [tocLink],
	}))
;

// insert backlinks
mdFiles.forEach(sourceFile => 
	sourceFile.outlinks.forEach(link =>
		mdFiles.find(targetFile =>
			targetFile.name != sourceFile.name &&
			targetFile.name == link.target + '.md' 
		)?.backlinks.push(simpleLink(sourceFile.name))
	)
);

// todo: turn backlinks into a Set

// todo: TOC content
const tocContent = "todo";
const tocFile = { name: tocName, content: tocContent };
mdFiles.push(tocFile);

mdFiles
	.forEach(file => console.log(JSON.stringify({...file, content:''}, null, 2)));

function fetchLinks(content) {
	const links = [];
	const linkRegex = /(!)?\[\[([^\]]+?)\]\]/g;
	let match;

	while ((match = linkRegex.exec(content)) !== null) {
		const
			embed = Boolean(match[1]),
			inner = match[2],
			pipeIndex = inner.indexOf('|'),
			targetPart = pipeIndex >= 0 ? inner.slice(0, pipeIndex).trim() : inner.trim(),
			alias = pipeIndex >= 0 ? inner.slice(pipeIndex + 1).trim() : null,
			hashIndex = targetPart.indexOf('#'),
			target = hashIndex >= 0 ? targetPart.slice(0, hashIndex).trim() : targetPart,
			anchor = hashIndex >= 0 ? targetPart.slice(hashIndex + 1).trim() : null,
			raw = match[0]
		;

		if (anchor === null && !target.includes('.')) {
			links.push({
				raw,
				target,
				anchor,
				alias,
				embed,
			});
		}
	}

	return links;
}

function simpleLink(fileName) {
	return aliasLink(fileName, null);
}

function aliasLink(fileName, alias) {
	const target = fileName.endsWith('.md') ? fileName.substring(0, fileName.length-3) : fileName;

	return {
		target,
		raw: `[[${target}]]`,
		anchor: null,
		alias: null,
		embed: false,
	}
}
