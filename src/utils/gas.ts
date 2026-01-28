import { ReceiptRecord } from '../db';

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data:image/jpeg;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const sendToGas = async (receipt: ReceiptRecord, gasUrl: string) => {
    if (!gasUrl) return;

    try {
        const imageBase64 = await blobToBase64(receipt.imageBlob);

        const payload = {
            date: new Date(receipt.date).toLocaleDateString('ja-JP'),
            amount: receipt.amount,
            text: receipt.rawText || '',
            fileName: receipt.fileName,
            id: receipt.id,
            image: imageBase64,
            mimeType: receipt.imageBlob.type
        };

        // mode: 'no-cors' is important because GAS Web Apps don't support CORS headers typically without redirects
        await fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        return true;
    } catch (error) {
        console.error('Failed to send to GAS:', error);
        return false;
    }
};
