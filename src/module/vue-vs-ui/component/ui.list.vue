<template>
    <ul class="ui-list">
        <li @click="select(x, i)" v-for="(x, i) in items" :class="isSelected(x) ?'active' :''">
            <i v-if="isSelected(x)" class="fas fa-chevron-right"></i>
            <b v-if="isShowNumbers">{{ i + 1 }}</b>
            {{ type === 'string' ?x :x.value }}
        </li>
    </ul>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";

    @Component({
        components: {}
    })
    export default class UI_List extends Vue {
        @Prop(Array) readonly items: string[];
        @Prop(Boolean) readonly isShowNumbers: boolean;
        public type: "string" | "object" = "string";
        public value: string = "";

        mounted() {
            this.checkType(this.items);
        }

        checkType(value: string[] | {}[]) {
            if (typeof value[0] === "string") {
                this.type = "string";
            } else {
                this.type = "object";
            }
        }

        isSelected(value: string | { id: string; value: string }) {
            if (this.type === 'string') {
                if (value === this.value) {
                    return true;
                }
            } else {
                if (value['id'] === this.value) {
                    return true;
                }
            }

            return false;
        }

        select(item: string | { id: string, value: string }, position: number) {
            if (typeof item === "string") {
                this.value = item;
                this.$emit('click', { value: item, position });
            } else {
                this.value = item.id;
                this.$emit('click', {...item, position });
            }
        }

        click(element: string | {id: string, value: string }) {
            if (typeof element === "string") {
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i] === element) {
                        this.select(this.items[i], i);
                        return;
                    }
                }
            } else {
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i]['id'] === element.id) {
                        this.select(this.items[i], i);
                        return;
                    }
                }
            }
        }

        @Watch('items')
        onPropertyChanged(value: string[] | {}[], oldValue: string) {
            this.checkType(value);
        }
    }
</script>