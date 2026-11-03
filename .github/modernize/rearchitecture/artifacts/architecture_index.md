# Architecture Index

## Implementation Guide

This index is not the full contract. Do not implement from this file alone; follow the artifact paths below.

### Global artifacts

- `unit_graph.yaml`
  - Who reads: all implementation workers.
  - Use: external entry points, ownership, dependencies, exported signatures, shared references.
  - How to consume: find the assigned unit; source anchors prove current behavior and are not automatically a rewrite scope.
- `shared_modules.yaml`
  - Who reads: workers using shared files.
  - Use: shared types and utilities, migration strategy, exact exported field whitelist.
  - How to consume: filter `used_by_units`; ensure `shared_refs[].used_fields` are a subset of listed fields.
- `wire_contracts.yaml`
  - Who reads: workers handling API/file boundaries.
  - Use: HTTP and file payload shapes, errors, and compatibility requirements.
  - How to consume: filter by `unit`.
- `cross_unit_state.yaml`
  - Who reads: Admin, Guru, and generator workers.
  - Use: `localStorage` and browser-event state exchanged across units.
  - How to consume: filter rows where writer or reader matches the assigned unit.
- `project-structure.md`, `tech-stack.md`, `data-model.md`
  - Who reads: all workers/design/review.
  - Use: global application boundaries, current dependencies, and existing data types/file contracts.
- `seams.yaml` and `migration_boundary.yaml` are intentionally omitted: this request documents the existing application and does not declare a migration/cutover or frozen-side seam.

## Unit: app-shell

- External trigger: opening the browser app, with hash `#/admin` or `#/guru`.
- Must read:
  - `units/app-shell/behavior.yaml` — routing, default route, visible navigation.
  - `units/app-shell/bindings.yaml` — entry point and hash listener.
  - `units/app-shell/unit_decomposition.yaml` — advisory split candidates only.
- Relevant global rows: dependencies in `unit_graph.yaml`; no shared refs or external wire contract.
- Before DONE report: artifact paths read; preserved routes/default; tests/build evidence.

## Unit: admin-research

- External trigger: `#/admin`.
- Must read:
  - `units/admin-research/behavior.yaml` — import, storage, final-test gate, aggregation/error behavior.
  - `units/admin-research/bindings.yaml` — tab/page wiring and browser state.
  - `units/admin-research/unit_decomposition.yaml` — optional candidates, not decided structure.
- Relevant global rows:
  - `wire_contracts.yaml`: `unit: admin-research`.
  - `shared_modules.yaml`: rows whose `used_by_units` includes `admin-research`.
  - `cross_unit_state.yaml`: rows whose writer/reader is `admin-research`.
- Before DONE report: artifacts read, preserved import/export/gate semantics, unresolved UI-only workflow gaps, tests/build evidence.

## Unit: teacher-evaluation

- External trigger: `#/guru`.
- Must read:
  - `units/teacher-evaluation/behavior.yaml` — blind placement, scoring, autosave, navigation.
  - `units/teacher-evaluation/bindings.yaml` — profile, file inputs, browser storage.
  - `units/teacher-evaluation/unit_decomposition.yaml` — advisory candidates only.
- Relevant global rows:
  - `wire_contracts.yaml`: `unit: teacher-evaluation`.
  - `shared_modules.yaml`: rows whose `used_by_units` includes `teacher-evaluation`.
  - `cross_unit_state.yaml`: rows whose writer/reader is `teacher-evaluation`.
- Before DONE report: artifacts read, preserved five criteria/27-column workbook/A-B behavior, tests/build evidence.

## Unit: live-generator

- External trigger: researcher opens live-generator dialog from Admin.
- Must read:
  - `units/live-generator/behavior.yaml` — health checks, serial chat pair, failures.
  - `units/live-generator/bindings.yaml` — modal state and URL/key handling.
  - `units/live-generator/unit_decomposition.yaml` — advisory candidates only.
- Relevant global rows:
  - `wire_contracts.yaml`: `unit: live-generator`.
  - `shared_modules.yaml`: rows whose `used_by_units` includes `live-generator`.
  - `cross_unit_state.yaml`: rows whose writer/reader is `live-generator`.
- Before DONE report: artifacts read, `/health` and `/chat` payload compliance, DPO availability behavior, API key remains memory-only, tests/build evidence.
