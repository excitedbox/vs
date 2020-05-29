<template>
    <div class="ui-checkbox" @click="change" :class="value ?'active' :''">
        <div></div>
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
    export default class UI_Checkbox extends Vue {
        public value: boolean = false;

        change() {
            this.value = !this.value;

            this.$emit('change', this.value);
        }
    }
</script>