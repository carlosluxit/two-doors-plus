import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PricingContext = createContext(null);

export function PricingProvider({ children }) {
  const [priceEntries, setPriceEntries] = useState([]);
  const [priceList, setPriceList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch active price list
        const { data: lists, error: listErr } = await supabase
          .from('price_lists')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (listErr) throw listErr;
        setPriceList(lists);

        // Fetch all entries for that list
        const { data: entries, error: entriesErr } = await supabase
          .from('price_entries')
          .select('*')
          .eq('price_list_id', lists.id)
          .order('product_category')
          .order('product_type')
          .order('width_min');

        if (entriesErr) throw entriesErr;
        setPriceEntries(entries);
      } catch (err) {
        console.error('Failed to load price list:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <PricingContext.Provider value={{ priceEntries, priceList, loading, error }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  return useContext(PricingContext);
}
