import { get, type Writable } from 'svelte/store';
import { type Obstacle, type Point } from './types';
import { ObstacleManager } from './obstacles';
import { aStar, checkCollision, generateRandomPoint } from './aStar';

export class Canvas {
	private ctx: CanvasRenderingContext2D;
	private canvasWidth: number;
	private canvasHeight: number;

	private start: Point = { x: 0, y: 0 };
	private end: Writable<Point>;

	private obstacleManager: ObstacleManager;

	private path: Point[] = [];
	private currentStep: number = 0;

	private currentTime: Writable<number>;
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
		currentTime: Writable<number>
	) {
		this.ctx = ctx;
		this.canvasWidth = width;
		this.canvasHeight = height;
		this.end = end;
		this.currentTime = currentTime;
		this.obstacleManager = new ObstacleManager();
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
		const paddingX = 2;
		const paddingY = 5;
		const { x, y } = this.currentPosition();

		const elementWidth = this.travellerWidth + paddingX * 2;
		const elementHeight = this.travellerHeight + paddingY * 2;

		this.ctx.clearRect(x - elementWidth / 2, y - elementHeight / 2, elementWidth, elementHeight);
	}

	clearRemainingPath() {
		const elementWidth = 4;
		const elementHeight = 4;

		for (const point of this.path.slice(this.currentStep)) {
			this.ctx.clearRect(
				point.x - elementWidth / 2,
				point.y - elementHeight / 2,
				elementWidth,
				elementHeight
			);
		}
	}

	startNextPath(startPoint?: Point) {
		this.calculatePath(startPoint);
		this.drawPath();
		this.drawDestination();
	}

	calculatePath(startPoint: Point = this.start) {
		this.path = aStar(startPoint, get(this.end), this.obstacleManager.getObstacleSet());
		this.currentStep = 0;
	}

	draw() {
		this.frameCount++;

		if (this.frameCount <= this.frameRate) {
			requestAnimationFrame(() => this.draw());
			return;
		}

		this.currentTime.set(get(this.currentTime) + 1);
		this.frameCount = 0;

		const currentPosition = this.currentPosition();

		const needsToRecalculate = this.checkIfPathNeedsToRecalculate();
		if (needsToRecalculate) {
			this.clearRemainingPath();
			this.startNextPath(currentPosition);
			requestAnimationFrame(() => this.draw());
			return;
		}

		this.clearTraveller();
		this.drawTraveller();

		// Go to next step
		this.currentStep++;
		if (this.currentStep < this.path.length) {
			requestAnimationFrame(() => this.draw());
		} else {
			this.calculateNewEnd();
			this.startNextPath(currentPosition);
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
		this.ctx.lineWidth = 3;
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
		this.ctx.lineWidth = 3;
		this.ctx.beginPath();
		this.ctx.moveTo(obstacle.trace[0].x, obstacle.trace[0].y);

		for (let i = 1; i < obstacle.trace.length; i++) {
			this.ctx.lineTo(obstacle.trace[i].x, obstacle.trace[i].y);
		}
		this.ctx.stroke();

		this.obstacleManager.addObstacle(obstacle);
	}

	checkIfPathNeedsToRecalculate() {
		if (!this.obstacleManager.newObstacle) return false;

		const remainPath = this.path.slice(this.currentStep);
		const obstacle = this.obstacleManager.getLastObstacle();
		const thereIsCollision = checkCollision(remainPath, obstacle);

		this.obstacleManager.newObstacle = false;

		return thereIsCollision;
	}

	currentPosition() {
		return this.path[this.currentStep];
	}

	calculateNewEnd() {
		const padding = 20;

		const randomPoint = generateRandomPoint(
			this.canvasWidth - padding,
			this.canvasHeight - padding
		);

		this.end.set(randomPoint);
	}
}
