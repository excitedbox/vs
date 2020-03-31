attribute vec2 aVertexPosition;
attribute vec2 aMatrixOne;
attribute vec2 aMatrixTwo;
attribute vec2 aTextureCoord;
uniform mat4 uCameraMatrix;
varying lowp vec2 vTextureCoord;

varying lowp vec4 vFuck;

void main(void) {
    vFuck.x = aVertexPosition.x * aMatrixTwo.x + aMatrixOne.x;
    vFuck.y = aVertexPosition.y * aMatrixTwo.y + aMatrixOne.y;
    vFuck.z = 1.0;
    vFuck.w = 1.0;

    gl_Position = uCameraMatrix * vFuck;
    vTextureCoord = aTextureCoord;
}