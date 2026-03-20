import { useState } from 'react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { usePricing } from '../context/PricingContext';
import { WINDOW_TYPES, DOOR_TYPES, SLIDING_DOOR_TYPES, DOOR_VARIANTS, findPriceEntry, calcLineItem } from '../data/products';
import CameraMeasure from './CameraMeasure';
import FractionPicker, { splitInches, combineInches } from './FractionPicker';
import {
  Plus,
  Trash2,
  Camera,
  Ruler,
  ArrowRight,
  ArrowLeft,
  Info,
  Home,
  Square,
  AlertCircle,
} from 'lucide-react';

export default function StepMeasurements() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const { priceEntries, loading: pricingLoading } = usePricing();
  const [measureItem, setMeasureItem] = useState(null);

  const showWindows = state.projectType === 'windows' || state.projectType === 'both';
  const showDoors = state.projectType === 'doors' || state.projectType === 'both';
  const measureFrom = state.measureFrom || 'inside';

  const addItem = (category) => {
    let defaults;
    if (category === 'window') {
      defaults = { itemCategory: 'window', subType: 'single_hung', width: 36, height: 48, quantity: 1, label: '', photo: null, doorStyle: null };
    } else if (category === 'door') {
      defaults = { itemCategory: 'door', subType: 'single_door', width: 36, height: 80, quantity: 1, label: '', photo: null, doorStyle: 'traditional' };
    } else {
      defaults = { itemCategory: 'sliding_door', subType: 'sgd_2_panel', width: 60, height: 80, quantity: 1, label: '', photo: null, doorStyle: null };
    }
    dispatch({ type: 'ADD_ITEM', item: defaults });
  };

  const handleMeasureComplete = ({ width, height, photo }) => {
    if (measureItem) {
      dispatch({ type: 'UPDATE_ITEM', id: measureItem.id, updates: { width, height, photo } });
      setMeasureItem(null);
    }
  };

  const getItemPrice = (item) => {
    if (!priceEntries.length) return null;
    const entry = findPriceEntry(priceEntries, item.subType, item.width, item.height);
    return calcLineItem(entry, item.doorStyle, item.quantity || 1);
  };

  const canProceed =
    state.items.length > 0 &&
    state.items.every((item) => item.width > 0 && item.height > 0 && item.quantity > 0);

  const windowItems = state.items.filter((i) => i.itemCategory === 'window');
  const doorItems = state.items.filter((i) => i.itemCategory === 'door');

  // Running total
  const runningTotal = state.items.reduce((sum, item) => {
    const p = getItemPrice(item);
    return sum + (p?.lineTotal ?? 0);
  }, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
        Add Your Windows & Doors
      </h2>
      <p className="text-gray-500 text-center mb-3">
        Select the product type, enter measurements in inches, and pick a style for doors.
      </p>

      {/* Measurement method banner */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm font-semibold ${
        measureFrom === 'outside'
          ? 'bg-amber-50 border border-amber-200 text-amber-800'
          : 'bg-blue-50 border border-blue-200 text-blue-800'
      }`}>
        {measureFrom === 'outside' ? (
          <Square className="w-4 h-4 flex-shrink-0 text-amber-600" />
        ) : (
          <Home className="w-4 h-4 flex-shrink-0 text-blue-600" />
        )}
        <span>
          Measuring from <strong>{measureFrom === 'outside' ? 'outside' : 'inside'}</strong>
          {measureFrom === 'outside' ? ' — border to border (full frame)' : ' — wall to wall, sill to top'}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>Approximate measurements are fine — we'll verify during the expert visit.</span>
      </div>

      {/* Camera Measure Modal */}
      {measureItem && (
        <CameraMeasure
          itemType={measureItem.itemCategory}
          measureFrom={measureFrom}
          onComplete={handleMeasureComplete}
          onCancel={() => setMeasureItem(null)}
        />
      )}

      {/* Windows Section */}
      {showWindows && (
        <Section
          label="Windows"
          emoji="🪟"
          count={windowItems.length}
          onAdd={() => addItem('window')}
          addLabel="Add Window"
          emptyMsg='No windows added yet. Click "Add Window" to start.'
        >
          {windowItems.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              index={idx}
              dispatch={dispatch}
              measureFrom={measureFrom}
              priceEntries={priceEntries}
              pricingLoading={pricingLoading}
              onMeasure={() => setMeasureItem({ id: item.id, itemCategory: 'window' })}
            />
          ))}
        </Section>
      )}

      {/* Doors Section */}
      {showDoors && (
        <Section
          label="Doors"
          emoji="🚪"
          count={doorItems.length}
          onAdd={() => addItem('door')}
          addLabel="Add Door"
          emptyMsg='No doors added yet. Click "Add Door" to start.'
        >
          {doorItems.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              index={idx}
              dispatch={dispatch}
              measureFrom={measureFrom}
              priceEntries={priceEntries}
              pricingLoading={pricingLoading}
              onMeasure={() => setMeasureItem({ id: item.id, itemCategory: 'door' })}
            />
          ))}
        </Section>
      )}

      {/* Running total */}
      {state.items.length > 0 && !pricingLoading && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Estimated Total</div>
            <div className="text-xs text-gray-400">Includes product + installation</div>
          </div>
          <div className="text-2xl font-extrabold text-primary">
            {runningTotal > 0 ? `$${runningTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button
          disabled={!canProceed}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-lg transition-all cursor-pointer ${
            canProceed
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Section({ label, emoji, count, onAdd, addLabel, emptyMsg, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">{emoji}</span> {label}
          <span className="text-sm font-normal text-gray-400">({count})</span>
        </h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {addLabel}
        </button>
      </div>
      {count === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400">{emptyMsg}</p>
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

const FRAC_LABELS = { 0: '', 0.125: '⅛', 0.25: '¼', 0.375: '⅜', 0.5: '½', 0.625: '⅝', 0.75: '¾', 0.875: '⅞' };

function formatSize(val) {
  const { whole, fraction } = splitInches(val);
  const f = FRAC_LABELS[fraction] || '';
  return f ? `${whole} ${f}"` : `${whole}"`;
}

function ItemCard({ item, index, dispatch, measureFrom, priceEntries, pricingLoading, onMeasure }) {
  const isWindow = item.itemCategory === 'window';
  const isDoor = item.itemCategory === 'door';

  const typeMap = isWindow ? WINDOW_TYPES : isDoor ? DOOR_TYPES : SLIDING_DOOR_TYPES;
  const typeEntries = Object.entries(typeMap);

  const { whole: wWhole, fraction: wFrac } = splitInches(item.width);
  const { whole: hWhole, fraction: hFrac } = splitInches(item.height);

  const updateDim = (dim, whole, frac) => {
    dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { [dim]: combineInches(whole, frac) } });
  };

  // Price lookup
  const entry = priceEntries.length
    ? findPriceEntry(priceEntries, item.subType, item.width, item.height)
    : null;
  const priceCalc = entry ? calcLineItem(entry, item.doorStyle, item.quantity || 1) : null;
  const noPriceYet = entry && priceCalc === null; // entry exists but price is null (sliding doors TBD)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
            {index + 1}
          </span>
          <input
            type="text"
            placeholder={`${isWindow ? 'Window' : isDoor ? 'Door' : 'Sliding Door'} label (e.g. Living Room)`}
            value={item.label}
            onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { label: e.target.value } })}
            className="border-0 border-b border-gray-200 focus:border-primary outline-none text-sm py-1 px-2 w-44 sm:w-56"
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMeasure} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer" title="Measure with camera">
            <Camera className="w-4 h-4" />
          </button>
          <button onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })} className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Type + Qty */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Product Type</label>
          <select
            value={item.subType}
            onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { subType: e.target.value } })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-primary outline-none cursor-pointer"
          >
            {typeEntries.map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Qty</label>
          <input
            type="number" min="1" max="50"
            value={item.quantity}
            onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { quantity: parseInt(e.target.value) || 1 } })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Door style selector */}
      {isDoor && (
        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">Door Style</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DOOR_VARIANTS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { doorStyle: key } })}
                className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors cursor-pointer text-left ${
                  item.doorStyle === key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Width */}
      <div className="bg-gray-50 rounded-lg p-2.5 mb-2">
        <div className="flex items-center gap-2 mb-1.5">
          <Ruler className="w-3 h-3 text-accent" />
          <span className="text-xs font-semibold text-gray-600">
            Width {measureFrom === 'outside' ? '(border to border)' : '(wall to wall)'}
          </span>
          <span className="text-xs text-primary font-bold ml-auto">{formatSize(item.width)}</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="number" min="0" max="300"
            value={wWhole}
            onChange={(e) => updateDim('width', e.target.value, wFrac)}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold focus:border-primary outline-none text-center bg-white"
          />
          <span className="text-xs text-gray-400">in +</span>
        </div>
        <FractionPicker value={wFrac} onChange={(f) => updateDim('width', wWhole, f)} />
      </div>

      {/* Height */}
      <div className="bg-gray-50 rounded-lg p-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Ruler className="w-3 h-3 text-blue-500" />
          <span className="text-xs font-semibold text-gray-600">
            Height {measureFrom === 'outside' ? '(border to border)' : '(sill to top)'}
          </span>
          <span className="text-xs text-primary font-bold ml-auto">{formatSize(item.height)}</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="number" min="0" max="300"
            value={hWhole}
            onChange={(e) => updateDim('height', e.target.value, hFrac)}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold focus:border-primary outline-none text-center bg-white"
          />
          <span className="text-xs text-gray-400">in +</span>
        </div>
        <FractionPicker value={hFrac} onChange={(f) => updateDim('height', hWhole, f)} />
      </div>

      {/* Price indicator */}
      <div className="mt-3">
        {pricingLoading ? (
          <div className="text-xs text-gray-400">Loading price...</div>
        ) : noPriceYet ? (
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Price coming soon — our team will quote this item</span>
          </div>
        ) : !entry ? (
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>No exact match — our team will verify measurements &amp; price</span>
          </div>
        ) : priceCalc ? (
          <div className="flex items-center justify-between text-xs bg-green-50 rounded-lg px-3 py-2">
            <span className="text-gray-500">Includes product + installation</span>
            <span className="font-bold text-primary">
              ${priceCalc.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        ) : null}
      </div>

      {/* Photo thumbnail */}
      {item.photo && (
        <div className="mt-3 flex items-center gap-3">
          <img src={item.photo} alt="Captured" className="w-20 h-14 object-contain rounded-lg border bg-gray-50" />
          <span className="text-xs text-success font-medium">Photo captured</span>
          <button
            onClick={() => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { photo: null } })}
            className="text-xs text-gray-400 hover:text-danger cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
