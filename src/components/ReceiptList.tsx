import React from 'react';
import type { ReceiptData } from '../types';
import { CheckCircle2, AlertCircle, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReceiptListProps {
    receipts: ReceiptData[];
    onDelete: (id: string) => void;
    onUpdateAmount: (id: string, newAmount: number) => void;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, onDelete, onUpdateAmount }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                読み取った領収証 ({receipts.length})
            </h3>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {receipts.map((receipt) => (
                        <motion.div
                            key={receipt.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                            className="glass-panel p-4 relative group hover:bg-slate-800/80 transition-colors"
                        >
                            <button
                                onClick={() => onDelete(receipt.id)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-800/50 hover:bg-red-500/20 hover:text-red-400 text-slate-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-700">
                                    <img
                                        src={receipt.imageUrl}
                                        alt="receipt preview"
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-400 truncate mb-1" title={receipt.fileName}>
                                        {receipt.fileName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {receipt.status === 'processing' && (
                                            <span className="text-xs text-yellow-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                                解析中...
                                            </span>
                                        )}
                                        {receipt.status === 'done' && (
                                            <span className="text-xs text-green-400 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                完了
                                            </span>
                                        )}
                                        {receipt.status === 'error' && (
                                            <span className="text-xs text-red-400 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                読取失敗
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="text-xs text-slate-500 block mb-1">金額 (円)</label>
                                <input
                                    type="number"
                                    value={receipt.amount}
                                    onChange={(e) => onUpdateAmount(receipt.id, Number(e.target.value) || 0)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-right font-mono text-lg text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    disabled={receipt.status === 'processing'}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
