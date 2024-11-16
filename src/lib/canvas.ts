import { get, type Writable } from 'svelte/store';
import { type Obstacle, type Point } from './types';
import { Grid } from './grid';
import { ObstacleManager } from './obstacles';
//import { checkCollision } from './aStar';
import { Traveller } from './traveller';

export class Canvas {
	private readonly ctx: CanvasRenderingContext2D;
	private readonly canvasWidth: number;
	private readonly canvasHeight: number;
	private readonly cellSize = 35;

	private start: Writable<Point>;
	private end: Writable<Point>;
	private grid: Grid;
	private traveller: Traveller;
	private obstacleManager: ObstacleManager;
	private destination?: HTMLImageElement;

	private currentTime: Writable<number>;
	private frameCount: number = 0;
	private frameRate: number = 50;

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

		this.setStartPoint();
		this.setEndPoint();
		this.setTraveller();
	}

	setStartPoint() {
		const point = this.grid.getRandomEmptyCell();
		this.start.set(point);
	}

	setEndPoint() {
		const point = this.grid.getRandomHouse();
		this.end.set(point);
	}

	setTraveller() {
		const travellerImage = new Image();
		travellerImage.src = '/car.png';
		travellerImage.onload = () => {
			this.traveller.setImage(travellerImage);
			this.drawPath(get(this.start));
			this.drawCanvas();
		};
	}

	//clearRemainingPath() {
	//	const elementWidth = 4;
	//	const elementHeight = 4;
	//
	//	for (const point of this.path.slice(this.currentStep)) {
	//		this.ctx.clearRect(
	//			point.x - elementWidth / 2,
	//			point.y - elementHeight / 2,
	//			elementWidth,
	//			elementHeight
	//		);
	//	}
	//}

	drawPath(startPoint: Point) {
		const endPoint = get(this.end);

		const blockedCells = new Set<string>(this.grid.getHousesSet());
		blockedCells.delete(`${endPoint.x},${endPoint.y}`);

		const hasSolution = this.traveller.calculatePath(startPoint, endPoint, blockedCells);
		if (!hasSolution) return false;

		this.drawDestination();
		return true;
	}

	drawCanvas() {
		this.frameCount++;

		if (this.frameCount <= this.frameRate) {
			requestAnimationFrame(() => this.drawCanvas());
			return;
		}

		this.currentTime.set(get(this.currentTime) + 1);
		this.frameCount = 0;

		//const needsToRecalculate = this.checkIfPathNeedsToRecalculate();
		//if (needsToRecalculate) {
		//	this.clearRemainingPath();
		//	this.startNextPath(currentPosition);
		//	requestAnimationFrame(() => this.draw());
		//	return;
		//}

		this.traveller.drawTraveller();

		if (this.traveller.hasCompletedPath()) {
			this.startNextPath(this.traveller.currentPosition());
			requestAnimationFrame(() => this.drawCanvas());
		} else {
			this.traveller.nextStep();
			requestAnimationFrame(() => this.drawCanvas());
		}
	}

	startNextPath(currentPosition: Point) {
		const lastEndPoint = get(this.end);
		const positionX = lastEndPoint.x * this.cellSize;
		const positionY = lastEndPoint.y * this.cellSize;

		let hasSolution = false;
		do {
			this.setEndPoint();
			hasSolution = this.drawPath(currentPosition);
			this.grid.drawHouse(positionX, positionY);
		} while (!hasSolution);
	}

	drawDestination() {
		if (!this.destination) return;

		const positionX = get(this.end).x * this.cellSize;
		const positionY = get(this.end).y * this.cellSize;
		this.grid.drawDestination(positionX, positionY);
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

	//checkIfPathNeedsToRecalculate() {
	//	if (!this.obstacleManager.newObstacle) return false;
	//
	//	const remainPath = this.path.slice(this.currentStep);
	//	const obstacle = this.obstacleManager.getLastObstacle();
	//	const thereIsCollision = checkCollision(remainPath, obstacle);
	//
	//	this.obstacleManager.newObstacle = false;
	//
	//	return thereIsCollision;
	//}
}
