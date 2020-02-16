import * as Fs from 'fs';
import * as Path from "path";
import * as Util from "util";
import TypeScriptModule from "./TypeScriptModule";
import TypeScriptImport from "./TypeScriptImport";
import TypeScriptExport from "./TypeScriptExport";
import * as MD5 from 'md5';
import StringExtender from "../../../lib/extender/StringExtender";

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

        let moduleIsGlobal = !!fileContent.match(/\/\/ global/);

        // Remove nodejs specific code
        fileContent = fileContent.replace(/\/\/ #ifdef nodejs.*?\/\/ #endif/gsm, '');

        // Handle all imports
        let importList: Array<TypeScriptImport> = [];
        fileContent = fileContent.replace(/^import (.*?) from (.*?)$/gm, (r1, r2, r3) => {
            // Check options
            let isDefault = !r2.includes('{');
            let isDeferred = !!r3.match('// deferred');
            r3 = r3.replace(/\/\/.*/, '').trim();

            // Full path of module
            r3 = Path.resolve(rootDir + '/' + r3.replace(/[";]/g, ''))
                .replace(/\\/g, '/') + '.ts';


            // Save to import list
            importList.push(new TypeScriptImport(r3, r2.split(','), isDefault, isDeferred));
            return '';
        });

        // Handle all exports
        let exportList: Array<TypeScriptExport> = [];
        fileContent = fileContent.replace(/^export (.*?)$/gm, (r1, r2) => {
            let isDefault = r2.includes('default');
            let whatExportName = r2.replace(/(class|function|{|default|const|let|=|\(.*?\))/g, '');
            whatExportName = whatExportName.replace(/extends .+/, '');
            exportList.push(new TypeScriptExport(whatExportName, isDefault));
            return r1.replace(/^export /, '').replace(/^default /, '');
        });

        // Create ts module
        let tsModule = new TypeScriptModule(
            '__' + Path.basename(fullPath).replace('.ts', '').dotToCamel() + '_' + MD5(fullPath + ' ' + fileContent).slice(0, 8),
            fullPath,
            importList,
            exportList,
            fileContent,
            moduleIsGlobal);

        // Save to list
        moduleList.set(fullPath, tsModule);

        for (let i = 0; i < importList.length; i++) {
            let relativePath = Path.relative(rootDir, importList[i].fileName);
            let tempRootDir = Path.dirname(Path.resolve(rootDir, relativePath)).replace(/\\/g, '/') + '/';
            let filePath = importList[i].fileName.replace(tempRootDir, '');

            await TypeScriptConverter.resolveTypeScriptModules(tempRootDir, filePath, moduleList);
        }
        return moduleList;
    }

    static async compileInSingleFile(path: string) {
        let moduleList = await TypeScriptConverter.resolveTypeScriptModules(Path.dirname(path), Path.basename(path));
        let instanceMap = `const __instanceMap = {\n`;
        let out = ``;
        let globalModules = ``;
        let globalImports = ``;

        moduleList.forEach(x => {
            let imports = ``;

            for (let i = 0; i < x.importList.length; i++) {
                let module = moduleList.get(x.importList[i].fileName);
                if (!module.isGlobal) {
                    imports += `let ${x.importList[i].importItem} = `;

                    if (x.importList[i].isDeferred) imports += `__instanceMap.${module.id}`;
                    else imports += `${module.id}()`;

                    if (x.importList[i].isDefault) imports += `.__$$default`;
                    imports += `;\n`;
                }

                // if (x.importList[i].isDefault) imports += `${x.importList[i].importItem} = ${module.id}().__$$default;\n`;
                // else imports += `${x.importList[i].importItem} = ${module.id}();\n`;

                // Huimports
                /*if (x.importList[i].isDefault) huImports += `let ${x.importList[i].importItem} = __fromModule === '${module.id}' ?(__instanceMap['${module.id}'] ?__instanceMap['${module.id}'].__$$default :null) :${module.id}('${x.id}').__$$default;\n`;
                else huImports += `let ${x.importList[i].importItem} = __fromModule === '${module.id}' ?__instanceMap['${module.id}'] :${module.id}('${x.id}');\n`;*/

                // Huimports
                //if (x.importList[i].isDefault) huImports += `let ${x.importList[i].importItem} = __fromModule === '${module.id}' ?(__instanceMap['${module.id}'] ?__instanceMap['${module.id}'].__$$default :null) :${module.id}('${x.id}').__$$default;\n`;
                //else huImports += `let ${x.importList[i].importItem} = __fromModule === '${module.id}' ?(__instanceMap['${module.id}'] ?__instanceMap['${module.id}'] :null) :${module.id}('${x.id}');\n`;
                //huImports += `huilo.push(${x.importList[i].importItem});`;
                //declareImports += `${x.importList[i].importItem},`;
                //defferedImports += `if (sasuin[i] === '${module.id}') ${x.importList[i].importItem} = __instanceMap[sasuin[i]];\n`;
            }

            instanceMap += `${x.id}: null,\n`;
            //let ${x.id}_instance = null;

            if (x.isGlobal) {
                globalImports += imports;
                globalModules += x.code + '\n';
                return;
            }

            out += `
                // ${x.fileName}
                const ${x.id} = (function (__fromModule, __isInit) {
                    if (!__isInit && __instanceMap.${x.id}) return __instanceMap.${x.id};
                    
                     ${imports}
                     
                    __instanceMap.${x.id} = new (function() {
                        console.log('Module "${x.id}" init!');
                        ${x.code}
                        
                        return {
                            ${x.exportList.map(y => {
                                if (y.isDefault) {
                                    return `
                                        __$$default: ${y.name},
                                        ${y.name}: ${y.name}
                                    `;
                                } else {
                                    return `${y.name}: ${y.name}`;
                                }
                            })}
                        }
                    })();
                    
                    return __instanceMap.${x.id};
                });
            `;
        });
        instanceMap += `};\n`;

        let baseName = Path.basename(path).replace('.ts', '');
        let mainModule = moduleList.get(Path.resolve(path).replace(/\\/g, '/'));
        let returnModule = `${mainModule.exportList[0].name}`;
        if (!mainModule.isGlobal) returnModule = `${mainModule.id}().__$$default;`;

        out = `let ${baseName} = (() => { ${instanceMap}\n ${globalModules}\n ${out}\n ${globalImports}\n return ${returnModule}; })()`;

        // if (mainModule.isGlobal) out += `let \n${baseName} = ${mainModule.exportList[0].name};`;
        // else out += `let \n${baseName} = ${mainModule.id}().__$$default;`;

        return out;
    }
}