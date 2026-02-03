
const { checkConsistent, checkTags } = require("./validator.js")

document.getElementById("fileForm").addEventListener("submit", (e) => {

	e.preventDefault()

	const resultsParent = document.getElementById("results")
	resultsParent.innerHTML = `<p>Working...</p>`

	try
	{
		const fileInput = document.getElementById("fileInput")
		const file = fileInput.files[0]
		if (file)
		{
			const reader = new FileReader();
			reader.onload = async function(e) {
				try
				{
					var resultString = "<h2>Results</h2><ul>"

					var newContent = e.target.result;
					const originalTextUrl = `https://raw.githubusercontent.com/BrianMacIntosh/bsb-wikidata/refs/heads/main/bsb_usfm_original/${file.name}`
					resultsParent.innerHTML = `<p>Loading original text...</p>`
					const fetchRes = await fetch(originalTextUrl);
					if (fetchRes.status >= 400)
					{
						resultsParent.innerHTML = `<h2>Results</h2><p><li style="color:red">Failed to load original text: check filename is unchanged.</p>`
						return
					}
					
					var oldContent = await fetchRes.text()
					resultsParent.innerHTML = `<p>Comparing...</p>`
					
					// normalize line returns
					oldContent = oldContent.replaceAll("\r\n", "\n")
					newContent = newContent.replaceAll("\r\n", "\n")

					const results = { errors: [], warnings: [] }
					checkConsistent(results, oldContent, newContent)
					checkTags(results, newContent)
					for (const error of results.errors)
					{
						resultString += `<li style="color:red">Error: ${error}</li>`
					}
					for (const warning of results.warnings)
					{
						resultString += `<li style="color:orange">Warning: ${warning}</li>`
					}
					if (results.errors.length == 0 && results.warnings.length == 0)
					{
						resultString += `<li style="color:darkgreen">File is valid.</li>`
					}

					resultsParent.innerHTML = resultString + "</ul>"
				}
				catch (e)
				{
					resultsParent.innerHTML = `<h2>Results</h2><p><li style="color:red">Unhandled exception.</p>`
					console.log(e)
				}
			};
			reader.onerror = function() {
				throw `FileReader error`
			};
			reader.readAsText(file, 'UTF-8');
		}
		else
		{
			throw `No file.`
		}
	}
	catch (e)
	{
		resultsParent.innerHTML = `<h2>Results</h2><p><li style="color:red">Unhandled exception.</p>`
		console.log(e)
	}

})
