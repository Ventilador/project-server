declare namespace ProjectServer {
    export interface IBaseFunction<T> {
        [0]: string;
        [1]: T
    }
    export interface IConditionFunction {
        (injection: any, value: any): Promise<boolean>;
    }
    export interface IParseFunction {
        (injection: any, value: any): Promise<any>;
    }

    export interface ICondition extends IBaseFunction<IConditionFunction> { }

    export interface IDescribeFn {
        (context: IContext): void;
    }
    export interface IParse extends IBaseFunction<IParseFunction> { }


    export interface IIfExpression {
        then(action: IChain): IIfExpression;
        else(action: IChain): IIfExpression;
        elseIf(action: ICondition): IIfExpression;
        done(): IChain;
    }
    export interface IContext {
        if(fnCondition: ICondition): IIfExpression;
        chain(): IChain;
        chain(action: [string, IParseFunction]): IChain;
    }
    export interface IChain {
        chain(action: IParse): IChain;
        return(action: IParse): void;
    }
}