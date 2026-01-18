<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { encode, decode } from '$lib/translator';
	import Logo from '$lib/components/Logo.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let input = $state('');
	let output = $state('');
	let error = $state('');
	let copied = $state(false);
	let hasTouch = $state(false);

	$effect(() => {
		if (browser) {
			hasTouch = window.matchMedia('(pointer: coarse)').matches;
		}
	});

	function updateUrl(mode: 'e' | 'd', text: string) {
		if (browser && text) {
			window.history.replaceState(null, '', `#${mode}:${encodeURIComponent(text)}`);
		}
	}

	function clearUrl() {
		if (browser) {
			window.history.replaceState(null, '', window.location.pathname);
		}
	}

	function loadFromHash() {
		const hash = window.location.hash.slice(1);
		if (!hash) return;

		const match = hash.match(/^([ed]):(.+)$/);
		if (!match) {
			clearUrl();
			return;
		}

		const [, mode, text] = match;
		try {
			input = decodeURIComponent(text);
			if (mode === 'e') {
				output = encode(input);
			} else {
				output = decode(input);
			}
		} catch {
			clearUrl();
		}
	}

	onMount(() => {
		loadFromHash();
		window.addEventListener('hashchange', loadFromHash);
		return () => window.removeEventListener('hashchange', loadFromHash);
	});

	function handleEncode() {
		error = '';
		try {
			output = encode(input);
			updateUrl('e', input);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Encoding failed';
		}
	}

	function handleDecode() {
		error = '';
		try {
			output = decode(input);
			updateUrl('d', input);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Decoding failed';
		}
	}

	function swap() {
		input = output;
		output = '';
		error = '';
	}

	function clear() {
		input = '';
		output = '';
		error = '';
		clearUrl();
	}

	async function copyOutput() {
		await navigator.clipboard.writeText(output);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	async function copyLink() {
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && e.target instanceof HTMLTextAreaElement) {
			e.preventDefault();
			handleEncode();
		} else if (e.key === 'Enter' && e.shiftKey && e.target instanceof HTMLTextAreaElement) {
			e.preventDefault();
			handleDecode();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<MetaTags
	title="kbye"
	titleTemplate="%s"
	description="Hide secret messages in boring replies. Encode anything into ok, k, bye, lol."
	canonical="https://kbye.lol"
	openGraph={{
		type: 'website',
		url: 'https://kbye.lol',
		title: 'kbye',
		description: 'Hide secret messages in boring replies.',
		siteName: 'kbye',
		images: [
			{
				url: 'https://kbye.lol/og-image.png',
				width: 1200,
				height: 630,
				alt: 'kbye - Hide messages in boring replies'
			}
		]
	}}
	twitter={{
		cardType: 'summary_large_image',
		title: 'kbye',
		description: 'Hide secret messages in boring replies.',
		image: 'https://kbye.lol/og-image.png'
	}}
/>

<div class="min-h-screen bg-black text-white selection:bg-white selection:text-black">
	<div class="max-w-xl mx-auto px-6 py-16">
		<!-- Header -->
		<header class="mb-16">
			<div class="flex items-center gap-4 mb-4">
				<Logo size={56} />
				<h1 class="text-4xl font-black tracking-tight">kbye</h1>
			</div>
			<p class="text-zinc-500 text-lg">
				Hide messages in boring replies.
			</p>
		</header>

		<!-- Input -->
		<div class="mb-6">
			<textarea
				bind:value={input}
				placeholder={hasTouch ? "Type anything..." : "Type anything... (Enter to encode, Shift+Enter to decode)"}
				rows="4"
				class="w-full bg-transparent border-2 border-zinc-800 rounded-none p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors resize-none font-mono"
			></textarea>
		</div>

		<!-- Actions -->
		<div class="flex gap-2 mb-6">
			<button
				onclick={handleEncode}
				class="flex-1 py-3 bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
			>
				ENCODE
			</button>
			<button
				onclick={handleDecode}
				class="flex-1 py-3 bg-zinc-900 text-white font-bold border-2 border-zinc-800 hover:border-zinc-600 transition-colors"
			>
				DECODE
			</button>
		</div>

		{#if error}
			<p class="text-red-500 text-sm mb-6 font-mono">{error}</p>
		{/if}

		<!-- Output -->
		{#if output}
			<div class="mb-6 animate-in fade-in duration-200">
				<div class="flex items-center justify-between mb-2">
					<span class="text-zinc-600 text-sm font-mono uppercase tracking-wider">Output</span>
					<div class="flex gap-3">
						<button onclick={copyOutput} class="text-zinc-600 hover:text-white text-sm transition-colors">
							{copied ? 'copied!' : 'copy'}
						</button>
						<button onclick={copyLink} class="text-zinc-600 hover:text-white text-sm transition-colors">
							link
						</button>
						<button onclick={swap} class="text-zinc-600 hover:text-white text-sm transition-colors">
							swap
						</button>
						<button onclick={clear} class="text-zinc-600 hover:text-white text-sm transition-colors">
							clear
						</button>
					</div>
				</div>
				<div class="bg-zinc-950 border-2 border-zinc-800 p-4">
					<p class="font-mono text-zinc-300 break-all">{output}</p>
				</div>
			</div>
		{/if}

		<!-- Example hint -->
		{#if !input && !output}
			<p class="text-zinc-700 text-sm mb-6">
				Try encoding: <button onclick={() => { input = 'hello'; handleEncode(); }} class="text-zinc-500 hover:text-white transition-colors">hello</button>
			</p>
		{/if}

		<!-- Dictionary -->
		<footer class="pt-16 border-t border-zinc-900">
			<p class="text-zinc-700 text-sm font-mono mb-2">DICTIONARY</p>
			<div class="flex flex-wrap gap-2">
				{#each ['ok', 'oke', 'k', 'bye', 'lol', 'cool', 'nice', 'sure', 'yeah'] as word}
					<span class="px-3 py-1 bg-zinc-950 border border-zinc-800 text-zinc-500 text-sm font-mono">
						{word}
					</span>
				{/each}
			</div>

			<div class="mt-12 flex items-center justify-between text-zinc-600 text-sm">
				<span>
					Made by <a href="https://github.com/giorgiobrullo" class="hover:text-white transition-colors">Giorgio Brullo</a>
				</span>
				<a href="https://github.com/giorgiobrullo/kbye" class="hover:text-white transition-colors">
					Source
				</a>
			</div>
		</footer>
	</div>
</div>
