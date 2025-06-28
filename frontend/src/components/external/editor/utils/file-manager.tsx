export enum Type {
  FILE,
  DIRECTORY,
  DUMMY
}

interface CommonProps {
  id: string; // file id
  type: Type; // file type
  name: string; // name
  content?: string;
  path: string;
  parentId: string | undefined; // parent directory; undefined if it's root
  depth: number; // file depth
}

export interface File extends CommonProps {}

export interface RemoteFile {
  type: "file" | "dir";
  name: string;
  path: string;
}

export interface Directory extends CommonProps {
  files: File[];
  dirs: Directory[];
}

/**
 * Build file tree
 * @param data result fetched from fetch
 */
export function buildFileTree(data: RemoteFile[]): Directory {
  const dirs = data.filter(x => x.type === "dir");
  const files = data.filter(x => x.type === "file");
  const cache = new Map<string, Directory | File>(); // cache

  // Root directory to be constructed
  let rootDir: Directory = {
    id: "root",
    name: "root",
    parentId: undefined,
    type: Type.DIRECTORY,
    path: "",
    depth: 0,
    dirs: [],
    files: []
  };

  // Store <id, directory object> in map
  dirs.forEach((item) => {
    let dir: Directory = {
      id: item.path,
      name: item.name,
      path: item.path,
      parentId: item.path.split("/").length === 2 ? "0" : dirs.find(x => x.path === item.path.split("/").slice(0, -1).join("/"))?.path,
      type: Type.DIRECTORY,
      depth: 0,
      dirs: [],
      files: []
    };

    cache.set(dir.id, dir);
  });

  // Store <id, file object> in map
  files.forEach((item) => {
    let file: File = {
      id: item.path,
      name: item.name,
      path: item.path,
      parentId: item.path.split("/").length === 2 ? "0" : dirs.find(x => x.path === item.path.split("/").slice(0, -1).join("/"))?.path,
      type: Type.FILE,
      depth: 0
    };
    cache.set(file.id, file);
  });

  // Start traversing to build file tree
  cache.forEach((value, key) => {
    // '0' means the file or directory is located in the root directory
    if (value.parentId === "0") {
      if (value.type === Type.DIRECTORY) rootDir.dirs.push(value as Directory);
      else rootDir.files.push(value as File);
    } else {
      const parentDir = cache.get(value.parentId as string) as Directory;
      if (value.type === Type.DIRECTORY)
        parentDir.dirs.push(value as Directory);
      else parentDir.files.push(value as File);
    }
  });

  // Get file depth
  getDepth(rootDir, 0);

  return rootDir;
}

/**
 * Get file depth
 * @param rootDir root directory
 * @param curDepth current depth
 */
function getDepth(rootDir: Directory, curDepth: number) {
  rootDir.files.forEach((file) => {
    file.depth = curDepth + 1;
  });
  rootDir.dirs.forEach((dir) => {
    dir.depth = curDepth + 1;
    getDepth(dir, curDepth + 1);
  });
}

export function findFileByName(
  rootDir: Directory,
  filename: string
): File | undefined {
  let targetFile: File | undefined = undefined;

  function findFile(rootDir: Directory, filename: string) {
    rootDir.files.forEach((file) => {
      if (file.name === filename) {
        targetFile = file;
        return;
      }
    });
    rootDir.dirs.forEach((dir) => {
      findFile(dir, filename);
    });
  }

  findFile(rootDir, filename);
  return targetFile;
}

export function sortDir(l: Directory, r: Directory) {
  return l.name.localeCompare(r.name);
}

export function sortFile(l: File, r: File) {
  return l.name.localeCompare(r.name);
}
