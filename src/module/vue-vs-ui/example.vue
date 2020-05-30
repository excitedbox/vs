<template>
    <div class="ui-theme" :class="isDarkTheme ?'theme-dark' :''" style="height: 100%;">
        <div class="row">
            <ui-block class="col-mobile-16 col-tablet-16 flex-row">
                <ui-checkbox @change="isDarkTheme = $event"></ui-checkbox>
                <div>Switch theme</div>
            </ui-block>

            <div v-if="step === 0" class="col-mobile-16 col-tablet-16">
                <ui-block>
                    <ui-form @success="step++">
                        <h1>Sign up</h1>
                        <ui-input name="first-name" placeholder="First name" style="margin-bottom: 20px;"
                                  icon="fas fa-user"></ui-input>
                        <ui-input name="last-name" placeholder="Last name" style="margin-bottom: 20px;"></ui-input>
                        <ui-input name="sex-name" placeholder="Sex name" style="margin-bottom: 20px;" :is-preload="true"></ui-input>
                        <ui-dropdown name="gender" placeholder="Choose your gender"
                                     :items="['Human', 'Woman', 'Gaygin']"
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

                        <div class="button-group border round" style="margin-bottom: 20px;">
                            <ui-button>
                                <i class="fas fa-archive"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fas fa-adjust"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fas fa-battery-full"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fas fa-border-all"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fab fa-bootstrap"></i>
                            </ui-button>
                        </div>
                        <div class="button-group border" style="margin-bottom: 20px;">
                            <ui-button>
                                <i class="fas fa-archive"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fas fa-adjust"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fas fa-battery-full"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fas fa-border-all"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fab fa-bootstrap"></i>
                            </ui-button>
                        </div>
                        <div class="button-group" style="margin-bottom: 20px;">
                            <ui-button>
                                <i class="fas fa-archive"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fas fa-adjust"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fas fa-battery-full"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fas fa-border-all"></i>
                            </ui-button>
                            <ui-button>
                                <i class="fab fa-bootstrap"></i>
                            </ui-button>
                        </div>
                        <ui-button class="orange" style="margin-bottom: 20px;" :is-preload="true">Gas</ui-button>
                        <ui-button type="submit" class="primary">Next</ui-button>
                    </ui-form>
                </ui-block>
            </div>

            <div v-if="step === 1" class="col-mobile-16 col-tablet-16">
                <ui-block>
                    <h1>About you</h1>
                    <h2>Expurulain er smollness</h2>
                    <ui-input
                            @input="text = $event"
                            :is-multiline="true"
                            placeholder="Description"
                            style="margin-bottom: 20px;"></ui-input>
                    <div class="flex-row" style="margin-bottom: 20px;">
                        <ui-progress :is-radial="true" style="width: 32px; height: 32px; font-size: 0.5rem;"
                                     :value="text.length"></ui-progress>
                        <div style="margin-left: 20px;">Gaygino mettero</div>
                    </div>

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
                            GGG
                        </div>
                    </ui-tab>

                    <ui-calendar style="margin-bottom: 20px;"></ui-calendar>
                    <div class="button-group">
                        <ui-button class="labeled" @click="step--">
                            <i class="fas fa-chevron-left"></i>
                            Back
                        </ui-button>
                        <ui-button class="primary" @click="step++">Next</ui-button>
                    </div>
                </ui-block>
            </div>

            <div v-if="step === 2" class="col-mobile-16 col-tablet-16">
                <ui-block>
                    <ui-form @success="step++">
                        <h1>Additional</h1>

                        <h2>Are you really baka gaijin?</h2>
                        <ui-radio-group name="a" :items="['Yos', 'Nope', 'Gaybe']"></ui-radio-group>

                        <h2>Antatachi wa shitto wo tabemasu hoshii des ka?</h2>
                        <ui-radio-group name="b" :items="['Sure', 'Nan', 'Fuck off gay']"></ui-radio-group>

                        <h2>Sekkuso hoshii des ka?</h2>
                        <ui-radio-group name="c" :items="['Iie', 'I donto allowedo to do sis']"></ui-radio-group>

                        <div class="button-group">
                            <ui-button class="labeled" @click="step--">
                                <i class="fas fa-chevron-left"></i>
                                Back
                            </ui-button>
                            <ui-button type="submit" class="primary">Next</ui-button>
                        </div>
                    </ui-form>
                </ui-block>
            </div>

            <div v-if="step === 3" class="col-mobile-16 col-tablet-16">
                <ui-block>
                    <h2>Big Data DB</h2>
                    <ui-table :header="[{ title: 'id', columnWidth: 0.2 }, 'name', { title: 'created', columnWidth: 0.4 }]" :data="[
                        { id: 1, name: 'Tolja', created: 1},
                        { id: 2, name: 'Kreeluwa', created: 2},
                        { id: 3, name: 'CouPro', created: 10},
                        { id: 4, name: 'Max New Tyan', created: 341},
                        { id: 5, name: 'Cureizee daiamondo', created: 1124},
                        ]"></ui-table>

                    <ui-button style="margin-top: 20px; margin-bottom: 20px;">Add my name here</ui-button>
                    <div class="flex-row" style="margin-bottom: 20px;">
                        <ui-checkbox name="peezdeele"></ui-checkbox>
                        <div>Remove this shitty db?</div>
                    </div>
                    <div class="flex-row" style="margin-bottom: 20px;">
                        <ui-checkbox name="peezdeele"></ui-checkbox>
                        <div>Send me callback is my ass</div>
                    </div>

                    <ui-button class="labeled" @click="step--">
                        <i class="fas fa-chevron-left"></i>
                        Back
                    </ui-button>
                    <ui-button @click="step++" class="primary" style="margin-top: 20px; margin-bottom: 20px;">Finish this shit already</ui-button>
                </ui-block>
            </div>

            <div v-if="step === 4" class="col-mobile-16 col-tablet-16 grid gap-10">
                <ui-block>
                    <ui-list :items="['a', 'b', 'c']"></ui-list>
                </ui-block>

                <ui-block>
                    <ui-list :items="['a', 'b', 'c']" :is-show-numbers="true"></ui-list>

                    <ui-message style="margin-top: 20px">
                        Omae wa <b>Baka gaigin</b> des ka? If not get the fuck out of here now!!!
                    </ui-message>

                    <ui-message class="primary" style="margin-top: 20px">
                        Omae wa <b>Baka gaigin</b> des ka? If not get the fuck out of here now!!!
                    </ui-message>

                    <ui-message class="positive" style="margin-top: 20px">
                        Omae wa <b>Baka gaigin</b> des ka? If not get the fuck out of here now!!!
                    </ui-message>

                    <ui-message class="negative" style="margin-top: 20px">
                        Omae wa <b>Baka gaigin</b> des ka? If not get the fuck out of here now!!!
                    </ui-message>

                    <ui-button class="labeled" @click="step--" style="margin-top: 20px;">
                        <i class="fas fa-chevron-left"></i>
                        Baskov
                    </ui-button>
                </ui-block>

                <ui-block>
                    <ui-split>
                        <div class="item">
                            <ui-message>
                                Omae wa <b>Baka gaigin</b> des ka? If not get the fuck out of here now!!!
                            </ui-message>
                        </div>
                        <div class="item">
                            Contributes the nth grid line to the grid item’s placement. If a negative integer is given, it instead counts in reverse, starting from the end edge of the explicit grid.
                            If a name is given as a, only lines with that name are counted. If not enough lines with that name exist, all implicit grid lines are assumed to have that name for the purpose of finding this position.
                        </div>
                    </ui-split>

                    <ui-button class="labeled" @click="step--" style="margin-top: 20px;">
                        <i class="fas fa-chevron-left"></i>
                        Back
                    </ui-button>
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
    import uiProgress from "./component/ui.progress.vue";
    import uiCalendar from "./component/ui.calendar.vue";
    import uiRadioGroup from "./component/ui.radio.group.vue";
    import uiTable from "./component/ui.table.vue";
    import uiList from "./component/ui.list.vue";
    import uiMessage from "./component/ui.message.vue";
    import uiSplit from "./component/ui.split.vue";

    @Component({
        components: {
            uiButton, uiInput, uiDropdown,
            uiBlock, uiCheckbox, uiForm,
            uiTab, uiProgress, uiCalendar,
            uiRadioGroup, uiTable, uiList,
            uiMessage, uiSplit
        }
    })
    export default class Example extends Vue {
        public isDarkTheme: boolean = false;
        public step: number = 0;
        public text: string = '';

        async mounted() {

        }
    }
</script>