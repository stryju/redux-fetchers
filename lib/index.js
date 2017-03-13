"use strict";
var react_redux_1 = require("react-redux");
var React = require("react");
var actionCounter = 0;
window.REDUX_FETCHER_CACHE = {};
function increment() {
    actionCounter++;
    return actionCounter;
}
function has(id) {
    return !!window.REDUX_FETCHER_CACHE[id];
}
function set(id, value) {
    window.REDUX_FETCHER_CACHE[id] = value;
}
/**
 * Resetting the cache should be done normally when the user logs out,
 * just everytime the wrapped actions would yield a different result than before.
 */
function reset() {
    window.REDUX_FETCHER_CACHE = {};
    actionCounter = 0;
}
exports.cache = {
    reset: reset,
    set: set,
    has: has,
    increment: increment
};
/**
 * This method is will take wrapped actions as parameters and returns
 * a function that will wrap a React component.
 *
 * @param fetchers - Wrapped actions that should be executed when needed
 */
function fetches() {
    var fetchers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fetchers[_i] = arguments[_i];
    }
    var decorator = function (WrappedComponent) {
        return react_redux_1.connect(function (state) {
            return {
                _reduxState: state
            };
        }, function (dispatch) {
            return {
                _reduxDispatch: dispatch
            };
        })(function NewWrappedComponent(props) {
            fetchers.forEach(function (fetcher) {
                fetcher(props._reduxState, props._reduxDispatch, props);
            });
            return React.createElement(WrappedComponent, props, null);
        });
    };
    return decorator;
}
exports.fetches = fetches;
/**
 * Takes an action and a store accessor function and creates a fetcher:
 * A actions that will automatically 'now' when it needs to be fetched/refetched
 *
 * @param action - The action to be wrapped
 * @param storeValueFn - The function to determine if the action needs to be fetched
 */
function wrapActionForFetching(action, storeValueFn) {
    var id = exports.cache.increment();
    // the custom store accessors used in the components
    return function () {
        var stateFns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stateFns[_i] = arguments[_i];
        }
        // this will be called by fetches
        var fetcher = function (state, dispatch, props) {
            var vars = stateFns.map(function (fn) { return fn(props, state); });
            var requestId = "id-" + id + "-" + vars.join('-');
            // it's dangerous to not give a state, should only be done, if the function is called once!
            if (!state || (storeValueFn.apply(void 0, [state].concat(vars)) === undefined && !exports.cache.has(requestId))) {
                exports.cache.set(requestId, true);
                return dispatch(action.apply(void 0, vars));
            }
        };
        return fetcher;
    };
}
exports.wrapActionForFetching = wrapActionForFetching;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsMkNBQXNDO0FBQ3RDLDZCQUErQjtBQWMvQixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFFdEIsTUFBTSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQUVoQztJQUNJLGFBQWEsRUFBRSxDQUFDO0lBQ2hCLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDekIsQ0FBQztBQUVELGFBQWMsRUFBcUI7SUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVELGFBQWMsRUFBcUIsRUFBRSxLQUFVO0lBQzNDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDM0MsQ0FBQztBQUVEOzs7R0FHRztBQUNIO0lBQ0ksTUFBTSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztJQUNoQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFFWSxRQUFBLEtBQUssR0FBRztJQUNqQixLQUFLLE9BQUE7SUFDTCxHQUFHLEtBQUE7SUFDSCxHQUFHLEtBQUE7SUFDSCxTQUFTLFdBQUE7Q0FDWixDQUFDO0FBYUY7Ozs7O0dBS0c7QUFDSDtJQUF5QixrQkFBc0I7U0FBdEIsVUFBc0IsRUFBdEIscUJBQXNCLEVBQXRCLElBQXNCO1FBQXRCLDZCQUFzQjs7SUFDM0MsSUFBTSxTQUFTLEdBQUcsVUFBYSxnQkFBbUM7UUFDOUQsTUFBTSxDQUFDLHFCQUFPLENBQ1YsVUFBVSxLQUFLO1lBQ1gsTUFBTSxDQUFDO2dCQUNILFdBQVcsRUFBRSxLQUFLO2FBQ3JCLENBQUM7UUFDTixDQUFDLEVBQ0QsVUFBVSxRQUFRO1lBQ2QsTUFBTSxDQUFDO2dCQUNILGNBQWMsRUFBRSxRQUFRO2FBQzNCLENBQUM7UUFDTixDQUFDLENBQ0osQ0FBQyw2QkFBOEIsS0FBd0I7WUFDcEQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87Z0JBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUQsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxnQkFBcUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkYsQ0FBQyxDQUFzQixDQUFDO0lBQzVCLENBQUMsQ0FBQztJQUNGLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDckIsQ0FBQztBQXJCRCwwQkFxQkM7QUFJRDs7Ozs7O0dBTUc7QUFDSCwrQkFDSSxNQUFnQyxFQUNoQyxZQUFpRDtJQUNqRCxJQUFJLEVBQUUsR0FBRyxhQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDM0Isb0RBQW9EO0lBQ3BELE1BQU0sQ0FBQztRQUFVLGtCQUFzQjthQUF0QixVQUFzQixFQUF0QixxQkFBc0IsRUFBdEIsSUFBc0I7WUFBdEIsNkJBQXNCOztRQUNuQyxpQ0FBaUM7UUFDakMsSUFBTSxPQUFPLEdBQWEsVUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUs7WUFDN0MsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztZQUNsRCxJQUFNLFNBQVMsR0FBRyxRQUFNLEVBQUUsU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDO1lBQy9DLDJGQUEyRjtZQUMzRixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksZ0JBQUMsS0FBSyxTQUFLLElBQUksT0FBTSxTQUFTLElBQUksQ0FBQyxhQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRixhQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLGVBQUksSUFBSSxFQUFFLENBQUM7WUFDckMsQ0FBQztRQUNMLENBQUMsQ0FBQztRQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQWxCRCxzREFrQkMifQ==