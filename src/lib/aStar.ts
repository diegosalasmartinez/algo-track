import type { Point } from './types';

type Node = {
	pos: Point;
	g: number;
	h: number;
	f: number;
	parent: Node | null;
};

function heuristic(a: Point, b: Point): number {
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export const aStar = (start: Point, end: Point): Point[] => {
	const openSet: Node[] = [];
	const closedSet: Set<string> = new Set();

	openSet.push({
		pos: start,
		g: 0,
		h: heuristic(start, end),
		f: 0,
		parent: null
	});

	while (openSet.length > 0) {
		let currentIndex = 0;
		for (let i = 1; i < openSet.length; i++) {
			if (openSet[i].f < openSet[currentIndex].f) {
				currentIndex = i;
			}
		}

		const currentNode = openSet[currentIndex];
		const { pos } = currentNode;

		if (pos.x === end.x && pos.y === end.y) {
			const path: Point[] = [];
			let temp: Node | null = currentNode;
			while (temp) {
				path.push(temp.pos);
				temp = temp.parent;
			}
			return path.reverse();
		}

		openSet.splice(currentIndex, 1);
		closedSet.add(`${pos.x},${pos.y}`);

		const neighbors: Point[] = [
			{ x: pos.x + 1, y: pos.y },
			{ x: pos.x - 1, y: pos.y },
			{ x: pos.x, y: pos.y + 1 },
			{ x: pos.x, y: pos.y - 1 }
		];

		for (const neighborPos of neighbors) {
			if (closedSet.has(`${neighborPos.x},${neighborPos.y}`)) continue;

			const g = currentNode.g + 1;
			const h = heuristic(neighborPos, end);
			const f = g + h;

			const existingNode = openSet.find(
				(node) => node.pos.x === neighborPos.x && node.pos.y === neighborPos.y
			);
			if (existingNode) {
				if (g < existingNode.g) {
					existingNode.g = g;
					existingNode.f = f;
					existingNode.parent = currentNode;
				}
			} else {
				openSet.push({
					pos: neighborPos,
					g,
					h,
					f,
					parent: currentNode
				});
			}
		}
	}

	return [];
};

export const generateRandomPoint = (width: number, height: number): Point => {
	return {
		x: Math.floor(Math.random() * width),
		y: Math.floor(Math.random() * height)
	};
};
