# Process overview

## What I built

I built *The Missing Night*, an interactive explanation of how artificial
skyglow removes our view of faint stars. The visitor moves one native range
control through the nine Bortle classes. A deterministic canvas star field,
the horizon glow and a plain-language observation change together. My point of
view is that city darkness is not empty or obsolete: it is an environmental
quality that lighting design can preserve. I kept the page static and the
visual explicitly illustrative, because pretending to predict the sky above a
specific Canberra address would undermine that argument.

## The moments that mattered

### 1. Making the constraint visible before making the page

The obvious response to an open explainer brief was to assemble several facts,
charts and interactions about light pollution. I instead treated “one strong
idea, and nothing else” as a testable limit. I carried forward rules about
grounding astronomy claims, keyboard operation and both marking viewports, then
replaced the starter test with a deliberately red contract: exactly one 1–9
range, nine ordered sky states, less visible starlight as the level rises,
non-colour status text and transparent sourcing. This made scope rejection part
of the harness rather than a late editing preference. The baseline failed
because the state model did not yet exist, then the same roster passed 20 tests
after implementation
([`0625870...6d15225`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-xty116/compare/0625870...6d15225)).

### 2. Refusing a fixed “before and after” image

A fixed dark-sky photograph with a coloured overlay looked plausible, but its
stars could not actually disappear; the interaction would have been decorative.
I generated only the Canberra-like ground and horizon, deliberately asking for
an empty sky. The browser now draws a seeded field of ordinary stars and a
denser Milky Way band, filtering both from the same state object that supplies
the written observation. That choice kept the visual, semantic status and test
contract on one source of truth. I verified it through the full build, lint and
test roster, then compared Class 4 and Class 9 in the rendered browser at both
marking widths. The contrast changed while the 186 KB ground asset stayed
constant
([`bf2923a`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-xty116/commit/bf2923a)).

### 3. Turning a resize failure into a permanent rule

The first desktop screenshot looked correct, and the page had no horizontal
overflow. The stronger check was to focus the range, set it to Class 9, and
resize from 1920 x 1080 to 390 x 844 without resetting. The state survived, but
the focused control caused the supposedly hidden scene to scroll internally by
460 pixels, pushing the title behind the navigation. Inspecting element bounds
showed that an absolute glow layer extended beyond the scene, so `overflow:
hidden` had still created a programmatically scrollable container. I bounded
the layer, changed the scene to `overflow: clip`, and added a `CLAUDE.md` rule
requiring `scrollHeight === clientHeight` during focused resize checks. The
retest held Class 9, returned internal scroll to zero, kept the title visible
and produced no console warnings
([`30ce249`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-xty116/commit/30ce249)).

### 4. Letting the deployment environment overrule the local preview

The ground image appeared locally, but the CI-equivalent link
crawler found that the built URL joined `BASE_URL` and `images` without a
slash. This would 404 under the GitHub Pages repository path. I fixed the join,
then did more than retry: I added a built-output test
for the exact public asset path and a harness rule requiring every preview to
be crawled under the repository base. The full roster increased to 21 passing
tests, and linkinator scanned all six links successfully. This was the check
that separated a convincing local artefact from a deployable one
([`90adcca`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-xty116/commit/90adcca)).
