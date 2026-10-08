import { create, composeSyllable, hangulCharDataLoader, hangulCharData } from '..';
import HanziWriter from '../../HanziWriter';
import { resolvePromises } from '../../testUtils';

describe('hangulCharDataLoader', () => {
  it('loads bundled data for ㄱ', () => {
    const onLoad = jest.fn();
    const onError = jest.fn();
    hangulCharDataLoader('ㄱ', onLoad, onError);
    expect(onLoad).toHaveBeenCalledWith(hangulCharData['ㄱ']);
    expect(onError).not.toHaveBeenCalled();
  });

  it('composes syllables on demand', () => {
    const onLoad = jest.fn();
    hangulCharDataLoader('한', onLoad, jest.fn());
    expect(onLoad).toHaveBeenCalledWith(composeSyllable('한'));
  });

  it('reports an error for characters without data', () => {
    const onLoad = jest.fn();
    const onError = jest.fn();
    hangulCharDataLoader('A', onLoad, onError);
    expect(onLoad).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(new Error('No Hangul character data for "A"'));
  });
});

describe('create', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="target"></div>';
  });

  /** Draws a stroke given in character coordinates, as a user would on screen. */
  const drawStroke = (writer: HanziWriter, corners: number[][]) => {
    const positioner = writer._positioner!;
    const toExternal = ([x, y]: number[]) => ({
      x: x * positioner.scale + positioner.xOffset,
      y: positioner.height - positioner.yOffset - y * positioner.scale,
    });
    const [first, ...rest] = corners;
    writer._quiz!.startUserStroke(toExternal(first));
    rest.forEach((corner) => writer._quiz!.continueUserStroke(toExternal(corner)));
    writer._quiz!.endUserStroke();
  };

  const RIGHT_THEN_DOWN = [
    [210, 700],
    [400, 700],
    [600, 700],
    [775, 700],
    [775, 550],
    [775, 400],
    [750, 220],
    [700, 80],
  ];

  it('renders ㄱ using the bundled Hangul data', async () => {
    const writer = create('target', 'ㄱ', { width: 300, height: 300 });
    const character = await writer.getCharacterData();
    expect(character.symbol).toBe('ㄱ');
    expect(character.strokes.length).toBe(1);
    expect(document.querySelectorAll('#target svg').length).toBe(1);
  });

  it('completes a quiz when ㄱ is drawn right, then down', async () => {
    const onCorrectStroke = jest.fn();
    const onMistake = jest.fn();
    const onComplete = jest.fn();
    const writer = create('target', 'ㄱ', { width: 300, height: 300 });
    writer.quiz({ onCorrectStroke, onMistake, onComplete });
    await resolvePromises();

    drawStroke(writer, RIGHT_THEN_DOWN);

    expect(onMistake).not.toHaveBeenCalled();
    expect(onCorrectStroke).toHaveBeenCalledWith(
      expect.objectContaining({ character: 'ㄱ', strokeNum: 0, strokesRemaining: 0 }),
    );
    expect(onComplete).toHaveBeenCalledWith({ character: 'ㄱ', totalMistakes: 0 });
  });

  it('reports a backwards mistake, then completes on a correct retry', async () => {
    const onMistake = jest.fn();
    const onComplete = jest.fn();
    const writer = create('target', 'ㄱ', { width: 300, height: 300 });
    writer.quiz({ onMistake, onComplete });
    await resolvePromises();

    drawStroke(writer, [...RIGHT_THEN_DOWN].reverse());
    expect(onMistake).toHaveBeenCalledWith(
      expect.objectContaining({
        character: 'ㄱ',
        isBackwards: true,
        mistakesOnStroke: 1,
      }),
    );
    expect(onComplete).not.toHaveBeenCalled();

    drawStroke(writer, RIGHT_THEN_DOWN);
    expect(onComplete).toHaveBeenCalledWith({ character: 'ㄱ', totalMistakes: 1 });
  });

  it('completes ㅂ when its four strokes are drawn in order', async () => {
    const onMistake = jest.fn();
    const onComplete = jest.fn();
    const writer = create('target', 'ㅂ', { width: 300, height: 300 });
    writer.quiz({ onMistake, onComplete });
    await resolvePromises();

    hangulCharData['ㅂ'].medians.forEach((median) => drawStroke(writer, median));

    expect(onMistake).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith({ character: 'ㅂ', totalMistakes: 0 });
  });

  it('counts a stroke drawn out of order as a mistake', async () => {
    const onMistake = jest.fn();
    const writer = create('target', 'ㅂ', { width: 300, height: 300 });
    writer.quiz({ onMistake });
    await resolvePromises();

    // the middle bar (stroke 3) drawn first
    drawStroke(writer, hangulCharData['ㅂ'].medians[2]);

    expect(onMistake).toHaveBeenCalledWith(
      expect.objectContaining({ character: 'ㅂ', strokeNum: 0, isBackwards: false }),
    );
  });

  it('completes a composed syllable (한) drawn stroke by stroke', async () => {
    const onMistake = jest.fn();
    const onComplete = jest.fn();
    const writer = create('target', '한', { width: 300, height: 300 });
    writer.quiz({ onMistake, onComplete });
    await resolvePromises();

    composeSyllable('한')!.medians.forEach((median) => drawStroke(writer, median));

    expect(onMistake).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith({ character: '한', totalMistakes: 0 });
  });
});
