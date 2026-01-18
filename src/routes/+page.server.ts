import type { PageServerLoad } from './$types';
import { encode, decode } from '$lib/translator';

export const load: PageServerLoad = ({ url }) => {
	const encodedText = url.searchParams.get('e');
	const decodedText = url.searchParams.get('d');

	let input = '';
	let output = '';
	let mode: 'e' | 'd' | null = null;

	if (encodedText) {
		try {
			input = encodedText;
			output = encode(encodedText);
			mode = 'e';
		} catch {
			// Invalid input, ignore
		}
	} else if (decodedText) {
		try {
			input = decodedText;
			output = decode(decodedText);
			mode = 'd';
		} catch {
			// Invalid input, ignore
		}
	}

	return {
		input,
		output,
		mode,
		ogImageUrl: mode && input ? `/api/og?${mode}=${encodeURIComponent(input)}` : null
	};
};
