<template>
    <div class="ui-theme" :class="isDarkTheme ?'theme-dark' :''" style="height: 100%;">
        <div class="row">
            <ui-block style="display: flex; align-items: center;">
                <ui-checkbox @change="isDarkTheme = $event"></ui-checkbox>
                <div>Switch theme</div>
            </ui-block>

            <div v-if="step === 0" class="col-tablet-16">
                <ui-block>
                    <ui-form @success="step++">
                        <h1>Sign up</h1>
                        <ui-input name="first-name" placeholder="First name" style="margin-bottom: 20px;" icon="fas fa-user"></ui-input>
                        <ui-input name="last-name" placeholder="Last name" style="margin-bottom: 20px;"></ui-input>
                        <ui-dropdown name="gender" placeholder="Choose your gender" :items="['Human', 'Woman', 'Gaygin']"
                                     style="margin-bottom: 20px;"></ui-dropdown>
                        <div class="flex-row" style="margin-bottom: 20px;">
                            <ui-checkbox name="omega"></ui-checkbox>
                            <div>Omega Bakemonogatari</div>
                        </div>
                        <div class="flex-row" style="margin-bottom: 20px;">
                            <ui-checkbox name="alpha"></ui-checkbox>
                            <div>Alpha Gaygin</div>
                        </div>
                        <div class="flex-row" style="margin-bottom: 20px;">
                            <ui-checkbox name="dog-food"></ui-checkbox>
                            <div>Eat dog food?</div>
                        </div>
                        <div class="flex-row" style="margin-bottom: 20px;">
                            <ui-checkbox name="peezdeele"></ui-checkbox>
                            <div>Peez deel ee?</div>
                        </div>
                        <ui-dropdown name="food-type" placeholder="Choose your food" :is-multiple="true" :items="[
                        'Dogs', 'Cats', 'Shit', 'Piss', 'Dicks'
                        ]" style="margin-bottom: 20px;"></ui-dropdown>

                        <ui-button type="submit" class="primary">Next</ui-button>
                    </ui-form>
                </ui-block>
            </div>

            <div v-if="step === 1" class="col-tablet-16">
                <ui-block>
                    <h1>About you</h1>
                    <h2>Expurulain er smollness</h2>
                    <ui-input :is-multiline="true" placeholder="Description" style="margin-bottom: 20px;"></ui-input>
                    <ui-tab :items="['A', 'B', 'C']" style="margin-bottom: 20px;" :max-height="150">
                        <div class="item">
                            1
                        </div>
                        <div class="item">
                            Etiam sagittis sem sed lacus laoreet, eu fermentum eros auctor.
                            Proin at nulla elementum, consectetur ex eget, commodo ante.
                            Sed eros mi, bibendum ut dignissim et, maximus eget nibh. Phasellus
                            blandit quam turpis, at mollis velit pretium ut. Nunc consequat
                            efficitur ultrices. Nullam hendrerit posuere est. Nulla libero
                            sapien, egestas ac felis porta, cursus ultricies quam. Vestibulum
                            tincidunt accumsan sapien, a fringilla dui semper in. Vivamus
                            consectetur ipsum a ornare blandit. Aenean tempus at lorem sit
                            amet faucibus. Curabitur nibh justo, faucibus sed velit cursus,
                            mattis cursus dolor. Pellentesque id pretium est. Quisque
                            convallis nisi a diam malesuada mollis. Aliquam at enim ligula.
                        </div>
                        <div class="item">
                            3
                        </div>
                    </ui-tab>
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
    import uiForm from "./component/ui.form.vue";
    import uiTab from "./component/ui.tab.vue";

    @Component({
        components: {
            uiButton, uiInput, uiDropdown,
            uiBlock, uiCheckbox, uiForm,
            uiTab
        }
    })
    export default class Example extends Vue {
        public isDarkTheme: boolean = false;
        public step: number = 0;

        async mounted() {

        }
    }
</script>