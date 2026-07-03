# Plan: feat: Update Application Logo

## Spec

Link: [Update Application Logo](_specs/2026-07-03-update-application-logo.md)

## Current State

The application currently displays a text-based logo via the `LogoLink` component in the dashboard header, dashboard navigation, and mobile navigation. Public assets include PNG icons and a favicon used by the PWA manifest and page metadata. The new SVG logo is available at the provided external path and needs to be integrated across all logo touchpoints.

## Implementation Steps

### Phase 1 — Asset and Core Logo Component

- [ ] Copy the new SVG logo into the project and remove the old logo asset.
- [ ] Update the shared logo component so it renders the new SVG asset.
- [ ] Ensure the logo component preserves existing dimensions and layout behavior, adjusting proportionally if the new asset has a different aspect ratio.

### Phase 2 — Page Integration

- [ ] Display the new logo on the login page.
- [ ] Display the new logo on the signup page.
- [ ] Display the new logo in the dashboard header and navigation components.

### Phase 3 — Theme, Metadata, and Cleanup

- [ ] Verify the new logo renders correctly in light mode.
- [ ] Verify the new logo renders correctly in dark mode.
- [ ] Update any favicon, manifest, or metadata references in `public` and `app` to point to the new logo asset where appropriate.
- [ ] Remove any stale references to the old logo.

### Phase 4 — Testing and Quality Checks

- [ ] Add tests verifying the logo component renders the new SVG asset.
- [ ] Add tests verifying the logo appears on the login page.
- [ ] Add tests verifying the logo appears on the signup page.
- [ ] Add tests verifying the logo appears in the dashboard navigation or header.
- [ ] Run `pnpm check`, `pnpm type-check`, and `pnpm test:run` and fix any regressions.

## Risks & Notes

- The new SVG may have a different viewBox, aspect ratio, or inline colors that conflict with existing styles or theme adaptation.
- Favicon and PWA manifest assets may need separate handling if they cannot be generated directly from the SVG.
- The old logo file should be deleted rather than kept as a backup, per the spec decision.

## Definition of Done

- [ ] The new logo is visible on the login page.
- [ ] The new logo is visible on the signup page.
- [ ] The new logo is visible in the dashboard header or navigation.
- [ ] The new logo renders correctly in light mode.
- [ ] The new logo renders correctly in dark mode.
- [ ] No broken image references or 404 errors related to the logo asset.
- [ ] No stale references to the old logo remain.
- [ ] New tests cover logo rendering on the component and page levels.
- [ ] `pnpm check`, `pnpm type-check`, and `pnpm test:run` pass.
