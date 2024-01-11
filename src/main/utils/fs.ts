import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export function writeTextFile(file: string, content: string) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, { encoding: 'utf-8' });
}

export function readTextFile(file: string) {
  return readFileSync(file, { encoding: 'utf-8' });
}

export function getFiles(dir: string, dir2: string, files: string[] = []) {
  const fileList = readdirSync(dir);
  for (const file of fileList) {
    const name = join(dir, file);
    const name2 = dir2 === '' ? file : join(dir2, file);
    if (statSync(name).isDirectory()) {
      getFiles(name, name2, files);
    } else {
      files.push(name2);
    }
  }
  return files;
}

export function dirSize(dir: string) {
  const files = readdirSync(dir, { withFileTypes: true });

  const paths = files.map((file) => {
    const path = join(dir, file.name);

    if (file.isDirectory()) return dirSize(path);

    if (file.isFile()) {
      const { size } = statSync(path);

      return size;
    }

    return 0;
  });

  return paths.flat(Infinity).reduce((i: any, size: any) => i + size, 0);
}
