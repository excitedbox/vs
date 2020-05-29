<template>
    <div style="position: relative;">
        <div class="ui-dropdown" @click.stop="toggleOpen" :class="isShowItems ?'active' :''">
            <!-- Placeholder -->
            <span v-if="!isMultiple" :class="selected ?'' :'placeholder'">
                {{ selected || placeholder }}
            </span>

            <!-- Placeholder -->
            <span v-if="isMultiple && !selectedMultiple.length"
                  :class="selected ?'' :'placeholder'">
                {{ placeholder }}
            </span>

            <!-- Multiple -->
            <div v-if="isMultiple" class="items">
                <div v-for="x in selectedMultiple">
                    {{ x }}
                    <i @click.stop="removeItem(x)" class="fas fa-times" style="margin-left: 0.5rem;"></i>
                </div>
            </div>
            <i class="fas fa-sort-down"></i>
        </div>
        <div v-if="isShowItems"
        :class="[ isHideItems ?'ui-dropdown-elements-hide' :'ui-dropdown-elements']">
            <div @click.stop="[select(x)]" v-for="x in items.filter(y => selectedMultiple.indexOf(y) === -1)">{{ x }}</div>
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
        @Prop(Boolean) readonly isMultiple: boolean;
        @Prop(String) readonly title: string;
        @Prop(String) readonly icon: string;
        @Prop(String) readonly placeholder: string;
        @Prop(Array) readonly items: {}[];

        public isHideItems: boolean = false;
        public isShowItems: boolean = false;
        public selected: string = '';
        public selectedMultiple: string[] = [];
        public value: string | string[] = '';
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

        select(item: string) {
            if (this.isMultiple) {
                if (this.selectedMultiple.indexOf(item) === -1) {
                    this.selectedMultiple.push(item);
                }

                if (this.selectedMultiple.length === this.items.length) {
                    this.toggleOpen();
                }

                this.value = this.selectedMultiple;
            } else {
                this.selected = item;
                this.value = item;
                this.toggleOpen();
            }
        }

        removeItem(item: string) {
            if (this.selectedMultiple.indexOf(item) !== -1) {
                this.selectedMultiple.splice(this.selectedMultiple.indexOf(item), 1);
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