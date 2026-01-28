import React from 'react';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface SummaryCardProps {
    totalAmount: number;
    deductionThreshold: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ totalAmount, deductionThreshold }) => {
    const diff = totalAmount - deductionThreshold;
    const isEligible = diff > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 md:p-8"
        >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-primary" />
                        集計結果
                    </h2>
                    <p className="text-slate-400 text-sm">医療費控除の目安をリアルタイムで計算</p>
                </div>

                <div className="w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end gap-1 p-3 md:p-0 bg-slate-800/30 md:bg-transparent rounded-lg md:rounded-none border border-slate-700/50 md:border-none">
                    <div className="text-sm text-slate-400">合計医療費</div>
                    <div className="text-2xl md:text-3xl font-bold text-white font-mono tracking-tight">
                        ¥ {totalAmount.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Threshold */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">控除基準額</h4>
                        <div className="text-xl font-mono text-slate-300">
                            - ¥ {deductionThreshold.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">※一般的に10万円または所得の5%</p>
                    </div>

                    {/* Card 2: Result */}
                    <div className={clsx(
                        "md:col-span-2 rounded-xl p-4 border relative overflow-hidden transition-all duration-500",
                        isEligible
                            ? "bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-primary/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                            : "bg-slate-800/30 border-slate-700"
                    )}>
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between h-full gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-300 mb-1">
                                    控除対象額 (見込み)
                                </h4>
                                {isEligible ? (
                                    <div className="text-3xl md:text-4xl font-bold font-mono text-white gradient-text">
                                        ¥ {diff.toLocaleString()}
                                    </div>
                                ) : (
                                    <div className="text-3xl md:text-4xl font-bold font-mono text-slate-500">
                                        ¥ 0
                                    </div>
                                )}
                            </div>

                            {isEligible ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-full border border-green-500/30 text-sm font-semibold">
                                    <TrendingUp className="w-4 h-4" />
                                    控除対象です
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-400 rounded-full border border-slate-600/50 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    基準額に達していません
                                </div>
                            )}
                        </div>

                        {isEligible && (
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
