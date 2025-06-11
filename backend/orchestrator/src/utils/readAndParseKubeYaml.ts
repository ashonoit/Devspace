import fs from "fs";
import yaml from "yaml";

export const readAndParseKubeYaml = (filePath: string, spaceId: string): Array<any> => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
        let docString = doc.toString();
        const regex = new RegExp(`service_name`, 'g');
        docString = docString.replace(regex, spaceId);
        // console.log(docString);
        return yaml.parse(docString);
    });
    return docs;
};