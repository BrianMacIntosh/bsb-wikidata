# bsb-wikidata
USFM Berean Standard Bible with additional markers linking entities to Wikidata. The text itself is unchanged.

## Progress
![Book progress badges](assets/progress.svg)

## Markers
The following markers are being added to the USFM markup:

### zwd

**zwd** is a [character marker](https://ubsicap.github.io/usfm/characters/index.html) that links an identifiable person to a Wikidata item. Attributes for zwd are:
* **id** (mandatory): the Wikidata Q-id of the person.
* **t** (optional, default **1**): the type of the reference. **1** (primary) means the character is present in the story or the general context around it. **2** (secondary) means the character is only being referred to.

Example: `\zwd Abraham|id="Q9181"\zwd* was the father of \zwd Isaac|id="Q671872"\zwd*`

The `id` parameter is the default parameter, so e.g. `\zwd Abraham|Q9181\zwd*` may also be used.

If a segment of text refers to multiple people at once, the id may be multiple comma-separated values.

Example: `the two \zwd sons of Zebedee|Q44015,Q43999\zwd*`

zwd markers may be nested (for example, if a person is identified by their relationship to another): `He saw \zwd \zwd Peter|Q33923\zwd*’s mother-in-law|Q23581940\zwd* sick`

The primary goals of this tagging are to link the reader to supplementary information, and to connect references across the text.

Currently, pronouns and people who cannot be linked to a name with reasonable inference are not marked.

### zdate

**zdate** is a [standalone milestone](https://ubsicap.github.io/usfm/milestones/index.html) that indicates the date (and optionally, time) when the events being described occurred.

Markers look like `\zdate|date="Q302"\*` or `\zdate|Q302\*`.

It has one parameter **date**, which can be:
* A Wikidata ID, indicating that the date is the date of that entity (e.g. `Q302`). Properties checked dates are, in order of priority, P585, P580, P569, or P571.
* A Wikidata ID and property (e.g. `Q302:P570`), indicating that the date is the value of that property.
* A Wikidata ID, property, property value, and qualifier property (e.g. `Q334739:P39:Q26835654:P580`), indicating that the date is the value of that qualifier.

**date** can also be made relative by appending one or more of the following:
* A `+` and an ISO 8601 duration to add that relative duration (ex: `Q302:P570+P-40D`).
* A `>` and a month name to advance to the next occurrence of that month.
These will be evaluated in order.

## Attribution Notice

The Berean Bible and Majority Bible texts are officially [dedicated to the public domain](https://creativecommons.org/publicdomain/zero/1.0/) as of April 30, 2023.

The modifications made in this repository are similarly dedicated to the public domain (CC0).

See [https://berean.bible/](https://berean.bible/terms.htm) for attribution and terms.
