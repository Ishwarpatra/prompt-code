# LANDING-PAGE.md: Landing Page Plan

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Status: built as `static/index.html` (demo mode). This document records the reasoning and the reference. Colours, type and wording in the built page are Prompt Code's own; the reference supplied the structure only.

Reference supplied by the owner: https://brik.space/home ("this is how the landing page should look").

## 1. What was read from the reference (text only)
The page was opened as text. Section 2 adds what the owner's screenshots show.

- Navigation: Use cases, Tool gallery, Collections, Space mag, Product, About, Pricing; plus Sign in and a "Build a Tool" button.
- Hero headline with a small image set inline inside the sentence: "Build the [image] design tool you wish existed".
- One-line subheading explaining what the product does.
- A prompt-style input right in the hero: a plus button, the text "go on, make something", and a send arrow.
- A row of quick-start chips under the input: Image Effect, Logo Motion, Kinetic Typography, 3D Scene, Animated Gallery.
- An "Explore community" rail with a poster image, showing what others made.
- Page metadata suggests it was built on Base44.

## 2. What the screenshots show
The owner supplied four screenshots of the reference: the home hero, a generated tool, the "Use cases" page and the sign-up screen. The screenshots are not stored in this repository (they show another company's work). Colours below were measured from pixels in the first screenshot. Chip text was assumed to be the same dark colour as the headline.

### 2.1 Home hero
- Top bar: wordmark on the left, seven centred links, a "Sign in" text link, and a black square "Build a Tool" button at the top right.
- Headline: very large, two lines, centred, tight tracking and line spacing, with a small square image set between words.
- Subheading: centred, medium size, two lines.
- Input row: a wide input box with a small "+" button at its bottom-left, next to a same-height solid blue square button with a white up arrow.
- Chips: a row of small flat coloured labels under the input.
- Right edge: a vertical strip labelled "Explore community", with a chevron and stacked poster images.
- Shape language: no rounded corners, flat fills, hairline borders, large blocks.

| Item | Measured value |
|---|---|
| Page background | #FAFAFA |
| Input box | #EDEDED |
| Send button | #193EF9 |
| Top-right button | #1F1F1F |
| Headline text | #262626 |
| Chips | orange #FF942E, periwinkle #A199FF, green #36D972, pale pink #FFC0C0, hot pink #F955B2 |

Typefaces: a large geometric sans for the headline and body, and a small monospace for section tags such as "USE CASES". Font names are unknown. Identify them before reusing anything.

### 2.2 Generated tool screen
The result fills the page. A small white panel floats on the left with the tool's title and labelled sliders, each with a number box (Grid Resolution 400, Model Spacing 2, Contrast 11). The community strip stays on the right. Lesson: show the output large with a small control panel beside it.

### 2.3 Use cases page
A small bordered tag, a list of categories where the selected one is large and dark and the rest are pale, a large framed photo, a black "All Use Cases" button, a one-line caption and an underlined link.

### 2.4 Sign-up screen
A full-screen grid of hairline-bordered cells, some filled with images, behind a centred white card: heading, one line of text, a log-in link, three outlined sign-in buttons, an "or" divider, an email field, a black "Continue with Email" button, a legal line and a close button.

### 2.5 Contrast measured from the screenshots
| Pair | Ratio | Result |
|---|---|---|
| Headline #262626 on #FAFAFA | 14.5:1 | Good |
| Placeholder #595959 on #EDEDED | 6.0:1 | Good |
| White arrow on blue #193EF9 | 6.8:1 | Good |
| Dark chip text on orange, periwinkle, green, pale pink, hot pink | 6.9, 6.1, 8.2, 9.8, 5.0 | All pass 4.5:1 |
| Unselected use-case text #E1E1E1 on #FAFAFA | 1.25:1 | Fails badly. Do not copy |

### 2.6 Problems to avoid
- Pale list text at 1.25:1.
- A send button that shows only an arrow. Give Prompt Code's button a visible "Convert" label as well as an icon.
- Rotated vertical text in the side strip is harder to read. Keep text horizontal.
- A fixed side strip takes width on phones. The mobile layout was not seen.
- The viewport setting that blocks zoom (see section 5).

### 2.7 Still not seen
Mobile layout, motion, hover and focus states, and pages below the hero on the home page.

## 3. The pattern to learn
1. **The product is in the hero.** A visitor can start by typing, with no sign-up step first.
2. **One-click starts.** Chips pre-fill the input so nobody faces a blank box.
3. **Proof of possibility.** A rail of real examples shows what comes out.
4. **Short navigation and two clear actions.** Sign in, and start building.
5. **One memorable visual idea.** The image inside the headline. Pick one idea of your own; do not reuse theirs.

## 4. Proposed Prompt Code landing page
| Section | Content | Notes |
|---|---|---|
| Navigation | How it works, Prompt types, Examples, Resources, Try it | Short; skip link first |
| Hero | Headline "Turn a rough idea into a prompt that works"; one line: open-weight models by default, free to use | Final wording is the owner's |
| Hero input | Text box labelled "Your idea", a Convert prompt button | Same input component as the app |
| Quick-start chips | Class design, Data audit, Chatbot, Agent, Project | Each fills the box with an example idea |
| Result in place | Prompt appears under the input: recommended type and reason, which model answered, fallback notice if used | No page jump; reuse the app's result component |
| Examples rail | 4 to 6 before-and-after cards written by the team | Real examples only; no invented numbers |
| How it works | Three steps: paste, get a recommendation, copy or refine | A real sequence, so numbering is fine |
| Prompt types | Task to recommended type table | From the project plan |
| Reliability | If one model is busy, another takes over; you see which | Matches the app's behaviour |
| Resources | SKILL.md spec, example skill repositories, DevDocs | Add links only after they are checked |
| FAQ and footer | Free? Stored? What if a model is down? Own key? | Include acknowledgements for anything borrowed |

### 4.1 Visual direction for Prompt Code
- Flat, square, hairline grid on a near-white ground; one saturated colour reserved for the Convert action; a few flat chips for task types; one very large headline.
- Choose Prompt Code's own colours, typeface, headline image and wordmark. Do not reuse the reference's exact blue, chip palette, wordmark, images or headline wording. If the owner wants an exact match, record that decision and the brand and legal risk in STATUS.md.
- Hero: input box plus a large square Convert button labelled "Convert", with chips for Class design, Data audit, Chatbot, Agent, Project.
- Result screen: the prompt shown large, with a small floating panel for prompt type and model, plus the fallback notice when it applies.
- Prompt types section: styled like the use-cases list, but the unselected items must stay readable (at least 4.5:1).
- Examples strip: replaces "Explore community". Real examples only.
- Sign-in: only if the app has accounts. That is the owner's decision.

## 5. Accessibility rules for this page
- Do not block zoom. The reference page's viewport setting includes a maximum scale of 1, which can stop pinch-zoom on phones. Do not copy that.
- Skip link, visible keyboard focus, 44px touch targets, text contrast at least 4.5:1.
- The input has a visible label. The send button has an accessible name. Chips are real buttons.
- An image inside the headline must keep the headline readable as plain text, and the image gets empty alt text if decorative.
- Respect reduced-motion. No motion that cannot be paused.
- Light and dark themes. Test at 375px width and with keyboard only.

## 6. What not to copy
For a repeatable way to learn a layout from a link, see DESIGN-EXTRACTION.md (extract, keep the structure, replace the surface).

Another company's wordmark, headline wording, images, poster art, layout pixel for pixel, or distinctive styling. Take the structure and the ideas only. Log anything taken in REFERENCES.md section 11.

## 7. Open questions for the owner
1. Resolved: the landing page is `static/index.html`.
2. Resolved: principles only. The built page uses Prompt Code's own colours, type and wording; the reference supplied structure.
3. Do you want the hero input to work without sign-in?
4. Who writes the example cards?

## 8. Build checklist
- [x] Screenshots received and reviewed
- [ ] Copy approved by the owner
- [x] Hero input wired to the free-try route (/api/try), served by the demo backend until the Rust API exists
- [x] Chips, result in place, fallback notice
- [ ] Examples: the three on the page are labelled "Illustrative example". Replace with real outputs once the app runs
- [x] Automated checks passed (contrast, structure, labels, no inline scripts or styles, 19 simulated-browser tests). Still to do by hand: screen reader, phone, zoom to 200%
- [x] Borrowing log: structure ideas only from the reference; no assets, wording, colours or fonts copied. Fonts are system fonts.
- [x] CODEMAP updated with the new files

## 9. As built
- Free try on the page, limited, no sign-in; sign-in needed for everything else (see AUTH-AND-ACCESS.md).
- Headline ends with a text-cursor bar instead of the reference's inline image. Chips, flat square shapes and hairline frame follow the plan; the action colour is yellow, not the reference's blue.
- Prompt-type browser, three illustrative examples, reliability section, free-versus-account table, resources, FAQ.
- No side strip. Examples sit in a normal section so the page works at any width.

## 10. Design decisions and reasons (R-31)
One line per major decision. These are the reasons the build stands on; the owner confirms or changes them. They can move into a `DESIGN.md` if finding 14 is approved.

| Decision | Reason |
|---|---|
| Yellow is the one accent: the Convert button and selected options | It marks the two moments that matter, where to act and what is chosen. Yellow reads like a text highlighter, which suits a tool that marks up prompts. Ink on yellow measures 12.65:1 |
| Everything else is neutral: near-white ground, near-black ink, grey rules | So the accent is the only colour asking for attention. Green, amber and red tints exist only for success, warning and error messages |
| Square corners, no shadows, no glow | The product is two panes, input and output, like an editor. Hard edges and flat fills keep both panes readable without decoration |
| Hairline frame and ruled sections | Rules group content the way margins do in a document, so spacing does the work instead of boxed cards with shadows |
| Example chips are outlined and not colour-coded | The five ideas are the same kind of thing, so they look the same. The outline shows they are buttons and gives each an edge (16.57:1 against the page) |
| A text-cursor bar ends the headline | The product writes text, so a cursor is the one repeated gesture. It is static, which matches a MOTION level of 1 (hover only) |
| Serif headline, system sans for controls, monospace for generated prompts | Three voices for three jobs: title, interface, and text meant to be copied. System fonts send no visitor data to a font server. The serif face varies by device (finding 11, still open) |
| Converter: input left, result right, stacked on phones | The task reads left to right: idea in, prompt out |
| Landing page puts the free try first | The product is its own demo, so a visitor can use it before reading anything |
| Free versus account is a table | It is a real comparison: rows of features, two columns |
| Prompt types are a list with one detail panel | There are seven types and a visitor wants one at a time. The selected item takes the accent |
| Light and dark follow the system setting | Both themes are measured for contrast without a toggle (finding 17, still open) |
| Loading, empty and error states use plain words | Each says what is happening or what to do next (R-27) |
