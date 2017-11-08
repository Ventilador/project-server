declare var nextId: () => number;
declare var valueFn: (val: any) => any;
declare var expect: Chai.ExpectStatic;
declare namespace FileSystem {
    export interface IRuntime {
        readFile(...path: string[]): Promise<Buffer>;
        fileExists(...path: string[]): Promise<boolean>;
        join(...path: string[]): string;
        writeFile(fileName: string, content: any): Promise<void>;
        makeTestDir(...basePath: string[]): Promise<ITestDir>;
        getDirectories(...path: string[]): Promise<string[]>;
    }
    export interface ITestDir {
        readFile(fileName: string): Promise<Buffer>;
        writeFile(fileName: string, content: any): Promise<void>;
        deleteFile(fileName: string): Promise<void>;
        list(): Promise<string[]>;
    }
}

interface Function {
    $inject?: string[];
    (...args: any[]): any;
}

declare namespace project {
    export var module: (name: string, requires?: string[], config?: any) => IModule
    export interface IModule {
        name: string;
        requires: string[];
        conditional(name: string, fn: Function): IModule;
        conditional(name: string, fn: any[]): IModule;
        transform(name: string, fn: Function): IModule;
        transform(name: string, fn: any[]): IModule;
        through(name: string, fn: Function): IModule;
        through(name: string, fn: any[]): IModule;
    }
}
