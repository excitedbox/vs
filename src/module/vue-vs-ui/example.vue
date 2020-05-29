<template>
    <div class="ui-theme" :class="isDarkTheme ?'theme-dark' :''" style="height: 100%;">
        <div class="row">
            <ui-block style="display: flex; align-items: center;">
                <ui-checkbox @change="isDarkTheme = $event"></ui-checkbox>
                <div>Switch theme</div>
            </ui-block>

            <div v-if="step === 0" class="col-tablet-16">
                <ui-block>
                    <h1>Sign up</h1>
                    <ui-input placeholder="First name" style="margin-bottom: 20px;"></ui-input>
                    <ui-input placeholder="Last name" style="margin-bottom: 20px;"></ui-input>
                    <ui-dropdown placeholder="Choose your gender" :items="['Human', 'Woman', 'Gaygin']" style="margin-bottom: 20px;"></ui-dropdown>
                    <div class="flex-row" style="margin-bottom: 20px;">
                        <ui-checkbox></ui-checkbox>
                        <div>Omega Bakemonogatari</div>
                    </div>
                    <div class="flex-row" style="margin-bottom: 20px;">
                        <ui-checkbox></ui-checkbox>
                        <div>Alpha Gaygin</div>
                    </div>
                    <div class="flex-row" style="margin-bottom: 20px;">
                        <ui-checkbox></ui-checkbox>
                        <div>Eat dog food?</div>
                    </div>
                    <div class="flex-row" style="margin-bottom: 20px;">
                        <ui-checkbox></ui-checkbox>
                        <div>Peez deel ee?</div>
                    </div>
                    <ui-dropdown placeholder="Choose your food" :is-multiple="true" :items="[
                        'Dogs', 'Cats', 'Shit', 'Piss', 'Dicks'
                        ]" style="margin-bottom: 20px;"></ui-dropdown>

                    <ui-button class="primary" @click="step++">Next</ui-button>
                </ui-block>
            </div>

            <div v-if="step === 1" class="col-tablet-16">
                <ui-block>
                    <h1>About you</h1>
                    <h2>Expurulain er smollness</h2>
                    <ui-input :is-multiline="true" placeholder="Description" style="margin-bottom: 20px;"></ui-input>
                    <div class="button-group">
                        <ui-button class="labeled" @click="step--">
                            <i class="fas fa-chevron-left"></i>
                            Back
                        </ui-button>
                        <ui-button class="primary" @click="step++">Next</ui-button>
                    </div>
                </ui-block>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import uiButton from "./component/ui.button.vue";
    import uiInput from "./component/ui.input.vue";
    import uiDropdown from "./component/ui.dropdown.vue";
    import uiBlock from "./component/ui.block.vue";
    import uiCheckbox from "./component/ui.checkbox.vue";

    @Component({
        components: {
            uiButton, uiInput, uiDropdown, uiBlock, uiCheckbox
        }
    })
    export default class Example extends Vue {
        public isDarkTheme: boolean = false;
        public step: number = 0;

        async mounted() {

        }
    }
</script>