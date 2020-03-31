precision lowp float;
varying lowp vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
    gl_FragColor = textureColor;
}
