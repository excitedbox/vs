<template>
    <ul class="ui-list">
        <li @click="select(x)" v-for="x in items" :class="isSelected(x) ?'active' :''">
            <i v-if="isSelected(x)" class="fas fa-chevron-right"></i>
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
                return true;
            } else {
                if (value['id'] === this.value) {
                    return true;
                }
            }

            return false;
        }

        select(item: string | { id: string, value: string }) {
            if (typeof item === "string") {
                this.value = item;
            } else {
                this.value = item.id;
            }

            this.$emit('click', item);
        }

        @Watch('items')
        onPropertyChanged(value: string[] | {}[], oldValue: string) {
            this.checkType(value);
        }
    }
</script>