<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { Canvas } from '$lib/canvas';
	import { createObstacle } from '$lib/obstacles';

	let canvas: Canvas;
	let start = writable({ x: 0, y: 0 });
	let end = writable({ x: 0, y: 0 });
	let currentTime = writable(0);

	onMount(() => {
		const canvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
		if (!canvasElement) return;
		const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;

		canvas = new Canvas(ctx, canvasElement.width, canvasElement.height, start, end, currentTime);
	});

	const addObstacle = () => {
		if (!canvas) return;

		// TODO: Read the obstacles from user input
		const obstacle = createObstacle(80, 80, 100, 'horizontal', 100000);
		canvas.drawObstacle(obstacle);
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
				<p>Destination: <span>{$end.x}, {$end.y}</span></p>
			</div>
			<div class="divider"></div>
			<button on:click={addObstacle}>Add Obstacle</button>
		</div>
	</section>
</main>

<style>
	main {
		display: flex;
		height: 100vh;
		flex: 1;
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

	section {
		display: flex;
		gap: 20px;
	}

	.canvas-drawer {
		background-color: white;
		border-radius: 10px;
		padding: 20px;
	}

	.settings {
		border: 1px solid #ccc;
		border-radius: 10px;
		padding: 10px 20px;
		color: #ccc;
		min-width: 200px;
	}

	.settings span {
		color: white;
		font-weight: 600;
	}

	.divider {
		width: 100%;
		height: 1px;
		background-color: #ccc;
		margin: 20px 0;
	}

    @media (max-width: 600px) {
        section {
            flex-direction: column;
        }
    }
</style>
