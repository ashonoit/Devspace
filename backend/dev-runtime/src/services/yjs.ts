import * as Y from "yjs";
import debounce from "lodash.debounce";
import { saveFile } from "./fileSystem";
import { saveToB2 } from "./b2storage";
import fs from 'fs';
import { fetchFileContent } from "./fileSystem";

export const docs: Map<string, Y.Doc> = new Map();   //stores Y.Doc for files opened by the user

export async function getYDoc(filePath: string): Promise<Y.Doc> {
    let doc = docs.get(filePath);

    if (doc === undefined) {
        const fullPath = `/workspace/${filePath}`;
        doc = new Y.Doc();

        if (fs.existsSync(fullPath)) {
            // Read the file content from the disk
            const content = await fetchFileContent(fullPath);
            console.log(`[${filePath}] File exists. Content loaded from disk. Length: ${content.length}`);
            
            // Populate the new Y.Doc with the file content
            const yText = doc.getText("monaco");
            Y.transact(doc, () => {
                yText.insert(0, content);
            });
        }
        else console.log(`[${filePath}] File does not exist. Creating a blank document.`);

        docs.set(filePath, doc);
    }
    return doc;
}

export function persistDoc(filePath: string, doc: Y.Doc, spaceId: string) {
    const text = doc.getText("monaco").toString();
    saveFile(`/workspace/${filePath}`, text);
    saveToB2(`spaces/${spaceId}`, filePath, text);
}

export const saveDebounced = debounce(persistDoc, 3000);