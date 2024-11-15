import type { Point } from './types';

const generateHouseRow = (x: number, y: number, length: number): Point[] => {
	const row = [];
	for (let i = 0; i < length; i++) {
		row.push({ x: x + i, y });
	}
	return row;
};

const generateHouseColumn = (x: number, y: number, length: number): Point[] => {
	const column = [];
	for (let i = 0; i < length; i++) {
		column.push({ x, y: y + i });
	}
	return column;
};

export const houses: Point[] = [
	...generateHouseRow(0, 0, 10),
	...generateHouseColumn(0, 1, 16),
	...generateHouseColumn(9, 1, 16),
	...generateHouseRow(0, 17, 10),

	...generateHouseRow(2, 2, 6),
	...generateHouseRow(2, 3, 6),

	...generateHouseRow(2, 5, 4),
	...generateHouseRow(2, 6, 4),
	...generateHouseColumn(7, 5, 2),

	...generateHouseColumn(2, 11, 2),
	...generateHouseRow(4, 11, 4),
	...generateHouseRow(4, 12, 4),

	...generateHouseRow(2, 14, 6),
	...generateHouseRow(2, 15, 6)
	//...generateHouseRow(8, 5, 4),
	//...generateHouseRow(13, 5, 4),
	//...generateHouseRow(19, 5, 4),
	//...generateHouseRow(2, 6, 4),
	//...generateHouseRow(8, 6, 4),
	//...generateHouseRow(13, 6, 4),
	//...generateHouseRow(19, 6, 4),
	//
	//...generateHouseRow(2, 8, 10),
	//...generateHouseRow(13, 8, 10),
	//...generateHouseRow(2, 9, 10),
	//...generateHouseRow(13, 9, 10),
	//
	//...generateHouseRow(2, 11, 2),
	//...generateHouseRow(6, 11, 2),
	//...generateHouseRow(10, 11, 2),
	//...generateHouseRow(13, 11, 2),
	//...generateHouseRow(17, 11, 2),
	//...generateHouseRow(21, 11, 2),
	//...generateHouseRow(2, 12, 2),
	//...generateHouseRow(6, 12, 2),
	//...generateHouseRow(10, 12, 2),
	//...generateHouseRow(13, 12, 2),
	//...generateHouseRow(17, 12, 2),
	//...generateHouseRow(21, 12, 2),
	//...generateHouseRow(2, 13, 2),
	//...generateHouseRow(6, 13, 2),
	//...generateHouseRow(10, 13, 2),
	//...generateHouseRow(13, 13, 2),
	//...generateHouseRow(17, 13, 2),
	//...generateHouseRow(21, 13, 2),
	//
	//...generateHouseRow(2, 15, 10),
	//...generateHouseRow(13, 15, 10),
	//...generateHouseRow(2, 15, 10),
	//...generateHouseRow(13, 15, 10),
	//...generateHouseRow(2, 16, 10),
	//...generateHouseRow(13, 16, 10),
	//...generateHouseRow(2, 16, 10),
	//...generateHouseRow(13, 16, 10),
	//
	//...generateHouseRow(2, 18, 4),
	//...generateHouseRow(8, 18, 4),
	//...generateHouseRow(13, 18, 4),
	//...generateHouseRow(19, 18, 4),
	//...generateHouseRow(2, 19, 4),
	//...generateHouseRow(8, 19, 4),
	//...generateHouseRow(13, 19, 4),
	//...generateHouseRow(19, 19, 4),
	//
	//...generateHouseRow(2, 21, 10),
	//...generateHouseRow(13, 21, 10),
	//...generateHouseRow(2, 22, 10),
	//...generateHouseRow(13, 22, 10)
];
