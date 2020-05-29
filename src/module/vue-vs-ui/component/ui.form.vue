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
    export default class UI_Block extends Vue {
        mounted() {
            let element = (this.$refs['form'] as HTMLElement).querySelector('[type=submit]');
            if (element) {
                element.addEventListener('click', () => {
                    this.submit();
                });
            }
        }

        submit() {
            let elements = Array.from((this.$refs['form'] as HTMLElement).querySelectorAll('[name]'));
            elements.forEach((e: HTMLElement) => {
                console.log(e.getAttribute('name'), e['__vue__'].$data.value);
            });

            this.$emit('success');
        }
    }
</script>

<style lang="scss" scoped>

</style>