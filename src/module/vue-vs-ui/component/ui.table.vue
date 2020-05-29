<template>
    <div class="ui-table">
        <div class="header">
            <div v-for="(x, i) in headerTitle" @click="sortBy(x, headerType[i])"
                 :style="{ flex: headerColumnWidth[i] }">{{ x }}
            </div>
        </div>
        <div class="body" :class="scrollY ?'scroll-mini' :''" :style="[scrollY ?{overflowY: 'scroll'} :{}]">
            <div v-for="(x, i) in currentData" @click.stop="$emit('select', x)">
                <div @click="[editable ?edit(i, j) :'']" v-for="(y, j) in headerTitle"
                     :style="{ flex: headerColumnWidth[j] }">
                    <span v-if="!isEditable(i, j)" v-html="headerFormat[j](x[y], x)"></span>

                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({
        components: {}
    })
    export default class UI_Table extends Vue {
        @Prop(Array) readonly header: string[];
        @Prop(Array) readonly data: string[];
        @Prop(Boolean) readonly isEdit: boolean;
        @Prop(Boolean) readonly scrollY: boolean;

        public currentData: any = [];
        public headerTitle: any = [];
        public headerType: any = [];
        public headerColumnWidth: any = [];
        public headerFormat: any = [];
        public row: number = -1;
        public column: any = -1;
        public isSortOrderAsc: boolean = false;

        mounted() {
            this.refresh(this.header, this.data);
        }

        isEditable(row, column) {
            return this.row === row && this.column === column;
        }

        refresh(header = null, data = null) {
            if (data) this.currentData = data;
            if (header) {
                this.headerTitle = header.map(x => {
                    if (typeof x === "string") return x.split(':')[0];
                    return x.title.split(':')[0];
                });
                this.headerType = header.map(x => {
                    if (typeof x === "string") return x.split(':')[1] || 'string';
                    return x.title.split(':')[1] || 'string';
                });
                this.headerColumnWidth = header.map(x => {
                    if (typeof x === "string") return 1;
                    return x.columnWidth || 1;
                });
                this.headerFormat = header.map(x => {
                    if (typeof x === "string") return (y) => y;
                    return x.format ? x.format : (y) => y;
                });
            }
        }
    }
</script>