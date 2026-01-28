import { useState, useMemo, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { ReceiptList } from './components/ReceiptList';
import { SummaryCard } from './components/SummaryCard';
import { processReceiptImage } from './utils/ocr';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import type { ReceiptData } from './types';
import { ScanLine, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { SettingsModal } from './components/SettingsModal';
import { sendToGas } from './utils/gas';

function App() {
  /* 
   * Use Dexie's useLiveQuery to automatically sync with the DB.
   * This replaces the simple useState for receipts.
   */
  const receipts = useLiveQuery(async () => {
    const recs = await db.receipts.orderBy('date').reverse().toArray();
    // Convert Blobs back to URLs for display
    return recs.map(r => ({
      ...r,
      imageUrl: URL.createObjectURL(r.imageBlob)
    }));
  }, []) || [];

  const [isProcessing, setIsProcessing] = useState(false);
  const [deductionThreshold] = useState(100000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('gasUrl') || '');

  // Persist GAS URL
  useEffect(() => {
    if (gasUrl) localStorage.setItem('gasUrl', gasUrl);
  }, [gasUrl]);

  const handleFileSelect = async (files: File[]) => {
    setIsProcessing(true);

    for (const file of files) {
      const id = Math.random().toString(36).substr(2, 9);

      // 1. Add initial record to DB
      await db.receipts.add({
        id,
        fileName: file.name,
        imageBlob: file, // Save the file object directly as Blob
        amount: 0,
        date: Date.now(),
        status: 'processing'
      });

      // 2. Process OCR
      try {
        const { amount, text } = await processReceiptImage(file);

        // 3. Update DB record with result
        await db.receipts.update(id, {
          amount,
          status: 'done',
          rawText: text
        });

        // 4. Send to GAS if URL is configured
        if (gasUrl) {
          const record = await db.receipts.get(id);
          if (record) {
            // Processing async to not block UI updates too much, or await if we want to ensure
            sendToGas(record, gasUrl).catch(err => console.error(err));
          }
        }
      } catch (e) {
        await db.receipts.update(id, {
          status: 'error'
        });
      }
    }

    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    await db.receipts.delete(id);
  };

  const handleClearAll = async () => {
    if (window.confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
      await db.receipts.clear();
    }
  };

  const handleUpdateAmount = async (id: string, amount: number) => {
    await db.receipts.update(id, { amount });
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
              医療費控除チェッカー
            </h1>
          </div>

          <button
            onClick={handleClearAll}
            className="text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-800/50"
            disabled={receipts.length === 0}
          >
            すべて削除
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gasUrl={gasUrl}
        onSave={(url) => setGasUrl(url)}
      />

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
              receipts={receipts as ReceiptData[]}
            />

            <div className="pt-4">
              <UploadZone
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
              />
            </div>

            <div className="text-xs text-slate-500 text-center px-4">
              ※ データはブラウザ内（IndexedDB）に保存されます。<br />
              プライバシー保護のため、外部サーバーには一切送信されません。
            </div>
          </div>

          {/* Right / Bottom: List */}
          <div className="lg:col-span-7">
            {receipts.length > 0 ? (
              <ReceiptList
                receipts={receipts as ReceiptData[]} // Cast is safe because we map blob to url
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
