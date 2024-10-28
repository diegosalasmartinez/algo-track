<script lang="ts">
	import { onMount } from 'svelte';
	import { Canvas } from '$lib/canvas';
	import { type Point } from '$lib/aStar';

	onMount(() => {
		const canvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
		if (!canvasElement) return;
		const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;

		const canvas = new Canvas(ctx, canvasElement.width, canvasElement.height);

		const start: Point = { x: 10, y: 10 };
		canvas.setStart(start);

		const end: Point = { x: 400, y: 400 };
		canvas.setEnd(end);

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
</script>

<div id="map">
	<h1>ALGO TRACK</h1>
	<canvas id="myCanvas" width="500" height="500"></canvas>
</div>

<style>
</style>
