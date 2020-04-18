precision lowp float;
varying lowp vec2 vTextureCoord;
varying lowp vec4 vColor;
uniform sampler2D uSampler;

void main(void) {
    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
    if (vTextureCoord.x == -1.0 && vTextureCoord.y == -1.0) gl_FragColor = vColor;
    else gl_FragColor = textureColor * vColor;

    if (gl_FragColor.a < 0.01)
        discard;

    //gl_FragColor.r = gl_FragCoord.z;
    /*gl_FragColor.r = floor(gl_FragColor.r / 0.5) * 0.5;
    gl_FragColor.g = floor(gl_FragColor.g / 0.5) * 0.5;
    gl_FragColor.b = floor(gl_FragColor.b / 0.5) * 0.5;*/
}
