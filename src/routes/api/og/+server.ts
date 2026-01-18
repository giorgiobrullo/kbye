import { encode, decode } from '$lib/translator';
import type { RequestHandler } from './$types';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Logo SVG as a component for satori
const Logo = {
	type: 'svg',
	props: {
		width: 72,
		height: 72,
		viewBox: '0 0 128 128',
		children: [
			{
				type: 'rect',
				props: {
					width: 128,
					height: 128,
					rx: 24,
					fill: '#18181b',
				},
			},
			{
				type: 'path',
				props: {
					d: 'M64 24c0 0-28 32-28 52c0 15.464 12.536 28 28 28s28-12.536 28-28c0-20-28-52-28-52z',
					fill: 'none',
					stroke: '#fafafa',
					'stroke-width': 6,
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round',
				},
			},
			{
				type: 'line',
				props: {
					x1: 36,
					y1: 96,
					x2: 92,
					y2: 40,
					stroke: '#fafafa',
					'stroke-width': 6,
					'stroke-linecap': 'round',
				},
			},
		],
	},
};

export const GET: RequestHandler = async ({ url, fetch }) => {
	const encodedText = url.searchParams.get('e');
	const decodedText = url.searchParams.get('d');

	let input = '';
	let output = '';
	let mode: 'encode' | 'decode' | null = null;

	if (encodedText) {
		try {
			input = encodedText;
			output = encode(encodedText);
			mode = 'encode';
		} catch {
			// Invalid input
		}
	} else if (decodedText) {
		try {
			input = decodedText;
			output = decode(decodedText);
			mode = 'decode';
		} catch {
			// Invalid input
		}
	}

	// Load fonts - both regular and bold weights
	const [fontBoldResponse, fontRegularResponse] = await Promise.all([
		fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff'),
		fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff'),
	]);
	const [fontBoldData, fontRegularData] = await Promise.all([
		fontBoldResponse.arrayBuffer(),
		fontRegularResponse.arrayBuffer(),
	]);

	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#000',
					padding: '60px',
					fontFamily: 'Inter',
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								alignItems: 'center',
								marginBottom: mode ? '40px' : '20px',
							},
							children: [
								Logo,
								{
									type: 'span',
									props: {
										style: {
											marginLeft: '20px',
											fontSize: '56px',
											fontWeight: 700,
											color: 'white',
											letterSpacing: '-0.02em',
										},
										children: 'kbye',
									},
								},
							],
						},
					},
					mode && input
						? {
								type: 'div',
								props: {
									style: {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: '16px',
										maxWidth: '100%',
									},
									children: [
										{
											type: 'div',
											props: {
												style: {
													fontSize: '18px',
													fontWeight: 400,
													color: '#71717a',
													textTransform: 'uppercase',
													letterSpacing: '0.15em',
												},
												children: mode === 'encode' ? 'Input' : 'Encoded',
											},
										},
										{
											type: 'div',
											props: {
												style: {
													fontSize: '36px',
													fontWeight: 700,
													color: 'white',
													textAlign: 'center',
													maxWidth: '1000px',
												},
												children: input.length > 40 ? input.slice(0, 40) + '...' : input,
											},
										},
										{
											type: 'div',
											props: {
												style: {
													fontSize: '32px',
													color: '#52525b',
													margin: '8px 0',
												},
												children: '↓',
											},
										},
										{
											type: 'div',
											props: {
												style: {
													fontSize: '18px',
													fontWeight: 400,
													color: '#71717a',
													textTransform: 'uppercase',
													letterSpacing: '0.15em',
												},
												children: mode === 'encode' ? 'Output' : 'Decoded',
											},
										},
										{
											type: 'div',
											props: {
												style: {
													fontSize: '28px',
													fontWeight: 400,
													color: '#a1a1aa',
													textAlign: 'center',
													maxWidth: '1000px',
													lineHeight: 1.4,
												},
												children: output.length > 180 ? output.slice(0, 180) + '...' : output,
											},
										},
									],
								},
							}
						: {
								type: 'div',
								props: {
									style: {
										fontSize: '28px',
										fontWeight: 400,
										color: '#71717a',
									},
									children: 'Hide secret messages in boring replies.',
								},
							},
				],
			},
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Inter',
					data: fontBoldData,
					weight: 700,
					style: 'normal',
				},
				{
					name: 'Inter',
					data: fontRegularData,
					weight: 400,
					style: 'normal',
				},
			],
		}
	);

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: 2400,
		},
		font: {
			loadSystemFonts: false,
		},
		shapeRendering: 2,
		textRendering: 1,
		imageRendering: 0,
	});
	const pngData = resvg.render();
	const pngBuffer = pngData.asPng();

	return new Response(new Uint8Array(pngBuffer), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};
