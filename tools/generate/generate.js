#!/usr/bin/env node

// Produces:
// * labels.json, a list of all the ways each Qid is referred to in the text.

const fs = require('fs').promises
const path = require('node:path')
const UsfmParser = require("lite-usfm")

const labelsFilePath = "./generated/labels.json"

// For each wikidata id, a set of labels harvested from the text
const harvestedLabels = {}

// Searches a specified USFM json 'item' for zwd tags and logs them to global structures.
function searchContent(location, topLevelItem, item)
{
	if (item.content)
	{
		for (const content of item.content)
		{
			const idParam = content.params?.id || content.params?._default
			if (content.tag == "zwd" && idParam)
			{
				for (const id of idParam.split(','))
				{
					var labels = harvestedLabels[id]
					if (!labels) labels = harvestedLabels[id] = new Set()

					const label = UsfmParser.flattenContent(content.content)
					labels.add(label.replaceAll('  ', ' ').replaceAll(/[\[\]]/g, '')) //HACK: remove double whitespace
				}
			}
			searchContent(location, topLevelItem, content)
		}
	}
}

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
				var book = file.substring(2, 5), chapter = 0, verse = 0

				const data = await fs.readFile(bsbDir + `/` + file, 'utf8')
				const usfmHandler = new UsfmParser()
				try
				{
					usfmHandler.parse(data, (item) => {
						
						if (item.tag == 'v') verse = item.num
						else if (item.tag == 'c') chapter = item.num

						searchContent(`${book} ${chapter}:${verse}`, item, item)

					})
				}
				catch (e)
				{
					console.error(e)
					console.error(`Failed to parse '${file}'.`)
				}
			}
		}
	}
	catch (err)
	{
		console.error('Error:', err)
	}

})
.then(async () => {

	await fs.mkdir(path.dirname(labelsFilePath), { recursive: true })

	const harvestedLabelsArr = {}
	for (const id in harvestedLabels)
	{
		harvestedLabelsArr[id] = Array.from(harvestedLabels[id])
	}
	await fs.writeFile(labelsFilePath, JSON.stringify(harvestedLabelsArr, null, '\t'), 'utf8')
})
