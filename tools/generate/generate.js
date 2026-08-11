#!/usr/bin/env node

// Produces:
// * labels.json, a list of all the ways each Qid is referred to in the text.
// * occurrences.csv, a list of counts of appearances of each Qid

const fs = require('fs').promises
const path = require('node:path')
const UsfmParser = require("lite-usfm")

const labelsFilePath = "./generated/labels.json"
const occurrencesFilePath = "./generated/occurrences.csv"

// For each wikidata id, a set of labels harvested from the text
const harvestedLabels = {}

// For each wikidata id:
// * refCount[]: total count of all refs by type (1-3)
// * chapters: set of chapters where ref appears ("MAT 1")
// * chapters: set of verses where ref appears ("MAT 1:1")
const qidOccurrences = {}

// Searches a specified USFM json 'item' for zwd tags and logs them to global structures.
function searchContent(where, topLevelItem, item)
{
	const verseString = `${where.book} ${where.chapter}:${where.verse}`
	const chapterString = `${where.book} ${where.chapter}`
	if (item.content)
	{
		for (const content of item.content)
		{
			const idParam = content.params?.id || content.params?._default
			const refType = content.params?.t ? Number(content.params.t) : 1
			if (content.tag == "zwd" && idParam)
			{
				for (const id of idParam.split(','))
				{
					if (id == "nil") continue
					
					var labels = harvestedLabels[id]
					if (!labels) labels = harvestedLabels[id] = new Set()

					const label = UsfmParser.flattenContent(content.content)
					labels.add(label.replaceAll('  ', ' ').replaceAll(/[\[\]]/g, '')) //HACK: remove double whitespace

					var occurrences = qidOccurrences[id]
					if (!occurrences) occurrences = qidOccurrences[id] = { refCount: [0,0,0], books: new Set(), chapters: new Set(), verses: new Set() }

					occurrences.refCount[refType-1]++
					occurrences.books.add(where.book)
					occurrences.chapters.add(chapterString)
					occurrences.verses.add(chapterString)
				}
			}
			searchContent(where, topLevelItem, content)
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

						searchContent({ book:book, chapter:chapter, verse:verse }, item, item)

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

	// write labels list
	const harvestedLabelsArr = {}
	for (const id in harvestedLabels)
	{
		harvestedLabelsArr[id] = Array.from(harvestedLabels[id])
	}
	await fs.writeFile(labelsFilePath, JSON.stringify(harvestedLabelsArr, null, '\t'), 'utf8')

	// write occurrences list
	const occurrencesLines = [ "qid,totalRefs,totalPrimaryRefs,totalSecondaryRefs,verseRefs,chapterRefs,bookRefs,books" ]
	for (const qid in qidOccurrences)
	{
		const occurrence = qidOccurrences[qid]
		const refSum = occurrence.refCount.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
		const books = [...occurrence.books].join(";")
		occurrencesLines.push(`${qid},${refSum},${occurrence.refCount[0]},${occurrence.refCount[1]},${occurrence.verses.size},${occurrence.chapters.size},${occurrence.books.size},${books}`)
	}
	await fs.writeFile(occurrencesFilePath, occurrencesLines.join('\n'), 'utf8')
})
