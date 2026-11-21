# Starter template mode (planned, Phase 3)

A starter template is a demo built on the Travelscape parent alone, sold or offered on wptravelkit.com and installed with Demo Importer Plus. No child theme, no wordpress.org review.

## Not automated yet

What this plugin version can do in this mode:
- Stages 1, 2 and 4: build and validate the page markup with the kit, using only parent-theme classes and block attributes (no `<p>-*` child components), and load the pages onto the site.
- Write the color and font values as a list of Customizer settings for the user to enter (Appearance > Customize), since there is no child theme to hold them.

What it cannot do yet (say this to the user):
- The child-theme components (icon tiles, pills, FAQ accordion styling, card links, tablet grids, CF7 styling, image-with-badge rows) live in the child theme. On the parent alone they have no CSS. Until they move into Travelscape as `ts-*` utilities (a Cursor task on the parent, planned before Phase 3), either keep starter-template designs to core blocks plus the parent's `ts-*` classes, or put the needed CSS into the site's Additional CSS (Customizer), which a Customizer export carries.
- Packaging for Demo Importer Plus (content XML, Customizer export, widgets, menus) and saving the page patterns as "My patterns" (wp_block posts) inside the demo content.

## Phase 3 plan

1. Parent: move the reusable child components into Travelscape `assets/css/blocks.css` as `ts-*` classes (backward compatible, new classes only).
2. Plugin: tokens -> Customizer theme_mods JSON; Additional CSS for anything page-specific; patterns as wp_block posts; export via WP-CLI (`wp export`, Customizer export) into a Demo Importer Plus package.
