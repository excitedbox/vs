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
    .ui-block {
        padding: 1rem;
        background: #fefefe;
        border-radius: 0.2rem;
        box-shadow: 0px 0 5px rgba(0, 0, 0, 0.16);
        font-size: 1rem;
    }
</style>