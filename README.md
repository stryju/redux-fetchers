# redux-fetchers
Let components automatically fetch their needed data.

[![npm version](https://badge.fury.io/js/redux-fetchers.svg)](https://badge.fury.io/js/redux-fetchers)
[![Build Status](https://travis-ci.org/LIQIDTechnology/redux-fetchers.svg?branch=master)](https://travis-ci.org/LIQIDTechnology/redux-fetchers)

```
npm install --save redux-fetchers
```

## Why does this exist?
In the world of redux, actions are commonly used for asyncronous data.
Want to fetch the account data of an user? Dispatch an action.
A common problem that occurs, that some actions need to be cached, like actions that trigger network requests.

As an example, we don't want to dispatch an action, when the value is already in the store but also
we don't want to redispatch an action when it was already dispatched.
Current best pratices would be have a state somewhere in the store for every action that needs to check these things.
Something like `NONE / IN_PROGRESS / DONE / FAIL`.
This get's really tedious when having a lot of actions which need this kind of states.

This is where fetchers are used.

The most common use case are actions that perform network requests, which you don't want to reexecute.
But it's a general approach which can be used for everything.

## How to use
The complete example is running at https://liqidtechnology.github.io/redux-fetchers/, the source can be found in the examples folder.

At first we have some actions which fill our store:
```js
function getTitle () {
    ...
}

function getUser (userId) {
    ...
}
```


To make a fetcher out of an action, we use `wrapActionForFetching` and give it an accessor function.
The state here is the state from your store, the accessor function uses it and (optional) additional arguments to check for existence.

```js
const getTitleFetcher = wrapActionForFetching(
    getTitle,
    (state) => state.title
);

const getUserFetcher = wrapActionForFetching(
    getUser,
    (state, userId) => state.users[userId]
);

```

Let's say we have a simple component that is connected to a store
```js
function UserScreen({title, user}) {
    return (
        <div>
            <h1>{title}</h1>
            <h2>{'Hi User: '}<strong>{`${user.name} ${user.lastName}!`}</strong></h2>
        </div>
    );
}

const ConnectedUserScreen = connect(
    (state, props) => {
        return {
            title: state.title,
            user: state.users[props.userId] || {}
        }
    }
)(UserScreen);
```

We can now use fetchers to wrap this connected component and **automatically** dispatch the needed actions to fill the store.
```js
const WrappedUserScreen = fetches(
    getTitleFetcher(),
    getUserFetcher(
        // this will provide the additional argument of the accessor of getUserFetcher
        props => props.userId
    )
)()(UserScreen));
```

## How does it work?

The fetcher (the wrapped action) will add these checks to know if it should dispatch itself:

1. Using the accessor, which was provided in the creation of the fetcher, it checks the state of the store if the requested value exists. If it does not exist (is falsy) check 2.

2. Nothing is in the store yet, but maybe the action was already dispatched. For this we check an internal cache that redux-fetchers uses.
If the cache says we already dispatched the action, do nothing, else dispatch the action.

## Advanced

Internally fetchers use a global cache, to check if the action was already dispatched.
This cache can be controlled and resettet (which normally needs to be done if a user switches accounts for example).

```js
import {
    cache
} from 'redux-fetchers';

// do this to reset the internal fetcher cache
// this cache is only there to not retrigger actions that are async

cache.reset();
```

Sometimes you want to manually dispatch an action inside a fetcher (without warpping it inside a component). To achieve this, set the first argument to something falsy and the wrapped action will be dispatched **and** cached. That this action won't be dispatched a second time when using a *real* fetcher, because it got cached, is actually the only reason you might want to do this. Keep in mind, that this will always dispatch the action, it does not matter if it got cached or not, the only advantage of using this instead of dispatching the action itself is the cache.

```js
getUserFetcher(
    dict => dict.userId
)(null, dispatch, {
    userId: 'test'
});
```
