import { createContext, useContext, useReducer } from 'react';

const QuoteContext = createContext(null);
const QuoteDispatchContext = createContext(null);

const initialState = {
  // 0=landing, 1=project type, 2=measure method, 3=items, 4=client info, 5=verify, 6=quote
  step: 0,
  projectType: null,   // 'windows' | 'doors' | 'both'
  measureFrom: 'inside', // 'inside' | 'outside'
  items: [],
  clientInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  },
  verificationCode: '',
  quoteGenerated: false,
  quoteId: null,
  quoteData: null, // full quote response from DB after submission
};

function quoteReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: Math.max(0, state.step - 1) };
    case 'SET_PROJECT_TYPE':
      return { ...state, projectType: action.projectType };
    case 'SET_MEASURE_FROM':
      return { ...state, measureFrom: action.measureFrom };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, { ...action.item, id: Date.now() }] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, ...action.updates } : item
        ),
      };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };
    case 'SET_CLIENT_INFO':
      return { ...state, clientInfo: { ...state.clientInfo, ...action.info } };
    case 'SET_VERIFICATION_CODE':
      return { ...state, verificationCode: action.code };
    case 'GENERATE_QUOTE':
      return {
        ...state,
        quoteGenerated: true,
        quoteId: action.quoteId || null,
        quoteData: action.quoteData || null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function QuoteProvider({ children }) {
  const [state, dispatch] = useReducer(quoteReducer, initialState);
  return (
    <QuoteContext.Provider value={state}>
      <QuoteDispatchContext.Provider value={dispatch}>
        {children}
      </QuoteDispatchContext.Provider>
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  return useContext(QuoteContext);
}

export function useQuoteDispatch() {
  return useContext(QuoteDispatchContext);
}
