#!/usr/bin/env node

// Validates the tagged files for various errors.

const fs = require('fs').promises
const UsfmJsonParser = require("lite-usfm")

async function nop() {}

nop()
.then(async () => {

	try
	{
		const bsbDir = 'bsb_usfm'
		const files = await fs.readdir(bsbDir)
		for (const file of files)
		{
			if (file.toUpperCase().endsWith(".SFM"))
			{
				console.log(`Validating '${file}'...`)
				const data = await fs.readFile(bsbDir + `/` + file, 'utf8')

				// check that the only difference from originals is the zwd tags
				const originalData = await fs.readFile(`bsb_usfm_original/` + file, 'utf8')
				checkConsistent(originalData, data)

				// parse and do checks against the parsed data
				const parser = new UsfmJsonParser()
				const parsed = parser.parse(data)
				for (var lineNum = 0; lineNum < parsed.length; ++lineNum)
				{
					recursiveCheckContents(lineNum + 1, parsed[lineNum])
				}
			}
		}
	}
	catch (err)
	{
		console.error('Error:', err)
	}

})

function isZwdOpen(text, index)
{
	const candidate = text.substring(index, index + 5)
	if (candidate == '\\zwd ') return index + 5
	else if (candidate == '\\zwd\\') return index + 4
	else return 0
}

function isZwdClose(lineNum, text, index)
{
	if (text[index] == '|')
	{
		const possibleClose = text.indexOf('\\zwd*', index)
		if (possibleClose >= 0)
		{
			const possibleParams = text.substring(index + 1, possibleClose)
			if (possibleParams.match(/^id="[Q0-9,]*"( t="[12]")?$/)
				|| possibleParams.match(/^[Q0-9,]*$/))
			{
				return possibleClose + 5
			}
			else
			{
				console.error(`Error: 'zwd' tag has invalid parameters (at line ${lineNum}).`)
			}
		}
	}
	return 0
}

function isZdate(lineNum, text, index)
{
	const candidate = text.substring(index, index + 7)
	if (candidate == '\\zdate|')
	{
		const endIndex = text.indexOf('\\*', index + 7)
		if (endIndex >= 0)
		{
			const possibleParams = text.substring(index + 7, endIndex)
			if (possibleParams.match(/^date="[\-+][\-0-9]+"$/)
				|| possibleParams.match(/^date="Q[0-9]+(:P[0-9]+)?(:Q[0-9]+:P[0-9]+)?(\+P\-?[0-9]+[A-Z])?"$/)
				|| possibleParams.match(/^[\-+][\-0-9]+$/)
				|| possibleParams.match(/^Q[0-9]+(:P[0-9]+)?(:Q[0-9]+:P[0-9]+)?(\+P\-?[0-9]+[A-Z])?$/))
			{
				return endIndex + 2
			}
			else
			{
				console.error(`Error: 'zdate' tag has invalid parameters (at line ${lineNum}).`)
			}
		}
	}
	return 0
}

function checkConsistent(originalText, newText)
{
	var originalI = 0
	var newI = 0
	var lineNum = 1
	for (; originalI < originalText.length && newI < newText.length; )
	{
		var newNewI = isZwdOpen(newText, newI) || isZwdClose(lineNum, newText, newI) || isZdate(lineNum, newText, newI)
		//const debug = newText.substring(newI)
		if (newNewI)
		{
			newI = newNewI
			continue
		}
		else if (originalText[originalI] != newText[newI])
		{
			// mismatched text
			console.error(`Error: Original text altered (at line ${lineNum})`)
			return
		}
		else
		{
			if (originalText[originalI] == '\n') lineNum++

			// matched text
			originalI++
			newI++
		}
	}
}

function recursiveCheckContents(lineNum, node)
{
	if (node.content)
	{
		for (const contentNode of node.content)
		{
			if (contentNode.tag == "zwd" && contentNode.params?.id === undefined && contentNode.params?._default === undefined)
			{
				console.error(`Error: Missing 'id' attribute on 'zwd' tag (at line ${lineNum})`)
			}
			recursiveCheckContents(lineNum, contentNode)
		}
	}
}
