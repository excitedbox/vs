<template>
    <div class="ui-message">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";

    @Component({
        components: {}
    })
    export default class UI_List extends Vue {
        mounted() {
            
        }
    }
</script>