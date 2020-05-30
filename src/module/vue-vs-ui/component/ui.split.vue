<template>
    <div ref="split" class="ui-split">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import interactjs from "interactjs";

    @Component({
        components: {

        }
    })
    export default class UI_Split extends Vue {
        mounted() {
            let ch = document.createElement("div");
            ch.setAttribute("class", "split");

            (this.$refs['split'] as HTMLElement).appendChild(ch);

            let maxWidth = (this.$refs['split'] as HTMLElement).getBoundingClientRect().width;
            ch.style.transform = `translate(${maxWidth / 2}px)`;

            let [left, right] = [...(this.$refs['split'] as HTMLElement).querySelectorAll('.item')] as HTMLElement[];

            interactjs('.split').draggable({
                listeners: {
                    // call this function on every dragmove event
                    move(event) {
                        event.preventDefault();

                        var target = event.target;
                        // keep the dragged position in the data-x/data-y attributes
                        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        var y = 0; //(parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                        if (x < 0) {
                            x = 0;
                        }

                        if (x > maxWidth - 8) {
                            x = maxWidth - 8;
                        }

                        let percentage = (x / (maxWidth - 8)) * 100;

                        left.style.width = percentage + '%';
                        right.style.width = 100 - (percentage) + '%';

                        // translate the element
                        target.style.webkitTransform =
                            target.style.transform =
                                'translate(' + x + 'px, ' + y + 'px)';

                        // update the posiion attributes
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    }
                }
            });
        }
    }
</script>