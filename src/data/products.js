// Hurricane Impact Product Catalog - South Florida
// Pricing per united inch (width + height) for standard sizes

export const TIERS = {
  economic: {
    id: 'economic',
    name: 'Economic',
    tagline: 'Reliable Protection',
    description: 'Quality hurricane impact products from trusted manufacturers. Meets all Florida building codes and Miami-Dade NOA requirements.',
    color: '#3b82f6',
    badge: 'Best Value',
    manufacturer: 'EcoShield Impact Systems',
    warranty: '10-Year Limited Warranty',
    features: [
      'Miami-Dade NOA Approved',
      'Large Missile Impact Rated',
      'Standard white vinyl frame',
      'Clear glass with impact interlayer',
      'Energy Star certified',
      'Florida Building Code compliant',
      'Factory certified installation',
      'Opening reconstruction and finishing touches',
      'City permits and inspections',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'Superior Performance',
    description: 'Enhanced hurricane protection with premium materials, better energy efficiency, and more design options.',
    color: '#8b5cf6',
    badge: 'Most Popular',
    manufacturer: 'StormGuard Premium Series',
    warranty: '15-Year Comprehensive Warranty',
    features: [
      'Miami-Dade NOA Approved',
      'Large Missile Impact Rated',
      'Multi-chamber vinyl frame',
      'Low-E argon-filled impact glass',
      'Superior sound reduction',
      'Multiple color options',
      'Enhanced energy efficiency',
      'Decorative glass options available',
      'Factory certified installation',
      'Opening reconstruction and finishing touches',
      'City permits and inspections',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Ultimate Protection',
    description: 'Top-of-the-line hurricane impact products with maximum performance, premium aesthetics, and lifetime peace of mind.',
    color: '#f59e0b',
    badge: 'Premium Choice',
    manufacturer: 'EliteGuard Pro Series',
    warranty: 'Lifetime Transferable Warranty',
    features: [
      'Miami-Dade NOA Approved',
      'Large Missile Impact Rated',
      'Heavy-duty aluminum-clad frame',
      'Triple-pane Low-E impact glass',
      'Maximum sound deadening',
      'Unlimited color & finish options',
      'Best-in-class energy rating',
      'Decorative & custom glass',
      'Smart-home sensor ready',
      'Transferable lifetime warranty',
      'Factory certified installation',
      'Opening reconstruction and finishing touches',
      'City permits and inspections',
    ],
  },
};

// Window types and their base pricing per united inch
export const WINDOW_TYPES = {
  single_hung: { name: 'Single Hung', icon: '⬆️' },
  double_hung: { name: 'Double Hung', icon: '↕️' },
  horizontal_slider: { name: 'Horizontal Slider', icon: '↔️' },
  casement: { name: 'Casement', icon: '🪟' },
  picture: { name: 'Picture Window', icon: '🖼️' },
  awning: { name: 'Awning', icon: '🏠' },
};

// Door types
export const DOOR_TYPES = {
  single_entry: { name: 'Single Entry Door', icon: '🚪' },
  double_entry: { name: 'Double Entry Door', icon: '🚪🚪' },
  sliding_glass: { name: 'Sliding Glass Door', icon: '🏠' },
  french: { name: 'French Doors', icon: '🏰' },
};

// Pricing per united inch (width + height in inches)
// These are realistic South Florida market rates
export const PRICING = {
  windows: {
    economic: {
      basePerUnitedInch: 4.50,
      minPrice: 350,
      installPerUnit: 150,
    },
    premium: {
      basePerUnitedInch: 7.25,
      minPrice: 550,
      installPerUnit: 200,
    },
    pro: {
      basePerUnitedInch: 11.00,
      minPrice: 850,
      installPerUnit: 275,
    },
  },
  doors: {
    economic: {
      basePerUnitedInch: 8.50,
      minPrice: 1200,
      installPerUnit: 350,
    },
    premium: {
      basePerUnitedInch: 13.00,
      minPrice: 1800,
      installPerUnit: 450,
    },
    pro: {
      basePerUnitedInch: 19.50,
      minPrice: 2800,
      installPerUnit: 600,
    },
  },
};

// Additional costs
export const ADDITIONAL_COSTS = {
  permit: 250,
  inspectionFee: 150,
  debrisRemoval: 15, // per unit
  trimPackage: 75, // per unit
};

export function calculateUnitPrice(type, tier, widthInches, heightInches) {
  const unitedInch = widthInches + heightInches;
  const priceData = PRICING[type][tier];
  const productCost = Math.max(priceData.basePerUnitedInch * unitedInch, priceData.minPrice);
  return {
    product: Math.round(productCost),
    installation: priceData.installPerUnit,
    trim: ADDITIONAL_COSTS.trimPackage,
    debris: ADDITIONAL_COSTS.debrisRemoval,
    unitTotal: Math.round(productCost + priceData.installPerUnit + ADDITIONAL_COSTS.trimPackage + ADDITIONAL_COSTS.debrisRemoval),
  };
}

export function calculateFullQuote(items, tier) {
  let totalProduct = 0;
  let totalInstall = 0;
  let totalTrim = 0;
  let totalDebris = 0;
  let unitCount = 0;

  const lineItems = items.map((item) => {
    const type = item.itemType === 'window' ? 'windows' : 'doors';
    const unitPrice = calculateUnitPrice(type, tier, item.width, item.height);
    const qty = item.quantity || 1;
    unitCount += qty;
    totalProduct += unitPrice.product * qty;
    totalInstall += unitPrice.installation * qty;
    totalTrim += unitPrice.trim * qty;
    totalDebris += unitPrice.debris * qty;

    return {
      ...item,
      unitPrice,
      lineTotal: unitPrice.unitTotal * qty,
      qty,
    };
  });

  const subtotal = totalProduct + totalInstall + totalTrim + totalDebris;
  const permit = ADDITIONAL_COSTS.permit;
  const inspection = ADDITIONAL_COSTS.inspectionFee;
  const grandTotal = subtotal + permit + inspection;

  return {
    lineItems,
    unitCount,
    totalProduct,
    totalInstall,
    totalTrim,
    totalDebris,
    subtotal,
    permit,
    inspection,
    grandTotal,
    tier: TIERS[tier],
  };
}
