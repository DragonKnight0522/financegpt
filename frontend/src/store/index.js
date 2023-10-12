import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";

import { themeReducer } from "./reducers/themeReducer";
import { plaidReducer } from "./reducers/plaidReducer";
import { transactionReducer } from "./reducers/transactionReducer";
import { userReducer } from "./reducers/userReducer";

const reducer = combineReducers({
	theme: themeReducer,
	plaid: plaidReducer,
	transactions: transactionReducer,
	user: userReducer,
});

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));

export default store;
