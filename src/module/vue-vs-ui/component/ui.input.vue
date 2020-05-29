<template>
    <div class="ui-input" :class="isPreload ?'preload' :''">
        <i v-if="icon" :class="icon"></i>
        <input
                @input="$emit('input', value)"
                v-model="value" v-if="!isMultiline"
                type="text"
                :placeholder="placeholder"
                :disabled="isPreload"
        >
        <textarea
                @input="$emit('input', value)"
                v-model="value"
                v-if="isMultiline"
                :placeholder="placeholder"
                :disabled="isPreload"></textarea>
        <ui-preload v-if="isPreload"></ui-preload>
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
    export default class UI_Input extends Vue {
        @Prop(Boolean) readonly isPreload: boolean;
        @Prop(String) readonly title: string;
        @Prop(String) readonly icon: string;
        @Prop(String) readonly placeholder: string;
        @Prop(String) readonly isMultiline: boolean;

        public value: string = "";
    }
</script>