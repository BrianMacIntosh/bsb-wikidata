#!/usr/bin/env node

// Produces progress badges from progress.csv

const fs = require('fs').promises

async function nop() {}

nop()
.then(async () => {

	const progressData = await fs.readFile(`./progress.csv`, 'utf8')
	const lines = progressData.split('\n')

	const badgeCount = lines.length - 1
	const badgeWidth = 37
	const badgeHeight = 20
	const padding = 2
	var maxWidth = 700
	const badgesX = Math.floor(maxWidth / badgeWidth)
	maxWidth = badgesX * badgeWidth + (badgesX - 1) * padding
	const badgesY = Math.ceil(badgeCount / badgesX)
	const maxHeight = badgesY * badgeHeight + (badgesY - 1) * padding

	var result =
`<svg xmlns="http://www.w3.org/2000/svg" width="${maxWidth}" height="${maxHeight}" role="img" aria-label="Progress">
<title>Progress</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="r"><rect width="${badgeWidth}" height="${badgeHeight}" rx="3" fill="#fff"/></clipPath>`

	const template = await fs.readFile(`./tools/badges/template.svg`, 'utf8')

	for (var i = 1; i < lines.length; ++i)
	{
		const line = lines[i].trim()
		const parts = line.split(',')

		const bookCode = parts[0]
		var bgColor
		if (parts[1] == 'all' && parts[2] == 'all' && parts[3] == 'all')
			bgColor = "#4c1"
		else if (parts[1] == 'all' && parts[2] == 'all')
			bgColor = "#a4a61d"
		else if (parts[1] != '' || parts[2] != '' || parts[3] != '')
			bgColor = "#dfb317"
		else
			bgColor = "#555"

		result += template
			.replaceAll('$LABEL', bookCode)
			.replaceAll('$BGCOLOR', bgColor)
			.replaceAll('$OFFSETX', ((i - 1) % badgesX) * (badgeWidth + padding))
			.replaceAll('$OFFSETY', Math.floor((i - 1) / badgesX) * (badgeHeight + padding))
	}

	result += `</svg>`

	await fs.writeFile(`./assets/progress.svg`, result, 'utf8')

})
