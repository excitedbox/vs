import Session from "../../user/Session";

export default interface IDrive {
    path: string;
    contentType: string;

    /**
     * Get info about a file or folder.
     */
    info();

    /**
     * Read file and return file content
     */
    readFile();

    /**
     * Get file and folder list from the path.
     * @param filter
     */
    list(filter: string);

    search(filter: string);

    tree(filter: string);

    /**
     * Check if file or folder exists
     */
    exists();

    /**
     * Create folder
     */
    createDir();

    /**
     * Write file data. Create a file if it's not exists.
     * @param data
     */
    writeFile(data: Buffer | Uint8Array | string);

    /**
     * Rename a file or folder.
     * @param name
     */
    rename(name: string);

    /**
     * Remove file or folder
     */
    remove();
}