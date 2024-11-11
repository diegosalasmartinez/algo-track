export type Point = { x: number; y: number };

export type Obstacle = {
	duration: number;
	trace: Point[];
};

export type CellType = 'house' | 'street';

export type GridCell = {
	position: Point;
	type: CellType;
};
