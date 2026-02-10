#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const filePath = process.argv[2]
if (!filePath) process.exit(1)

const brackets = ["()", "[]", "{}", "<>"]

let fileContent
try {
	fileContent = fs.readFileSync(path.resolve(filePath), 'utf-8')
} catch {
	process.exit(1)
}
const lines = fileContent.split('\n').filter(line => line.trim() !== '')

function parseList(lines, level = 0) {
	const result = []
	while (lines.length) {
		const line = lines[0]
		const stripped = line.trim()
		if (!stripped.startsWith('-')) { lines.shift(); continue }

		const indentLevel = line.match(/^\t*/)[0].length

		if (indentLevel < level) break
		else if (indentLevel > level) {
			const last = result.pop()
			const [nested] = parseList(lines, level + 1)
			result.push(last + ':' + nested)
		} else {
			result.push(stripped.replace(/^-\s*/, ''))
			lines.shift()
		}
	}

	if (level === 0) return [result.join(' || '), lines]

	const [openB, closeB] = brackets[(level - 1) % brackets.length].split('')
	return [openB + result.join(' || ') + closeB, lines]
}

const [nestedText] = parseList(lines)
console.log(nestedText)

