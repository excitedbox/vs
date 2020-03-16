export default class builtinModules {
    static list() {
        return {
            'fs': {
                writeFile: (path, data, callback) => {
                    let oReq = new XMLHttpRequest(), formData = new FormData();

                    if (typeof data === "object" && !(data instanceof Blob) && !(data instanceof Uint8Array)) data = JSON.stringify(data);
                    formData.append("data", new Blob([data]), "content-file");

                    oReq.onload = function () {
                        if (this.status === 200) callback(null, this.responseText);
                        else callback(this.responseText);
                    };
                    oReq.open("post", `/$api?m=FileSystem.writeFile&path=${path}`, true);
                    oReq.send(formData);
                },
                readFile: (path, type, callback) => {
                    fetch(`/$api?m=FileSystem.readFile&path=${path}`).then((response) => {
                        if (response.ok) return response.text();
                        throw new Error(response.statusText);
                    }).then((response) => {
                        callback(null, response);
                    }).catch((e) => {
                        callback(e);
                    });
                }
            },
            'util': {
                promisify: (fn) => {
                    return function () {
                        // Get current arguments
                        let args = Array.from(arguments);

                        // Create promise
                        return new Promise((resolve, reject) => {
                            // Call function
                            fn.apply(this, [...args, function (err, ...other) {
                                // console.log(...other);
                                if (err) reject(err);
                                else resolve(...other);
                            }]);
                        });
                    };
                }
            }
        }
    }
};