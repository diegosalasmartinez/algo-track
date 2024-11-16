import type { Point } from './types';

export class Path {
	private readonly ctx: CanvasRenderingContext2D;
	private readonly cellSize: number;
	private path: Point[] = [];

	constructor(ctx: CanvasRenderingContext2D, cellSize: number) {
		this.ctx = ctx;
		this.cellSize = cellSize;
	}

	setPath(path: Point[]) {
		this.path = path;
	}

	getPath() {
		return this.path;
	}

	clear() {
		this.path = [];
	}

	drawPath() {
		this.ctx.strokeStyle = '#89CFF0';
		this.ctx.lineWidth = 4;
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

	clearFinalPath() {
		const position = this.path[this.path.length - 1];
		if (!position) return;
		const positionX = position.x * this.cellSize;
		const positionY = position.y * this.cellSize;

		this.ctx.fillStyle = '#353935';
		this.ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
	}
}
