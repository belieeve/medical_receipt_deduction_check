import Tesseract from 'tesseract.js';

export const processReceiptImage = async (file: File): Promise<{ text: string; amount: number }> => {
    try {
        const result = await Tesseract.recognize(
            file,
            'jpn',
            {
                logger: m => console.log(m) // Optional logging
            }
        );

        const text = result.data.text;
        const amount = extractAmount(text);

        return { text, amount };
    } catch (error) {
        console.error("OCR Error:", error);
        throw error;
    }
};

const extractAmount = (text: string): number => {
    // Common keywords preceding total amount in Japanese receipts
    const keywords = ['合計', '請求金額', '領収金額', 'お預り', '対象額'];

    // Clean text lines
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    let bestAmount = 0;

    // Strategy 1: Look for keywords and immediate following numbers
    for (const line of lines) {
        for (const keyword of keywords) {
            if (line.includes(keyword)) {
                // Extract numbers from this line
                const numbers = extractNumbersFromLine(line);
                if (numbers.length > 0) {
                    return Math.max(...numbers); // Usually the largest number on the total line is the total
                }
            }
        }
    }

    // Strategy 2: If no keyword found, look for valid currency patterns and take the largest logical amount
    // Exclude phone numbers (often start with 0, 10-11 digits)
    const allNumbers = extractNumbersFromLine(text);

    // Filter out unlikely numbers (too small, likely dates, or too massive/phone numbers)
    // Medical receipts usually range from 100s to 100,000s. 
    // Phone numbers like 03-1234-5678 might appear as 12345678.
    // 10 digits is usually a phone number. 

    const potentialAmounts = allNumbers.filter(num => {
        return num > 10 && num < 10000000; // Filter out single digits and huge numbers
    });

    if (potentialAmounts.length > 0) {
        bestAmount = Math.max(...potentialAmounts);
    }

    return bestAmount;
};

const extractNumbersFromLine = (line: string): number[] => {
    // Matches 1,000 or 1000. Ignores dates roughly (needs improvement but works for basic)
    // We remove commas and non-digit chars that aren't separators

    // Regex to capture groups of digits/commas
    // We want to avoid capturing "2023" as an amount if possible, but hard to distinguish without context.

    const matches = line.matchAll(/([0-9]{1,3}(,[0-9]{3})*)|([0-9]+)/g);
    const numbers: number[] = [];

    for (const match of matches) {
        const raw = match[0].replace(/,/g, '');
        const val = parseInt(raw, 10);
        if (!isNaN(val)) {
            numbers.push(val);
        }
    }
    return numbers;
};
