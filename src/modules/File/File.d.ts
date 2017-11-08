declare namespace FileModule {
    export interface File {
        full(): boolean;
        queue(method: string, file: string, done: Function): void;
        start(): void;
        done(): void;
    }
}