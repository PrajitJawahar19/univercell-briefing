# UniverCell Holding GmbH — a briefing

A 16-slide board briefing on **UniverCell Holding GmbH** (Flintbek, Germany) and the
global battery industry, written for an Indian audience. All money is shown in rupees.

**Open `index.html` in any browser.** No build step, no dependencies, no internet needed.

| | |
|---|---|
| ← → or space | move between slides |
| **G** | see all sixteen slides at once |
| **N** | show the speaker notes under the slide |
| **T** | switch between the light and dark versions |
| **F** | full screen |
| 1–9 | jump to a slide |
| Esc | close any panel |

Click the right-hand side of a slide to advance, the far left to go back, or swipe on a phone.
Every chart has a tooltip on hover. The URL carries the slide number, so `index.html#s9`
opens on slide 9.

## What is in here

```
index.html                       the deck
assets/
  data.js                        every figure, in one file, with the rupee conversion
  charts.js                      the chart primitives (plain inline SVG)
  deck.js                        navigation, and the chart instances
  notes.js                       speaker notes, one entry per slide
  deck.css                       the design system
downloads/
  UniverCell_Briefing_Deck.pptx  an editable PowerPoint of the same sixteen slides
  UniverCell_Speaker_Notes.pdf   printable notes, one slide per page
  UniverCell_Research_Report.pdf the long version, with every source numbered
```

## Changing a number

Every figure lives in `assets/data.js` and nothing is hard-coded into the slides' charts.
Edit the value there and the chart, the label and the tooltip all follow.

Foreign currency is converted once, at the top of that file:

```js
const FX = { USD: 95.24, EUR: 106.82, GBP: 123.00 };   // 19 October 2026
```

One rate is used for every year, so older figures are stated in today's rupees. That keeps
the shape of a trend honest. The original currency is kept beside each figure, so the
arithmetic can always be checked.

## The design

The palette is UniverCell's own. Their stylesheet names its colours after the materials on
a coating line, and this deck uses those names and those values so the two look related:

| | | |
|---|---|---|
| `--copper` | `#FF8D61` | the copper current collector |
| `--alu` | `#AFB3BB` | the aluminium cell housing |
| `--slurry` | `#121313` | the electrode paste |
| `--light` | `#F3F2EF` | their page background |

Chart colours are stepped darker than the raw brand hues so they hold contrast on the light
ground, and the set was checked for colour-blind separation before use.

Type is a single family. `Lato` is UniverCell's own face and is listed first; where it is not
installed the stack falls back to Helvetica Neue, Segoe UI, Roboto and Arial, all of which
set at a similar width.

## A note on the figures

Confidence varies and the deck says so. Anything contested is given as a range rather than a
single number, and slide 16 lists what could not be established at all. The long report in
`downloads/` carries the numbered source for every figure.

Data is current to **20 October 2026**. Battery-industry figures date quickly; check the
China export-control position and the European insolvency list before presenting this after
about January 2027.
