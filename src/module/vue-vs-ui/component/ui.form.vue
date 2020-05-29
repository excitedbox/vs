<template>
    <div ref="form" class="ui-form">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({
        components: {

        }
    })
    export default class UI_Form extends Vue {
        mounted() {
            let element = (this.$refs['form'] as HTMLElement).querySelector('[type=submit]');
            if (element) {
                element.addEventListener('click', () => {
                    this.submit();
                });
            }
        }

        submit() {
            let out = {};
            let elements = Array.from((this.$refs['form'] as HTMLElement).querySelectorAll('[name]'));
            elements.forEach((e: HTMLElement) => {
                out[e.getAttribute('name')] =  e['__vue__'].$data.value;
            });
            console.log(out);
            this.$emit('success', out);
        }
    }
</script>

<style lang="scss" scoped>

</style>