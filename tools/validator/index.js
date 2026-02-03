#!/usr/bin/env node

// Validates the tagged files for various errors.

const fs = require('fs').promises
const { checkConsistent, checkTags } = require("./validator.js")

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

				const results = { errors: [], warnings: [] }

				// check that the only difference from originals is the zwd tags
				const originalData = await fs.readFile(`bsb_usfm_original/` + file, 'utf8')
				checkConsistent(results, originalData, data)

				// parse and do checks against the parsed data
				checkTags(results, data)

				for (const error of results.errors)
				{
					console.error(`Error: ${error}`)
				}
				for (const warning of results.warnings)
				{
					console.warn(`Warning: ${warning}`)
				}
			}
		}
	}
	catch (err)
	{
		console.error('Error:', err)
	}

})
