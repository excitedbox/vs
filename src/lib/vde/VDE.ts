import VdeApplicationApi from "./VdeApplicationApi";
import VdeFileSystemApi from "./VdeFileSystemApi";
import VdeUrlApi from "./VdeUrlApi";

export default class VDE {
    static application: VdeApplicationApi = new VdeApplicationApi();
    static fs: VdeFileSystemApi = new VdeFileSystemApi();
    static url: VdeUrlApi = new VdeUrlApi();
}