# 3D Ontology Map Design

Date: 2026-04-18
Status: Approved for planning

## Goal

Replace the root page's current 2D radial ontology visualization with a 3D ontology map that:

- preserves the wiki's ontology structure as the primary model
- provides stronger visual depth and motion on the homepage
- supports click-to-preview behavior before navigation
- remains responsive on desktop and mobile

## Current State

The root page currently renders [src/pages/index.tsx](/home/hhk7734/.superset/projects/wiki/src/pages/index.tsx) with a client-only [RadialTree](/home/hhk7734/.superset/projects/wiki/src/components/RadialTree.tsx) SVG built from Docusaurus docs metadata.

The current implementation already solves two important problems:

- deriving ontology sections from Docusaurus global docs data
- resolving document metadata for human-readable labels

The new design should preserve those data sources rather than introducing a second ontology pipeline for the homepage.

## Chosen Approach

Use a hybrid 3D graph:

- render the homepage scene with `react-force-graph-3d`
- derive a structured graph from the existing ontology tree data
- constrain the force layout so role clusters and hierarchy remain legible
- show a preview panel when a node is selected instead of navigating immediately

This is preferred over a fully custom `three` scene because it reaches a better 3D result faster while still letting the ontology shape remain recognizable.

## Scope

In scope:

- replace the homepage visualization
- add a 3D graph scene
- add node selection and preview UI
- add doc navigation from the preview UI
- preserve ontology-role grouping and document labels
- support mobile and desktop interaction

Out of scope:

- editing ontology content
- changing docs classification or frontmatter
- adding search behavior to the homepage
- building a separate graph API or backend

## Data Model

The homepage graph will be derived entirely on the client from the same Docusaurus-generated inputs currently used by `RadialTree`.

### Node Types

- `root`: the site root node
- `role`: one of the ontology section roots such as `Entity` or `Concept`
- `group`: intermediate category nodes created from the doc path segments
- `doc`: terminal wiki documents

### Node Shape

Each graph node should include:

- `id`
- `label`
- `type`
- `depth`
- `role`
- `docId` for document nodes
- `href` for document nodes
- `description` when available from metadata
- `childCount` for non-leaf nodes

### Link Shape

Each graph link should include:

- `source`
- `target`
- `kind`

`kind` is primarily for styling and future tuning; the initial implementation only needs parent-child ontology links.

## Components

### `src/pages/index.tsx`

Keep the page as a lightweight shell that mounts the homepage visualization inside `BrowserOnly`.

### `src/components/OntologyGraph3D.tsx`

New primary homepage component responsible for:

- building graph data
- rendering the 3D scene
- handling camera defaults and interaction state
- coordinating selection state with the preview panel

This should replace direct usage of `RadialTree` on the root page.

### `src/components/ontologyGraph/buildOntologyGraph.*`

New data utility responsible for converting Docusaurus docs metadata into graph nodes and links. This isolates ontology extraction from rendering and makes it testable. The exact extension can follow the repository's testable module pattern as long as it remains easy to import from the homepage component.

### `src/components/ontologyGraph/OntologyPreviewPanel.tsx`

New overlay component responsible for:

- showing selected node metadata
- rendering description, ontology context, and counts
- exposing the primary navigation action for doc nodes

### `src/components/ontologyGraph/ontologyGraph.types.ts`

Shared types for graph nodes, links, and selected-node state.

## Interaction Design

### Default State

- the graph fills the viewport below the site chrome
- the camera starts far enough back to show the whole ontology
- no preview panel is shown until a node is selected

### Hover

- hover changes the cursor and lightly emphasizes the node
- hover may show a short label hint, but hover alone must not trigger large overlays

### Click

- clicking a node selects it
- clicking a document node opens the preview panel with title, description, ontology path, and an `Open document` action
- clicking a structural node opens the preview panel with label, role, and child counts
- clicking empty space clears the selection

### Navigation

- navigation happens from the preview panel, not directly from raw node click
- the preview panel should use standard Docusaurus links so routing behavior stays consistent

### Mobile

- the preview panel becomes a bottom sheet
- labels are reduced to selected and nearby nodes only
- drag and orbit remain enabled, but defaults should avoid over-sensitive controls

## Visual Design

The scene should look intentional rather than purely technical.

### Visual Direction

- dark or near-dark canvas for depth contrast
- distinct color palette by ontology role
- subtle link glow and atmospheric depth fog
- brighter emphasis for selected nodes
- restrained labels to avoid unreadable clutter

### Role Coloring

Use a stable color mapping for role recognition across the graph and preview UI. Exact colors can be finalized during implementation, but each ontology role should have its own visible identity.

### Label Density

Do not attempt to render every label at full prominence at once. Initial label rules:

- always show the root label
- show selected node label
- show role labels
- selectively show document labels based on depth, selection, or camera distance

## Layout Behavior

The graph should not collapse into an undifferentiated force cloud.

Initial layout rules:

- root node stays near the center
- role nodes stay on a wider ring or sphere around the root
- descendant nodes attract toward their parent role cluster
- link distance and charge should vary by node type
- document nodes should be lighter and more numerous than structural nodes

The goal is visual motion with readable clusters, not perfect physical simulation.

## Error Handling

- if docs metadata cannot be resolved, render a lightweight fallback state instead of a blank page
- if a selected node has incomplete metadata, the preview panel should still render the available label and type
- if 3D rendering fails on a client, the page should degrade to a simple explanatory fallback rather than crashing the root page

## Performance

- keep graph generation linear relative to the current docs tree size
- avoid per-frame React state churn from camera movement
- keep text rendering limited to an intentionally small subset of nodes
- prefer memoized graph construction from static metadata
- test interaction on a narrow mobile viewport before merge

## Testing Strategy

### Unit Tests

Add tests for the graph builder to verify:

- ontology sections become role nodes
- intermediate path segments become structural group nodes
- document leaves produce doc nodes with stable IDs
- links connect parent and child nodes correctly
- labels prefer sidebar label or title when available

### Manual Verification

Verify:

- root page renders without SSR breakage
- graph loads on desktop and mobile viewport sizes
- selecting a doc node opens the correct preview
- selecting a structural node opens a non-navigation preview
- `Open document` routes correctly to the target doc
- empty-space click clears selection

### Project Validation

Run:

- `npm run ontology:bootstrap`
- `npm run ontology:validate`
- `npm run build`

These checks already align with repository requirements for ontology-related and site-level changes.

## Risks

### Label Clutter

If too many labels render, the homepage becomes unreadable. The implementation should start with strict label reduction and only expand density if it remains legible.

### Force Layout Chaos

If the force configuration is too loose, the ontology structure will read as noise. The implementation should bias toward constrained clustering even if that slightly reduces dramatic motion.

### Mobile Interaction Fatigue

3D orbit interactions can feel awkward on small screens. The preview UI and control sensitivity need explicit mobile tuning rather than relying on desktop defaults.

## Implementation Notes

- the existing `RadialTree` component can remain temporarily during migration, but the root page should switch to the new 3D component once the feature is ready
- because `three` is already present in `package.json`, the preferred implementation path does not require introducing a large new rendering stack beyond the graph library chosen for the scene
- if `react-force-graph-3d` is added, it should be isolated to the homepage component and not become a cross-site dependency pattern by default

## Acceptance Criteria

The work is complete when:

- the root page shows a 3D ontology visualization instead of the current 2D SVG tree
- ontology role/group/document structure remains understandable in the 3D layout
- clicking a node opens a preview first
- document navigation occurs from the preview panel
- the page remains usable on desktop and mobile
- ontology validation and site build succeed
