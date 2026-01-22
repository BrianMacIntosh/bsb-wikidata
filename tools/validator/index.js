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

function recursiveCheckContents(lineNum, node)
{
	if (node.content)
	{
		for (const contentNode of node.content)
		{
			if (contentNode.tag == "zwd" && (!contentNode.params || contentNode.params.id === undefined))
			{
				console.error(`Error: Missing 'id' attribute on 'zwd' tag (at line ${lineNum})`)
			}
			recursiveCheckContents(lineNum, contentNode)
		}
	}
}
