# BlastRadius Agent Instructions

## Core Principles
- **Product Thesis**: Reveal what a change could break before it happens, using AI to infer runtime dependencies, hidden couplings, call chains, and historical intent.
- **Do not invent or fake LatentForce APIs**. The product must be backed by real codebase discovery capabilities available via standard MCP / LatentCode integrations.
- **Structured Data over Text**: Output must be typed/validated schemas. Clearly separate observable evidence from AI inference.
- **Explainable Risk**: Risk models must be derived from observable signals (dependency breadth, call depth, historical sensitivity, etc.), not a single black-box LLM prompt.

## Setup & Architecture
- **Framework**: Next.js (App Router), TypeScript, TailwindCSS
- **Tooling**: `npm`
- **Design**: "Professional engineering diagnostic system", premium tool aesthetic, excellent typography and hierarchy.

## External References
| Need | File |
|------|------|
| BuildSprint Goals | `README.md` (to be created) |

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: LatentCode <bot@latentcode.dev>
```