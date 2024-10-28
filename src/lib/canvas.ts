import { get, type Writable } from 'svelte/store';
import { type Obstacle, type Point } from './types';
import { aStar, generateRandomPoint } from './aStar';

export class Canvas {
	private ctx: CanvasRenderingContext2D;
	private canvasWidth: number;
	private canvasHeight: number;
	private start: Point = { x: 0, y: 0 };
	private end: Writable<Point>;
	private obstacles: Obstacle[] = [];
	private obstaclesLength: Writable<number>;

	private path: Point[] = [];
	private currentStep: number = 0;
	private frameCount: number = 0;
	private frameRate: number = 2;

	private traveller?: HTMLImageElement;
	private travellerWidth: number = 30;
	private travellerHeight: number = 20;

	private destination?: HTMLImageElement;
	private destinationWidth: number = 30;
	private destinationHeight: number = 20;

	constructor(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		end: Writable<Point>,
		obstaclesLength: Writable<number>
	) {
		this.ctx = ctx;
		this.canvasWidth = width;
		this.canvasHeight = height;
		this.end = end;
		this.obstaclesLength = obstaclesLength;
	}

	setStart(start: Point) {
		this.start = start;
	}

	setTraveller(traveller: HTMLImageElement, width: number, height: number) {
		this.traveller = traveller;
		this.travellerWidth = width;
		this.travellerHeight = height;
	}

	setDestination(destination: HTMLImageElement, width: number, height: number) {
		this.destination = destination;
		this.destinationWidth = width;
		this.destinationHeight = height;
	}

	clearTraveller() {
		const padding = 5;
		const { x, y } = this.currentPosition();

		this.ctx.clearRect(
			x - this.travellerWidth / 2 - padding,
			y - this.travellerHeight / 2 - padding,
			this.travellerWidth + padding * 2,
			this.travellerHeight + padding * 2
		);
	}

	calculatePath(startPoint: Point = this.start) {
		this.path = aStar(startPoint, get(this.end));
		this.currentStep = 0;
	}

	draw() {
		this.frameCount++;
		if (this.frameCount <= this.frameRate) {
			requestAnimationFrame(() => this.draw());
			return;
		}

		this.frameCount = 0;

		this.clearTraveller();
		this.drawTraveller();

		const currentPosition = this.currentPosition();

		// Go to next step
		this.currentStep++;
		if (this.currentStep < this.path.length) {
			requestAnimationFrame(() => this.draw());
		} else {
			this.calculateNewEnd();
			this.calculatePath(currentPosition);
			this.drawPath();
			this.drawDestination();
			requestAnimationFrame(() => this.draw());
		}
	}

	drawDestination() {
		if (!this.destination) return;

		this.ctx.drawImage(
			this.destination,
			get(this.end).x - this.destinationWidth / 2,
			get(this.end).y - this.destinationHeight / 2,
			this.destinationWidth,
			this.destinationHeight
		);
	}

	drawPath() {
		const currentPosition = this.currentPosition();
		if (!currentPosition) return;

		this.ctx.strokeStyle = 'blue';
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(currentPosition.x, currentPosition.y);

		for (let i = this.currentStep + 1; i < this.path.length; i++) {
			this.ctx.lineTo(this.path[i].x, this.path[i].y);
		}
		this.ctx.stroke();
	}

	drawTraveller() {
		const currentPosition = this.currentPosition();
		if (!currentPosition || !this.traveller) return;

		const { x, y } = currentPosition;

		const lastPosition = this.path[this.currentStep - 1];
		if (lastPosition) {
			const angle = Math.atan2(y - lastPosition.y, x - lastPosition.x);
			const needsFlip = Math.abs(angle) > Math.PI / 2;

			this.ctx.save();
			this.ctx.translate(x, y);
			this.ctx.rotate(angle);

			if (needsFlip) {
				this.ctx.scale(1, -1);
			}

			this.ctx.drawImage(
				this.traveller,
				-this.travellerWidth / 2,
				-this.travellerHeight / 2,
				this.travellerWidth,
				this.travellerHeight
			);
			this.ctx.restore();
		} else {
			this.ctx.drawImage(
				this.traveller,
				x - this.travellerWidth / 2,
				y - this.travellerHeight / 2,
				this.travellerWidth,
				this.travellerHeight
			);
		}
	}

	drawObstacle(obstacle: Obstacle) {
		this.ctx.strokeStyle = 'black';
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(obstacle.trace[0].x, obstacle.trace[0].y);

		for (let i = 1; i < obstacle.trace.length; i++) {
			this.ctx.lineTo(obstacle.trace[i].x, obstacle.trace[i].y);
		}
		this.ctx.stroke();

		this.obstacles.push(obstacle);
		this.obstaclesLength.set(get(this.obstaclesLength) + 1);
	}

	checkColission(obstacle: Obstacle) {
		const remainPath = this.path.slice(this.currentStep);

		for (const point of remainPath) {
			for (const tracePoint of obstacle.trace) {
				if (point.x === tracePoint.x && point.y === tracePoint.y) {
					// TODO: Recalculate path
					return true;
				}
			}
		}
	}

	currentPosition() {
		return this.path[this.currentStep];
	}

	calculateNewEnd() {
		this.end.set(generateRandomPoint(this.canvasWidth - 20, this.canvasHeight - 20));
	}
}
