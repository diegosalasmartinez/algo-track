import type { GridCell, Point } from './types';
import { houses } from './data';

export class Grid {
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private readonly numColumns: number;
	private readonly numRows: number;
	private readonly cellSize: number;

	private handleObstacleDetection: (obstacleDetected: Point) => void;
	private house?: HTMLImageElement;
	private grid: GridCell[][] = [];
	private houses: Point[] = [];
	private emptyRoad: Point[] = [];
	private obstacles: Point[] = [];
	private blockedCells: Set<string> = new Set();

	constructor(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		gridWidth: number,
		gridHeight: number,
		cellSize: number,
		handleObstacleDetection: (obstacleDetected: Point) => void
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.numColumns = gridWidth / cellSize;
		this.numRows = gridHeight / cellSize;
		this.cellSize = cellSize;
		this.handleObstacleDetection = handleObstacleDetection;

		this.initGrid();
		this.setHouse();
		this.addListeners();
	}

	setHouse() {
		const house = new Image();
		house.src = '/house.png';
		house.onload = () => {
			this.house = house;
			this.fillGrid();
		};
	}

	initGrid() {
		for (let y = 0; y < this.numRows; y++) {
			this.grid[y] = [];
			for (let x = 0; x < this.numColumns; x++) {
				const isHouse = houses.some((house) => house.x === x && house.y === y);

				const positionX = x * this.cellSize;
				const positionY = y * this.cellSize;

				if (isHouse) {
					this.houses.push({ x, y });
				} else {
					this.emptyRoad.push({ x, y });
					this.drawStreet(positionX, positionY);
				}

				this.grid[y][x] = {
					position: { x: positionX, y: positionY },
					type: isHouse ? 'house' : 'street'
				};
			}
		}
	}

	fillGrid() {
		for (const house of this.houses) {
			const positionX = house.x * this.cellSize;
			const positionY = house.y * this.cellSize;

			this.drawHouse(positionX, positionY);
			this.blockedCells.add(`${house.x},${house.y}`);
		}
	}

	drawStreet(positionX: number, positionY: number) {
		this.ctx.fillStyle = '#353935';
		this.ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
	}

	drawHouse(positionX: number, positionY: number, color: string = '#F9F6EE') {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
		this.ctx.drawImage(
			this.house ?? new Image(),
			positionX,
			positionY,
			this.cellSize,
			this.cellSize
		);
	}

	drawDestination(positionX: number, positionY: number) {
		this.drawHouse(positionX, positionY, 'green');
	}

	getRandomEmptyCell(): Point {
		const randomIndex = Math.floor(Math.random() * this.emptyRoad.length);
		return this.emptyRoad[randomIndex];
	}

	getRandomHouse(): Point {
		const randomIndex = Math.floor(Math.random() * this.houses.length);
		return this.houses[randomIndex];
	}

	getBlockedCells() {
		return this.blockedCells;
	}

	addListeners() {
		this.canvas.addEventListener('click', (event: MouseEvent) => {
			const rect = this.canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			const cellX = Math.floor(x / this.cellSize);
			const cellY = Math.floor(y / this.cellSize);
			const xIsValid = cellX >= 0 && cellX < this.numColumns;
			const yIsValid = cellY >= 0 && cellY < this.numRows;

			if (xIsValid && yIsValid) {
				const cell = this.grid[cellY][cellX];
				if (cell.type === 'street') {
					cell.type = 'obstacle';
					this.addObstacle(cellX, cellY);
				} else if (cell.type === 'obstacle') {
					cell.type = 'street';
					this.deleteObstacle(cellX, cellY);
				}
			}
		});
	}

	addObstacle(cellX: number, cellY: number) {
		const positionX = cellX * this.cellSize;
		const positionY = cellY * this.cellSize;

		this.obstacles.push({ x: cellX, y: cellY });
		this.blockedCells.add(`${cellX},${cellY}`);
		this.drawObstacle(positionX, positionY);
		this.handleObstacleDetection({ x: cellX, y: cellY });
	}

	drawObstacle(positionX: number, positionY: number) {
		this.ctx.fillStyle = 'red';
		this.ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
	}

	deleteObstacle(cellX: number, cellY: number) {
		const positionX = cellX * this.cellSize;
		const positionY = cellY * this.cellSize;

		this.obstacles = this.obstacles.filter((obs) => obs.x !== cellX || obs.y !== cellY);
		this.blockedCells.delete(`${cellX},${cellY}`);
		this.drawStreet(positionX, positionY);
	}

	getObstacles() {
		return this.obstacles;
	}
}
