import type { Point } from './types';

export class Traveller {
	private readonly ctx: CanvasRenderingContext2D;
	private readonly cellSize: number;

	private travellerImage?: HTMLImageElement;
	private path: Point[] = [];
	private currentStep: number = 0;

	constructor(ctx: CanvasRenderingContext2D, cellSize: number) {
		this.ctx = ctx;
		this.cellSize = cellSize;
	}

	setImage(image: HTMLImageElement) {
		this.travellerImage = image;
	}

	setPath(path: Point[]) {
		this.path = path;
		this.currentStep = 0;
	}

	clear() {
		const prevPosition = this.prevPosition();
		if (prevPosition) {
			const positionX = prevPosition.x * this.cellSize;
			const positionY = prevPosition.y * this.cellSize;

			this.ctx.fillStyle = '#353935';
			this.ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
		}

		const currentPosition = this.currentPosition();
		if (currentPosition) {
			const positionX = currentPosition.x * this.cellSize;
			const positionY = currentPosition.y * this.cellSize;

			this.ctx.fillStyle = '#353935';
			this.ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
		}
	}

	draw() {
		this.clear();

		const currentPosition = this.currentPosition();
		if (!currentPosition || !this.travellerImage) return;

		const { x, y } = currentPosition;
		const lastPosition = this.path[this.currentStep - 1];
		const travellerHeight = 28;
		const travellerWidth = 20;

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
				this.travellerImage,
				-travellerHeight / 2,
				-travellerWidth / 2,
				travellerHeight,
				travellerWidth
			);
			this.ctx.restore();
		} else {
			this.ctx.drawImage(
				this.travellerImage,
				x * this.cellSize + (this.cellSize - travellerHeight) / 2,
				y * this.cellSize + (this.cellSize - travellerWidth) / 2,
				travellerHeight,
				travellerWidth
			);
		}
	}

	nextStep() {
		this.currentStep++;
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

	hasCompletedPath() {
		return this.currentStep >= this.path.length;
	}
}
