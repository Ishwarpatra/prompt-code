# REFERENCES.md: Research and Resources

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Purpose: sources behind the skill files and architecture, for the report and the app's Resources section.

Last checked: 31 Oct 2026. "Confirmed" means the paper's arXiv page, abstract or full text was seen during checking. Confirmed does not mean the whole paper was read. Read each paper before quoting it in the report.

## 1. Confirmed papers

| Title | Authors | Source | What it covers | Notes |
|---|---|---|---|---|
| Agent Skills for Large Language Models: Architecture, Acquisition, Security, and the Path Forward | Renjun Xu, Yang Yan | arXiv 2602.12430 (submitted 12 Feb 2026, revised 2 Jun 2026) | Survey of the skill layer: SKILL.md, progressive context loading, link to MCP, skill acquisition, security. Proposes a four-tier trust and governance framework. Abstract cites an analysis finding 26.1% of community skills contain vulnerabilities | arXiv comments say it was accepted at the Agent Skills '26 Workshop. Project repo: github.com/scienceaix/agentskills |
| Reinforcement Learning for Self-Improving Agent with Skill Library (SAGE) | Jiongxiao Wang et al. (AWS Agentic AI) | arXiv 2512.17102 (Dec 2025, revised Mar 2026) | Skill Augmented GRPO for self-Evolution. On AppWorld: 8.9% higher Scenario Goal Completion, 26% fewer steps, 59% fewer tokens | Code: github.com/amazon-science/SAGE |
| Agent Skills Can Be Harmful: An Empirical Study of Skill-Induced Failures in LLM Agents | Yu Hua, Fan Yang, Gen Dong, Yanjie Gao, Liqun Li | arXiv 2608.11888 | Found 307 skill-induced failures (125 functional, 182 efficiency regressions). Seemingly relevant skills often cause wrong or missing implementation. Regressions are not explained by prompt length alone | Done with Microsoft Research involvement |
| SkillOps: Managing LLM Agent Skill Libraries as Self-Maintaining Software Ecosystems | Xinyuan Song, Hongji Pu, Liang Zhao | arXiv 2605.13716 (13 May 2026) | "Skill technical debt"; typed skill contracts; graph of skills; health checks across utility, compatibility, risk and validation. 79.5% task success on ALFWorld as a standalone agent | |
| A Survey of Agent Skills: Toward Procedural Infrastructure for LLM Agents | Cehao Yang, Xiaojun Wu, Honghao Liu, Xueyuan Lin and others; corresponding authors Hui Xiong, Jian Guo | Preprints.org 202605.1276 (submitted 13 May 2026, posted 19 May 2026) | Six-layer taxonomy: ontology, representation and packaging, lifecycle, runtime integration, governance, applications. Defines a skill as a reusable procedural abstraction between memory and rules. Reports that curated skills help more than self-generated ones | Not peer-reviewed. Companion list: github.com/DataArcTech/Awesome-Agent-Skill-Papers. Supplied phrase "form-factored procedural memory" not seen in the text I read |

## 2. Corrections to the summary originally supplied
1. SkillOps title: the paper is "Self-Maintaining Software Ecosystems", not "Self-Correcting Ecosystems".
2. SkillOps link: the supplied link (arXiv 2608.11888) is the Harmful Skills paper. The SkillOps paper is arXiv 2605.13716.
3. Harmful Skills claim: the supplied summary said too many skills collapse retrieval and hurt performance past a critical library size. The abstract I saw does not say that. Its findings are that relevant-looking skills can cause failures and efficiency regressions. A separate survey (Dynamic Agent Skills, below) reports that flat retrieval can degrade as libraries grow. Cite each claim to the paper that makes it.

## 3. Not yet confirmed
| Title (as supplied) | Status |
|---|---|
| A Survey on Agent Skills: Externalized Procedural Knowledge in Language Models (Google Research listing) | Not opened [verify] |
| Skill-Pro: Learning Reusable Skills from Experience via Non-Parametric PPO (Mi et al., 2026) | Named in Table 2 of the preprints.org survey as a PPO-style skill-evolution method, so it exists. The paper itself was not opened; authors and year unconfirmed [verify] |
| PolySkill: Learning Generalizable Skills Through Polymorphic Abstraction (Yu et al., arXiv 2510.15863) | Not opened [verify] |
| Paper lists: github.com/baibizhe/Awesome-Skills-Paper, github.com/DataArcTech/Awesome-Agent-Skill-Papers | The DataArcTech list is named by the preprints.org survey as its companion resource. Neither list was opened [verify] |

## 4. Related papers found while checking (abstracts or snippets only)
| Title | Source | Why it matters |
|---|---|---|
| Dynamic Agent Skills: A Lifecycle Survey and Taxonomy of Evolving Skill Libraries | arXiv 2607.10113 | Eight-stage lifecycle; reports that admission and repair matter and flat retrieval can degrade as libraries grow |
| SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? | arXiv 2603.15401 | In its tests, 39 of 49 skills (about 80%) changed pass rate by zero; three lowered it; skills can raise token use |
| Demystifying Agent Skills: Why They Work, Until They Don't | arXiv 2608.14036 | Skills mostly act as procedural anchors; they fail when retrieved wrongly or followed too rigidly |
| The Regression Tax: Decomposing Why Skills Help and Hurt LLM Agents | Tank and Nama, 2026 | Skills can lower results through context presence, grounding and verification displacement |
| SkillsVote: Lifecycle Governance of Agent Skills | arXiv 2605.18401 | Governed skill libraries with evidence-gated updates |

## 5. GitHub skill resources (from one search, not opened)
| Resource | Use |
|---|---|
| github.com/agentskills/agentskills | SKILL.md specification |
| github.com/anthropics/skills | Example skills |
| github.com/addyosmani/agent-skills | Engineering skills, orchestration, personas |
| github.com/VoltAgent/awesome-agent-skills | Large curated list |
| github.com/skillmatic-ai/awesome-agent-skills | Talks, patterns, guides |
| github.com/seb1n/awesome-ai-agent-skills | About a hundred ready-to-use skills |

## 6. Gateways, documentation tools, design
| Topic | Source |
|---|---|
| Model fallback and gateways | docs.litellm.ai, openrouter.ai/docs |
| Offline documentation | devdocs.io, zealdocs.org, Dash (Mac) |
| Rust docs | doc.rust-lang.org, docs.rs, cargo doc |
| Interface patterns | linear.app, vercel.com, raycast.com (from memory, not verified) |
| Landing page patterns | Show the product in the hero, minimal meaningful motion, accessible, dark and light themes (one web search) |

## 7. How the research shapes the project
| Finding | Decision |
|---|---|
| Skills can help, do nothing, or hurt; most had no effect in one benchmark | Keep the skill set small. Test a skill before keeping it. Remove skills that add cost without benefit |
| Relevant-looking skills can still cause wrong or extra work | Skills state limits and checks. Agents must not follow a skill rigidly when the task differs |
| Skill libraries gather technical debt | Treat skill files like code: version them, review changes, record who changed what |
| Flat retrieval may degrade as libraries grow | INDEX.md maps each problem to one file so an agent loads only what it needs |
| Community skills carry security risk | security-skills.md; review any third-party skill before use; no secrets in skill files |

## 8. For the app's Resources section
Short list: SKILL.md specification, two or three example skill repositories, DevDocs. One line per link. Add after links are checked.

## 9. For the report
Cite only sources you have read. For each, give exact title, authors, year, and link as shown in section 1.

## 10. Design references (open source and sample UIs)

Source: one web search. None of these were opened. Read each project's licence before using any of its code, designs or text. [verify] all entries.

### 10.1 Component libraries and starting points
| Resource | What it is | Fit for Prompt Code |
|---|---|---|
| shadcn/ui (github.com/shadcn-ui) | Accessible, customizable components you copy into your project; built on Radix UI and Tailwind | Good design reference. React and Tailwind based, so copy ideas, not code, if the interface is plain HTML served by Rust |
| Radix UI Primitives | Low-level accessible component building blocks | Reference for keyboard and screen-reader behavior |
| shadcn-templ (unofficial port for Go and templ) | Shows the shadcn pattern outside React | Evidence the pattern can move to non-React stacks; not Rust |
| Magic UI | Animated React components | Use sparingly; motion must serve a purpose |
| UIAble, Interlace UI, usva | Extended shadcn-style libraries; Interlace states a WCAG 2.2 AA target | Check the claim yourself before relying on it |

### 10.2 Curated lists to browse for sample UIs
| List | Use |
|---|---|
| github.com/alexpate/awesome-design-systems | Real design systems from companies and governments; study structure, tokens, voice and tone |
| github.com/darelova/Awesome-Design-Resources-List | Design tools, articles, inspiration |
| github.com/al-husayn/awesome-ui-resources, github.com/designdetails-io/awesome-ui-resources | Modern UI libraries, systems and tools |
| github.com/dalisoft/awesome-ui-libraries | UI libraries, templates, dashboard and landing templates |
| github.com/birobirobiro/awesome-shadcn-ui, github.com/bytefer/awesome-shadcn-ui, github.com/2-fly-4-ai/awesome-shadcnui | Examples, blocks, starters, themes |

### 10.3 Tools for checking design and accessibility
| Tool | What it does (from a one-line summary) |
|---|---|
| memi | Reads a frontend repo; reports accessibility and design-system issues tied to files; gives agents context. MIT licensed, runs with npx |
| shadcn agent-first linter for Tailwind design systems | Rules that agents can verify. Only useful if Tailwind is adopted |

Extraction tools that read a design from a website link are listed in DESIGN-EXTRACTION.md.

### 10.4 Sample landing pages and UI galleries (from earlier searches)
SaaSFrame, saaslandingpage.com, and the landing-page roundups found earlier. Patterns noted: show the product in the hero, keep motion meaningful, use dark and light themes, make accessibility visible. Also: Brik (brik.space/home), supplied by the owner as the target look for the landing page; read as text and four owner screenshots. See agent/docs/LANDING-PAGE.md.

### 10.5 Inspiration galleries (supplied by the owner)
Source: a list supplied by the owner. Descriptions are as supplied. None were opened here [verify]. These show other people's work; use them to study layout, hierarchy, type and flow, not to copy. Check each site's terms.

| Site | Link | What it is (as supplied) | Useful for |
|---|---|---|---|
| Siteinspire | siteinspire.com | Clean, filterable showcase of agency, studio and portfolio sites | Overall layout and typography |
| Mobbin | mobbin.com | Large library of shipped mobile and web app screens, flows and patterns | Real app patterns: input forms, results, errors, empty states |
| Dribbble | dribbble.com/tags/web-design-inspiration | Community of landing pages, UI shots and interactive components | Visual ideas; designs there are often concepts, not shipped products |
| Httpster | httpster.net | Curated live websites, strong on typography, layout and variety | Type and layout |
| Minimal Gallery | minimal.gallery | Clean, minimalist layouts with filters | Restrained, uncluttered pages |
| Land-book | land-book.com (link not given in the list) | Landing page structure and conversion design | Landing page structure |
| One Page Love | onepagelove.com | Single-page websites and portfolios | One-page structure |
| Godly Website | godly.website | Cutting-edge web design with stack and platform notes | Ideas on motion and tech; use sparingly |

Best matches for Prompt Code's job (input on one side, result on the other, with error and fallback states): Mobbin for app flows and states, Minimal Gallery for restraint, Land-book and One Page Love only if a landing page is added. The UI in `static/` is built; use these to compare and refine it, not to replace it.

Record anything you take from these in the borrowing log (section 11).

## 11. How to use references responsibly

1. **Refer, do not copy.** Take structure, spacing, hierarchy and patterns. Build the look yourself.
2. **Check the licence first.** Record it. MIT and similar permit reuse with a notice; anything unclear or non-commercial means do not copy.
3. **Keep a borrowing log.** For each thing taken: source link, licence, what was used, where in the project. Put it in the report.
4. **Credit sources.** Add an Acknowledgements section to the app or README for anything reused.
5. **Do not copy another company's brand.** No logos, names, or distinctive trade dress.
6. **Match the stack.** React or Tailwind code does not drop into a Rust-served page; port the idea.
7. **Keep what you pick small.** One type scale, one accent colour, a few components. Fewer parts are easier to keep accessible.
8. **Test what you keep.** Keyboard only, 375px width, light and dark themes, contrast checks.
9. **Do not trust claims.** A library saying it meets an accessibility standard still needs your own check.
10. **Galleries show other people's work.** Study layout, hierarchy, type and flow. Never copy a design, image or text from them.

### Borrowing log template
| Item | Source link | Licence | What was used | Where | Date |
|---|---|---|---|---|---|
| | | | | | |

## 12. What to include in the report about design
- Which references were studied and what each taught you.
- What you borrowed, with licences (use the log above).
- Your design tokens: colours, type, spacing, radius.
- Accessibility checks you ran and results.
- Screenshots of main, fallback, error and empty states.
- What you chose not to do, and why.

## 13. Event resources (Hacktoberfest 2026 participant guide)
Supplied by the owner as a .docx. The guide transcribes links from promotional cards and slides; none were opened here, and short links may redirect. The full list, with how each is used for Prompt Code, is in SUBMISSION.md section 6. Main groups: the Open-Source AI challenge page, Gemma quickstart and API docs, DigitalOcean starter kit and libraries, MLH submission and DEV write-up pages, and the MLH Code of Conduct. The guide warns that credits, swag and free access are conditional; Prompt Code does not rely on them.
