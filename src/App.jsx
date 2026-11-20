import { QuoteProvider, useQuote } from './context/QuoteContext';
import { PricingProvider } from './context/PricingContext';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Landing from './components/Landing';
import StepProjectType from './components/StepProjectType';
import StepMeasureMethod from './components/StepMeasureMethod';
import StepQuoteMode from './components/StepQuoteMode';
import StepMeasurements from './components/StepMeasurements';
import StepClientInfo from './components/StepClientInfo';
import StepVerification from './components/StepVerification';
import StepQuote from './components/StepQuote';
import AdminApp from './components/admin/AdminApp';
import TermsConditions from './components/TermsConditions';
import Contact from './components/Contact';

function AppContent() {
  const state = useQuote();

  // Steps: 0=landing, 1=project type, 2=measure method, 3=quote mode, 4=items, 5=client info, 6=verify, 7=quote
  const renderStep = () => {
    switch (state.step) {
      case 0: return <Landing />;
      case 1: return <StepProjectType />;
      case 2: return <StepMeasureMethod />;
      case 3: return <StepQuoteMode />;
      case 4: return <StepMeasurements />;
      case 5: return <StepClientInfo />;
      case 6: return <StepVerification />;
      case 7: return <StepQuote />;
      default: return <Landing />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProgressBar currentStep={state.step} />
      <main>{renderStep()}</main>
    </div>
  );
}

export default function App() {
  if (window.location.pathname.startsWith('/admin')) return <AdminApp />;
  if (window.location.pathname === '/terms') return <TermsConditions />;
  if (window.location.pathname === '/contact') return <Contact />;

  return (
    <PricingProvider>
      <QuoteProvider>
        <AppContent />
      </QuoteProvider>
    </PricingProvider>
  );
}
