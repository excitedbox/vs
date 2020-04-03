import SensitiveComponent from "../../../../user/root/bin/github.com/maldan/sensitive/SensitiveComponent";
import {UI_SensitiveDefaultStyle} from "../../../../user/root/bin/github.com/maldan/sensitive/ui/sensitive.std.ui";
import SensitiveNode from "../../../../user/root/bin/github.com/maldan/sensitive/SensitiveNode";

export default class UI_BlastGL extends SensitiveComponent {
    constructor(props: {}) {
        super(props);
    }

    render(): {} {
        return {
            '.app'(appNode: SensitiveNode): void {
                appNode.push({
                    '.game-container'(): void {

                    }
                });
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
                    }
                }
            }
        ];
    }
}