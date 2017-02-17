# redux-fetchers
Let components automatically dispatch actions when they need to be dispatched.

In the world of redux, actions are commonly used for asyncronous data.
Want to fetch the account data of an user? Dispatch an action.
A common problem is the caching of the action.


So for example, we don't want to dispatch an action, when the value is already in the store but also
we don't want to redispatch an action when it was already dispatched.
Current best pratices would be have a state somewhere in the store for every action that needs to check these things.
Something like `NONE / IN_PROGRESS / DONE / FAIL`.
This get's really tedious when having a lot of actions which need this kind of states.


This is where fetchers are used.

The most common use case are actions that perform network requests, which you don't want to reexecute.
But it's a general approach which can be used for everything.


Fetchers are used like this:

```js
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from 'redux';
import {
    wrapActionForFetching,
    fetches
} from 'redux-fetchers';

const initialState = {
    dataFromOtherAction: {
        a: true,
        b: true
    }
};

function reducer (state = initialState, action) {
    switch (action.type) {
    case 'MY_ACTION':
        return Object.assign({}, state, {
            dataFromAction: action.data
        });
    case: 'MY_ACTION_2':
        return Object.assign({}, state, {
                dataFromOtherAction: Object.assign({}, state.dataFromOtherAction, {
                    [action.key]: true
                })
            });
    default:
        return state
    }
}

const store = createStore(reducer);

function myAction () {
    return {
        type: 'MY_ACTION',
        data: 'my_data'
    };
}

function myAction2 () {
    return {
        type: 'MY_ACTION_2',
        key: key
    };
}

const myActionFetcher = wrapActionForFetching(
    myAction, // first argument is the action we want to wrap
    (state) => state.dataFromAction // second is an accessor function, which checks if the data is there
);

const myActionFetcher2 = wrapActionForFetching(
    myAction2, // first argument is the action we want to wrap
    (state, props) => state.dataFromOtherAction[props.key] // the function also has access to the given props
);

function MyComponent() {
    return <h1>{'Hi!'}</h1>;
}

const WrappedMyComponent = fetches(
    myActionFetcher(),
    myAction2Fetcher(
        props => props.key // the result of the function will be the argument of myAction2
    )
)(MyComponent);

// WrappedMyComponent asks for data of myAction and myAction2
// myAction will be dispatched, because state.dataFromAction is undefined
// myAction2 won't be executed because the data for the key 'a' already exsists
ReactDOM.render(
    <WrappedMyComponent key='a' />,
    document.getElementById('root')
);

```

Internally fetchers also uses a global cache, to check if the action was already triggered.
This cache can be controlled and resettet (which normally needs to be done if a user switches accounts for example).

```js
import {
    cache
} from 'redux-fetchers';


// do this to reset the internal fetcher cache
// this cache is only there to not retrigger actions that are async

cache.reset();
```
