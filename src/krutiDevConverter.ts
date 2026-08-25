/**
 * Kruti Dev 010 <-> Mangal (Unicode) Bidirectional Font Converter
 * Specially designed for Indian Cyber Cafe & CSC typing operations.
 */

// Kruti Dev to Unicode character mappings
const KD_TO_UNI_MAP: Record<string, string> = {
  'ñ': 'ह्न',
  'ò': 'हृ',
  'ó': 'ह्र',
  'ô': 'ह्म्',
  'õ': 'ह्य',
  'ù': 'ष्ठ',
  'ú': 'ष्ट',
  'û': 'ज्ञ',
  'ü': 'द्य',
  'ý': 'द्ब',
  'þ': 'द्द',
  'ÿ': 'द्व',
  'À': 'द्ध',
  'Á': 'द्म',
  'Â': 'द्र',
  'Ã': '्र',
  'Ä': 'रू',
  'Å': 'रु',
  'Æ': 'ृ',
  'Ç': '़',
  'È': 'ं',
  'É': 'ँ',
  'Ê': 'ः',
  'Ë': 'ऽ',
  'Ì': 'ॅ',
  'Í': 'ॐ',
  'Î': '्',
  'Ï': '।',
  'Ð': '॥',
  'Ñ': '०',
  'Ò': '१',
  'Ó': '२',
  'Ô': '३',
  'Õ': '४',
  'Ö': '५',
  '×': '६',
  'Ø': '७',
  'Ù': '८',
  'Ú': '९',
  'Û': '₹',
  'Ü': '?',
  'Ý': '!',
  'Þ': '%',
  'ß': '/',
  'à': '(',
  'á': ')',
  'â': '"',
  'ã': '"',
  'ä': "'",
  'å': "'",
  'æ': '₹',
  'ç': '-',
  'è': ':',
  'é': ';',
  'ê': ',',
  'ë': '.',
  'ì': '“',
  'í': '”',
  'î': '‘',
  'ï': '’',
  'ð': '—',
  
  // Standard letters & matras
  'k': 'ा',
  'i': 'ी',
  'h': 'ी',
  'q': 'ु',
  'w': 'ू',
  's': 'े',
  'S': 'ै',
  'a': 'ं',
  'A': 'ा',
  'd': 'क',
  'D': 'क्',
  'f': 'ि', // Handled specially
  'g': 'ह',
  'G': 'ह्',
  'j': 'र',
  'J': 'श्र',
  'l': 'त',
  'L': 'त्',
  'u': 'न',
  'U': 'न्',
  'y': 'ल',
  'Y': 'ल्',
  't': 'ज',
  'T': 'ज्',
  'r': 'प',
  'R': 'प्',
  'e': 'म',
  'E': 'म्',
  'b': 'द',
  'B': 'द्',
  'v': 'अ',
  'V': 'आ',
  'c': 'ब',
  'C': 'ब्',
  'x': 'ग',
  'X': 'ग्',
  'z': '्र',
  'Z': 'र्', // Reph
  'o': 'द',
  'O': 'ध',
  'p': 'च',
  'P': 'च्',
  'n': 'स',
  'N': 'स्',
  'm': 'इ',
  'M': 'ई',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
  '0': '०',
  
  // Uppercase / shift keys
  'Q': 'फ',
  'W': 'ॉ',
  'I': 'ध',
  'K': 'ज्ञ',
  '{': 'क्ष',
  '}': 'द्व',
  '[': 'ख्',
  ']': '्',
  '|': 'द्य',
  '\\': '?',
  ';': 'य',
  ':': 'य्',
  "'": 'ट',
  '"': 'ठ',
  ',': 'ए',
  '<': 'ऐ',
  '.': 'ण्',
  '>': 'ण',
  '/': 'ध्र',
  '?': 'घ्',
  '~': '़',
  '`': '़',
  '+': 'ऋ',
  '=': 'ृ',
  '_': 'ऋ',
  '-': ':',
  '(': 'त्र',
  ')': 'ऋ',
  '*': 'द्ध',
  '&': 'ठ्',
  '^': 'त्र्',
  '%': 'र्',
  '$': '्र',
  '#': 'रु',
  '@': 'रू',
  '!': '!',
};

// Converts Kruti Dev 010 text to Mangal (Unicode)
export function convertKrutiDevToUnicode(krutiText: string): string {
  if (!krutiText) return '';

  let text = krutiText;

  // Replace multi-character combinations first
  const multiReplace: [RegExp, string][] = [
    [/ç/g, 'fa'],
    [/Ç/g, 'fS'],
    [/É/g, 'F'],
    [/Ê/g, 'G'],
    [/Í/g, 'I'],
    [/Î/g, 'J'],
    [/Ò/g, 'K'],
    [/Ó/g, 'L'],
    [/Ô/g, 'M'],
    [/Õ/g, 'N'],
    [/Ö/g, 'O'],
    [/×/g, 'P'],
    [/Ø/g, 'Q'],
    [/Ù/g, 'R'],
    [/Ú/g, 'S'],
    [/Û/g, 'T'],
    [/Ü/g, 'U'],
    [/Ý/g, 'V'],
    [/Þ/g, 'W'],
    [/ß/g, 'X'],
    [/à/g, 'Y'],
    [/á/g, 'Z'],
  ];

  // Specific Kruti Dev glyph combinations
  const specialPatterns: [RegExp, string][] = [
    [/\"/g, 'ठ'],
    [/\'/g, 'ट'],
    [/\{/g, 'क्ष'],
    [/\}/g, 'द्व'],
    [/\|/g, 'द्य'],
    [/«/g, 'त्र'],
    [/»/g, 'ज्ञ'],
    [/~/g, '़'],
    [/`/g, '़'],
    [/=/g, 'ृ'],
    [/_/g, 'ऋ'],
    [/\+/g, 'ऋ'],
    [/\[/g, 'ख्'],
    [/\]/g, '्'],
    [/\?/g, 'घ्'],
    [/\\/g, '?' ],
    [/;/g, 'य'],
    [/:/g, 'य्'],
    [/</g, 'ऐ'],
    [/>/g, 'ण'],
    [/\//g, 'ध्र'],
  ];

  // Apply symbol replacements
  for (const [re, rep] of specialPatterns) {
    text = text.replace(re, rep);
  }

  // Handle 'f' (Chhoti 'i' matra) position transposition
  // In Kruti Dev, 'f' precedes the consonant, but in Unicode 'ि' comes after the consonant
  // e.g. "fd" -> "कि", "fdr" -> "किर"
  let modifiedText = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === 'f') {
      let nextChar = text[i + 1] || '';
      let lookAhead = 1;
      
      // If next char is half letter, skip it to find full consonant
      if (['D', 'G', 'L', 'U', 'Y', 'T', 'R', 'E', 'B', 'C', 'X', 'P', 'N', 'ण्', 'ख्', 'घ्', 'य्'].includes(nextChar)) {
        lookAhead = 2;
      }
      
      const targetSub = text.substr(i + 1, lookAhead);
      let uniSub = '';
      for (const c of targetSub) {
        uniSub += KD_TO_UNI_MAP[c] || c;
      }
      modifiedText += uniSub + 'ि';
      i += lookAhead;
    } else if (ch === 'Z') {
      // Reph (र्) - in Kruti Dev it comes after the letter, in Unicode it comes before with halant
      // Append 'र्' before last consonant if possible
      modifiedText += 'र्';
    } else {
      modifiedText += KD_TO_UNI_MAP[ch] || ch;
    }
  }

  // Post-fix combinations and vowels
  let result = modifiedText
    .replace(/अाे/g, 'ओ')
    .replace(/अाै/g, 'औ')
    .replace(/अा/g, 'आ')
    .replace(/एे/g, 'ऐ')
    .replace(/िर्/g, 'र्ि')
    .replace(/्ा/g, '')
    .replace(/ाे/g, 'ो')
    .replace(/ाै/g, 'ौ')
    .replace(/िे/g, 'ि')
    .replace(/ीे/g, 'ी')
    .replace(/ुे/g, 'ु')
    .replace(/ूे/g, 'ू');

  // Fix Reph (र्) position: e.g. "कर्म" -> 'क' + 'म' + 'र्' -> 'क' + 'र्' + 'म'
  result = result.replace(/([क-ह])([ा-ौ]*)र्/g, 'र्$1$2');

  return result;
}

// Converts Mangal (Unicode) text to Kruti Dev 010
export function convertUnicodeToKrutiDev(unicodeText: string): string {
  if (!unicodeText) return '';

  // Inverse lookup map
  const UNI_TO_KD_MAP: Record<string, string> = {
    'ा': 'k',
    'ी': 'h',
    'ि': 'f',
    'ु': 'q',
    'ू': 'w',
    'े': 's',
    'ै': 'S',
    'ो': 'ks',
    'ौ': 'kS',
    'ं': 'a',
    'ँ': '¡',
    'ः': '%',
    '्': '',
    '़': '़',
    'क': 'd',
    'क्': 'D',
    'ख': '[k',
    'ख्': '[',
    'ग': 'x',
    'ग्': 'X',
    'घ': '?k',
    'घ्': '?',
    'च': 'p',
    'च्': 'P',
    'छ': 'N',
    'ज': 't',
    'ज्': 'T',
    'झ': 'Hk',
    'ट': "'",
    'ठ': '"',
    'ड': 'M',
    'ढ': '<',
    'ण': '>',
    'ण्': '.',
    'त': 'l',
    'त्': 'L',
    'थ': 'Fk',
    'थ्': 'F',
    'द': 'n',
    'द्': 'B',
    'ध': 'èk',
    'ध्': 'è',
    'न': 'u',
    'न्': 'U',
    'प': 'r',
    'प्': 'R',
    'फ': 'Q',
    'फ्': '¶',
    'ब': 'c',
    'ब्': 'C',
    'भ': 'Hk',
    'भ्': 'H',
    'म': 'e',
    'म्': 'E',
    'य': ';',
    'य्': ':',
    'र': 'j',
    'र्': 'Z',
    'ल': 'y',
    'ल्': 'Y',
    'व': 'o',
    'व्': 'O',
    'श': "'k",
    'श्': "'",
    'ष': '"k',
    'ष्': '"',
    'स': 'n',
    'स्': 'N',
    'ह': 'g',
    'ह्': 'G',
    'क्ष': '{k',
    'क्ष्': '{',
    'त्र': '(',
    'ज्ञ': 'K',
    'श्र': 'J',
    'अ': 'v',
    'आ': 'vk',
    'इ': 'b',
    'ई': 'bZ',
    'उ': 'm',
    'ऊ': 'Å',
    'ऋ': '_',
    'ए': ',',
    'ऐ': '<',
    'ओ': 'vks',
    'औ': 'vkS',
    '०': '0',
    '१': '1',
    '२': '2',
    '३': '3',
    '४': '4',
    '५': '5',
    '६': '6',
    '७': '7',
    '८': '8',
    '९': '9',
    '।': 'A',
  };

  let text = unicodeText;

  // Handle 'र्' (Reph) preceding consonant in Unicode -> moving to after consonant 'Z' in Kruti Dev
  text = text.replace(/र्([क-ह])/g, '$1Z');

  // Handle 'ि' (Chhoti 'i' matra) -> moving 'f' to BEFORE consonant in Kruti Dev
  text = text.replace(/([क-ह])ि/g, 'f$1');
  text = text.replace(/([क-ह]्[क-ह])ि/g, 'f$1');

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    result += UNI_TO_KD_MAP[ch] || ch;
  }

  return result;
}
