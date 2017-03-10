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


An example usage for fetchers is shown below. For a guarenteed working example, check the example directory.

```js
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import {
    wrapActionForFetching,
    fetches
} from '../index';

const initialState = {
    users: {
        someid: {
            name: 'Max',
            lastName: 'Mustermann'
        }
    },
    title: undefined
};

function reducer (state = initialState, action) {
    switch (action.type) {
    case 'GET_TITLE':
        return Object.assign({}, state, {
            title: action.title
        });
    case 'GET_USER':
        return Object.assign({}, state, {
                users: Object.assign({}, state.users, {
                    [action.id]: action.user
                })
            });
    default:
        return state
    }
}

const store = createStore(reducer);

function getTitle () {
    return {
        type: 'GET_TITLE',
        title: 'Having fun with redux-fetchers'
    };
}

function getUser (id) {
    return {
        type: 'GET_USER',
        id: id,
        user: {
            name: 'Tom',
            lastName: 'Nick'
        }
    };
}

const getTitleFetcher = wrapActionForFetching(
    getTitle, // first argument is the action we want to wrap
    (state) => state.title // second is an accessor function, which checks if the data is there
);

const getUserFetcher = wrapActionForFetching(
    getUser,
    // the function also has access to the given arguments
    (state, userId) => {
        return state.users[userId];
    }
);

function UserScreen({title, user}) {
    return (
        <div>
            <h1>{title}</h1>
            <h2>{`Hi ${user.name} ${user.lastName}!`}</h2>
        </div>
    );
}

const WrappedUserScreen = fetches(
    getTitleFetcher(),
    getUserFetcher(
        props => props.userId // the result of the function will be the argument of getUser
    )
)(connect(
    function (state, props : {userId: string}) {
        return {
            title: state.title,
            user: state.users[props.userId] || {}
        }
    }
)(UserScreen));

// WrappedUserScreen asks for data of getTitle and getUser
// getTitle will be dispatched, because state.dataFromAction is undefined
// getUser won't be executed because the data for the key 'someid' already exsists
ReactDOM.render(
    <Provider
        store={store}
    >
        <WrappedUserScreen
            userId='someid'
        />
    </Provider>,
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
