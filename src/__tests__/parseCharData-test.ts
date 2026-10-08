import parseCharData from '../parseCharData';

describe('parseCharData', () => {
  it('creates a Character object from character json', () => {
    const res = parseCharData('X', {
      strokes: ['M 0 0 Z', 'M 1 1 Z', 'M 2 2 Z'],
      medians: [
        [
          [0, 0],
          [10, 0],
        ],
        [
          [0, 10],
          [10, 10],
        ],
        [
          [5, 20],
          [5, 30],
        ],
      ],
      radStrokes: [0, 1],
    });
    expect(res.symbol).toBe('X');
    expect(res.strokes).toHaveLength(3);
    expect(res.strokes[0].points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
    expect(res.strokes[0].isInRadical).toBe(true);
    expect(res.strokes[1].isInRadical).toBe(true);
    expect(res.strokes[2].isInRadical).toBe(false);
  });
});
