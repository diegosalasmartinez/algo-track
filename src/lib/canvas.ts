import { get, type Writable } from 'svelte/store';
import { type Obstacle, type Point } from './types';
import { Grid } from './grid';
import { ObstacleManager } from './obstacles';
import { aStar, checkCollision } from './aStar';
import { Traveller } from './traveller';

export class Canvas {
	private ctx: CanvasRenderingContext2D;
	private canvasWidth: number;
	private canvasHeight: number;

	private cellSize = 35;

	private start: Writable<Point>;
	private end: Writable<Point>;
	private path: Point[] = [];
	private currentStep: number = 0;

	private grid: Grid;
	private traveller: Traveller;
	private obstacleManager: ObstacleManager;

	private currentTime: Writable<number>;
	private frameCount: number = 0;
	private frameRate: number = 80;

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

		this.grid = new Grid(ctx, this.canvasWidth, this.canvasHeight, this.cellSize);
		this.traveller = new Traveller(this.ctx, this.cellSize);
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
		const travellerImage = new Image();
		travellerImage.src = '/car.png';
		travellerImage.onload = () => {
			this.traveller.setImage(travellerImage);
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
		this.traveller.setPath(this.path);
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

		const currentPosition = this.traveller.currentPosition();

		//const needsToRecalculate = this.checkIfPathNeedsToRecalculate();
		//if (needsToRecalculate) {
		//	this.clearRemainingPath();
		//	this.startNextPath(currentPosition);
		//	requestAnimationFrame(() => this.draw());
		//	return;
		//}

		this.traveller.draw();
		this.traveller.nextStep();

		if (this.traveller.hasCompletedPath()) {
			this.calculateNewEnd();
			this.startNextPath(currentPosition);
			requestAnimationFrame(() => this.draw());
		} else {
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
		this.ctx.strokeStyle = '#89CFF0'; // Color de la línea
		this.ctx.lineWidth = 4; // Ancho de la línea, puedes ajustarlo según prefieras
		this.ctx.beginPath();

		const startPosition = this.path[0];
		if (!startPosition) return;

		this.ctx.moveTo(
			startPosition.x * this.cellSize + this.cellSize / 2,
			startPosition.y * this.cellSize + this.cellSize / 2
		);

		for (let i = 1; i < this.path.length; i++) {
			const positionX = this.path[i].x * this.cellSize + this.cellSize / 2;
			const positionY = this.path[i].y * this.cellSize + this.cellSize / 2;

			this.ctx.lineTo(positionX, positionY);
			//this.ctx.fillStyle = '#89CFF0';
			//this.ctx.fillRect(positionX, positionY, this.cellSize / 2, this.cellSize / 2);
		}
		this.ctx.stroke();
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
		//TODO: Change this to a new house
		const randomPoint = this.grid.getRandomEmptyCell();
		this.end.set(randomPoint);
	}
}
