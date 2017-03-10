
import * as Redux from 'redux';
import { connect } from 'react-redux';
import * as React from 'react';

/**
 * We create a global cache-object, where it's stored if we already
 * requested the action
 */
declare global {
    interface Window {
        REDUX_FETCHER_CACHE: {
            [n: string]: string
        };
    }
}

let actionCounter = 0;

window.REDUX_FETCHER_CACHE = {};

function increment (): number {
    actionCounter++;
    return actionCounter;
}

function has (id: (number | string)) : boolean {
    return !!window.REDUX_FETCHER_CACHE[id];
}

function set (id: (number | string), value: any) : void {
    window.REDUX_FETCHER_CACHE[id] = value;
}

/**
 * Resetting the cache should be done normally when the user logs out,
 * just everytime the wrapped actions would yield a different result than before.
 */
function reset () : void {
    window.REDUX_FETCHER_CACHE = {};
    actionCounter = 0;
}

export const cache = {
    reset,
    set,
    has,
    increment
};

export type Fetcher = (state: any, dispatch: Redux.Dispatch<any>, props: any) => any;

type ImplicitState = {
    _reduxState: any;
    _reduxDispatch: any;
};

type ComponentClass<P> = React.ComponentClass<P>;
type StatelessComponent<P> = React.StatelessComponent<P>;
type ReactComponent<P> = (ComponentClass<P> | StatelessComponent<P>);

/**
 * This method is will take wrapped actions as parameters and returns
 * a function that will wrap a React component.
 *
 * @param fetchers - Wrapped actions that should be executed when needed
 */
export function fetches (...fetchers: Fetcher[]) {
    const decorator = function<T> (WrappedComponent: ReactComponent<T>) : (ReactComponent<T>) {
        return connect(
            function (state) {
                return {
                    _reduxState: state
                };
            },
            function (dispatch) {
                return {
                    _reduxDispatch: dispatch
                };
            }
        )(function NewWrappedComponent (props: T & ImplicitState) {
            fetchers.forEach(fetcher => {
                fetcher(props._reduxState, props._reduxDispatch, props);
            });
            return React.createElement(WrappedComponent as ComponentClass<T>, props, null);
        }) as ComponentClass<T>;
    };
    return decorator;
}

type StateFn = (props: any, state: any) => any;

/**
 * Takes an action and a store accessor function and creates a fetcher:
 * A actions that will automatically 'now' when it needs to be fetched/refetched
 *
 * @param action - The action to be wrapped
 * @param storeValueFn - The function to determine if the action needs to be fetched
 */
export function wrapActionForFetching (
    action: Redux.ActionCreator<any>,
    storeValueFn: (state: any, ...vars: any[]) => any) {
    let id = cache.increment();
    // the custom store accessors used in the components
    return function (...stateFns: StateFn[]) {
        // this will be called by fetches
        const fetcher : Fetcher = (state, dispatch, props) => {
            const vars = stateFns.map(fn => fn(props, state));
            const requestId = `id-${id}-${vars.join('-')}`;
            // it's dangerous to not give a state, should only be done, if the function is called once!
            if (!state || (storeValueFn(state, ...vars) === undefined && !cache.has(requestId))) {
                cache.set(requestId, true);
                return dispatch(action(...vars));
            }
        };
        return fetcher;
    };
}

