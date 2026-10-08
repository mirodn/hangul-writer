import { RenderTargetInitFunction } from '../../typings/types';
import HangulWriterRenderer from './HangulWriterRenderer';
import RenderTarget from './RenderTarget';

export default {
  HangulWriterRenderer,
  createRenderTarget: RenderTarget.init as RenderTargetInitFunction<
    SVGSVGElement | SVGElement
  >,
};
