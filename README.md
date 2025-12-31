# bsb-wikidata
USFM Berean Standard Bible with additional tags linking entities to Wikidata. The text itself is unchanged.

## Progress
41MAT has all identifiable people marked, and rudimentary date markers.

## Tags
The following tags are being added to the USFM markup:

### x-wd

**x-wd** is a [word-level attribute](https://ubsicap.github.io/usfm/attributes/index.html) that links an identifiable person to a Wikidata item. It has one mandatory parameter **id**, which is the Wikidata Q-id of the person.

Example: `\x-wd Abraham|id="Q9181"\x-wd* was the father of \x-wd Isaac|id="Q671872"\x-wd*`

If a segment of text refers to multiple people at once, the id may be multiple comma-separated values.

Example: `the two \x-wd sons of Zebedee|id="Q44015,Q43999"\x-wd*`

The primary goals of this tagging are to link the reader to supplementary information, and to connect references to people across the text.

Currently, pronouns and people who cannot be linked to a name with reasonable inference are not marked.

### x-date

**x-date** is a [standalone milestone](https://ubsicap.github.io/usfm/milestones/index.html) that indicates the date (and optionally, time) when the events being described occurred.

It can appear as a self-closing attribute (`\x-date|date="-001813-01-01"\*`) or start/end attribute (`\x-date-s|date="-001813-01-01"\*` and `\x-date-e\*`). **x-date** attributes will not be nested.

It has one parameter **date**, which is an RFC 3339 date with a 6-digit expanded year (e.g. `-001813-01-01` or `-001813-01-01T12:00:00`).

Currently, dates, particularly after the first few centuries BC, may be estimates or guesses.

## Attribution Notice

The Berean Bible and Majority Bible texts are officially [dedicated to the public domain](https://creativecommons.org/publicdomain/zero/1.0/) as of April 30, 2023.

The modifications made in this repository are similarly dedicated to the public domain (CC0).

See [https://berean.bible/](https://berean.bible/terms.htm) for attribution and terms.
