import type { FC } from 'react';
import { Navbar } from './components/Navbar';
import { MerchantDashboard } from './pages/MerchantDashboard';

const App: FC = () => {
  return (
    <div>
      <Navbar />
      <main className="container">
        <MerchantDashboard />
      </main>
    </div>
  );
}

export default App;
