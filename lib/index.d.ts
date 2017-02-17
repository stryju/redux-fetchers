/// <reference types="react" />
import * as Redux from 'redux';
import * as React from 'react';
/**
 * We create a global cache-object, where it's stored if we already
 * requested the action
 */
declare global  {
    interface Window {
        REDUX_FETCHER_CACHE: {
            [n: string]: string;
        };
    }
}
export declare const cache: {
    reset: () => void;
    set: (id: string | number, value: any) => void;
    has: (id: string | number) => boolean;
    increment: () => number;
};
export declare type Fetcher = (state: any, dispatch: Redux.Dispatch<any>, props: any) => any;
/**
 * This method is will take wrapped actions as parameters and returns
 * a function that will wrap a React component.
 *
 * @param fetchers - Wrapped actions that should be executed when needed
 */
export declare function fetches(...fetchers: Fetcher[]): <T>(WrappedComponent: React.ComponentClass<T> | React.StatelessComponent<T>) => React.ComponentClass<T & {
    _reduxState: any;
    _reduxDispatch: any;
}> | React.StatelessComponent<T & {
    _reduxState: any;
    _reduxDispatch: any;
}>;
/**
 * Takes an action and a store accessor function and creates a fetcher:
 * A actions that will automatically 'now' when it needs to be fetched/refetched
 *
 * @param action - The action to be wrapped
 * @param storeValueFn - The function to determine if the action needs to be fetched
 */
export declare function wrapActionForFetching(action: Redux.ActionCreator<any>, storeValueFn: (state: any, ...vars: any[]) => any): (...stateFns: ((props: any, state: any) => any)[]) => Fetcher;
