import { useState, useMemo } from 'react';
import { UploadZone } from './components/UploadZone';
import { ReceiptList } from './components/ReceiptList';
import { SummaryCard } from './components/SummaryCard';
import { processReceiptImage } from './utils/ocr';
import type { ReceiptData } from './types';
import { ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deductionThreshold] = useState(100000);

  const handleFileSelect = async (files: File[]) => {
    setIsProcessing(true);

    // Create placeholders immediately
    const newReceipts: ReceiptData[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      imageUrl: URL.createObjectURL(file), // Create preview URL
      amount: 0,
      status: 'processing'
    }));

    setReceipts(prev => [...prev, ...newReceipts]);

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const receiptId = newReceipts[i].id;

      try {
        const { amount, text } = await processReceiptImage(file);

        setReceipts(prev => prev.map(r =>
          r.id === receiptId
            ? { ...r, amount, status: 'done', rawText: text } // Update with real result
            : r
        ));
      } catch (e) {
        setReceipts(prev => prev.map(r =>
          r.id === receiptId
            ? { ...r, status: 'error' }
            : r
        ));
      }
    }

    setIsProcessing(false);
  };

  const handleDelete = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateAmount = (id: string, amount: number) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, amount } : r));
  };

  const currentTotal = useMemo(() => {
    return receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [receipts]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/5">
        <div className="container py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary/20 p-1.5 md:p-2 rounded-lg ring-1 ring-primary/30">
              <ScanLine className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Medical Tax Checker
            </h1>
          </div>

          <button
            onClick={() => setReceipts([])}
            className="text-sm text-slate-400 hover:text-white transition-colors"
            disabled={receipts.length === 0}
          >
            Clear All
          </button>
        </div>
      </header>

      <main className="container mt-6 md:mt-8 space-y-8 md:space-y-12">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
          >
            医療費控除を<span className="gradient-text">瞬時に計算</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            領収証をアップロードするだけで、OCRが金額を自動読み取り。<br />
            面倒な計算も自動化して、控除対象額を一目で確認できます。
          </motion.p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left / Top: Summary & Upload */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <SummaryCard
              totalAmount={currentTotal}
              deductionThreshold={deductionThreshold}
            />

            <div className="pt-4">
              <UploadZone
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
              />
            </div>

            <div className="text-xs text-slate-500 text-center px-4">
              ※ プライバシー保護のため、画像データはサーバーに送信されず、すべてブラウザ内で処理されます。
            </div>
          </div>

          {/* Right / Bottom: List */}
          <div className="lg:col-span-7">
            {receipts.length > 0 ? (
              <ReceiptList
                receipts={receipts}
                onDelete={handleDelete}
                onUpdateAmount={handleUpdateAmount}
              />
            ) : (
              <div className="h-64 rounded-2xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center text-slate-500">
                <p>まだ領収証がありません</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
