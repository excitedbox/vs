export default class VueApplication {
    public $router: any;

    navigate(path: string) {
        if (path === this.$router.history.current.path) return;
        this.$router.push(path);
    }

    currentPath() {
        return this.$router.history.current.path;
    }
}