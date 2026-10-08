import Character from '../models/Character';
import Positioner from '../Positioner';
import { RenderStateObject } from '../RenderState';
import RenderTargetBase from './RenderTargetBase';

export default interface HangulWriterRendererBase<
  TElementType extends HTMLElement | HTMLCanvasElement | SVGElement | SVGSVGElement,
  TRenderTarget extends RenderTargetBase<TElementType>
> {
  _character: Character;
  _positioner: Positioner;

  mount(target: TRenderTarget): void;

  render(props: RenderStateObject): void;

  destroy(): void;
}

export interface HangulWriterRendererConstructor {
  new (character: Character, positioner: Positioner): HangulWriterRendererBase<any, any>;
}
