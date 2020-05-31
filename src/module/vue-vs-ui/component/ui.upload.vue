<template>
    <div class="ui-upload" :class="isPreload ?'preload' :''">
        <input ref="file-select" type="file" style="position: absolute; top: -10000px; display: none;">
        <div style="flex: 1;">
            {{ value ?(value.length + ' files') :'Empty...'}}
        </div>
        <ui-button @click="pickFile" class="primary labeled">
            <i class="fas fa-upload"></i>
            Select
        </ui-button>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {Fragment} from 'vue-fragment';
    import uiPreload from './ui.preload.vue';
    import uiButton from './ui.button.vue';

    @Component({
        components: {
            Fragment, uiPreload, uiButton
        }
    })
    export default class UI_Input extends Vue {
        @Prop(Boolean) readonly isPreload: boolean;

        public value: FileList = null;

        mounted() {

        }

        pickFile() {
            let parent = this;

            this.$refs['file-select']['onchange'] = async function() {
                if (!this.files) {
                    return;
                }
                parent.value = parent.$refs['file-select']['files'];

                // Read file
                /*let reader = new FileReader();
                reader.onloadend = async function () {
                    parent.$refs['file-select']['value'] = '';
                    parent.$refs['file-select']['type'] = '';
                    parent.$refs['file-select']['type'] = 'file';
                };
                reader.readAsDataURL(file);*/
            };
            this.$refs['file-select']['click']();
        }
    }
</script>