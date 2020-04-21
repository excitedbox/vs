import Sprite from "./Sprite";
import AdvancedSpriteMaterial from "../shader/AdvancedSpriteMaterial";
import {TypeRenderObjectParameters} from "./RenderObject";
import SpriteMaterial from "../shader/SpriteMaterial";

export default class AdvancedSprite extends Sprite {
    constructor(params: TypeRenderObjectParameters) {
        super(params);

        this._material = new AdvancedSpriteMaterial(this.blastGl);
    }

    get material(): AdvancedSpriteMaterial {
        return this._material as AdvancedSpriteMaterial;
    }
}