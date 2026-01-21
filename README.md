# bsb-wikidata
USFM Berean Standard Bible with additional markers linking entities to Wikidata. The text itself is unchanged.

## Progress
41MAT has all identifiable people marked, and rudimentary date markers.

## Markers
The following markers are being added to the USFM markup:

### zwd

**zwd** is a [character marker](https://ubsicap.github.io/usfm/characters/index.html) that links an identifiable person to a Wikidata item. It has one mandatory attribute **id**, which is the Wikidata Q-id of the person.

Example: `\zwd Abraham|id="Q9181"\zwd* was the father of \zwd Isaac|id="Q671872"\zwd*`

If a segment of text refers to multiple people at once, the id may be multiple comma-separated values.

Example: `the two \zwd sons of Zebedee|id="Q44015,Q43999"\zwd*`

zwd markers may be nested (for example, if a person is identified by their relationship to another): `He saw \zwd \zwd Peter|id="Q33923"\zwd*’s mother-in-law|id="Q23581940"\zwd* sick`

The primary goals of this tagging are to link the reader to supplementary information, and to connect references across the text.

Currently, pronouns and people who cannot be linked to a name with reasonable inference are not marked.

### zdate

**zdate** is a [standalone milestone](https://ubsicap.github.io/usfm/milestones/index.html) that indicates the date (and optionally, time) when the events being described occurred.

It can appear as a self-closing marker (`\zdate|date="-001813-01-01"\*`) or start/end marker (`\zdate-s|date="-001813-01-01"\*` and `\zdate-e\*`). **zdate** markers will not be nested.

It has one parameter **date**, which is an RFC 3339 date with a 6-digit expanded year (e.g. `-001813-01-01` or `-001813-01-01T12:00:00`).

Currently, dates, particularly before the first few centuries BC, may be estimates or guesses.

## Attribution Notice

The Berean Bible and Majority Bible texts are officially [dedicated to the public domain](https://creativecommons.org/publicdomain/zero/1.0/) as of April 30, 2023.

The modifications made in this repository are similarly dedicated to the public domain (CC0).

See [https://berean.bible/](https://berean.bible/terms.htm) for attribution and terms.
