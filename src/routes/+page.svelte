<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { Canvas } from '$lib/canvas';

	let endPosition = writable({ x: 0, y: 0 });
	let currentPosition = writable({ x: 0, y: 0 });
	let currentTime = writable(0);
	let logs: string[] = [];

	onMount(() => {
		const canvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
		if (!canvasElement) return;
		const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;

		new Canvas(
			canvasElement,
			ctx,
			canvasElement.width,
			canvasElement.height,
			endPosition,
			currentPosition,
			currentTime,
			addLog
		);
	});

	const addLog = (log: string) => {
		logs = [...logs, log];
	};
</script>

<main>
	<h1>ALGO TRACK</h1>
	<section class="grid">
		<div class="canvas-drawer">
			<canvas id="myCanvas" width="350" height="630"></canvas>
		</div>
		<div class="settings">
			<div class="info">
				<p>Current time: <span>{$currentTime}</span></p>
				<p>Current algorithm: <span>A*</span></p>
				<p>Current position: <span>{$currentPosition.x}, {$currentPosition.y}</span></p>
				<p>Destination: <span>{$endPosition.x}, {$endPosition.y}</span></p>
			</div>
			<div class="logs">
				<h3>Logs</h3>
				<ul>
					{#each logs as log}
						<li>{log}</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>
</main>

<style>
	main {
		display: flex;
		min-height: 100vh;
		margin: 0;
		padding: 0;
		flex-direction: column;
		align-items: center;
		background-color: #040d12;
		color: white;
	}

	h1 {
		margin-bottom: 40px;
		font-weight: 800;
	}

	.grid {
		display: flex;
		gap: 20px;
		height: 670px;
	}

	@media (max-width: 720px) {
		.grid {
			flex-direction: column;
			height: auto;
		}
	}

	.canvas-drawer {
		background-color: white;
		border-radius: 10px;
		padding: 20px;
		height: 630px;
	}

	.settings {
		display: flex;
		flex-direction: column;
		gap: 20px;
		flex: 1;
	}

	.info,
	.logs {
		border: 1px solid #ccc;
		border-radius: 10px;
		padding: 10px 20px;
		color: #ccc;
		min-width: 200px;
	}

	.info span {
		color: white;
		font-weight: 600;
	}

	.logs {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		overflow-y: hidden;
		margin-bottom: 0;
        max-height: none;
	}

	@media (max-width: 720px) {
		.logs {
			margin-bottom: 20px;
            max-height: 300px;
		}
	}

	.logs h3 {
		margin: 0;
		padding: 10px 0;
	}

	.logs ul {
		flex-grow: 1;
		overflow-y: auto;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.logs ul li {
		padding: 5px 0;
	}
</style>
