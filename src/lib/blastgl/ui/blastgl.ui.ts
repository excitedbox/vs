import SensitiveComponent from "../../../../user/root/bin/github.com/maldan/sensitive/SensitiveComponent";
import {UI_SensitiveDefaultStyle} from "../../../../user/root/bin/github.com/maldan/sensitive/ui/sensitive.std.ui";
import SensitiveNode from "../../../../user/root/bin/github.com/maldan/sensitive/SensitiveNode";
import UI_SensitiveMenuBar from "../../../../user/root/bin/github.com/maldan/sensitive/ui/menu.bar.ui";
import {SensitiveUI} from "../../../../user/root/bin/github.com/maldan/sensitive/SensitiveUI";
import BlastGL from "../BlastGL";
import UI_SensitiveButton from "../../../../user/root/bin/github.com/maldan/sensitive/ui/button.ui";

export default class UI_BlastGL extends SensitiveComponent {
    constructor(props: {}) {
        super(props);
    }

    render(): {} {
        const state = SensitiveUI.watch({
            section: 'Game'
        });
        const engineInfoState = SensitiveUI.watch({
            refresh: 0
        });

        let gameContainer: SensitiveNode;
        let isInit: boolean = false;

        return {
            '.app'(appNode: SensitiveNode): void {
                appNode.watch(state);

                // Menu
                if (!isInit) {
                    appNode.push({
                        '@1': new UI_SensitiveMenuBar({
                            items: [
                                {
                                    title: 'Game',
                                    onClick(): void {
                                        state.section = 'Game';
                                    }
                                },
                                {
                                    title: 'Info',
                                    onClick(): void {
                                        state.section = 'Info';
                                    }
                                }
                            ]
                        })
                    }, 0);

                    isInit = true;
                }

                // Game container
                if (!gameContainer) {
                    appNode.push({
                        '.game-container'(gameContainerNode: SensitiveNode): void {
                            gameContainer = gameContainerNode;
                        }
                    }, 1);
                }

                if (state.section === 'Game') {
                    gameContainer.style = { display: 'block' };
                } else {
                    gameContainer.style = { display: 'none' };
                }

                if (state.section === 'Info') {
                    // Game container
                    appNode.push({
                        '.engine-info'(engineInfoNode: SensitiveNode): void {
                            engineInfoNode.watch(engineInfoState);

                            engineInfoNode.push({
                                '.tick-id': `Tick ID: ${BlastGL.info.tickId}`,
                                '.delta': `Delta: ${BlastGL.info.deltaTime}`,
                                '@1': new UI_SensitiveButton({
                                    title: 'Refresh',
                                    onClick(): void {
                                        engineInfoState.refresh = Math.random();
                                    }
                                })
                            });
                        }
                    }, 2);
                } else {
                    appNode.clear(2);
                }
            }
        };
    }

    get style(): {} | {}[] {
        return [
            UI_SensitiveDefaultStyle,
            {
                '.app': {
                    '.game-container': {
                        margin: 'auto'
                    },
                    '.engine-info': {
                        padding: 5
                    }
                }
            }
        ];
    }
}