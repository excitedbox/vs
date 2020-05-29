<template>
    <div>
        <div class="ui-dropdown" @click.stop="toggleOpen" :class="isShowItems ?'active' :''">
            <span>{{ selected || 'Select' }}</span>
            <i class="fas fa-sort-down"></i>
        </div>
        <div v-if="isShowItems"
        :class="[ isHideItems ?'ui-dropdown-elements-hide' :'ui-dropdown-elements']">
            <div @click="[selected = x, toggleOpen()]" v-for="x in 10">{{ x }}</div>
        </div>
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
    export default class UI_Dropdown extends Vue {
        @Prop(Boolean) readonly isPreload: boolean;
        @Prop(String) readonly title: string;
        @Prop(String) readonly icon: string;
        @Prop(String) readonly placeholder: string;
        @Prop(Array) readonly items: {}[];

        public isHideItems: boolean = false;
        public isShowItems: boolean = false;
        public selected: string = '';
        private _listener: () => void = null;

        toggleOpen() {
            if (!this.isShowItems) {
                this.isShowItems = true;
            } else {
                this.hideElements();
            }
        }

        hideElements() {
            if (!this.isHideItems) {
                this.isHideItems = true;
                setTimeout(() => {
                    this.isShowItems = false;
                    this.isHideItems = false;
                }, 200);
            }
        }

        mounted() {
            this._listener = () => {
                this.hideElements();
            };

            document.addEventListener('click', this._listener);
        }

        beforeUnmounted() {
            document.removeEventListener('click', this._listener);
        }
    }
</script>

<style lang="scss" scoped>
    .ui-dropdown {
        flex: 1;
        display: flex;
        padding: 0.65em 1em;
        background: #fefefe;
        border: 1px solid rgba(34, 36, 38, .15);
        border-radius: 0.2rem;
        align-items: center;
        cursor: pointer;
        font-size: 1rem;
        // transition: border 0.2s;
        user-select: none;

        i.fa-sort-down {
            position: relative;
            top: -0.16rem;
            margin-left: auto;
            color: rgba(0, 0, 0, .6);
        }

        &.active {
            border-color: #85b7d9;
            border-bottom-color: rgba(34, 36, 38, .15);
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
        }
    }

    @keyframes uiDropDownAppear {
        0% {
            transform: scaleY(0);
            transform-origin: 0 0;
            opacity: 0;
        }
        100% {
            transform: scaleY(1);
            transform-origin: 0 0;
            opacity: 1;
        }
    }

    @keyframes uiDropDownDisappear {
        0% {
            transform: scaleY(1);
            transform-origin: 0 0;
            opacity: 1;
        }
        100% {
            transform: scaleY(0);
            transform-origin: 0 0;
            opacity: 0;
        }
    }

    .ui-dropdown-elements, .ui-dropdown-elements-hide {
        border: 1px solid #85b7d9;
        border-top-width: 0;
        border-radius: 0 0 0.2rem 0.2rem;
        overflow: hidden;
        user-select: none;
        animation-name: uiDropDownAppear;
        animation-duration: 0.3s;

        > div {
            font-size: 1rem;
            padding: 0.5rem 1rem;
            background: #fefefe;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
                background: darken(#fefefe, 5%);
            }
        }
    }

    .ui-dropdown-elements-hide {
        animation-name: uiDropDownDisappear;
        animation-duration: 0.2s;
        animation-fill-mode: forwards;
    }
</style>