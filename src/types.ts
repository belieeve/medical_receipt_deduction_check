export interface ReceiptData {
  id: string;
  fileName: string;
  imageUrl: string;
  amount: number; // 0 if not found
  date?: string;
  status: 'processing' | 'done' | 'error';
  rawText?: string;
}
