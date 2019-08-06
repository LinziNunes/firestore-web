import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { apiMiddleware } from 'redux-api-middleware';
import api from 'redux-cached-api-middleware';
import { composeWithDevTools } from 'redux-devtools-extension';

export const store = createStore(
  combineReducers({
    [api.constants.NAME]: api.reducer,
  }),
  composeWithDevTools(applyMiddleware(thunk, apiMiddleware))
);