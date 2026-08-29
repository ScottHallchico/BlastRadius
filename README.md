# BlastRadius

An advanced engineering diagnostic tool built during the **LatentForce.ai BuildSprint**.

BlastRadius helps engineers answer one critical question before they ship:
> **"If I make this change, what could I actually break?"**

## The Problem
Standard static analysis tools and IDEs trace explicit source-level dependencies (like `import` statements). But in modern microservices and event-driven architectures, the most dangerous breakages occur at boundaries that static analysis misses:

- **Implicit runtime couplings** (e.g., Redis Pub/Sub channels, shared message queues).
- **Cross-service dependencies** disguised as opaque string contracts.
- **Architectural invariants** documented in ADRs but not enforced in code.
- **Historical engineering decisions**.

## The Solution: BlastRadius + LatentForce
BlastRadius uses the **LatentForce** codebase discovery API (simulated here via LatentCode MCP context extraction) to perform semantic and structural investigations of a codebase.

When a change is proposed (e.g., "Replace Redis event publisher with Kafka"), BlastRadius:
1. Orchestrates targeted `glob`, `grep`, and `read` searches across the repository.
2. Discovers implicit dependencies (e.g., finding the matching Redis subscriber in another module).
3. Cross-references documentation and Architecture Decision Records (ADRs).
4. Emits a structured, evidence-backed **Risk Assessment** and **Verification Plan**.

## Running the App

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Visit `http://localhost:3000` to interact with the BlastRadius dashboard.

## Demo Scenario
The included `demo-repo/` folder contains a realistic hidden coupling:
- `OrderService` publishes to a Redis channel called `order-events`.
- `NotificationService` subscribes to that channel, but *there is no direct code dependency* between them.
- `ADR-012.md` states an invariant: the `ORDER_CREATED` schema must remain backward compatible.

Typing *"Replace Redis with Kafka"* into the BlastRadius UI will trigger the LatentForce engine to discover these hidden linkages and flag the change as **HIGH RISK**.
# BlastRadius
