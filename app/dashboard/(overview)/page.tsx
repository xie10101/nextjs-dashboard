// 
import { Card } from '@/app/ui/dashboard/cards';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
 import { fetchCardData, fetchRevenue } from '@/app/lib/data';
import { Suspense } from 'react';
import { RevenueChart } from '@/app/dashboard/revenue-chart';
import { RevenueChartSkeleton, LatestInvoicesSkeleton } from "@/app/ui/skeletons"
import Info from '@/app/ui/infos';
export default async function Page() {
const [
    cardData,
    revenue, 
  ] = await Promise.all([
    fetchCardData(),
    fetchRevenue(),
  ]);
  const { totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers } = cardData;
  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          仪表板
        </h1>
        <Info />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="已收款" value={totalPaidInvoices} type="collected" />
        <Card title="待处理" value={totalPendingInvoices} type="pending" />
        <Card title="总发票数" value={numberOfInvoices} type="invoices" />
        <Card
          title="总客户数"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}> 
          <LatestInvoices  />
        </Suspense>
      </div>
    </main>
  );
}