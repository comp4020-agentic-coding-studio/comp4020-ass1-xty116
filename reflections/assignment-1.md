# Assignment 1 reflection

## What was the breakthrough that moved the work forward?

The breakthrough was separating the photographed ground from the simulated
sky. My first mental model was a beautiful night photograph that became hazier
as the slider moved. That would have changed the mood, but not the information:
every star in the photograph would still be present. Leaving the generated sky
empty and drawing deterministic stars in Canvas made the interaction become the
explanation. The same nine-state model could now decide which stars remain,
how much Milky Way structure survives, and what the status text says. It also
made the visual honest enough to label as illustrative rather than pretending
to be measured Canberra data.

## What did this work change about who I want to be as a developer?

I want to be a developer who tests the uncomfortable transition, not only the
polished default state. The page initially passed its code checks and looked
good at both viewport sizes when opened separately. It still broke when I
focused the slider and resized mid-interaction. Finding the hidden internal
scroll required trusting the rendered page over the CSS I thought I had
written. More importantly, the correction became a rule in `CLAUDE.md`, so the
next agent has to verify that path instead of relying on my memory. I now see a
harness less as a collection of formatting preferences and more as accumulated
evidence of where my assumptions have failed.
