import { ReceiptRecord } from '../db';
import { ReceiptData } from '../types';

export const generateCSV = (receipts: ReceiptRecord[] | ReceiptData[]) => {
    // Header row
    const headers = ['日付', '金額', '内容(OCR結果)', 'ファイル名', 'ID'];

    // Data rows
    const rows = receipts.map(r => {
        const dateStr = r.date ? new Date(r.date).toLocaleDateString('ja-JP') : '';
        const amountStr = r.amount ? r.amount.toString() : '0';
        // Escape quotes and wrap in quotes for CSV safety
        const textStr = r.rawText ? `"${r.rawText.replace(/"/g, '""').replace(/\n/g, ' ')}"` : '""';
        const fileNameStr = `"${r.fileName}"`;

        return [dateStr, amountStr, textStr, fileNameStr, r.id].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (content: string, filename = 'medical_expenses.csv') => {
    // Add BOM for Excel compatibility with UTF-8
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
