import * as React from 'react';
import {
    wrapActionForFetching,
    fetches
} from '../index';
import { createStore } from 'redux';

const initialState = {
    dataFromMockAction4: true
};

function reducer (state = initialState, action) {
    switch (action.type) {
    case 'MOCK_ACTION':
        return Object.assign({}, state, {
            dataFromMockAction: action.data
        });
    default:
        return state
    }
}

const store = createStore(reducer);

const mockAction = jest.fn().mockImplementation(() => {
    return {
        type: 'MOCK_ACTION',
        data: new Date()
    };
})

const mockAction2 = jest.fn().mockImplementation(() => {
    return {
        type: 'MOCK_ACTION_2',
        data: new Date()
    };
});

const mockAction3 = jest.fn().mockImplementation(() => {
    return {
        type: 'MOCK_ACTION_3',
        data: new Date()
    };
});

const mockAction4 = jest.fn().mockImplementation(() => {
    return {
        type: 'MOCK_ACTION_4',
        data: new Date()
    };
});

class MyComponent extends React.Component<{}, {}> {
    render () {
        return <h1>{'Test'}</h1>;
    }
}

function MyStatelessComponent () {
    return <h1>{'Test Stateless'}</h1>;
}

describe('wrapActionForFetching', () => {
    const wrappedAction = wrapActionForFetching(
        mockAction,
        state => state.dataFromMockAction
    );

    const wrappedAction2 = wrapActionForFetching(
        mockAction2,
        () => undefined
    );

    const wrappedAction3 = wrapActionForFetching(
        mockAction3,
        () => undefined
    );

    const wrappedAction4 = wrapActionForFetching(
        mockAction4,
        state => state.dataFromMockAction4
    )

    it('wraps an action', () => {
        expect(typeof wrappedAction).toBe('function');
    });

    it('calls the action only once, because it the action will write into the store', () => {
        wrappedAction()(store.getState(), store.dispatch, {});
        expect(mockAction).toBeCalled();
        wrappedAction()(store.getState(), store.dispatch, {});
        wrappedAction()(store.getState(), store.dispatch, {});
        wrappedAction()(store.getState(), store.dispatch, {});
        expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('calls the action only once, because it does not depend on any props', () => {
        wrappedAction2()(store.getState(), store.dispatch, {});
        expect(mockAction).toBeCalled();
        wrappedAction2()(store.getState(), store.dispatch, {});
        wrappedAction2()(store.getState(), store.dispatch, {});
        wrappedAction2()(store.getState(), store.dispatch, {});
        expect(mockAction2).toHaveBeenCalledTimes(1);
    });

    it('calls the action only every time the data changes, because it depends on changing props and does not write to the store', () => {
        wrappedAction3(p => p.data)(store.getState(), store.dispatch, {data: 1});
        expect(mockAction).toBeCalled();
        wrappedAction3(p => p.data)(store.getState(), store.dispatch, {data: 2});
        wrappedAction3(p => p.data)(store.getState(), store.dispatch, {data: 3});
        wrappedAction3(p => p.data)(store.getState(), store.dispatch, {data: 4});
        wrappedAction3(p => p.data)(store.getState(), store.dispatch, {data: 4});
        expect(mockAction3).toHaveBeenCalledTimes(4);
    });

    it('does not call the action, because the data in the store', () => {
        wrappedAction4(p => p.data)(store.getState(), store.dispatch, {data: 1});
        wrappedAction4(p => p.data)(store.getState(), store.dispatch, {data: 2});
        wrappedAction4(p => p.data)(store.getState(), store.dispatch, {data: 3});
        wrappedAction4(p => p.data)(store.getState(), store.dispatch, {data: 4});
        wrappedAction4(p => p.data)(store.getState(), store.dispatch, {data: 4});
        expect(mockAction4).toHaveBeenCalledTimes(0);
    });

});

describe('fetches', () => {

    it('wraps a React.Component and returns a component', () => {
        const wrappedComponent = fetches()(MyComponent);
        expect(typeof wrappedComponent).toBe('function');
    });

    it('wraps a stateless component without a type and returns a component', () => {
        const wrappedComponent = fetches()(MyStatelessComponent);
        expect(typeof wrappedComponent).toBe('function');
    });

});
