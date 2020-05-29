<template>
    <div class="ui-button">
        <button @click="click" v-if="!isPreload">
            <slot></slot>
        </button>
        <button @click="click" v-if="isPreload">
            <ui-preload></ui-preload>
        </button>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {Fragment} from 'vue-fragment';
    import uiPreload from './ui.preload.vue';

    @Component({
        components: {
            Fragment, uiPreload
        }
    })
    export default class UI_Button extends Vue {
        @Prop(Boolean) readonly isPreload: boolean;

        click() {
            this.$emit('click');
        }
    }
</script>