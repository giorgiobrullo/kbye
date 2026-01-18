<script lang="ts">
	let { size = 48 }: { size?: number } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 128 128"
	class="inline-block"
>
	<rect width="128" height="128" rx="24" class="fill-zinc-800" />
	<!-- Water drop -->
	<path
		d="M64 24c0 0-28 32-28 52c0 15.464 12.536 28 28 28s28-12.536 28-28c0-20-28-52-28-52z"
		fill="none"
		class="stroke-zinc-100"
		stroke-width="6"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<!-- Slash -->
	<line x1="36" y1="96" x2="92" y2="40" class="stroke-zinc-100" stroke-width="6" stroke-linecap="round" />
</svg>
