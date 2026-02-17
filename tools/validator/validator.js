
const UsfmJsonParser = require("lite-usfm")

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
			if (possibleParams.match(/^id="(Q[0-9]+)?(,Q[0-9]+)*"( t="[123]")?$/)
				|| possibleParams.match(/^(Q[0-9]+)?(,Q[0-9]+)*$/)
				|| possibleParams == 'nil' || possibleParams == 'id="nil"')
			{
				return possibleClose + 5
			}
			else
			{
				throw `Couldn't understand 'zwd' tag parameters (at line ${lineNum}).`
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
			if (possibleParams == ''
				|| possibleParams.match(/^date="([\-+][\-0-9]+)?"$/)
				|| possibleParams.match(/^date="(Q[0-9]+(?::P[0-9]+)?(?::Q[0-9]+:P[0-9]+)?)([\+>](?:[A-Za-z]+(?:![0-9]+)?|P\-?[0-9A-Z]+)+)*"$/)
				|| possibleParams.match(/^min="(Q[0-9]+(?::P[0-9]+)?(?::Q[0-9]+:P[0-9]+)?)([\+>](?:[A-Za-z]+(?:![0-9]+)?|P\-?[0-9A-Z]+)+)*" max="(Q[0-9]+(?::P[0-9]+)?(?::Q[0-9]+:P[0-9]+)?)([\+>](?:[A-Za-z]+(?:![0-9]+)?|P\-?[0-9A-Z]+)+)*"$/)
				|| possibleParams.match(/^[\-+][\-0-9]+$/)
				|| possibleParams.match(/^(Q[0-9]+(?::P[0-9]+)?(?::Q[0-9]+:P[0-9]+)?)([\+>](?:[A-Za-z]+(?:![0-9]+)?|P\-?[0-9A-Z]+)+)*$/))
			{
				return endIndex + 2
			}
			else
			{
				throw `Couldn't understand 'zdate' tag parameters (at line ${lineNum}).`
			}
		}
	}
	return 0
}

function checkConsistent(resultBuffer, originalText, newText)
{
	var originalI = 0
	var newI = 0
	var lineNum = 1
	for (; originalI < originalText.length && newI < newText.length; )
	{
		try
		{
			var newNewI = isZwdOpen(newText, newI) || isZwdClose(lineNum, newText, newI) || isZdate(lineNum, newText, newI)
		}
		catch (e)
		{
			resultBuffer.errors.push(e)

			originalI = originalText.indexOf('\n', originalI)
			newI = newText.indexOf('\n', newI)
		}

		if (resultBuffer.errors.length > 15)
		{
			resultBuffer.errors.push(`Too many errors; stopping.`)
			return
		}

		//const debug = newText.substring(newI)
		if (newNewI)
		{
			newI = newNewI
			continue
		}
		else if (originalText[originalI] != newText[newI])
		{
			// mismatched text
			resultBuffer.errors.push(`Text altered from original (at line ${lineNum}).`)
			
			originalI = originalText.indexOf('\n', originalI)
			newI = newText.indexOf('\n', newI)
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

function checkTags(resultBuffer, newText)
{
	const parser = new UsfmJsonParser()
	const parsed = parser.parse(newText)
	for (var lineNum = 0; lineNum < parsed.length; ++lineNum)
	{
		recursiveCheckContents(resultBuffer, lineNum + 1, [parsed[lineNum]])
	}
}

function recursiveCheckContents(resultBuffer, lineNum, nodeStack)
{
	const node = nodeStack.at(-1)
	if (node.content)
	{
		for (const contentNode of node.content)
		{
			if (contentNode.tag == "zwd")
			{
				if (nodeStack[0].tagClass == "s")
				{
					resultBuffer.errors.push(`'zwd' shouldn't be inside 's' (at line ${lineNum})`)
				}
				else if (nodeStack.some((node) => node.tag == "f"))
				{
					resultBuffer.errors.push(`'zwd' shouldn't be inside 'f' (at line ${lineNum})`)
				}
				else if (contentNode.params?.id === undefined && contentNode.params?._default === undefined)
				{
					resultBuffer.errors.push(`Missing 'id' attribute on 'zwd' tag (at line ${lineNum})`)
				}
			}
			nodeStack.push(contentNode)
			recursiveCheckContents(resultBuffer, lineNum, nodeStack)
			nodeStack.splice(nodeStack.length - 1, 1)
		}
	}
}

module.exports = {
	checkConsistent: checkConsistent,
	checkTags: checkTags
}
