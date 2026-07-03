# Plan: feat: Update Application Logo

## Spec

Link: [Update Application Logo](_specs/2026-07-03-update-application-logo.md)

## Current State

The application currently displays a text-based logo via the `LogoLink` component in the dashboard header, dashboard navigation, and mobile navigation. Public assets include PNG icons and a favicon used by the PWA manifest and page metadata. The new SVG logo is available at the provided external path and needs to be integrated across all logo touchpoints.

## Implementation Steps

### Phase 1 — Asset and Core Logo Component

- [x] Copy the new SVG logo into the project and remove the old logo asset.
- [x] Update the shared logo component so it renders the new SVG asset.
- [x] Ensure the logo component preserves existing dimensions and layout behavior, adjusting proportionally if the new asset has a different aspect ratio.

### Phase 2 — Page Integration

- [x] Display the new logo on the login page.
- [x] Display the new logo on the signup page.
- [x] Display the new logo in the dashboard header and navigation components.

### Phase 3 — Theme, Metadata, and Cleanup

- [x] Verify the new logo renders correctly in light mode.
- [x] Verify the new logo renders correctly in dark mode.
- [x] Update any favicon, manifest, or metadata references in `public` and `app` to point to the new logo asset where appropriate.
- [x] Remove any stale references to the old logo.

### Phase 4 — Testing and Quality Checks

- [x] Add tests verifying the logo component renders the new SVG asset.
- [x] Add tests verifying the logo appears on the login page.
- [x] Add tests verifying the logo appears on the signup page.
- [x] Add tests verifying the logo appears in the dashboard navigation or header.
- [x] Run `pnpm check`, `pnpm type-check`, and `pnpm test:run` and fix any regressions.

## Risks & Notes

- The new SVG may have a different viewBox, aspect ratio, or inline colors that conflict with existing styles or theme adaptation.
- Favicon and PWA manifest assets may need separate handling if they cannot be generated directly from the SVG.
- The old logo file should be deleted rather than kept as a backup, per the spec decision.

## Definition of Done

- [x] The new logo is visible on the login page.
- [x] The new logo is visible on the signup page.
- [x] The new logo is visible in the dashboard header or navigation.
- [x] The new logo renders correctly in light mode.
- [x] The new logo renders correctly in dark mode.
- [x] No broken image references or 404 errors related to the logo asset.
- [x] No stale references to the old logo remain.
- [x] New tests cover logo rendering on the component and page levels.
- [x] `pnpm check`, `pnpm type-check`, and `pnpm test:run` pass.
