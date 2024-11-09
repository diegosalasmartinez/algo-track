import type { Obstacle, Point } from './types';

export class ObstacleManager {
	private obstaclesSet: Set<string> = new Set();
	private obstacles: Obstacle[] = [];
	private paddingBlock: number = 20;

	public newObstacle = false;

	addObstacle(obstacle: Obstacle) {
		this.obstacles.push(obstacle);
		this.newObstacle = true;

		for (const p of obstacle.trace) {
			for (let dx = -this.paddingBlock; dx <= this.paddingBlock; dx++) {
				for (let dy = -this.paddingBlock; dy <= this.paddingBlock; dy++) {
					this.obstaclesSet.add(`${p.x + dx},${p.y + dy}`);
				}
			}
		}
	}

	getLastObstacle() {
		return this.obstacles[this.obstacles.length - 1];
	}

	getObstacleSet() {
		return this.obstaclesSet;
	}
}

export const createObstacle = (
	posX: number,
	posY: number,
	length: number,
	mode: 'vertical' | 'horizontal',
	duration: number
): Obstacle => {
	const trace: Point[] = [];
	const firstPoint = { x: posX, y: posY };
	trace.push(firstPoint);

	for (let i = 0; i < length; i++) {
		if (mode === 'vertical') {
			trace.push({ x: posX, y: posY + i });
		} else {
			trace.push({ x: posX + i, y: posY });
		}
	}

	return { trace, duration };
};
