import type { GridCell, Point } from './types';
import { houses } from './data';

export class Grid {
	private readonly ctx: CanvasRenderingContext2D;
	private readonly numColumns: number;
	private readonly numRows: number;
	private readonly cellSize: number;

	private house?: HTMLImageElement;
	private grid: GridCell[][] = [];
	private houses: Point[] = [];
	private emptyRoad: Point[] = [];
	private housesSet: Set<string> = new Set();

	constructor(
		ctx: CanvasRenderingContext2D,
		gridWidth: number,
		gridHeight: number,
		cellSize: number
	) {
		this.ctx = ctx;
		this.numColumns = gridWidth / cellSize;
		this.numRows = gridHeight / cellSize;
		this.cellSize = cellSize;

		this.initGrid();
		this.setHouse();
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
			this.housesSet.add(`${house.x},${house.y}`);
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

	getHousesSet() {
		return this.housesSet;
	}
}
