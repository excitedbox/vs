declare var Vue;

export default class VueHelper {
    static async loadStandardUIComponents() {
        let domainUrl = ['ui', ...window.location.host.split('.').slice(1)].join('.');
        domainUrl = window.location.protocol + '//' + domainUrl;

        await VueHelper.loadComponents([
            domainUrl + '/ui/vde.button.vue',
        ]);
    }

    static async loadComponent(path: string, componentName: string = null, script: any = null) {
        // Download converted component
        let response = await fetch(`${path}?convert`);
        let data = await response.json();

        // Calculate component name
        let tmpComponentName = componentName || path.split('/').pop()
            .replace(/\.vue$/, '')
            .replace('.', '-');

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
        for (let i = 0; i < list.length; i++) {
            await VueHelper.loadComponent(list[i]);
        }
    }

    static async initApplication(app: any) {
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
        let methodList = {}, propList = Object.getOwnPropertyNames(instance.__proto__);
        for (let i = 0; i < propList.length; i++) {
            if (propList[i] === 'constructor') continue;
            if (propList[i][0] === '$') continue;
            if (typeof instance[propList[i]] !== 'function') continue;
            methodList[propList[i]] = instance[propList[i]];
        }

        let data = {
            //storage: instance.storage,
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

        // Vue init
        new Vue({
            el: '#app',
            mounted() {
                if (instance.$start)
                    appIsReady = instance.$start.bind(this);
            },
            methods: methodList,
            data: data
        });

        appIsReady();
    }
}