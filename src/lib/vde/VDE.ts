import VdeApplicationApi from "./VdeApplicationApi"
import VdeFileSystemApi from "./VdeFileSystemApi"

export default class VDE {
    static application: VdeApplicationApi = new VdeApplicationApi();
    static fs: VdeFileSystemApi = new VdeFileSystemApi();
}