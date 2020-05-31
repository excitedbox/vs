<template>
    <div class="ui-pagination">
        <button><i class="fas fa-chevron-left"></i></button>
        <button @click="select(x)" v-for="x in itemsLeft">{{ x }}</button>
        <div v-if="isNeedCenter">...</div>
        <button @click="select(x)" v-for="x in itemsRight">{{ x }}</button>
        <button><i class="fas fa-chevron-right"></i></button>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({
        components: {

        }
    })
    export default class UI_Pagination extends Vue {
        @Prop(Number) amount: number;
        @Prop(Number) max: number = 6;

        public page: number = 0;
        public itemsLeft: number[] = [];
        public itemsRight: number[] = [];
        public isNeedCenter: boolean = false;

        mounted() {
            this.refresh();
        }

        select(page: number) {
            this.page = page - 1;
            this.refresh();
        }

        refresh() {
            let out = [];
            for (let i = 0; i < Math.floor(this.max / 2); i++) {
                out.push(this.page + i + 1);
            }
            this.itemsLeft = out;

            out = [];
            for (let i = this.amount - Math.floor(this.max / 2) + 1; i <= this.amount; i++) {
                out.push(i);
            }
            this.itemsRight = out;

            if (this.amount > this.max) {
                this.isNeedCenter = true;
            }
        }
    }
</script>