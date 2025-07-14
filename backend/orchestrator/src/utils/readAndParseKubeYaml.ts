import fs from "fs";
import yaml from "yaml";

export const readAndParseKubeYaml = (filePath: string, spaceId: string, podId:string): Array<any> => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
        let docString = doc.toString();

        // const regex = new RegExp(`service_name`, 'g');
        // docString = docString.replace(regex, spaceId);

        // Replace all "service_name" with podId
        docString = docString.replace(/service_name/g, podId);

        // Replace all "target_s3_folder_name" with spaceId
        docString = docString.replace(/target_s3_folder_name/g, spaceId);


        // console.log(docString);
        return yaml.parse(docString);
    });
    return docs;
};