import { constructorFn } from './constructor';
import { readProvider } from './read';
import { existsProvider } from './exists';
export default project.module('file', [],
    {
        injectable: true,
        constructorFn: constructorFn
    })
    .conditional('exists', existsProvider)
    .transform('read', readProvider)
    .name;
