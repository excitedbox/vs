import Main from "./src/server/Main";
/*import FileConverter from "./src/server/fs/FileConverter";

FileConverter.convertTypeScript(`./user/root/bin/github.com/maldan/vde-gallery/core/Main.ts`, {});*/

Main.run();

/*import * as ts from "typescript";

let program = ts.createProgram([
    './bin/a.ts'
], {});

let emitResult = program.emit();*/


/*allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
        console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
});*/