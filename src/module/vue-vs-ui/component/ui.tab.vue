<template>
    <div class="ui-tab">
        <div class="items">
            <div @click="selectTab(x)" v-for="x in items" :class="x === selected ?'active' :''">
                {{ x }}
            </div>
        </div>
        <div ref="body" class="body scroll" :style="maxHeight ?{maxHeight: maxHeight + 'px'} :{}">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({
        components: {

        }
    })
    export default class UI_Block extends Vue {
        @Prop(Boolean) readonly items: string[];
        @Prop(Boolean) readonly maxHeight: number;
        public selected: string = '';

        mounted() {
            this.hideItems();
            this.selectTab(this.items[0]);
        }

        hideItems() {
            let items = Array.from((this.$refs['body'] as HTMLElement).querySelectorAll('.item'));
            items.forEach((x: HTMLElement) => {
                x.style.display = 'none';
            });
        }

        selectTab(x: string) {
            this.selected = x;

            this.hideItems();
            let items = Array.from((this.$refs['body'] as HTMLElement).querySelectorAll('.item'));
            (items[this.items.indexOf(x)] as HTMLElement).style.display = 'flex';
        }
    }
</script>