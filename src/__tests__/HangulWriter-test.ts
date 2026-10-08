jest.mock('../Quiz');

const oldGlobal = { test: 'object' };
(global as any).HangulWriter = oldGlobal;

import siot from '../hangul/data/siot';
import eu from '../hangul/data/eu';
import HangulWriter from '../HangulWriter';
import { timeout } from '../utils';
import { resolvePromises } from '../testUtils';
import Quiz from '../Quiz';
import parseCharData from '../parseCharData';

const charDataLoader = () => siot;

describe('HangulWriter', () => {
  beforeEach(() => {
    (Quiz as any).mockClear();
  });

  describe('constructor', () => {
    it('can optionally run init() if element and options are passed in', async () => {
      document.body.innerHTML = '<div id="target"></div>';

      const writer = new HangulWriter('target', { charDataLoader });
      await writer.setCharacter('ㅅ');

      expect(document.querySelectorAll('#target svg').length).toBe(1);
      const svg = document.querySelector('#target svg')!;
      expect(svg.childNodes.length).toBe(2);
      expect(svg.childNodes[0].nodeName).toBe('defs');
      expect(svg.childNodes[1].nodeName).toBe('g');
      // the characters are repeated 3 times - one for outline, character, and highlight
      expect(svg.childNodes[1].childNodes.length).toBe(3);
      svg!.childNodes[1].childNodes.forEach((charNode) => {
        expect(charNode.nodeName).toBe('g');
        // 2 strokes per character
        expect(charNode.childNodes.length).toBe(2);
      });
    });

    it('[deprecated] loads data and builds an instance in a dom element', async () => {
      document.body.innerHTML = '<div id="target"></div>';

      const writer = HangulWriter.create('target', 'ㅅ', { charDataLoader });

      await writer._withDataPromise;

      expect(document.querySelectorAll('#target svg').length).toBe(1);
      const svg = document.querySelector('#target svg')!;
      expect(svg.childNodes.length).toBe(2);
      expect(svg.childNodes[0].nodeName).toBe('defs');
      expect(svg.childNodes[1].nodeName).toBe('g');
      // the characters are repeated 3 times - one for outline, character, and highlight
      expect(svg.childNodes[1].childNodes.length).toBe(3);
      svg!.childNodes[1].childNodes.forEach((charNode) => {
        expect(charNode.nodeName).toBe('g');
        // 2 strokes per character
        expect(charNode.childNodes.length).toBe(2);
      });
    });
  });

  describe('HangulWriter.create', () => {
    it('loads data and builds an instance in a dom element', async () => {
      document.body.innerHTML = '<div id="target"></div>';

      const writer = HangulWriter.create('target', 'ㅅ', { charDataLoader });

      await writer._withDataPromise;

      expect(document.querySelectorAll('#target svg').length).toBe(1);
      const svg = document.querySelector('#target svg')!;
      expect(svg.childNodes.length).toBe(2);
      expect(svg.childNodes[0].nodeName).toBe('defs');
      expect(svg.childNodes[1].nodeName).toBe('g');
      // the characters are repeated 3 times - one for outline, character, and highlight
      expect(svg.childNodes[1].childNodes.length).toBe(3);
      svg!.childNodes[1].childNodes.forEach((charNode) => {
        expect(charNode.nodeName).toBe('g');
        // 2 strokes per character
        expect(charNode.childNodes.length).toBe(2);
      });
    });

    it("Errors if the target element can't be found", () => {
      document.body.innerHTML = '<div id="target"></div>';
      expect(() => {
        HangulWriter.create('wrong-target', 'ㅅ', { charDataLoader });
      }).toThrow('HangulWriter target element not found: wrong-target');
    });

    it('can optionally use a canvas for rendering instead of SVG', async () => {
      document.body.innerHTML = '<div id="target"></div>';

      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader,
        renderer: 'canvas',
      });

      await writer._withDataPromise;

      expect(document.querySelectorAll('#target canvas').length).toBe(1);
      const canvas = document.querySelector<HTMLCanvasElement>('#target canvas')!;
      expect(canvas.getContext('2d')).toMatchSnapshot();
    });
  });

  describe('data loading', () => {
    it('calls onLoadCharDataError if provided on loading failure', async () => {
      document.body.innerHTML = '<div id="target"></div>';

      const onLoadCharDataError = jest.fn();
      const writer = HangulWriter.create('target', 'ㅅ', {
        onLoadCharDataError,
        charDataLoader: () => Promise.reject('reasons'),
      });

      await writer._withDataPromise;

      expect(onLoadCharDataError.mock.calls.length).toBe(1);
      expect(onLoadCharDataError.mock.calls[0][0]).toBe('reasons');
    });

    it('throws when calling an animatable method after loading failure', async () => {
      document.body.innerHTML = '<div id="target"></div>';

      const onLoadCharDataError = jest.fn();
      const writer = HangulWriter.create('target', 'ㅅ', {
        onLoadCharDataError,
        charDataLoader: (char, onComplete, onErr) => {
          onErr('reasons');
        },
      });

      await writer._withDataPromise;
      expect(() => writer.showCharacter()).toThrow();

      expect(onLoadCharDataError).toHaveBeenCalledTimes(1);
      expect(onLoadCharDataError).toHaveBeenCalledWith('reasons');
    });

    it('throws an error on loading fauire if onLoadCharDataError is not provided', async () => {
      document.body.innerHTML = '<div id="target"></div>';

      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader: (char, onComplete, onErr) => {
          onErr(new Error('reasons'));
        },
      });

      await expect(writer._withDataPromise).rejects.toThrow(new Error('reasons'));
    });
  });

  describe('updateDimensions', () => {
    it('resizes the SVG target', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader,
        width: 200,
        height: 200,
        padding: 10,
      });
      await writer.setCharacter('ㅅ');
      writer.updateDimensions({ width: 300, height: 350, padding: 20 });
      expect(document.querySelector('#target svg')?.attributes['width'].value).toBe(
        '300',
      );
      expect(document.querySelector('#target svg')?.attributes['height'].value).toBe(
        '350',
      );
      expect(writer._positioner?.width).toBe(300);
      expect(writer._positioner?.height).toBe(350);
      expect(writer._positioner?.padding).toBe(20);
    });

    it('resizes the target when using canvas', () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader,
        width: 200,
        height: 200,
        padding: 10,
        renderer: 'canvas',
      });
      writer.updateDimensions({ width: 300, height: 350, padding: 20 });
      expect(document.querySelector('#target canvas')?.attributes['width'].value).toBe(
        '300',
      );
      expect(document.querySelector('#target canvas')?.attributes['height'].value).toBe(
        '350',
      );
    });

    it('updates the positioner for the active quiz, if it exists', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader,
        width: 200,
        height: 200,
        padding: 10,
      });
      await writer.setCharacter('ㅅ');
      writer.quiz();
      await resolvePromises();
      writer.updateDimensions({ width: 300, height: 350, padding: 20 });
      expect(writer._quiz!.setPositioner).toHaveBeenCalledWith(writer._positioner);
    });

    it('destroys the old renderer before recreating a new resized one', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader,
        width: 200,
        height: 200,
        padding: 10,
      });
      await writer.setCharacter('ㅅ');
      const originalRenderer = writer._hangulWriterRenderer;
      const destroyRendererSpy = jest.spyOn(writer._hangulWriterRenderer!, 'destroy');
      writer.updateDimensions({ width: 300, height: 350, padding: 20 });
      await resolvePromises();

      // old renderer should be destroyed
      expect(destroyRendererSpy).toHaveBeenCalledTimes(1);
      expect(writer._hangulWriterRenderer?._positioner).toBe(writer._positioner);
      // the renderer should be replaced
      expect(writer._hangulWriterRenderer).not.toBe(originalRenderer);
    });
  });

  describe('setCharacter', () => {
    it('deletes the current character while loading', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader: (char) => timeout(1).then(() => (char === 'ㅅ' ? siot : eu)),
      });
      await writer._withDataPromise;

      expect(document.querySelector('#target svg g')).not.toBe(null);
      expect(document.querySelector('#target svg defs *')).not.toBe(null);
      writer.setCharacter('ㅡ');
      expect(document.querySelector('#target svg g')).toBe(null);
      expect(document.querySelector('#target svg defs *')).toBe(null);

      await writer._withDataPromise;
      expect(document.querySelector('#target svg g')!.childNodes.length).toBe(3);
      expect(document.querySelector('#target svg defs *')).not.toBe(null);
    });

    it('maintains the visibility of the character from the last character rendered', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader: (char) => timeout(1).then(() => (char === 'ㅅ' ? siot : eu)),
      });
      await writer._withDataPromise;

      writer.hideOutline();
      writer.setCharacter('ㅡ');
      await writer._withDataPromise;
      expect(writer._renderState!.state.character.main.opacity).toBe(1);
      expect(writer._renderState!.state.character.outline.opacity).toBe(0);
    });

    it('maintains the visibility of the outline from the last character rendered', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader: (char) => timeout(1).then(() => (char === 'ㅅ' ? siot : eu)),
      });
      await writer._withDataPromise;

      writer.hideCharacter();
      writer.setCharacter('ㅡ');
      await writer._withDataPromise;
      expect(writer._renderState!.state.character.main.opacity).toBe(0);
      expect(writer._renderState!.state.character.outline.opacity).toBe(1);
    });

    it('maintains colors from the last character rendered', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader: (char) => timeout(1).then(() => (char === 'ㅅ' ? siot : eu)),
      });
      await writer._withDataPromise;

      writer.updateColor('strokeColor', 'rgba(30, 30, 30, 0.8)');
      writer.updateColor('outlineColor', 'rgba(10, 20, 30, 0.1)');
      writer.setCharacter('ㅡ');
      await writer._withDataPromise;
      expect(writer._renderState!.state.options.strokeColor).toEqual({
        r: 30,
        g: 30,
        b: 30,
        a: 0.8,
      });
      expect(writer._renderState!.state.options.outlineColor).toEqual({
        r: 10,
        g: 20,
        b: 30,
        a: 0.1,
      });
    });
  });

  describe('getCharacterData', () => {
    it('returns a promise with the loaded character', async () => {
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader,
      });
      const character = await writer.getCharacterData();
      expect(character).toEqual(parseCharData('ㅅ', siot));
    });

    it('returns a promise with the loaded character after initial loading is done', async () => {
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader,
      });
      await writer._withDataPromise;
      const character = await writer.getCharacterData();
      expect(character).toEqual(parseCharData('ㅅ', siot));
    });

    it('errors if no character has been set yet', async () => {
      const writer = new HangulWriter('target', {
        charDataLoader,
      });
      await expect(writer.getCharacterData()).rejects.toThrow(
        new Error('setCharacter() must be called before calling getCharacterData()'),
      );
    });

    it('errors if loading fails', async () => {
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader: async () => {
          throw new Error('omg!');
        },
      });

      await expect(writer.getCharacterData()).rejects.toThrow(new Error('omg!'));
    });

    it('errors if loading fails before this method is called', async () => {
      const writer = HangulWriter.create('target', 'ㅅ', {
        charDataLoader: async () => {
          throw new Error('omg!');
        },
      });
      try {
        await writer._withDataPromise;
        // eslint-disable-next-line no-empty
      } catch (err) {}

      await expect(writer.getCharacterData()).rejects.toThrow(
        new Error('Failed to load character data. Call setCharacter and try again.'),
      );
    });
  });

  describe('animateCharacter', () => {
    it('animates and returns promise that resolves when animation is finished', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        showCharacter: true,
        charDataLoader,
      });
      await writer._withDataPromise;

      let isResolved = false;
      let resolvedVal;
      const onComplete = jest.fn();

      writer.animateCharacter({ onComplete }).then((result) => {
        isResolved = true;
        resolvedVal = result;
      });

      await resolvePromises();

      expect(writer._renderState!.state.character.main.opacity).toBe(1);
      [0, 1].forEach((strokeNum) => {
        expect(writer._renderState!.state.character.main.strokes[strokeNum].opacity).toBe(
          1,
        );
      });

      clock.tick(1000);
      await resolvePromises();

      expect(writer._renderState!.state.character.main.opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[0].opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(0);

      clock.tick(1000);
      await resolvePromises();

      expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(1);

      clock.tick(1000);
      await resolvePromises();

      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(0);
      expect(isResolved).toBe(false);
      expect(onComplete).not.toHaveBeenCalled();

      clock.tick(1000);
      await resolvePromises();

      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(1);
      expect(isResolved).toBe(true);
      expect(resolvedVal).toEqual({ canceled: false });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({ canceled: false });
    });
  });

  describe('animateStroke', () => {
    it('animates and returns promise that resolves when animation is finished', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        showCharacter: true,
        charDataLoader,
      });
      await writer._withDataPromise;

      let isResolved = false;
      let resolvedVal;
      const onComplete = jest.fn();

      writer.animateStroke(1, { onComplete }).then((result) => {
        isResolved = true;
        resolvedVal = result;
      });

      await resolvePromises();

      expect(writer._renderState!.state.character.main.opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[0].opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].opacity).toBe(1);

      expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(0);
      expect(isResolved).toBe(false);
      expect(onComplete).not.toHaveBeenCalled();

      clock.tick(1000);
      await resolvePromises();

      expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(1);
      expect(isResolved).toBe(true);
      expect(resolvedVal).toEqual({ canceled: false });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({ canceled: false });
    });

    it('supports negative indices', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        showCharacter: true,
        charDataLoader,
      });
      await writer._withDataPromise;

      let isResolved = false;
      let resolvedVal;
      const onComplete = jest.fn();

      writer.animateStroke(-1, { onComplete }).then((result) => {
        isResolved = true;
        resolvedVal = result;
      });

      await resolvePromises();

      expect(writer._renderState!.state.character.main.opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[0].opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].opacity).toBe(1);

      expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(0);
      expect(isResolved).toBe(false);
      expect(onComplete).not.toHaveBeenCalled();

      clock.tick(1000);
      await resolvePromises();

      expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(1);
      expect(isResolved).toBe(true);
      expect(resolvedVal).toEqual({ canceled: false });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({ canceled: false });
    });

    it('keeps other stroke opacities where they were originally', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        showCharacter: true,
        charDataLoader,
      });
      await writer._withDataPromise;

      let isResolved = false;
      let resolvedVal;
      const onComplete = jest.fn();

      writer.hideCharacter({ duration: 0 });
      await resolvePromises();

      expect(writer._renderState!.state.character.main.opacity).toBe(0);
      expect(writer._renderState!.state.character.main.strokes[0].opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].opacity).toBe(1);

      writer.animateStroke(1, { onComplete }).then((result) => {
        isResolved = true;
        resolvedVal = result;
      });

      await resolvePromises();

      expect(writer._renderState!.state.character.main.opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[0].opacity).toBe(0);
      expect(writer._renderState!.state.character.main.strokes[1].opacity).toBe(1);

      expect(isResolved).toBe(false);
      expect(onComplete).not.toHaveBeenCalled();

      clock.tick(1000);
      await resolvePromises();

      expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(1);
      expect(isResolved).toBe(true);
      expect(resolvedVal).toEqual({ canceled: false });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({ canceled: false });
    });
  });

  describe('pauseAnimation and resumeAnimation', () => {
    it('pauses and resumes the currently running animations', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        showCharacter: true,
        charDataLoader,
      });
      await writer._withDataPromise;

      let isResolved = false;
      let resolvedVal;
      const onComplete = jest.fn();

      clock.tick(50);
      await resolvePromises();

      writer.animateStroke(1, { onComplete }).then((result) => {
        isResolved = true;
        resolvedVal = result;
      });

      await resolvePromises();
      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(0);

      clock.tick(50);
      await resolvePromises();

      const pausedDisplayPortion = writer._renderState!.state.character.main.strokes[1]
        .displayPortion;
      expect(pausedDisplayPortion).toBeGreaterThan(0);
      expect(pausedDisplayPortion).toBeLessThan(1);
      expect(isResolved).toBe(false);

      writer.pauseAnimation();
      await resolvePromises();

      clock.tick(2000);
      await resolvePromises();

      expect(isResolved).toBe(false);
      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(
        pausedDisplayPortion,
      );

      writer.resumeAnimation();
      await resolvePromises();

      clock.tick(50);
      await resolvePromises();

      const newDisplayPortion = writer._renderState!.state.character.main.strokes[1]
        .displayPortion;
      expect(newDisplayPortion).not.toBe(pausedDisplayPortion);
      expect(newDisplayPortion).toBeGreaterThan(0);
      expect(newDisplayPortion).toBeLessThan(1);
      expect(isResolved).toBe(false);

      clock.tick(2000);
      await resolvePromises();

      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(1);
      expect(isResolved).toBe(true);
      expect(resolvedVal).toEqual({ canceled: false });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({ canceled: false });
    });
  });

  describe('highlightStroke', () => {
    it('highlights a single stroke', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        showCharacter: true,
        charDataLoader,
      });
      await writer._withDataPromise;

      let isResolved = false;
      let resolvedVal;
      const onComplete = jest.fn();

      writer.highlightStroke(1, { onComplete }).then((result) => {
        isResolved = true;
        resolvedVal = result;
      });

      await resolvePromises();

      expect(writer._renderState!.state.character.highlight.opacity).toBe(1);
      expect(writer._renderState!.state.character.highlight.strokes[0].opacity).toBe(0);
      expect(writer._renderState!.state.character.highlight.strokes[1].opacity).toBe(0);

      expect(
        writer._renderState!.state.character.highlight.strokes[1].displayPortion,
      ).toBe(0);
      expect(isResolved).toBe(false);
      expect(onComplete).not.toHaveBeenCalled();

      clock.tick(1000);
      await resolvePromises();

      expect(
        writer._renderState!.state.character.highlight.strokes[1].displayPortion,
      ).toBe(1);
      expect(writer._renderState!.state.character.highlight.strokes[1].opacity).toBe(1);

      clock.tick(1000);
      await resolvePromises();

      expect(
        writer._renderState!.state.character.highlight.strokes[1].displayPortion,
      ).toBe(1);
      expect(writer._renderState!.state.character.highlight.strokes[1].opacity).toBe(0);

      expect(isResolved).toBe(true);
      expect(resolvedVal).toEqual({ canceled: false });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({ canceled: false });
    });

    it('works with negative indices', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        showCharacter: true,
        charDataLoader,
      });
      await writer._withDataPromise;

      let isResolved = false;
      let resolvedVal;
      const onComplete = jest.fn();

      writer.highlightStroke(-1, { onComplete }).then((result) => {
        isResolved = true;
        resolvedVal = result;
      });

      await resolvePromises();

      expect(writer._renderState!.state.character.highlight.opacity).toBe(1);
      expect(writer._renderState!.state.character.highlight.strokes[0].opacity).toBe(0);
      expect(writer._renderState!.state.character.highlight.strokes[1].opacity).toBe(0);

      expect(
        writer._renderState!.state.character.highlight.strokes[1].displayPortion,
      ).toBe(0);
      expect(isResolved).toBe(false);
      expect(onComplete).not.toHaveBeenCalled();

      clock.tick(1000);
      await resolvePromises();

      expect(
        writer._renderState!.state.character.highlight.strokes[1].displayPortion,
      ).toBe(1);
      expect(writer._renderState!.state.character.highlight.strokes[1].opacity).toBe(1);

      clock.tick(1000);
      await resolvePromises();

      expect(
        writer._renderState!.state.character.highlight.strokes[1].displayPortion,
      ).toBe(1);
      expect(writer._renderState!.state.character.highlight.strokes[1].opacity).toBe(0);

      expect(isResolved).toBe(true);
      expect(resolvedVal).toEqual({ canceled: false });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({ canceled: false });
    });

    it("doesn't freeze and leave the highlight showing if another highlight happens before the first finishes", async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        showCharacter: true,
        charDataLoader,
      });
      await writer._withDataPromise;

      let stroke1Resolved = false;
      let stroke1ResolvedVal;
      const onComplete1 = jest.fn();

      // start highlighting the first stroke
      writer.highlightStroke(0, { onComplete: onComplete1 }).then((result) => {
        stroke1Resolved = true;
        stroke1ResolvedVal = result;
      });

      await resolvePromises();
      clock.tick(200);
      await resolvePromises();
      expect(writer._renderState!.state.character.highlight.strokes[0].opacity).not.toBe(
        0,
      );

      expect(stroke1Resolved).toBe(false);

      // starting another stroke highlight cancels the first one
      // NOTE: In the future this may not be the case, there's no reason we can't have strokes animate independently
      writer.highlightStroke(1);

      await resolvePromises();
      expect(stroke1Resolved).toBe(true);
      expect(stroke1ResolvedVal).toEqual({ canceled: true });

      expect(writer._renderState!.state.character.highlight.strokes[0].opacity).toBe(0);
    });
  });

  describe('loopCharacterAnimation', () => {
    it('animates and then repeats until something else stops it', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        showCharacter: true,
        charDataLoader,
      });
      await writer._withDataPromise;

      writer.loopCharacterAnimation();

      await resolvePromises();

      // loop 5 times
      for (let i = 0; i < 5; i++) {
        expect(writer._renderState!.state.character.main.opacity).toBe(1);
        [0, 1].forEach((strokeNum) => {
          expect(
            writer._renderState!.state.character.main.strokes[strokeNum].opacity,
          ).toBe(1);
        });

        clock.tick(1000);
        await resolvePromises();

        expect(writer._renderState!.state.character.main.opacity).toBe(1);
        expect(writer._renderState!.state.character.main.strokes[0].opacity).toBe(1);
        expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(
          0,
        );

        clock.tick(1000);
        await resolvePromises();

        expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(
          1,
        );

        clock.tick(1000);
        await resolvePromises();

        expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(
          0,
        );

        clock.tick(1000);
        await resolvePromises();

        expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(
          1,
        );

        clock.tick(3000);
        await resolvePromises();
      }

      // now, stop the animation by running something different
      writer.showCharacter();
      await resolvePromises();
      clock.tick(1000);
      await resolvePromises();

      expect(writer._renderState!.state.character.main.opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[0].opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[0].displayPortion).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].opacity).toBe(1);
      expect(writer._renderState!.state.character.main.strokes[1].displayPortion).toBe(1);
    });
  });

  ([
    { methodLabel: 'Character', stateLabel: 'main' },
    { methodLabel: 'Outline', stateLabel: 'outline' },
  ] as const).forEach(({ methodLabel, stateLabel }) => {
    const hideMethod = methodLabel === 'Character' ? 'hideCharacter' : 'hideOutline';
    const showMethod = methodLabel === 'Character' ? 'showCharacter' : 'showOutline';

    describe(hideMethod, () => {
      it('animates and returns promise that resolves when finished', async () => {
        document.body.innerHTML = '<div id="target"></div>';
        const writer = HangulWriter.create('target', 'ㅅ', {
          showCharacter: true,
          charDataLoader,
        });
        await writer._withDataPromise;

        let isResolved = false;
        let resolvedVal;
        const onComplete = jest.fn();

        writer[hideMethod]({ onComplete }).then((result) => {
          isResolved = true;
          resolvedVal = result;
        });

        await resolvePromises();

        expect(writer._renderState!.state.character[stateLabel].opacity).toBe(1);
        expect(isResolved).toBe(false);

        clock.tick(1000);
        await resolvePromises();

        expect(writer._renderState!.state.character[stateLabel].opacity).toBe(0);

        expect(isResolved).toBe(true);
        expect(resolvedVal).toEqual({ canceled: false });
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith({ canceled: false });
      });

      it('returns instantly if char is already hidden', async () => {
        document.body.innerHTML = '<div id="target"></div>';
        const writer = HangulWriter.create('target', 'ㅅ', {
          showCharacter: false,
          showOutline: false,
          charDataLoader,
        });
        await writer._withDataPromise;

        let isResolved = false;
        let resolvedVal;
        const onComplete = jest.fn();

        writer[hideMethod]({ onComplete }).then((result) => {
          isResolved = true;
          resolvedVal = result;
        });

        expect(isResolved).toBe(false);

        await resolvePromises();

        expect(writer._renderState!.state.character[stateLabel].opacity).toBe(0);
        expect(isResolved).toBe(true);
        expect(resolvedVal).toEqual({ canceled: false });
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith({ canceled: false });
      });

      it('resolves immediately if duration: 0 is passed', async () => {
        document.body.innerHTML = '<div id="target"></div>';
        const writer = HangulWriter.create('target', 'ㅅ', {
          showCharacter: true,
          showOutline: true,
          charDataLoader,
        });
        await writer._withDataPromise;

        let isResolved = false;
        let resolvedVal;
        const onComplete = jest.fn();

        writer[hideMethod]({ onComplete, duration: 0 }).then((result) => {
          isResolved = true;
          resolvedVal = result;
        });

        expect(isResolved).toBe(false);

        await resolvePromises();

        expect(writer._renderState!.state.character[stateLabel].opacity).toBe(0);
        expect(isResolved).toBe(true);
        expect(resolvedVal).toEqual({ canceled: false });
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith({ canceled: false });
      });
    });

    describe(showMethod, () => {
      it('animates and returns promise that resolves when finished', async () => {
        document.body.innerHTML = '<div id="target"></div>';
        const writer = HangulWriter.create('target', 'ㅅ', {
          [showMethod]: false,
          charDataLoader,
        });
        await writer._withDataPromise;

        let isResolved = false;
        let resolvedVal;
        const onComplete = jest.fn();

        writer[showMethod]({ onComplete }).then((result) => {
          isResolved = true;
          resolvedVal = result;
        });

        await resolvePromises();

        expect(writer._renderState!.state.character[stateLabel].opacity).toBe(0);
        expect(isResolved).toBe(false);

        clock.tick(1000);
        await resolvePromises();

        expect(writer._renderState!.state.character[stateLabel].opacity).toBe(1);

        expect(isResolved).toBe(true);
        expect(resolvedVal).toEqual({ canceled: false });
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith({ canceled: false });
      });

      it('returns instantly if already shown', async () => {
        document.body.innerHTML = '<div id="target"></div>';
        const writer = HangulWriter.create('target', 'ㅅ', {
          [showMethod]: true,
          charDataLoader,
        });
        await writer._withDataPromise;

        let isResolved = false;
        let resolvedVal;
        const onComplete = jest.fn();

        writer[showMethod]({ onComplete }).then((result) => {
          isResolved = true;
          resolvedVal = result;
        });

        expect(isResolved).toBe(false);

        await resolvePromises();

        expect(writer._renderState!.state.character[stateLabel].opacity).toBe(1);
        expect(isResolved).toBe(true);
        expect(resolvedVal).toEqual({ canceled: false });
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith({ canceled: false });
      });

      it('resolves immediately if duration: 0 is passed', async () => {
        document.body.innerHTML = '<div id="target"></div>';
        const writer = HangulWriter.create('target', 'ㅅ', {
          [showMethod]: false,
          charDataLoader,
        });
        await writer._withDataPromise;

        let isResolved = false;
        let resolvedVal;
        const onComplete = jest.fn();

        writer[showMethod]({ onComplete, duration: 0 }).then((result) => {
          isResolved = true;
          resolvedVal = result;
        });

        expect(isResolved).toBe(false);

        await resolvePromises();

        expect(writer._renderState!.state.character[stateLabel].opacity).toBe(1);
        expect(isResolved).toBe(true);
        expect(resolvedVal).toEqual({ canceled: false });
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith({ canceled: false });
      });
    });
  });

  describe('updateColor', () => {
    it('animates and returns promise that resolves when finished', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        strokeColor: '#123',
        charDataLoader,
      });
      await writer._withDataPromise;

      let isResolved = false;
      let resolvedVal;
      const onComplete = jest.fn();

      writer
        .updateColor('strokeColor', 'rgba(30, 30, 30, 0.8)', { onComplete })
        .then((result) => {
          isResolved = true;
          resolvedVal = result;
        });

      await resolvePromises();

      expect(writer._renderState!.state.options.strokeColor).toEqual({
        r: 17,
        g: 34,
        b: 51,
        a: 1,
      });
      expect(isResolved).toBe(false);

      clock.tick(1000);
      await resolvePromises();

      expect(writer._renderState!.state.options.strokeColor).toEqual({
        r: 30,
        g: 30,
        b: 30,
        a: 0.8,
      });

      expect(isResolved).toBe(true);
      expect(resolvedVal).toEqual({ canceled: false });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({ canceled: false });
    });

    it('uses strokeColor for the tween if radicalColor is set to null', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', {
        strokeColor: 'rgba(30, 30, 30, 0.8)',
        radicalColor: '#EEE',
        charDataLoader,
      });
      await writer._withDataPromise;

      let isResolved = false;
      let resolvedVal;
      const onComplete = jest.fn();

      writer
        .updateColor('radicalColor', null, { onComplete, duration: 1000 })
        .then((result) => {
          isResolved = true;
          resolvedVal = result;
        });

      await resolvePromises();

      expect(writer._renderState!.state.options.radicalColor).toEqual({
        r: 238,
        g: 238,
        b: 238,
        a: 1,
      });
      expect(isResolved).toBe(false);

      clock.tick(999);
      await resolvePromises();
      expect(writer._renderState!.state.options.radicalColor.r).toBeCloseTo(30, 0);
      expect(writer._renderState!.state.options.radicalColor.g).toBeCloseTo(30, 0);
      expect(writer._renderState!.state.options.radicalColor.b).toBeCloseTo(30, 0);
      expect(writer._renderState!.state.options.radicalColor.a).toBeCloseTo(1, 0);
      clock.tick(30);
      await resolvePromises();

      expect(writer._renderState!.state.options.radicalColor).toBeNull();

      expect(isResolved).toBe(true);
      expect(resolvedVal).toEqual({ canceled: false });
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledWith({ canceled: false });
    });
  });

  describe('quiz', () => {
    it('sets up and starts the quiz', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', { charDataLoader });
      const onComplete = jest.fn();
      writer.quiz({ onComplete });
      expect(Quiz).not.toHaveBeenCalled();
      await writer._withDataPromise;
      await resolvePromises();
      expect(Quiz).toHaveBeenCalledTimes(1);
      expect(Quiz).toHaveBeenCalledWith(
        writer._character,
        writer._renderState,
        writer._positioner,
      );
      expect(writer._quiz!.startQuiz).toHaveBeenCalledTimes(1);
      expect(writer._quiz!.startQuiz).toHaveBeenCalledWith(
        Object.assign({}, writer._options, { onComplete }),
      );
    });
  });

  describe('cancelQuiz', () => {
    it('cancels the existing quiz', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', { charDataLoader });
      await writer._withDataPromise;
      writer.quiz();
      await resolvePromises();
      const quiz = writer._quiz!;
      writer.cancelQuiz();
      expect(quiz.cancel).toHaveBeenCalledTimes(1);
      expect(writer._quiz).toBe(undefined);
    });
  });

  describe('skipQuizStroke', () => {
    it('returns if there is not active quiz', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', { charDataLoader });
      await writer._withDataPromise;
      expect(writer.skipQuizStroke()).toBe(undefined);
      expect(writer._quiz).toBe(undefined);
    });

    it('skips the current stroke if a quiz is active', async () => {
      document.body.innerHTML = '<div id="target"></div>';
      const writer = HangulWriter.create('target', 'ㅅ', { charDataLoader });
      writer.quiz();
      await resolvePromises();
      const quiz = writer._quiz!;
      writer.skipQuizStroke();
      expect(quiz.nextStroke).toHaveBeenCalledTimes(1);
      expect(quiz._handleSuccess).not.toHaveBeenCalled();
    });
  });

  describe('mouse and touch events', () => {
    let writer: HangulWriter;
    beforeEach(async () => {
      document.body.innerHTML = '<div id="target"></div>';
      writer = HangulWriter.create('target', 'ㅅ', { charDataLoader });
      await writer._withDataPromise;
      writer.quiz();
      await resolvePromises();
    });

    it('starts a user stroke on mousedown', () => {
      const evt = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: 170,
        clientY: 127,
      });
      const svg = document.querySelector('#target svg')!;
      svg.getBoundingClientRect = () => ({ left: 50, top: 60 } as any);
      const canceled = !svg!.dispatchEvent(evt);
      expect(canceled).toBe(true);
      expect(writer._quiz!.startUserStroke).toHaveBeenCalledTimes(1);
      expect(writer._quiz!.startUserStroke).toHaveBeenCalledWith({ x: 120, y: 67 });
    });

    it('starts a user stroke on touchstart', () => {
      const evt = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [
          {
            clientX: 170,
            clientY: 127,
          },
        ],
      } as any);
      const svg = document.querySelector('#target svg')!;
      svg!.getBoundingClientRect = () => ({ left: 50, top: 60 } as any);
      const canceled = !svg!.dispatchEvent(evt);
      expect(canceled).toBe(true);
      expect(writer._quiz!.startUserStroke).toHaveBeenCalledTimes(1);
      expect(writer._quiz!.startUserStroke).toHaveBeenCalledWith({ x: 120, y: 67 });
    });

    it('continues a user stroke on mousemove', () => {
      const evt = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: 170,
        clientY: 127,
      });
      const svg = document.querySelector('#target svg')!;
      svg!.getBoundingClientRect = () => ({ left: 50, top: 60 } as any);
      const canceled = !svg!.dispatchEvent(evt);
      expect(canceled).toBe(true);
      expect(writer._quiz!.continueUserStroke).toHaveBeenCalledTimes(1);
      expect(writer._quiz!.continueUserStroke).toHaveBeenCalledWith({ x: 120, y: 67 });
    });

    it('continues a user stroke on touchmove', () => {
      const evt = new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [
          {
            clientX: 170,
            clientY: 127,
          },
        ],
      } as any);
      const svg = document.querySelector('#target svg')!;
      svg!.getBoundingClientRect = () => ({ left: 50, top: 60 } as any);
      const canceled = !svg!.dispatchEvent(evt);
      expect(canceled).toBe(true);
      expect(writer._quiz!.continueUserStroke).toHaveBeenCalledTimes(1);
      expect(writer._quiz!.continueUserStroke).toHaveBeenCalledWith({ x: 120, y: 67 });
    });

    it('ends a user stroke on mouseup', () => {
      const evt = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
      const svg = document.querySelector('#target svg')!;
      svg!.dispatchEvent(evt);
      expect(writer._quiz!.endUserStroke).toHaveBeenCalledTimes(1);
    });

    it('ends a user stroke on touchend', () => {
      const evt = new TouchEvent('touchend', { bubbles: true, cancelable: true });
      const svg = document.querySelector('#target svg')!;
      svg!.dispatchEvent(evt);
      expect(writer._quiz!.endUserStroke).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadCharacterData', () => {
    it('calls onLoadCharDataError if provided on loading failure', async () => {
      const onLoadCharDataError = jest.fn();
      const loadingPromise = HangulWriter.loadCharacterData('ㅅ', {
        onLoadCharDataError,
        charDataLoader: () => Promise.reject('reasons'),
      });

      await loadingPromise;

      expect(onLoadCharDataError.mock.calls.length).toBe(1);
      expect(onLoadCharDataError.mock.calls[0][0]).toBe('reasons');
    });

    it('throws an error on loading fauire if onLoadCharDataError is not provided', async () => {
      const loadingPromise = HangulWriter.loadCharacterData('ㅅ', {
        charDataLoader: (_char, _onComplete, onErr) => {
          onErr(new Error('reasons'));
        },
      });

      await expect(loadingPromise).rejects.toThrow(new Error('reasons'));
    });

    it('returns the character data in a promise on success', async () => {
      const loadingPromise = HangulWriter.loadCharacterData('ㅅ', {
        charDataLoader: () => siot,
      });

      const result = await loadingPromise;
      expect(result).toBe(siot);
    });

    it('returns the character data in onLoadCharDataSuccess if provided', async () => {
      const onLoadCharDataSuccess = jest.fn();
      const loadingPromise = HangulWriter.loadCharacterData('ㅅ', {
        onLoadCharDataSuccess,
        charDataLoader: () => siot,
      });

      await loadingPromise;

      expect(onLoadCharDataSuccess.mock.calls.length).toBe(1);
      expect(onLoadCharDataSuccess.mock.calls[0][0]).toBe(siot);
    });
  });

  describe('getScalingTransform', () => {
    it('returns an object with info that can be used for scaling a character in SVG', () => {
      expect(HangulWriter.getScalingTransform(100, 120, 10)).toEqual({
        scale: 0.078125,
        transform: 'translate(10, 90.3125) scale(0.078125, -0.078125)',
        x: 10,
        y: 29.6875,
      });
    });

    it('uses 0 as the default padding', () => {
      expect(HangulWriter.getScalingTransform(100, 100)).toEqual({
        scale: 0.09765625,
        transform: 'translate(0, 87.890625) scale(0.09765625, -0.09765625)',
        x: 0,
        y: 12.109375,
      });
    });
  });

  describe('option defaults', () => {
    it('works with legacy strokeAnimationDuration and strokeHighlightDuration if present', () => {
      const writer = HangulWriter.create('target', 'ㅅ', {
        strokeAnimationDuration: 1000,
        strokeHighlightDuration: 250,
      });
      expect(writer._options.strokeAnimationSpeed).toBe(0.5);
      expect(writer._options.strokeHighlightSpeed).toBe(2);
    });

    it('sets highlightCompleteColor to highlightColor if not explicitly set', () => {
      const writer = HangulWriter.create('target', 'ㅅ', { highlightColor: '#ABC' });
      expect(writer._options.highlightCompleteColor).toBe('#ABC');
    });

    it('sets highlightCompleteColor to the default highilghtColor if none is passed', () => {
      const writer = HangulWriter.create('target', 'ㅅ');
      expect(writer._options.highlightCompleteColor).toBe('#AAF');
    });
  });
});
