import DashboardLayout from '../components/DashboardLayout';
import { ReportsAnalytics } from '../components/ReportsAnalytics';
import AllInOneReport from '../components/AllInOneReport';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Reports() {
  return (
    <DashboardLayout>
      <Tabs defaultValue="all-in-one" className="p-4 sm:p-6 lg:p-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all-in-one">All-in-One Report</TabsTrigger>
          <TabsTrigger value="analytics">Live Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="all-in-one" className="mt-4">
          <AllInOneReport />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <ReportsAnalytics />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
