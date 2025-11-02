import DashboardLayout from '@/components/DashboardLayout';
import DecorativeBackground from '@/components/DecorativeBackground';
import CalculatorsContent from '@/components/CalculatorsContent';

const Calculators = () => (
  <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <DecorativeBackground />
      <CalculatorsContent />
    </div>
  </DashboardLayout>
);

export default Calculators;