<template>
    <div class="input" :class="isPreload ?'preload' :''">
        <!-- <label v-if="title">{{ title }}</label> -->
        <i v-if="icon" :class="icon"></i>
        <input type="text" :placeholder="placeholder" :disabled="isPreload">
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
    }
</script>

<style lang="scss" scoped>
    .input {
        flex: 1;
        display: flex;
        // flex-direction: column;
        padding: 0.65em 1em;
        background: #fefefe;
        border: 1px solid rgba(34, 36, 38, .15);
        border-radius: 0.2rem;
        align-items: center;

        i {
            font-size: 1rem;
            margin-right: 0.65rem;
            color: rgba(0, 0, 0, 0.5);
            transition: color 0.2s;
        }

        label {
            margin-bottom: 5px;
            font-size: 12px;
        }

        input {
            flex: 1;
            border: 0;
            // padding: 5px;
            padding: 0;
            background: no-repeat;
            border-radius: 2px;
            color: rgba(0, 0, 0, .87);
            outline: none;
            transition: border, background 0.2s;
            font-size: 1rem;

            &:focus {
                border: 0;
            }

            &::placeholder {
                color: rgba(0, 0, 0, .5);
            }
        }

        &:focus-within {
            i {
                color: rgba(0, 0, 0, 1);
            }

            border-color: #85b7d9;
        }
    }

    .input.preload {
        background: #f7f7f7;
    }
</style>