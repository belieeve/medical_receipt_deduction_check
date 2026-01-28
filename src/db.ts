import Dexie, { Table } from 'dexie';

export interface ReceiptRecord {
    id: string;
    fileName: string;
    imageBlob: Blob; // Store actual file data instead of URL
    amount: number;
    date: number; // Timestamp
    status: 'processing' | 'done' | 'error';
    rawText?: string;
}

export class ReceiptDatabase extends Dexie {
    receipts!: Table<ReceiptRecord>;

    constructor() {
        super('MedicalReceiptDB');
        this.version(1).stores({
            receipts: 'id, date, status' // Primary key and indexed props
        });
    }
}

export const db = new ReceiptDatabase();
