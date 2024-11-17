export type Point = { x: number; y: number };

export type CellType = 'house' | 'street' | 'obstacle';

export type GridCell = {
	position: Point;
	type: CellType;
};
