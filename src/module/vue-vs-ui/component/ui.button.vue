<template>
    <div class="ui-button">
        <button v-if="!isPreload">
            <slot></slot>
        </button>
        <button v-if="isPreload">
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
    }
</script>

<style lang="scss" scoped>
    .ui-button {
        display: flex;
        flex: 1;

        button {
            position: relative;
            flex: 1;
            background: #dedede;
            border: 0;
            outline: none;
            padding: .78571429em 1.5em .78571429em;
            border-radius: 0.2rem;
            cursor: pointer;
            color: rgba(0, 0, 0, .6);
            transition: all 0.2s;
            font-size: 1rem;
            font-weight: bold;

            &:hover, &:active {
                background: darken(#dedede, 10%);
                color: rgba(0, 0, 0, 1);
            }
        }
    }

    .ui-button.primary {
        button {
            background: #2185d0;
            color: #fefefe;

            &:hover, &:active {
                background: darken(#2185d0, 10%);
            }
        }
    }

    .ui-button.positive {
        button {
            background: #21ba45;
            color: #fefefe;

            &:hover, &:active {
                background: darken(#21ba45, 10%);
            }
        }
    }

    .ui-button.negative {
        button {
            background: #db2828;
            color: #fefefe;

            &:hover, &:active {
                background: darken(#db2828, 10%);
            }
        }
    }

    .ui-button.orange {
        button {
            background: #ff851b;
            color: #fefefe;

            &:hover, &:active {
                background: darken(#ff851b, 10%);
            }
        }
    }

    .ui-button.violet {
        button {
            background: #8a73ff;
            color: #fefefe;

            &:hover, &:active {
                background: darken(#8a73ff, 10%);
            }
        }
    }

    .ui-button.labeled {
        button {
            padding-left: 3.8rem;

            i {
                position: absolute;
                left: 0;
                top: 0;
                background: rgba(0, 0, 0, 0.2);
                padding: 0.86rem 0.7rem;
            }
        }
    }

    .ui-button.small {
        button {
            font-size: 0.7rem;
        }
    }

    .ui-button.big {
        button {
            font-size: 1.1rem;
        }
    }
</style>