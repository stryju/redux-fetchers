import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import {
    wrapActionForFetching,
    fetches
} from '../index';

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
    case 'SET_USER':
        return Object.assign({}, state, {
            currentUserId: action.id
        });
    default:
        return state
    }
}

const store = createStore(reducer);

function getTitle () {
    console.log('GET TITLE');
    return {
        type: 'GET_TITLE',
        title: 'Having fun with redux-fetchers'
    };
}

function getUser (id) {
    console.log('GET USER: ' + id);
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * names.length)];
    const names = ['Tom', 'Robert', 'Alice', 'John'];
    const lastNames = ['Nick', 'Appleseed', 'Foo', 'Müller'];
    return {
        type: 'GET_USER',
        id: id,
        user: {
            name: getRandomElement(names),
            lastName: getRandomElement(lastNames)
        }
    };
}

function setUser (id) {
    console.log('SET USER ' + id);
    return {
        type: 'SET_USER',
        id: id
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
    function (state, props : {userId: string}) {
        return {
            title: state.title,
            user: state.users[props.userId] || {}
        }
    }
)(UserScreen));

class Application extends React.Component<{
    state: any,
    userId: string,
    setUser: (id) => any
}, {}> {
    constructor (props) {
        super(props);
        this.setUser = this.setUser.bind(this);
    }
    setUser (e) {
        e.preventDefault();
        const input = document.getElementById('user-input') as HTMLInputElement;
        this.props.setUser(input.value);
    }
    render () {
        const {
            state, userId
        } = this.props;
        return (
            <div>
                <p>
                    {`This is an example of how to use redux-fetchers, for more information visit the repository page: `}
                    <br />
                    <a href='https://github.com/LIQIDTechnology/redux-fetchers'>{'https://github.com/LIQIDTechnology/redux-fetchers'}</a>
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

// WrappedUserScreen asks for data of getTitle and getUser
// getTitle will be dispatched, because state.dataFromAction is undefined
// getUser won't be executed because the data for the key 'someid' already exsists
ReactDOM.render(
    <Provider
        store={store}
    >
        <WrappedApplication />
    </Provider>,
    document.getElementById('root')
);
