import { QuoteProvider, useQuote } from './context/QuoteContext';
import { PricingProvider } from './context/PricingContext';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Landing from './components/Landing';
import StepProjectType from './components/StepProjectType';
import StepMeasureMethod from './components/StepMeasureMethod';
import StepMeasurements from './components/StepMeasurements';
import StepClientInfo from './components/StepClientInfo';
import StepVerification from './components/StepVerification';
import StepQuote from './components/StepQuote';
import AdminApp from './components/admin/AdminApp';

// Simple path-based admin detection (no router needed)
const isAdmin = window.location.pathname.startsWith('/admin');

function AppContent() {
  const state = useQuote();

  // Steps: 0=landing, 1=project type, 2=measure method, 3=items, 4=client info, 5=verify, 6=quote
  const renderStep = () => {
    switch (state.step) {
      case 0: return <Landing />;
      case 1: return <StepProjectType />;
      case 2: return <StepMeasureMethod />;
      case 3: return <StepMeasurements />;
      case 4: return <StepClientInfo />;
      case 5: return <StepVerification />;
      case 6: return <StepQuote />;
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
  if (isAdmin) return <AdminApp />;

  return (
    <PricingProvider>
      <QuoteProvider>
        <AppContent />
      </QuoteProvider>
    </PricingProvider>
  );
}
