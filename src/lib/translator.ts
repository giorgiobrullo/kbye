// 8 values, some with synonyms
const DICTIONARY: string[][] = [
	['ok', 'oke', 'okay'],           // 000
	['k', 'kk'],                     // 001
	['bye', 'cya', 'bai'],           // 010
	['lol', 'lmao', 'haha'],         // 011
	['cool', 'kool'],                // 100
	['nice', 'noice'],               // 101
	['sure', 'yup', 'yep'],          // 110
	['yeah', 'yea', 'ya'],           // 111
];

const BITS_PER_WORD = 3;

// Build reverse lookup: word -> value
const WORD_TO_VALUE = new Map<string, number>();
DICTIONARY.forEach((words, value) => {
	words.forEach(word => WORD_TO_VALUE.set(word, value));
});

function randomWord(value: number): string {
	const options = DICTIONARY[value];
	return options[Math.floor(Math.random() * options.length)];
}

export function encode(text: string): string {
	if (!text) return '';

	// Convert text to binary string
	const bytes = new TextEncoder().encode(text);
	let binary = '';
	for (const byte of bytes) {
		binary += byte.toString(2).padStart(8, '0');
	}

	// Pad to multiple of BITS_PER_WORD
	while (binary.length % BITS_PER_WORD !== 0) {
		binary += '0';
	}

	// Convert each chunk to a word
	const words: string[] = [];
	for (let i = 0; i < binary.length; i += BITS_PER_WORD) {
		const chunk = binary.slice(i, i + BITS_PER_WORD);
		const value = parseInt(chunk, 2);
		words.push(randomWord(value));
	}

	return words.join(' ');
}

export function decode(encoded: string): string {
	if (!encoded.trim()) return '';

	const words = encoded.toLowerCase().trim().split(/\s+/);

	// Convert words back to binary
	let binary = '';
	for (const word of words) {
		const value = WORD_TO_VALUE.get(word);
		if (value === undefined) {
			throw new Error(`Unknown word: "${word}"`);
		}
		binary += value.toString(2).padStart(BITS_PER_WORD, '0');
	}

	// Convert binary to bytes (drop incomplete bytes at end)
	const bytes: number[] = [];
	for (let i = 0; i + 8 <= binary.length; i += 8) {
		const byte = parseInt(binary.slice(i, i + 8), 2);
		bytes.push(byte);
	}

	return new TextDecoder().decode(new Uint8Array(bytes));
}

export const ALL_WORDS = DICTIONARY.flat();
