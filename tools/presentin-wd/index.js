#!/usr/bin/env node

// Lists objects that are "present in work" for Biblical chapters, but not tagged there

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
		// Query for all the items that are "present in" the book
		const bookId = "Q42040" //TODO: pass arg
		const bookCode = "67REV"
		const queryResult = await runQuery(
`SELECT ?item ?itemLabel ?itemDescription ?chapterLabel WHERE
{ wd:${bookId} wdt:P527 ?chapter.
 ?item wdt:P1441 ?chapter.
 FILTER NOT EXISTS { ?item wdt:P31 [wdt:P279* wd:Q16334295]. }
 FILTER NOT EXISTS { ?item wdt:P31 [wdt:P279* wd:Q2221906]. }
 FILTER NOT EXISTS { ?item wdt:P31 [wdt:P279* wd:Q22813674]. }
 FILTER NOT EXISTS { ?item wdt:P31 [wdt:P279* wd:Q2472587]. }
 SERVICE wikibase:label {bd:serviceParam wikibase:language "mul,en".}
}`)
		
		// Sort them into an array (by chapter)
		const items = []
		for (const binding of queryResult.results.bindings)
		{
			const chapter = binding.chapterLabel.value.split(' ').at(-1);
			const chapterNumber = Number(chapter)
			if (!items[chapterNumber]) items[chapterNumber] = []
			items[chapterNumber].push({
				id: binding.item.value.substring(binding.item.value.lastIndexOf("/") + 1),
				label: binding.itemLabel?.value,
				desc: binding.itemDescription?.value,
				chapter: chapterNumber
			})
		}

		const bsbDir = 'bsb_usfm'
		const data = await fs.readFile(bsbDir + `/${bookCode}BSB.SFM`, 'utf8')
		const usfmHandler = new UsfmParser()
		var chapter = undefined
		try
		{
			usfmHandler.parse(data, (item) => {
				if (item.tag == 'c') chapter = item.num
				if (items[chapter]) findZwds(items[chapter], item)
			})
		}
		catch (e)
		{
			console.error(e)
			console.error(`Failed to parse '${file}'.`)
		}

		for (const chapterItems of items)
		{
			if (chapterItems)
			{
				for (const itemLeft of chapterItems)
				{
					console.log(`${itemLeft.chapter},${itemLeft.id},${itemLeft.label},${itemLeft.desc}`)
				}
			}
		}
	}
	catch (err)
	{
		console.error('Error:', err)
	}

})
