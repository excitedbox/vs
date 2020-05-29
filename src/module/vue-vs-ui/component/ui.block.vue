<template>
    <div class="ui-block">
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

    }
</script>

<style lang="scss" scoped>

</style>