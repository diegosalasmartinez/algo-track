<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '$lib/canvas';
	import { type Point } from '$lib/aStar';
	import { writable } from 'svelte/store';

	let canvas: Canvas;
	let end = writable<Point>({ x: 400, y: 400 });

	onMount(() => {
		const canvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
		if (!canvasElement) return;
		const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;

		canvas = new Canvas(ctx, canvasElement.width, canvasElement.height, end);

		const start: Point = { x: 10, y: 10 };
		canvas.setStart(start);

		const traveller = new Image();
		traveller.src = '/car.png';
		canvas.setTraveller(traveller, 30, 20);

		const destination = new Image();
		destination.src = '/car.png';
		canvas.setDestination(destination, 30, 20);

		traveller.onload = () => {
			destination.onload = () => {
				canvas.calculatePath();
				canvas.drawPath();
				canvas.drawDestination();

				canvas.draw();
			};
		};
	});

	const addObstacle = () => {
		if (!canvas) return;
	};
</script>

<main>
	<h1>ALGO TRACK</h1>
	<section>
		<div class="canvas-drawer">
			<canvas id="myCanvas" width="500" height="500"></canvas>
		</div>
		<div class="settings">
			<div class="info">
				<p>Current algorithm: <span>A*</span></p>
				<p>Destination: <span>{$end.x}, {$end.y}</span></p>
				<p>Number of obstacles: <span>4</span></p>
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
</style>
