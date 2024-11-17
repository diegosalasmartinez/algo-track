import type { Point } from './types';
import { Path } from './path';
import { aStar, checkCollision } from './aStar';

export class Traveller {
	private readonly ctx: CanvasRenderingContext2D;
	private readonly cellSize: number;
	private readonly path: Path;

	private travellerImage?: HTMLImageElement;
	private currentStep: number = 0;

	constructor(ctx: CanvasRenderingContext2D, cellSize: number) {
		this.ctx = ctx;
		this.cellSize = cellSize;
		this.path = new Path(ctx, cellSize);
	}

	setImage(image: HTMLImageElement) {
		this.travellerImage = image;
	}

	isReady() {
		return !!this.travellerImage;
	}

	setPath(path: Point[]) {
		this.path.setPath(path);
		this.currentStep = 0;
	}

	clearTraveller() {
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

	drawTraveller() {
		const currentPosition = this.currentPosition();
		if (!currentPosition || !this.travellerImage) return;

		const { x, y } = currentPosition;
		const lastPosition = this.path.getPath()[this.currentStep - 1];
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
			return this.path.getPath()[this.currentStep - 1];
		}
		return null;
	}

	currentPosition() {
		return this.path.getPath()[this.currentStep];
	}

	hasCompletedPath() {
		return this.currentStep + 2 >= this.path.getPath().length;
	}

	clearPath(obstacles: Point[]) {
		for (let i = 0; i < this.path.getPath().length - 1; i++) {
			const point = this.path.getPath()[i];

			if (i === this.currentStep) continue;
			if (obstacles.some((obstacle) => obstacle.x === point.x && obstacle.y === point.y)) continue;

			const positionX = point.x * this.cellSize;
			const positionY = point.y * this.cellSize;

			this.ctx.fillStyle = '#353935';
			this.ctx.fillRect(positionX, positionY, this.cellSize, this.cellSize);
		}
	}

	calculatePath(startPoint: Point, endPoint: Point, blockedCells: Set<string>) {
		const newPath = aStar(startPoint, endPoint, blockedCells);
		if (newPath.length === 0) return false;

		this.currentStep = 0;

		this.path.clearFinalPath();
		this.path.setPath(newPath);
		this.path.drawPath();
		return true;
	}

	checkIfPathNeedsToRecalculate(obstacle: Point) {
		const remainPath = this.path.getPath().slice(this.currentStep);
		return checkCollision(remainPath, obstacle);
	}
}
