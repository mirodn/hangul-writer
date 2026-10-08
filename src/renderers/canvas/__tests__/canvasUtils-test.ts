import { pathStringToCanvas } from '../canvasUtils';

describe('canvasUtils', () => {
  let ctx;

  beforeEach(() => {
    ctx = document.createElement('canvas').getContext('2d');
  });

  describe('pathStringToCanvas', () => {
    const pathStrings = [
      // ㄱ outline (M, L and Q commands)
      'M 200 740 L 820 740 L 820 428 L 810 314 L 787 200 L 743 67 Q 730 29 692 42 Q 654 55 667 93 L 709 220 L 730 326 L 740 432 L 740 660 L 200 660 Q 160 660 160 700 Q 160 740 200 740 Z',
      // second stroke of ㅅ
      'M 476 495 L 590 356 L 717 220 L 864 112 Q 896 89 872 56 Q 849 24 816 48 L 663 160 L 530 304 L 414 445 Q 389 476 420 501 Q 451 526 476 495 Z',
      // cubic curves and negative coordinates
      'M 120 -40 L 880 -40 Q 900 -40 900 -20 L 900 20 C 900 40 880 40 860 40 L 120 40 C 100 40 100 -40 120 -40 Z',
    ];

    pathStrings.forEach((pathString, index) => {
      it(`translates SVG path strings into canvas commands case ${index}`, () => {
        const commandFunc = pathStringToCanvas(pathString);
        commandFunc(ctx);
        expect(ctx.__getEvents()).toMatchSnapshot();
      });
    });
  });
});
