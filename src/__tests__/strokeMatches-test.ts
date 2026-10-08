import strokeMatches from '../strokeMatches';
import Stroke from '../models/Stroke';
import UserStroke from '../models/UserStroke';
import Character from '../models/Character';

describe('strokeMatches', () => {
  it('does not match if the user stroke is a single point', () => {
    const stroke = new Stroke(
      '',
      [
        { x: 0, y: 0 },
        { x: 10, y: 50 },
      ],
      0,
    );

    const userStroke = new UserStroke(1, { x: 2, y: 1 }, { x: 9999, y: 9999 });

    expect(strokeMatches(userStroke, new Character('X', [stroke]), 0)).toEqual({
      isMatch: false,
      meta: { isStrokeBackwards: false },
    });
  });

  it('matches if the user stroke roughly matches the stroke medians', () => {
    const stroke = new Stroke(
      '',
      [
        { x: 0, y: 0 },
        { x: 10, y: 50 },
      ],
      0,
    );

    const userStroke = new UserStroke(1, { x: 2, y: 1 }, { x: 9999, y: 9999 });
    userStroke.appendPoint({ x: 5, y: 25 }, { x: 9999, y: 9999 });
    userStroke.appendPoint({ x: 10, y: 51 }, { x: 9999, y: 9999 });

    expect(strokeMatches(userStroke, new Character('X', [stroke]), 0)).toEqual({
      isMatch: true,
      meta: { isStrokeBackwards: false },
    });
  });

  it('does not match if the user stroke is in the wrong direction', () => {
    const stroke = new Stroke(
      '',
      [
        { x: 0, y: 0 },
        { x: 10, y: 50 },
      ],
      0,
    );

    const userStroke = new UserStroke(1, { x: 10, y: 51 }, { x: 9999, y: 9999 });
    userStroke.appendPoint({ x: 5, y: 25 }, { x: 9999, y: 9999 });
    userStroke.appendPoint({ x: 2, y: 1 }, { x: 9999, y: 9999 });

    expect(strokeMatches(userStroke, new Character('X', [stroke]), 0)).toEqual({
      isMatch: false,
      meta: { isStrokeBackwards: true },
    });
  });

  it('does not match if the user stroke is too far away', () => {
    const stroke = new Stroke(
      '',
      [
        { x: 0, y: 0 },
        { x: 10, y: 50 },
      ],
      0,
    );

    const userStroke = new UserStroke(
      1,
      { x: 2 + 200, y: 1 + 200 },
      { x: 9999, y: 9999 },
    );
    userStroke.appendPoint({ x: 5 + 200, y: 25 + 200 }, { x: 9999, y: 9999 });
    userStroke.appendPoint({ x: 10 + 200, y: 51 + 200 }, { x: 9999, y: 9999 });

    expect(strokeMatches(userStroke, new Character('X', [stroke]), 0)).toEqual({
      isMatch: false,
      meta: { isStrokeBackwards: false },
    });
  });

  it('is more lenient depending on how large leniency is', () => {
    const stroke = new Stroke(
      '',
      [
        { x: 0, y: 0 },
        { x: 10, y: 50 },
      ],
      0,
    );

    const userStroke = new UserStroke(
      1,
      { x: 2 + 200, y: 1 + 200 },
      { x: 9999, y: 9999 },
    );
    userStroke.appendPoint({ x: 5 + 200, y: 25 + 200 }, { x: 9999, y: 9999 });
    userStroke.appendPoint({ x: 10 + 200, y: 51 + 200 }, { x: 9999, y: 9999 });

    expect(
      strokeMatches(userStroke, new Character('X', [stroke]), 0, { leniency: 0.2 }),
    ).toEqual({ isMatch: false, meta: { isStrokeBackwards: false } });
    expect(
      strokeMatches(userStroke, new Character('X', [stroke]), 0, { leniency: 20 }),
    ).toEqual({ isMatch: true, meta: { isStrokeBackwards: false } });
  });
});
