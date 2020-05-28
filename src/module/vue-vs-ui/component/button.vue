<template>
    <div class="button">
        <button>
            <slot></slot>
        </button>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import { Fragment } from 'vue-fragment';

    @Component({
        components: {
            Fragment
        }
    })
    export default class UI_Button extends Vue {

    }
</script>

<style lang="scss" scoped>
    .button {
        display: flex;
        flex: 1;

        button {
            flex: 1;
            background: #4b4b4b;
            border: 0;
            outline: none;
            padding: 5px 10px;
            border-radius: 2px;
            cursor: pointer;
            color: #bbbbbb;
            transition: background 0.2s;
            font-size: 12px;

            &:hover,  &:active {
                background: #6b6b6b;
            }
        }
    }
</style>