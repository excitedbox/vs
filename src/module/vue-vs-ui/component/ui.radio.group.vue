<template>
    <div class="ui-radio-group">
        <div v-for="x in items" @click="select(x)" class="flex-row item-container">
            <div class="item" :class="selected === x ?'active' :''">
                <div></div>
            </div>
            <span>{{ x }}</span>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({
        components: {}
    })
    export default class UI_RadioGroup extends Vue {
        @Prop(Boolean) readonly items: string[];
        public selected: string = '';
        public value: string = '';

        mounted() {
            this.select(this.items[0]);
        }

        select(x: string) {
            this.value = this.selected = x;
        }
    }
</script>