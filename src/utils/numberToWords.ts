/**
 * Utility to convert numerical currency amounts to English words (Indian & International numbering system)
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  if (n < 100) {
    const rem = n % 10;
    return TENS[Math.floor(n / 10)] + (rem !== 0 ? ' ' + ONES[rem] : '');
  }
  const rem = n % 100;
  return ONES[Math.floor(n / 100)] + ' Hundred' + (rem !== 0 ? ' and ' + convertLessThanThousand(rem) : '');
}

/**
 * Converts Indian Rupee number to Words (Crore, Lakh, Thousand, Hundred)
 */
export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Zero Rupees Only';
  if (amount < 0) return 'Negative ' + numberToIndianWords(Math.abs(amount));

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let num = integerPart;
  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const remainder = num;

  if (crore > 0) {
    result += convertLessThanThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    result += convertLessThanThousand(remainder);
  }

  result = result.trim();
  if (!result) result = 'Zero';

  let finalWords = 'Rupees ' + result;

  if (decimalPart > 0) {
    finalWords += ' and ' + convertLessThanThousand(decimalPart) + ' Paise';
  }

  finalWords += ' Only';
  return finalWords.replace(/\s+/g, ' ');
}
