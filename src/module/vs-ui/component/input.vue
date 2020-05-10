<template>
    <div class="input">
        <label v-if="title">{{ title }}</label>
        <input type="text">
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {Fragment} from 'vue-fragment';

    @Component({
        components: {
            Fragment
        }
    })
    export default class UI_Input extends Vue {
        @Prop(String) readonly title: string;
    }
</script>

<style lang="scss" scoped>
    .input {
        flex: 1;
        display: flex;
        flex-direction: column;

        label {
            margin-bottom: 5px;
            font-size: 12px;
        }

        input {
            flex: 1;
            border: 0;
            padding: 5px;
            background: no-repeat;
            border-radius: 2px;
            color: #b2b2b2;
            outline: none;
            transition: border, background 0.2s;
            background: #515151;

            &:focus {
                border: 0;
            }
        }
    }
</style>