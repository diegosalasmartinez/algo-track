import type { Obstacle, Point } from './types';

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
