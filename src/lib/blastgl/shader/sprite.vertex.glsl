attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
uniform mat4 uCameraMatrix;
varying lowp vec2 vTextureCoord;
varying lowp vec4 vColor;


void main(void) {
    gl_Position = uCameraMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
    vColor = aColor;
}
