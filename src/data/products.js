// Product catalog — types match price_entries.product_type in Supabase

export const WINDOW_TYPES = {
  single_hung: { name: 'Single Hung', icon: '⬆️', category: 'window' },
  horizontal_roller_xo: { name: 'Horizontal Roller XO', icon: '↔️', category: 'window' },
  horizontal_roller_xox: { name: 'Horizontal Roller XOX', icon: '↔️↔️', category: 'window' },
  geometric: { name: 'Geometric Shape', icon: '⭕', category: 'window' },
};

export const DOOR_TYPES = {
  single_door: { name: 'Single Door', icon: '🚪', category: 'door' },
  bermuda_door: { name: 'Bermuda Door', icon: '🏝️', category: 'door' },
  double_door: { name: 'Double Door', icon: '🚪🚪', category: 'door' },
  picture_window: { name: 'Picture Window', icon: '🖼️', category: 'door' },
  side_light: { name: 'Side Light', icon: '💡', category: 'door' },
};

export const SLIDING_DOOR_TYPES = {
  sgd_2_panel: { name: '2-Panel SGD', icon: '🏠', category: 'sliding_door' },
  sgd_3_panel: { name: '3-Panel XOX', icon: '🏠', category: 'sliding_door' },
  sgd_4_panel: { name: '4-Panel XOOX', icon: '🏠', category: 'sliding_door' },
};

export const DOOR_VARIANTS = {
  traditional: 'Traditional',
  design: 'Design',
  wg_traditional: 'Wood Grain Traditional',
  wg_design: 'Wood Grain Design',
};

export const MARKUP_RATE = 0.30;

// Map a door variant key to the correct price column
export function getVariantPrice(entry, variant) {
  const map = {
    traditional: entry.price_traditional,
    design: entry.price_design,
    wg_traditional: entry.price_wg_traditional,
    wg_design: entry.price_wg_design,
  };
  return map[variant] ?? null;
}

/**
 * Find the best-matching price entry for given measurements.
 * For exact-size products (windows): exact W×H match.
 * For range products (doors): width/height within range.
 * For geometric: uses the larger of W/H as the single dimension.
 */
export function findPriceEntry(entries, productType, widthInches, heightInches) {
  const candidates = entries.filter((e) => e.product_type === productType);
  if (!candidates.length) return null;

  if (productType === 'geometric') {
    const dim = Math.max(widthInches, heightInches);
    return candidates.find((e) => dim >= e.width_min && dim <= e.width_max) ?? null;
  }

  // Exact or range match
  const match = candidates.find(
    (e) =>
      widthInches >= e.width_min &&
      widthInches <= e.width_max &&
      heightInches >= e.height_min &&
      heightInches <= e.height_max
  );
  if (match) return match;

  // For exact-size windows: find next size up (smallest entry larger than given dims)
  const larger = candidates
    .filter((e) => e.width_min >= widthInches && e.height_min >= heightInches)
    .sort((a, b) => a.width_min - b.width_min || a.height_min - b.height_min);
  return larger[0] ?? null;
}

/**
 * Calculate a single line item price.
 * Returns null if no matching entry found or price not set.
 */
export function calcLineItem(entry, variant, quantity) {
  if (!entry) return null;

  const basePrice = entry.base_price != null
    ? entry.base_price
    : getVariantPrice(entry, variant);

  if (basePrice == null) return null;

  const installFee = entry.install_fee ?? 0;
  const unitSubtotal = basePrice + installFee;
  const unitMarkup = unitSubtotal * MARKUP_RATE;
  const unitTotal = unitSubtotal + unitMarkup;
  const lineTotal = unitTotal * quantity;

  return {
    basePrice,
    installFee,
    unitSubtotal,
    unitMarkup: Math.round(unitMarkup * 100) / 100,
    unitTotal: Math.round(unitTotal * 100) / 100,
    lineTotal: Math.round(lineTotal * 100) / 100,
  };
}
