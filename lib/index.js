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
            return React.createElement(WrappedComponent, props, props.children);
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
            if (!state || (!storeValueFn.apply(void 0, [state].concat(vars)) && !exports.cache.has(requestId))) {
                exports.cache.set(requestId, true);
                return dispatch(action.apply(void 0, vars));
            }
        };
        return fetcher;
    };
}
exports.wrapActionForFetching = wrapActionForFetching;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsMkNBQXNDO0FBQ3RDLDZCQUErQjtBQWMvQixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFFdEIsTUFBTSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQUVoQztJQUNJLGFBQWEsRUFBRSxDQUFDO0lBQ2hCLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDekIsQ0FBQztBQUVELGFBQWMsRUFBcUI7SUFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVELGFBQWMsRUFBcUIsRUFBRSxLQUFVO0lBQzNDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDM0MsQ0FBQztBQUVEOzs7R0FHRztBQUNIO0lBQ0ksTUFBTSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztJQUNoQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLENBQUM7QUFFWSxRQUFBLEtBQUssR0FBRztJQUNqQixLQUFLLE9BQUE7SUFDTCxHQUFHLEtBQUE7SUFDSCxHQUFHLEtBQUE7SUFDSCxTQUFTLFdBQUE7Q0FDWixDQUFDO0FBYUY7Ozs7O0dBS0c7QUFDSDtJQUF5QixrQkFBc0I7U0FBdEIsVUFBc0IsRUFBdEIscUJBQXNCLEVBQXRCLElBQXNCO1FBQXRCLDZCQUFzQjs7SUFDM0MsSUFBTSxTQUFTLEdBQUcsVUFBYSxnQkFBbUM7UUFDOUQsTUFBTSxDQUFDLHFCQUFPLENBQ1YsVUFBVSxLQUFLO1lBQ1gsTUFBTSxDQUFDO2dCQUNILFdBQVcsRUFBRSxLQUFLO2FBQ3JCLENBQUM7UUFDTixDQUFDLEVBQ0QsVUFBVSxRQUFRO1lBQ2QsTUFBTSxDQUFDO2dCQUNILGNBQWMsRUFBRSxRQUFRO2FBQzNCLENBQUM7UUFDTixDQUFDLENBQ0osQ0FBQyw2QkFBOEIsS0FBeUM7WUFDckUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87Z0JBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUQsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxnQkFBcUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdGLENBQUMsQ0FBc0IsQ0FBQztJQUM1QixDQUFDLENBQUM7SUFDRixNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFyQkQsMEJBcUJDO0FBSUQ7Ozs7OztHQU1HO0FBQ0gsK0JBQ0ksTUFBZ0MsRUFDaEMsWUFBaUQ7SUFDakQsSUFBSSxFQUFFLEdBQUcsYUFBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzNCLG9EQUFvRDtJQUNwRCxNQUFNLENBQUM7UUFBVSxrQkFBc0I7YUFBdEIsVUFBc0IsRUFBdEIscUJBQXNCLEVBQXRCLElBQXNCO1lBQXRCLDZCQUFzQjs7UUFDbkMsaUNBQWlDO1FBQ2pDLElBQU0sT0FBTyxHQUFhLFVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLO1lBQzdDLElBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7WUFDbEQsSUFBTSxTQUFTLEdBQUcsUUFBTSxFQUFFLFNBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUcsQ0FBQztZQUMvQywyRkFBMkY7WUFDM0YsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLFlBQVksZ0JBQUMsS0FBSyxTQUFLLElBQUksRUFBQyxJQUFJLENBQUMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxlQUFJLElBQUksRUFBRSxDQUFDO1lBQ3JDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFDRixNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUMsQ0FBQztBQUNOLENBQUM7QUFsQkQsc0RBa0JDIn0=