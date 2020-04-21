import Sprite from "./Sprite";
import AdvancedSpriteMaterial from "../shader/AdvancedSpriteMaterial";
import {TypeRenderObjectParameters} from "./RenderObject";

export default class AdvancedSprite extends Sprite {
    constructor(params: TypeRenderObjectParameters) {
        super(params);

        this._material = new AdvancedSpriteMaterial(this.blastGl);
    }
}