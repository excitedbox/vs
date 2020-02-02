declare var Vue;

class VueHelper {
    static async getStandardUIComponents() {
        await VueHelper.getComponents([
            '/$public/ui/vde.button.vue',
        ]);
    }

    static async getComponents(list: Array<string>) {
        for (let i = 0; i < list.length; i++) {
            // Download converted component
            let response = await fetch(`${list[i]}?convert`);
            let data = await response.json();

            // Calculate component name
            let componentName = list[i].split('/').pop()
                .replace(/\.vue$/, '')
                .replace('.', '-');

            // Register new component globally
            Vue.component(componentName, Object.assign({
                template: data.template
            }, eval(data.script)));

            // Inject component style to html document
            if (!document.querySelector(`style[vue-component=${componentName}]`)) {
                let p = document.createElement('style');
                p.setAttribute('vue-component', componentName);
                p.innerHTML = data.style;
                document.head.appendChild(p);
            }
        }

        return {};
    }
}