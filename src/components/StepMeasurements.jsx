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
  PanelTop,
  DoorOpen,
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

  const runningTotal = state.items.reduce((sum, item) => {
    const p = getItemPrice(item);
    return sum + (p?.lineTotal ?? 0);
  }, 0);

  return (
    <div className="max-w-lg mx-auto px-5 py-10 animate-fade-in">
      <h2 className="text-xl font-semibold text-primary text-center mb-1.5">
        Add Your Windows & Doors
      </h2>
      <p className="text-sm text-muted text-center mb-6">
        Enter measurements in inches and select product types.
      </p>

      {/* Measurement method banner */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-accent/20 bg-accent/5 mb-3 text-xs text-stone-700">
        <Ruler className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={1.5} />
        <span>
          Measuring from <span className="font-semibold">{measureFrom}</span>
          {measureFrom === 'outside' ? ' — border to border' : ' — wall to wall'}
        </span>
      </div>

      <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-50 mb-8 text-[11px] text-muted">
        <Info className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
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
          icon={PanelTop}
          count={windowItems.length}
          onAdd={() => addItem('window')}
          addLabel="Add Window"
          emptyMsg='No windows added yet.'
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
          icon={DoorOpen}
          count={doorItems.length}
          onAdd={() => addItem('door')}
          addLabel="Add Door"
          emptyMsg='No doors added yet.'
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
        <div className="border border-border rounded-lg p-4 mb-8 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-primary">Estimated Total</div>
            <div className="text-[11px] text-muted">Includes product + installation</div>
          </div>
          <div className="text-xl font-semibold text-accent">
            {runningTotal > 0 ? `$${runningTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '\u2014'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted hover:text-primary hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
        </button>
        <button
          disabled={!canProceed}
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all cursor-pointer ${
            canProceed
              ? 'bg-primary text-white hover:bg-primary-light'
              : 'bg-stone-100 text-stone-300 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function Section({ label, icon: Icon, count, onAdd, addLabel, emptyMsg, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" strokeWidth={1.5} />
          {label}
          <span className="text-xs font-normal text-muted">({count})</span>
        </h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-dark transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} /> {addLabel}
        </button>
      </div>
      {count === 0 && (
        <div className="text-center py-8 bg-stone-50 rounded-lg border border-dashed border-stone-200">
          <p className="text-xs text-muted">{emptyMsg}</p>
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

const FRAC_LABELS = { 0: '', 0.125: '\u215B', 0.25: '\u00BC', 0.375: '\u215C', 0.5: '\u00BD', 0.625: '\u215D', 0.75: '\u00BE', 0.875: '\u215E' };

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

  const entry = priceEntries.length ? findPriceEntry(priceEntries, item.subType, item.width, item.height) : null;
  const priceCalc = entry ? calcLineItem(entry, item.doorStyle, item.quantity || 1) : null;
  const noPriceYet = entry && priceCalc === null;

  return (
    <div className="bg-white border border-border rounded-lg p-4 transition-all hover:border-stone-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold text-muted bg-stone-100 w-6 h-6 rounded-full flex items-center justify-center">
            {index + 1}
          </span>
          <input
            type="text"
            placeholder={`${isWindow ? 'Window' : isDoor ? 'Door' : 'Sliding Door'} label`}
            value={item.label}
            onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { label: e.target.value } })}
            className="border-0 border-b border-transparent focus:border-stone-300 outline-none text-sm py-0.5 px-1 w-40 sm:w-48 text-primary placeholder:text-stone-300"
          />
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={onMeasure} className="p-1.5 text-muted hover:text-accent rounded-md transition-colors cursor-pointer" title="Measure with camera">
            <Camera className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })} className="p-1.5 text-muted hover:text-danger rounded-md transition-colors cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Type + Qty */}
      <div className="grid grid-cols-[1fr_80px] gap-2.5 mb-3">
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wide block mb-1">Type</label>
          <select
            value={item.subType}
            onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { subType: e.target.value } })}
            className="w-full border border-border rounded-md px-2.5 py-2 text-xs bg-white focus:border-accent outline-none cursor-pointer"
          >
            {typeEntries.map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wide block mb-1">Qty</label>
          <input
            type="number" min="1" max="50"
            value={item.quantity}
            onChange={(e) => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { quantity: parseInt(e.target.value) || 1 } })}
            className="w-full border border-border rounded-md px-2.5 py-2 text-xs focus:border-accent outline-none text-center"
          />
        </div>
      </div>

      {/* Door style */}
      {isDoor && (
        <div className="mb-3">
          <label className="text-[10px] text-muted uppercase tracking-wide block mb-1.5">Style</label>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(DOOR_VARIANTS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { doorStyle: key } })}
                className={`text-[11px] px-2.5 py-1.5 rounded-md border font-medium transition-all cursor-pointer ${
                  item.doorStyle === key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-stone-600 border-border hover:border-stone-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Width */}
      <div className="bg-stone-50 rounded-md p-2.5 mb-1.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Ruler className="w-3 h-3 text-accent" strokeWidth={1.5} />
          <span className="text-[10px] font-medium text-muted uppercase tracking-wide">
            Width {measureFrom === 'outside' ? '(border to border)' : '(wall to wall)'}
          </span>
          <span className="text-xs text-primary font-semibold ml-auto">{formatSize(item.width)}</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="number" min="0" max="300"
            value={wWhole}
            onChange={(e) => updateDim('width', e.target.value, wFrac)}
            className="w-16 border border-border rounded-md px-2 py-1.5 text-xs font-medium focus:border-accent outline-none text-center bg-white"
          />
          <span className="text-[10px] text-muted">in +</span>
        </div>
        <FractionPicker value={wFrac} onChange={(f) => updateDim('width', wWhole, f)} />
      </div>

      {/* Height */}
      <div className="bg-stone-50 rounded-md p-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Ruler className="w-3 h-3 text-primary" strokeWidth={1.5} />
          <span className="text-[10px] font-medium text-muted uppercase tracking-wide">
            Height {measureFrom === 'outside' ? '(border to border)' : '(sill to top)'}
          </span>
          <span className="text-xs text-primary font-semibold ml-auto">{formatSize(item.height)}</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="number" min="0" max="300"
            value={hWhole}
            onChange={(e) => updateDim('height', e.target.value, hFrac)}
            className="w-16 border border-border rounded-md px-2 py-1.5 text-xs font-medium focus:border-accent outline-none text-center bg-white"
          />
          <span className="text-[10px] text-muted">in +</span>
        </div>
        <FractionPicker value={hFrac} onChange={(f) => updateDim('height', hWhole, f)} />
      </div>

      {/* Price */}
      <div className="mt-3">
        {pricingLoading ? (
          <div className="text-[11px] text-muted">Loading price...</div>
        ) : noPriceYet ? (
          <div className="flex items-center gap-1.5 text-[11px] text-accent">
            <AlertCircle className="w-3 h-3" strokeWidth={1.5} />
            <span>Price coming soon — our team will quote this item</span>
          </div>
        ) : !entry ? (
          <div className="flex items-center gap-1.5 text-[11px] text-accent">
            <AlertCircle className="w-3 h-3" strokeWidth={1.5} />
            <span>No exact match — we'll verify measurements & price</span>
          </div>
        ) : priceCalc ? (
          <div className="text-[11px] bg-stone-50 rounded-md px-3 py-2 space-y-0.5">
            <div className="flex justify-between text-muted">
              <span>Price</span>
              <span>${Math.round(priceCalc.displayPrice * (item.quantity || 1)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Installation</span>
              <span>${Math.round(priceCalc.displayInstall * (item.quantity || 1)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-primary border-t border-stone-200 pt-1 mt-1">
              <span>Total</span>
              <span>${priceCalc.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Photo */}
      {item.photo && (
        <div className="mt-3 flex items-center gap-3">
          <img src={item.photo} alt="Captured" className="w-16 h-12 object-contain rounded-md border border-border bg-stone-50" />
          <span className="text-[11px] text-success font-medium">Photo captured</span>
          <button
            onClick={() => dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { photo: null } })}
            className="text-[11px] text-muted hover:text-danger cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
