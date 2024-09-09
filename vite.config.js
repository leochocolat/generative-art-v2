// Vendor
import fs from 'fs';
import { defineConfig } from 'vite';
import path, { resolve } from 'path';
import glsl from 'vite-plugin-glsl';
import handlebars from 'vite-plugin-handlebars';

export default defineConfig({
    plugins: [
        glsl(),
        handlebars({
            partialDirectory: getDirectoriesRecursive(resolve(__dirname, 'src/views')),
            context: JSON.parse(fs.readFileSync('./src/assets/copy/en.json')),
        }),
    ],
    resolve: {
        alias: [
            { find: '@', replacement: path.resolve(__dirname, './src') },
            { find: 'assets', replacement: path.resolve(__dirname, './src/assets') },
            { find: 'style', replacement: path.resolve(__dirname, './src/style') },
            { find: 'script', replacement: path.resolve(__dirname, './src/script') },
            { find: 'utils', replacement: path.resolve(__dirname, './src/script/utils') },
            { find: 'vendor', replacement: path.resolve(__dirname, './src/script/vendor') },
            { find: 'webgl', replacement: path.resolve(__dirname, './src/script/webgl') },
        ],
    },
});

function flatten(lists) {
    return lists.reduce((a, b) => a.concat(b), []);
}
  
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .map(file => path.join(srcpath, file))
        .filter(path => fs.statSync(path).isDirectory());
}
  
function getDirectoriesRecursive(srcpath) {
    return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive))];
}
