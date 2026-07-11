#!/usr/bin/env node

// Lists instances of Q20643955 (human biblical figure) who don't appear in the text

const fs = require('fs').promises
const UsfmParser = require("lite-usfm")

async function runQuery(query)
{
	const response = await fetch("https://query.wikidata.org/sparql", {
		method: 'POST',
		headers: {
			'User-Agent': `bsb-wikidata (https://github.com/BrianMacIntosh/bsb-wikidata) Node.js/${process.version}`,
			'Content-Type': 'application/sparql-query',
			'Accept': 'application/sparql-results+json'
		},
		body: query
	})
	if (response.status != 200)
	{
		console.log(response)
		console.error(`${response.status}: ${response.statusText}`)
		return null
	}
	else
	{
		return await response.json()
	}
}

// Searches a specified USFM json 'item' for zwd tags and removes the ids found from 'items'
function findZwds(items, item)
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
					for (var i = items.length - 1; i >= 0; --i)
					{
						if (items[i].id == id)
						{
							items.splice(i, 1)
						}
					}
				}
			}
			findZwds(items, content)
		}
	}
}

async function nop() {}
nop()
.then(async () => {

	try
	{
		//TODO: cache?
		const queryResult = await runQuery("SELECT ?item ?itemLabel ?itemDescription WHERE { ?item wdt:P31 wd:Q20643955. SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],mul,en\". }}")
		
		const items = []
		for (const binding of queryResult.results.bindings)
		{
			items.push({
				id: binding.item.value.substring(binding.item.value.lastIndexOf("/") + 1),
				label: binding.itemLabel?.value,
				desc: binding.itemDescription?.value
			})
		}

		const bsbDir = 'bsb_usfm'
		const files = await fs.readdir(bsbDir)
		for (const file of files)
		{
			if (file.toUpperCase().endsWith(".SFM"))
			{
				const data = await fs.readFile(bsbDir + `/` + file, 'utf8')
				const usfmHandler = new UsfmParser()
				try
				{
					usfmHandler.parse(data, (item) => {
						findZwds(items, item)
					})
				}
				catch (e)
				{
					console.error(e)
					console.error(`Failed to parse '${file}'.`)
				}
			}
		}

		for (const itemLeft of items)
		{
			console.log(`${itemLeft.id},${itemLeft.label},${itemLeft.desc}`)
		}
	}
	catch (err)
	{
		console.error('Error:', err)
	}

})
