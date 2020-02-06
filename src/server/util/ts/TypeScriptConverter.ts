import * as Fs from 'fs';
import * as Path from "path";
import * as Util from "util";
import TypeScriptModule from "./TypeScriptModule";
import TypeScriptImport from "./TypeScriptImport";
import TypeScriptExport from "./TypeScriptExport";

const ReadFile = Util.promisify(Fs.readFile);
const WriteFile = Util.promisify(Fs.writeFile);

export default class TypeScriptConverter {
    static async resolveTypeScriptModules(rootDir: string, path: string, moduleList: Map<string, TypeScriptModule> = null) {
        if (!moduleList) moduleList = new Map<string, TypeScriptModule>();

        // Transform paths
        rootDir = Path.resolve(rootDir.replace(/\\/g, '/')).replace(/\\/g, '/') + '/';
        path = path.replace(/\\/g, '/');

        // Get path of file
        let fullPath = Path.resolve(rootDir + '/' + path).replace(/\\/g, '/');

        // If module already has that file
        if (moduleList.has(fullPath)) return moduleList;

        // Read file
        let fileContent = await ReadFile(fullPath, 'utf-8');

        // Remove nodejs specific code
        fileContent = fileContent.replace(/\/\/ #ifdef nodejs.*?\/\/ #endif/gsm, '');

        // Handle all imports
        let importList: Array<TypeScriptImport> = [];
        fileContent = fileContent.replace(/^import (.*?) from (.*?)$/gm, (r1, r2, r3) => {
            // Full path of module
            r3 = Path.resolve(rootDir + '/' + r3.replace(/[";]/g, ''))
                .replace(/\\/g, '/') + '.ts';

            // Save to import list
            let isDefault = !r2.includes('{');
            importList.push(new TypeScriptImport(r3, r2.split(','), isDefault));
            return '';
        });

        // Handle all exports
        let exportList: Array<TypeScriptExport> = [];
        fileContent = fileContent.replace(/^export (.*?)$/gm, (r1, r2) => {
            let isDefault = r2.includes('default');
            exportList.push(new TypeScriptExport(r2.replace(/(class|function|{|default)/g, ''), isDefault));
            return r1.replace(/^export /, '').replace(/^default /, '');
        });

        // Create ts module
        let tsModule = new TypeScriptModule(
            '__global__Module_' + Path.basename(fullPath).replace('.ts', ''),
            fullPath,
            importList,
            exportList,
            fileContent);

        // Save to list
        moduleList.set(fullPath, tsModule);

        for (let i = 0; i < importList.length; i++)
            await TypeScriptConverter.resolveTypeScriptModules(rootDir, importList[i].fileName.replace(rootDir, ''), moduleList);

        return moduleList;
    }

    static async compileInSingleFile(path: string) {
        let moduleList = await TypeScriptConverter.resolveTypeScriptModules(Path.dirname(path), Path.basename(path));
        let out = ``;

        moduleList.forEach(x => {
            let imports = ``;

            for (let i = 0; i < x.importList.length; i++) {
                let module = moduleList.get(x.importList[i].fileName);
                if (x.importList[i].isDefault) imports += `const ${x.importList[i].importItem} = ${module.id}().__$$default;\n`;
                else imports += `const ${x.importList[i].importItem} = ${module.id}();\n`;
            }

            out += `
                let ${x.id}_instance = null;
                const ${x.id} = (function () {
                    if (${x.id}_instance) return ${x.id}_instance;
                    ${x.id}_instance = (() => {
                        ${imports}
                    
                        ${x.code}
                        
                        return {
                            ${x.exportList.map(y => {
                if (y.isDefault) return '__$$default: ' + y.name + ', \n' + y.name + ': ' + y.name + ', \n';
                return y.name + ': ' + y.name + ', \n';
            })}
                        }
                    })();
                    
                    return ${x.id}_instance;
                });
            `;
        });

        let baseName = Path.basename(path).replace('.ts', '');
        out += `let \n${baseName} = ${moduleList.get(Path.resolve(path).replace(/\\/g, '/')).id}().__$$default;`;

        await WriteFile('./bin/test.ts', out);

        return out;
    }
}