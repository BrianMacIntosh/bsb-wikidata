#!/usr/bin/env node

// Produces progress badges from progress.csv

const fs = require('node:fs/promises');
const interpolate = require('color-interpolate').default;

const bsbDir = 'bsb_usfm'

const badgeCount = 65
const badgeWidth = 37
const badgeHeight = 20
const padding = 2
var maxWidth = 700
const badgesX = Math.floor(maxWidth / badgeWidth)
maxWidth = badgesX * badgeWidth + (badgesX - 1) * padding
const badgesY = Math.ceil(badgeCount / badgesX)
const maxHeight = badgesY * badgeHeight + (badgesY - 1) * padding

function countZwdTags()
{

}

async function produceSvg(colorCallback)
{
	var result =
`<svg xmlns="http://www.w3.org/2000/svg" width="${maxWidth}" height="${maxHeight}" role="img" aria-label="Progress">
<title>Progress</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="r"><rect width="${badgeWidth}" height="${badgeHeight}" rx="3" fill="#fff"/></clipPath>`

	const template = await fs.readFile(`./tools/badges/template.svg`, 'utf8')
	
	const files = await fs.readdir(bsbDir)
	for (var i = 0; i < files.length; i++)
	{
		const file = files[i]
		if (file.toUpperCase().endsWith(".SFM"))
		{
			const data = await fs.readFile(bsbDir + `/` + file, 'utf8')

			const bookCode = file.substring(2, 5)
			const bgColor = colorCallback(bookCode, data)

			result += template
				.replaceAll('$LABEL', bookCode)
				.replaceAll('$BGCOLOR', bgColor)
				.replaceAll('$OFFSETX', (i % badgesX) * (badgeWidth + padding))
				.replaceAll('$OFFSETY', Math.floor(i / badgesX) * (badgeHeight + padding))
		}
	}

	result += `</svg>`
	return result
}

async function nop() {}

nop()
.then(async () => {

	const zwdresult = await produceSvg((bookCode, data) => {

		// count tags
		var zwdTotalCount = 0
		var zwdEmptyCount = 0
		
		var next = data.indexOf("\\zwd*")
		while (next >= 0)
		{
			zwdTotalCount++
			next = data.indexOf("\\zwd*", next + 1)
		}

		var next = data.indexOf("|\\zwd*")
		while (next >= 0)
		{
			zwdEmptyCount++
			next = data.indexOf("|\\zwd*", next + 1)
		}

		var emptyRatio = zwdEmptyCount / zwdTotalCount

		if (zwdTotalCount == 0)
		{
			return "#555"
		}
		else if (emptyRatio > 0.5)
		{
			return "#F55"
		}

		const colormap = interpolate(["#4c1", "#dfb317", "#F55"])
		return colormap(emptyRatio * 2)
	})

	await fs.writeFile(`./assets/zwd-progress.svg`, zwdresult, 'utf8')

})
