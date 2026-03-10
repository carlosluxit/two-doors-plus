import { QuoteProvider, useQuote } from './context/QuoteContext';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import Landing from './components/Landing';
import StepProjectType from './components/StepProjectType';
import StepMeasureMethod from './components/StepMeasureMethod';
import StepMeasurements from './components/StepMeasurements';
import StepTierSelection from './components/StepTierSelection';
import StepClientInfo from './components/StepClientInfo';
import StepVerification from './components/StepVerification';
import StepQuote from './components/StepQuote';

function AppContent() {
  const state = useQuote();

  const renderStep = () => {
    switch (state.step) {
      case 0:
        return <Landing />;
      case 1:
        return <StepProjectType />;
      case 2:
        return <StepMeasureMethod />;
      case 3:
        return <StepMeasurements />;
      case 4:
        return <StepTierSelection />;
      case 5:
        return <StepClientInfo />;
      case 6:
        return <StepVerification />;
      case 7:
        return <StepQuote />;
      default:
        return <Landing />;
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
  return (
    <QuoteProvider>
      <AppContent />
    </QuoteProvider>
  );
}
