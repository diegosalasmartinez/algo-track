import { get, type Writable } from 'svelte/store';
import { type Obstacle, type Point } from './types';
import { Grid } from './grid';
import { ObstacleManager } from './obstacles';
import { aStar, checkCollision } from './aStar';

export class Canvas {
	private ctx: CanvasRenderingContext2D;
	private canvasWidth: number;
	private canvasHeight: number;

	private cellSize = 20;

	private start: Writable<Point>;
	private end: Writable<Point>;
	private path: Point[] = [];
	private currentStep: number = 0;

	private grid: Grid;
	private obstacleManager: ObstacleManager;

	private currentTime: Writable<number>;
	private frameCount: number = 0;
	private frameRate: number = 40;

	private traveller?: HTMLImageElement;
	private destination?: HTMLImageElement;

	constructor(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		start: Writable<Point>,
		end: Writable<Point>,
		currentTime: Writable<number>
	) {
		this.ctx = ctx;
		this.canvasWidth = width;
		this.canvasHeight = height;
		this.start = start;
		this.end = end;
		this.currentTime = currentTime;

		this.grid = new Grid(
			ctx,
			this.canvasWidth / this.cellSize,
			this.canvasHeight / this.cellSize,
			this.cellSize
		);
		this.obstacleManager = new ObstacleManager();

		this.calculateStart();
		this.calculateEnd();
		this.setDestination();
		this.setTraveller();
	}

	calculateStart() {
		const point = this.grid.getRandomEmptyCell();
		this.start.set(point);
	}

	calculateEnd() {
		const point = this.grid.getRandomEmptyCell();
		this.end.set(point);
	}

	setDestination() {
		const destination = new Image();
		destination.src = '/destination.png';
		destination.onload = () => {
			this.destination = destination;
			this.checkIfReady();
		};
	}

	setTraveller() {
		const traveller = new Image();
		traveller.src = '/car.png';
		traveller.onload = () => {
			this.traveller = traveller;
			this.checkIfReady();
		};
	}

	checkIfReady() {
		if (this.destination && this.traveller) {
			this.startNextPath();
			this.draw();
		}
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

	calculatePath(startPoint: Point = get(this.start)) {
		//const pathCalculated = aStar(startPoint, get(this.end), this.obstacleManager.getObstacleSet());
		const pathCalculated = aStar(startPoint, get(this.end), this.grid.getHousesSet());
		this.path = pathCalculated;

		// If there is no path, we need to recalculate the end point
		if (this.path.length === 0) {
			this.calculateNewEnd();
			this.startNextPath(startPoint);
		}

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

		//const needsToRecalculate = this.checkIfPathNeedsToRecalculate();
		//if (needsToRecalculate) {
		//	this.clearRemainingPath();
		//	this.startNextPath(currentPosition);
		//	requestAnimationFrame(() => this.draw());
		//	return;
		//}

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

		const positionX = get(this.end).x * this.cellSize;
		const positionY = get(this.end).y * this.cellSize;

		this.ctx.drawImage(this.destination, positionX, positionY, this.cellSize, this.cellSize);
	}

	drawPath() {
		const currentPosition = this.currentPosition();
		if (!currentPosition) return;

		const minifiedPath = this.path;

		for (let i = 1; i < minifiedPath.length; i++) {
			const positionX = minifiedPath[i].x * this.cellSize;
			const positionY = minifiedPath[i].y * this.cellSize;

			this.ctx.fillStyle = 'blue';
			this.ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
		}
		this.ctx.stroke();
	}

	clearTraveller() {
		const position = this.prevPosition();
		if (!position) return;

		const positionX = position.x * this.cellSize;
		const positionY = position.y * this.cellSize;

		this.ctx.clearRect(positionX, positionY, this.cellSize, this.cellSize);
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
			this.ctx.translate(
				x * this.cellSize + this.cellSize / 2,
				y * this.cellSize + this.cellSize / 2
			);
			this.ctx.rotate(angle);

			if (needsFlip) {
				this.ctx.scale(1, -1);
			}

			this.ctx.drawImage(
				this.traveller,
				-this.cellSize / 2,
				-this.cellSize / 2,
				this.cellSize,
				this.cellSize
			);
			this.ctx.restore();
		} else {
			this.ctx.drawImage(
				this.traveller,
				x * this.cellSize,
				y * this.cellSize,
				this.cellSize,
				this.cellSize
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

	prevPosition() {
		if (this.currentStep >= 1) {
			return this.path[this.currentStep - 1];
		}
		return null;
	}

	currentPosition() {
		return this.path[this.currentStep];
	}

	calculateNewEnd() {
		//TODO: Change this to a new house
		const randomPoint = this.grid.getRandomEmptyCell();
		this.end.set(randomPoint);
	}
}
