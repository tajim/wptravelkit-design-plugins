// WP Travel Engine blocks are rendered by PHP (save returns null), so the JS packages do not
// know them. Register them with the attributes we use, so the kit's unknown-attribute guard works.
export const WPTE_BLOCKS = {
  'wptravelengine/trip-search': {
    searchButtonLabel: { type: 'string' },
    searchFormOrientation: { type: 'boolean' },
    searchFilters: { type: 'object' },
    layoutFilters: { type: 'object' },
  },
  'wptravelengine/trips': {
    showSectionHeading: { type: 'boolean' },
    showSectionDescription: { type: 'boolean' },
    layout: { type: 'string' },
    tripsCountPerRow: { type: 'number' },
    cardlayout: { type: 'number' },
    viewMoreButtonText: { type: 'string' },
    excerptLength: { type: 'number' },
    tripTitleHeadingLevel: { type: 'number' },
    filters: { type: 'object' },
    layoutFilters: { type: 'object' },
  },
  'wptravelengine/destinations': {},
};

export function registerWpteBlocks(B, { strictAttributes = true } = {}) {
  for (const [name, attributes] of Object.entries(WPTE_BLOCKS)) {
    if (B.getBlockType(name)) continue;
    B.registerBlockType(name, {
      apiVersion: 3,
      title: name,
      category: 'widgets',
      // The validator does not know every attribute a site may use: accept anything there.
      attributes: strictAttributes ? attributes : {},
      save: () => null,
      edit: () => null,
    });
  }
}
