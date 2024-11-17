import { get, type Writable } from 'svelte/store';
import { type Point } from './types';
import { Traveller } from './traveller';
import { Grid } from './grid';

export class Canvas {
	private readonly ctx: CanvasRenderingContext2D;
	private readonly canvasWidth: number;
	private readonly canvasHeight: number;
	private readonly cellSize = 35;

	private start: Writable<Point>;
	private end: Writable<Point>;
	private grid: Grid;
	private traveller: Traveller;

	private currentTime: Writable<number>;
	private frameCount: number = 0;
	private frameRate: number = 50;
	private collisionDetected: boolean = false;

	constructor(
		canvas: HTMLCanvasElement,
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
			canvas,
			ctx,
			this.canvasWidth,
			this.canvasHeight,
			this.cellSize,
			this.handleObstacleDetection.bind(this)
		);
		this.traveller = new Traveller(this.ctx, this.cellSize);

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

		const blockedCells = new Set<string>(this.grid.getBlockedCells());
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

		this.traveller.clearTraveller();
		this.traveller.drawTraveller();

		if (this.collisionDetected) {
			this.revalidatePath();
			requestAnimationFrame(() => this.drawCanvas());
			return;
		}

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
		const positionX = get(this.end).x * this.cellSize;
		const positionY = get(this.end).y * this.cellSize;
		this.grid.drawDestination(positionX, positionY);
	}

	handleObstacleDetection(obstacle: Point) {
		const currentPosition = this.traveller.currentPosition();
		if (currentPosition.x === obstacle.x && currentPosition.y === obstacle.y) {
			// If traveller is on the obstacle
			// 1. no need to recalculate
			// 2. delete obstacle
			this.collisionDetected = false;
			this.grid.deleteObstacle(obstacle.x, obstacle.y);
		} else {
			this.collisionDetected = this.traveller.checkIfPathNeedsToRecalculate(obstacle);
		}
	}

	revalidatePath() {
		// TODO: Validte if destination is reachable
		this.collisionDetected = false;
		this.traveller.clearPath(this.grid.getObstacles());
		this.drawPath(this.traveller.currentPosition());
	}
}
