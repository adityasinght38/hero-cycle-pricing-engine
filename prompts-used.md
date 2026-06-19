# Prompts Used

Logging these as required by the assignment. Used Claude and Copilot during the build.

---

**Breaking down the problem**

Asked Claude: *"given this brief about a cycle pricing engine replacing excel, help me think through what the actual requirements are — who uses it, what they need, edge cases"*

Helped me think through the price snapshot question specifically — whether old configs should update when prices change. Decided snapshot was the right call.

---

**MongoDB schema**

Me: *"i want to track price history in mongoose — every time currentPrice changes i want to log the old price + timestamp. pre-save hook?"*

Got the pre-save hook approach. Had to tweak it because the initial version was double-logging on the first save.

---

**The recalculate endpoint**

Me: *"write an express route that takes a saved config, fetches current prices for all its parts, updates priceAtTime on each part in the config, and returns old total + new total + diff"*

Worked mostly first try, just cleaned up the variable naming.

---

**React config builder**

Me: *"react component — left side is a checklist of parts, right side shows live price breakdown as you select. state is just selectedIds array."*

Generated the bones of it. Rewrote the GST section and the way parts filter by category.

---

**Unit tests**

Me: *"write jest tests for the pure pricing logic — total calculation, gst, validation — without hitting the db"*

All 13 tests passing.

---

**CSS / design**

Wrote most of the CSS myself, used Copilot for some of the repetitive badge color stuff.
