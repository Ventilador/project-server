// import fs from './../src/file-system';
// describe('basicTree', function () {
//     let directory: FileSystem.ITestDir;
//     let myFiles: string[];
//     before(function (done: any) {
//         fs.makeTestDir()
//             .then(function (dir) {
//                 directory = dir;
//                 return directory.list();
//             })
//             .then(function (files: string[]) {
//                 myFiles = files.filter(txtFiles, true);
//                 return Promise.all(files.filter(txtFiles)
//                     .map(deleteAsync, directory));
//             })
//             .then(done);
//     });
//     it('should support chaining', function (done: Function) {

//     });
// });

// function txtFiles(val: string) {
//     return /\.txt$/.test(val) === !!this;
// }

// function deleteAsync(this: FileSystem.ITestDir, val: string) {
//     return this.deleteFile(val);
// }
