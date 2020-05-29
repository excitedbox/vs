<template>
    <div class="ui-progress-container" style="position: relative;">
        <svg class="ui-progress" width="120" height="120" viewBox="0 0 120 120">
            <circle class="meter" cx="60" cy="60" r="54" stroke-width="12"/>
            <circle class="value" cx="60" cy="60" r="54" stroke-width="12"/>
        </svg>
        <div>{{ value }}%</div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";

    @Component({
        components: {}
    })
    export default class UI_Preload extends Vue {
        @Prop(Number) readonly value: number;
        @Prop(Boolean) readonly isRadial: boolean;

        mounted() {
            this.setProgress(this.value);
        }

        setProgress(value: number) {
            if (value < 0) {
                value = 0;
            }
            if (value > 100) {
                value = 100;
            }

            const progress = value / 100;
            const dashoffset = (2 * Math.PI * 54) * (1 - progress);
            (document.querySelector('.value') as HTMLElement).style.strokeDashoffset = dashoffset + '';
            (document.querySelector('.value') as HTMLElement).style.strokeDasharray = (2 * Math.PI * 54) + '';
        }

        @Watch('value')
        onPropertyChanged(value: unknown, oldValue: string) {
            this.setProgress(this.value);
        }
    }
</script>

<style lang="scss" scoped>
    .ui-progress-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;

        .ui-progress {
            transform: rotate(-90deg);

            .meter, .value {
                fill: none;
            }

            .meter {
                stroke: #e6e6e6;
            }

            .value {
                stroke: #3eda00;
            }
        }

        > div {
            position: absolute;
            font-weight: bold;
        }
    }
</style>