# redux-fetchers
Let components automatically fetch their needed data.

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


An example usage for fetchers is shown below. This example is running at https://liqidtechnology.github.io/redux-fetchers/,
you can find the code in the examples directory.
The source there is in TypeScript, below the few type definitions were removed to make it valid JSX.

```js
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import {
    wrapActionForFetching,
    fetches
} from '../index';

/**
 * Our initial data, has an undefined title and one user with id *someid*
 */
const initialState = {
    currentUserId: 'someid',
    users: {
        someid: {
            name: 'Max',
            lastName: 'Mustermann'
        }
    },
    title: undefined
};

/**
 * Simple reducer, that just puts the received data into the store
 */
function reducer (state = initialState, action) {
    switch (action.type) {
    case 'GET_TITLE_SUCCESS':
        return Object.assign({}, state, {
            title: action.title
        });
    case 'GET_USER_SUCCESS':
        return Object.assign({}, state, {
                users: Object.assign({}, state.users, {
                    [action.id]: action.user
                })
            });
    case 'SET_USER':
        return Object.assign({}, state, {
            currentUserId: action.id
        });
    default:
        return state
    }
}

const store = createStore(reducer);

/**
 * Creates an action with a specific title
 */
function getTitle () {
    console.log('GET TITLE');
    return {
        type: 'GET_TITLE_SUCCESS',
        title: 'Having fun with redux-fetchers'
    };
}

/**
 * Creates an action with a random user that uses the given id
 * @param id - the id of the user that will be created
 */
function getUser (id) {
    console.log('GET USER: ' + id);
    // to better illustrate what the fetchers do, we use random names
    // so it becomes more clear when this action is executed again
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * names.length)];
    const names = ['Tom', 'Robert', 'Alice', 'John'];
    const lastNames = ['Nick', 'Appleseed', 'Foo', 'Müller'];
    return {
        type: 'GET_USER_SUCCESS',
        id: id,
        user: {
            name: getRandomElement(names),
            lastName: getRandomElement(lastNames)
        }
    };
}

/**
 * @param id - the id of the user that we want to set
 */
function setUser (id) {
    console.log('SET USER' + id);
    return {
        type: 'SET_USER',
        id: id
    };
}

/**
 * Create a fetcher for the title
 * This fetcher will always be called only once, because:
 *  * After the execution there will be an entry in the cache of redux-fetcher.
 *  * This store-accessor does not take any additional arguments despite the state
 *
 * The only way that the wrapped action would be dispatched again, is to reset the cache AND reset the store.
 */
const getTitleFetcher = wrapActionForFetching(
    getTitle,              // first argument is the action we want to wrap
    (state) => state.title // second is an accessor function, which checks if the data is there
);

/**
 * Create a fetcher for the user
 * This fetcher will be called everytime the userId changes or when the cache and store are resetted
 */
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
            <h2>{'Hi User: '}<strong>{`${user.name} ${user.lastName}!`}</strong></h2>
        </div>
    );
}

const WrappedUserScreen = fetches(
    getTitleFetcher(),
    getUserFetcher(
        props => props.userId // the result of the function will be the argument of getUser
    )
)(connect(
    function (state, props) {
        return {
            title: state.title,
            user: state.users[props.userId] || {}
        }
    }
)(UserScreen));

class Application extends React.Component {
    constructor (props) {
        super(props);
        this.setUser = this.setUser.bind(this);
    }
    setUser (e) {
        e.preventDefault();
        const input = document.getElementById('user-input');
        this.props.setUser(input.value);
    }
    render () {
        const {
            state, userId
        } = this.props;
        return (
            <div>
                <p>
                    {`This is an example of how to use redux-fetchers,
                      for more information visit the repository page: `}
                    <br />
                    <a
                        href='https://github.com/LIQIDTechnology/redux-fetchers'
                    >{'https://github.com/LIQIDTechnology/redux-fetchers'}</a>
                </p>
                <WrappedUserScreen
                    userId={userId}
                />
                <hr />
                <h3>{'Change Current User:'}</h3>
                <button onClick={this.setUser}>{'Set User ID'}</button>
                <input type="text" name="input" id="user-input" />
                <h3>{'Store:'}</h3>
                <code>
                    {JSON.stringify(state)}
                </code>
                <h3>{'Fetcher Cache:'}</h3>
                <code>
                    {JSON.stringify(window.REDUX_FETCHER_CACHE)}
                </code>
            </div>
        );
    }
}

const WrappedApplication = connect(
    function (state) {
        return {
            userId: state.currentUserId,
            state: state
        };
    },
    function (dispatch) {
        return {
            setUser: (user) => dispatch(setUser(user))
        };
    }
)(Application);


/**
 * WrappedUserScreen asks for data of getTitle and getUser
 * getTitle will be dispatched, because state.title is undefined
 * getUser won't be executed because the data for the key 'someid' in state.users already exsists
 */
ReactDOM.render(
    <Provider
        store={store}
    >
        <WrappedApplication />
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
