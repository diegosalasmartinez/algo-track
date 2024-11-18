import { get, type Writable } from 'svelte/store';
import { type Point } from './types';
import { Traveller } from './traveller';
import { Grid } from './grid';

export class Canvas {
	private readonly ctx: CanvasRenderingContext2D;
	private readonly canvasWidth: number;
	private readonly canvasHeight: number;
	private readonly cellSize = 35;

	private start: Point;
	private end: Writable<Point>;
	private currentPosition: Writable<Point>;
	private addLog: (log: string) => void;
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
		end: Writable<Point>,
		currentPosition: Writable<Point>,
		currentTime: Writable<number>,
		addLog: (log: string) => void
	) {
		this.ctx = ctx;
		this.canvasWidth = width;
		this.canvasHeight = height;
		this.end = end;
		this.currentPosition = currentPosition;
		this.currentTime = currentTime;
		this.addLog = addLog;

		this.grid = new Grid(
			canvas,
			ctx,
			this.canvasWidth,
			this.canvasHeight,
			this.cellSize,
			this.handleObstacleDetection.bind(this)
		);
		this.traveller = new Traveller(this.ctx, this.cellSize);

		// Set start point
		const startPoint = this.grid.getRandomEmptyCell();
		this.start = startPoint;
		this.currentPosition.set(startPoint);

		// Set end point
		const endPoint = this.grid.getRandomHouse();
		this.end.set(endPoint);
		this.addLog(`Set destination: ${endPoint.x},${endPoint.y}`);

		// Set traveller
		const travellerImage = new Image();
		travellerImage.src = '/car.png';
		travellerImage.onload = () => {
			this.traveller.setImage(travellerImage);
			console.log('[DIEGO] here');
			this.drawPath(this.start);
			console.log('[DIEGO] here 2');
			this.drawCanvas();
		};
	}

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

		const currentPosition = this.traveller.currentPosition();
		this.currentPosition.set(currentPosition);

		this.traveller.clearTraveller();
		this.traveller.drawTraveller();

		if (this.collisionDetected) {
			this.revalidatePath();
			requestAnimationFrame(() => this.drawCanvas());
			return;
		}

		if (this.traveller.hasCompletedPath()) {
			this.startNextPath(currentPosition);
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
		let endPoint;
		do {
			endPoint = this.grid.getRandomHouse();
			this.end.set(endPoint);

			hasSolution = this.drawPath(currentPosition);
			this.grid.drawHouse(positionX, positionY);
		} while (!hasSolution);

		this.addLog(`Set destination: ${endPoint.x},${endPoint.y}`);
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
