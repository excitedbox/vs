declare var Vue;
declare var VueRouter;

export default class VueHelper {
    static async loadComponent(path: string, componentName: string = null, script: any = null) {
        // Download converted component
        let response = await fetch(`${path}`);
        let data = await response.json();

        // Calculate component name
        let tmpComponentName = componentName || path.split('/').pop()
            .replace(/\.vue$/, '')
            .replace(/\./g, '-');

        // Register new component globally
        Vue.component(tmpComponentName, Object.assign({
            template: data.template
        }, script || eval(data.script)));

        // Inject component style to html document
        if (!document.querySelector(`style[vue-component=${tmpComponentName}]`)) {
            let p = document.createElement('style');
            p.setAttribute('vue-component', tmpComponentName);
            p.innerHTML = data.style;
            document.head.appendChild(p);
        }
    }

    static async loadComponents(list: Array<string>) {
        let promiseAll = [];
        for (let i = 0; i < list.length; i++) {
            promiseAll.push(VueHelper.loadComponent(list[i]));
        }
        await Promise.all(promiseAll);
    }

    private static setMethodList(instance, methodList) {
        let propList = Object.getOwnPropertyNames(instance.__proto__);
        for (let i = 0; i < propList.length; i++) {
            if (propList[i] === 'constructor') continue;
            if (propList[i][0] === '$') continue;
            if (typeof instance[propList[i]] !== 'function') continue;
            methodList[propList[i]] = instance[propList[i]];
        }
    }

    static async initApplication(app: any, routes:Array<any>) {
        // Instantiate application
        let instance = new app();
        let appIsReady = () => {
        };

        // Create application container
        let appDiv = document.createElement('div');
        appDiv.setAttribute('id', 'app');
        appDiv.innerHTML = `<main-app></main-app>`;
        document.body.appendChild(appDiv);

        // Get all application methods
        let methodList = {};
        this.setMethodList(instance, methodList);
        this.setMethodList(instance.__proto__, methodList);

        let data = {
            ...instance.storage
        };
        data.storage = data;

        // Vue components
        await VueHelper.loadComponent('/main.vue', 'main-app', {
            methods: methodList,
            data() {
                return data
            }
        });

        let router;
        try {
            router = new VueRouter({ routes });
        }
        catch (e) {

        }

        // Vue init
        new Vue({
            router,
            el: '#app',
            mounted() {
                if (instance.$start)
                    appIsReady = instance.$start.bind(this);
            },
            methods: methodList,
            watch: {
                '$route' (to, from) {
                    try {
                        instance.$event.bind(this)('routeChange', to, from);
                    }
                    catch (e) {

                    }
                }
            },
            data: data
        });

        appIsReady();
    }
}