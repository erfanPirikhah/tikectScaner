import { Suspense } from 'react';
import ScanResultClient from './ScanResultClient';

function ScanResultContent() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen">
          <div className="p-4 border-b">
            <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
              <div className="text-xl font-bold">نتیجه اسکن</div>
            </div>
          </div>
          <main className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <ScanResultClient />
    </Suspense>
  );
}

export default ScanResultContent;