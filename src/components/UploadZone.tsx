import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadZoneProps {
    onFileSelect: (files: File[]) => void;
    isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isProcessing }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (isProcessing) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(Array.from(e.target.files));
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={clsx(
                "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
                isProcessing
                    ? "border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed"
                    : "border-slate-600 bg-slate-800/30 hover:border-primary hover:bg-slate-800/60 hover:shadow-lg hover:shadow-primary/20"
            )}
        >
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleChange}
                disabled={isProcessing}
                className="absolute inset-0 cursor-pointer opacity-0 z-10"
            />

            <div className="flex flex-col items-center justify-center py-10 md:py-16 px-6 text-center">
                <div className="mb-4 md:mb-6 rounded-full bg-slate-800 p-4 shadow-xl ring-1 ring-slate-700 group-hover:bg-primary/20 group-hover:ring-primary/50 transition-all duration-300">
                    {isProcessing ? (
                        <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary animate-spin" />
                    ) : (
                        <Camera className="h-8 w-8 md:h-10 md:w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                    )}
                </div>

                <h3 className="mb-2 text-lg md:text-xl font-bold text-white">
                    {isProcessing ? '解析中...' : '写真を撮る / 選択'}
                </h3>
                <p className="text-xs md:text-sm text-slate-400 max-w-xs mx-auto dark:text-slate-400">
                    <span className="md:hidden">タップしてカメラを起動または画像を選択</span>
                    <span className="hidden md:inline">クリックまたはドラッグ＆ドロップ</span>
                </p>
            </div>

            {/* Decorative gradient blur */}
            <div className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-primary/10 blur-3xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none" />
        </div>
    );
};
