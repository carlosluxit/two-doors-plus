import { useState } from 'react';
import { useQuote, useQuoteDispatch } from '../context/QuoteContext';
import { WINDOW_TYPES, DOOR_TYPES } from '../data/products';
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
} from 'lucide-react';

export default function StepMeasurements() {
  const state = useQuote();
  const dispatch = useQuoteDispatch();
  const [measureItem, setMeasureItem] = useState(null);

  const showWindows = state.projectType === 'windows' || state.projectType === 'both';
  const showDoors = state.projectType === 'doors' || state.projectType === 'both';
  const measureFrom = state.measureFrom || 'inside';

  const addItem = (type) => {
    const defaults =
      type === 'window'
        ? { itemType: 'window', subType: 'single_hung', width: 36, height: 48, quantity: 1, label: '', photo: null }
        : { itemType: 'door', subType: 'single_entry', width: 36, height: 80, quantity: 1, label: '', photo: null };
    dispatch({ type: 'ADD_ITEM', item: defaults });
  };

  const handleMeasureComplete = ({ width, height, photo }) => {
    if (measureItem) {
      dispatch({ type: 'UPDATE_ITEM', id: measureItem.id, updates: { width, height, photo } });
      setMeasureItem(null);
    }
  };

  const canProceed =
    state.items.length > 0 &&
    state.items.every((item) => item.width > 0 && item.height > 0 && item.quantity > 0);

  const windowItems = state.items.filter((i) => i.itemType === 'window');
  const doorItems = state.items.filter((i) => i.itemType === 'door');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
        Add Your Windows & Doors
      </h2>
      <p className="text-gray-500 text-center mb-3">
        Enter measurements in inches, or use the camera to snap a photo for reference.
      </p>

      {/* Measurement method banner */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6 text-sm font-semibold ${
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

      <div className="flex items-center justify-center gap-2 mb-8 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>Approximate measurements are fine! We'll verify during the expert visit.</span>
      </div>

      {/* Camera Measure Modal */}
      {measureItem && (
        <CameraMeasure
          itemType={measureItem.itemType}
          measureFrom={measureFrom}
          onComplete={handleMeasureComplete}
          onCancel={() => setMeasureItem(null)}
        />
      )}

      {/* Windows Section */}
      {showWindows && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🪟</span> Windows
              <span className="text-sm font-normal text-gray-400">({windowItems.length})</span>
            </h3>
            <button
              onClick={() => addItem('window')}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Window
            </button>
          </div>
          {windowItems.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No windows added yet. Click "Add Window" to start.</p>
            </div>
          )}
          <div className="space-y-3">
            {windowItems.map((item, idx) => (
              <ItemCard
                key={item.id}
                item={item}
                index={idx}
                types={WINDOW_TYPES}
                dispatch={dispatch}
                measureFrom={measureFrom}
                onMeasure={() => setMeasureItem({ id: item.id, itemType: 'window' })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Doors Section */}
      {showDoors && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🚪</span> Doors
              <span className="text-sm font-normal text-gray-400">({doorItems.length})</span>
            </h3>
            <button
              onClick={() => addItem('door')}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Door
            </button>
          </div>
          {doorItems.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No doors added yet. Click "Add Door" to start.</p>
            </div>
          )}
          <div className="space-y-3">
            {doorItems.map((item, idx) => (
              <ItemCard
                key={item.id}
                item={item}
                index={idx}
                types={DOOR_TYPES}
                dispatch={dispatch}
                measureFrom={measureFrom}
                onMeasure={() => setMeasureItem({ id: item.id, itemType: 'door' })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
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

const FRAC_LABELS = { 0: '', 0.125: '⅛', 0.25: '¼', 0.375: '⅜', 0.5: '½', 0.625: '⅝', 0.75: '¾', 0.875: '⅞' };

function formatSize(val) {
  const { whole, fraction } = splitInches(val);
  const f = FRAC_LABELS[fraction] || '';
  if (!f) return `${whole}"`;
  return `${whole} ${f}"`;
}

function ItemCard({ item, index, types, dispatch, measureFrom, onMeasure }) {
  const typeEntries = Object.entries(types);
  const { whole: wWhole, fraction: wFrac } = splitInches(item.width);
  const { whole: hWhole, fraction: hFrac } = splitInches(item.height);

  const updateDimension = (dim, whole, frac) => {
    dispatch({
      type: 'UPDATE_ITEM',
      id: item.id,
      updates: { [dim]: combineInches(whole, frac) },
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
            {index + 1}
          </span>
          <input
            type="text"
            placeholder={`${item.itemType === 'window' ? 'Window' : 'Door'} label (e.g., Living Room)`}
            value={item.label}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { label: e.target.value } })
            }
            className="border-0 border-b border-gray-200 focus:border-primary outline-none text-sm py-1 px-2 w-44 sm:w-56"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMeasure}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
            title="Measure with camera"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
            className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Type + Qty row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Type</label>
          <select
            value={item.subType}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { subType: e.target.value } })
            }
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
            type="number"
            min="1"
            max="50"
            value={item.quantity}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_ITEM',
                id: item.id,
                updates: { quantity: parseInt(e.target.value) || 1 },
              })
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Width with fraction */}
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
            type="number"
            min="0"
            max="200"
            value={wWhole}
            onChange={(e) => updateDimension('width', e.target.value, wFrac)}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold focus:border-primary outline-none text-center bg-white"
          />
          <span className="text-xs text-gray-400">in +</span>
        </div>
        <FractionPicker value={wFrac} onChange={(f) => updateDimension('width', wWhole, f)} />
      </div>

      {/* Height with fraction */}
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
            type="number"
            min="0"
            max="200"
            value={hWhole}
            onChange={(e) => updateDimension('height', e.target.value, hFrac)}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold focus:border-primary outline-none text-center bg-white"
          />
          <span className="text-xs text-gray-400">in +</span>
        </div>
        <FractionPicker value={hFrac} onChange={(f) => updateDimension('height', hWhole, f)} />
      </div>

      {/* Photo thumbnail */}
      {item.photo && (
        <div className="mt-3 flex items-center gap-3">
          <img src={item.photo} alt="Captured" className="w-20 h-14 object-contain rounded-lg border bg-gray-50" />
          <span className="text-xs text-success font-medium">Photo captured & measured</span>
          <button
            onClick={() =>
              dispatch({ type: 'UPDATE_ITEM', id: item.id, updates: { photo: null } })
            }
            className="text-xs text-gray-400 hover:text-danger cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
