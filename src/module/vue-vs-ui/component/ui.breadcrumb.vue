<template>
    <div class="ui-breadcrumb">
        <div @click="$emit('select', x)" v-for="x in items" v-html="x"></div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";

    @Component({
        components: {

        }
    })
    export default class UI_Breadcrumb extends Vue {
        @Prop(Array) items: string[];

        mounted() {

        }
    }
</script>