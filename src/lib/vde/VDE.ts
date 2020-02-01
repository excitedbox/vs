/// <reference path="./VdeApplicationApi.ts" />
/// <reference path="./VdeFileSystemApi.ts" />

class VDE {
    static application: VdeApplicationApi = new VdeApplicationApi();
    static fs: VdeFileSystemApi = new VdeFileSystemApi();
}