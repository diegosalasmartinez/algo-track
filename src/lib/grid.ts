import type { GridCell, Point } from './types';
import { houses } from './data';

export class Grid {
	private ctx: CanvasRenderingContext2D;
	private gridWidth: number;
	private gridHeight: number;
	private cellSize: number;

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
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.cellSize = cellSize;

		this.initGrid();
		this.setHouse();
	}

	setHouse() {
		const house = new Image();
		house.src = '/destination.png';
		house.onload = () => {
			this.house = house;
			this.fillGrid();
		};
	}

	initGrid() {
		for (let x = 0; x < this.gridHeight; x++) {
			this.grid[x] = [];
			for (let y = 0; y < this.gridWidth; y++) {
				const isHouse = houses.some((house) => house.x === x && house.y === y);

				if (isHouse) {
					this.houses.push({ x, y });
				} else {
					this.emptyRoad.push({ x, y });
				}

				const positionX = x * this.cellSize;
				const positionY = y * this.cellSize;

				this.grid[x][y] = {
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

			this.ctx.fillStyle = 'gray';
			this.ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
			this.ctx.strokeRect(positionX, positionY, this.cellSize, this.cellSize);
			this.ctx.drawImage(
				this.house ?? new Image(),
				positionX,
				positionY,
				this.cellSize,
				this.cellSize
			);

			this.housesSet.add(`${house.x},${house.y}`);
		}
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