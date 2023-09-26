import apiCall from "@/utils/apiCall";
import {
	SET_PLAID_AUTH_STATE,
	SET_PLAID_BALANCE_STATE,
	SET_PLAID_HOLDING_STATE,
	SET_PLAID_IDENTITY_STATE,
	SET_PLAID_INVEST_TRANSACTIONS_STATE,
	SET_PLAID_LIABILITIES_STATE,
	SET_PLAID_PAYMENT_STATE,
	SET_PLAID_STATE,
	SET_PLAID_TRANSACTIONS_STATE,
	SET_PLAID_TRANSFER_STATE,
	SET_PLAID_ACCOUNTS_STATE,
	SET_PLAID_CATEGORY_STATE,
} from "../constants/plaidConstants";
import { handleError } from "@/utils/util";

export const setPlaidState = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_STATE,
		payload,
	});
};

// set information about your latest payment.
export const setPaymentState = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_PAYMENT_STATE,
		payload,
	});
};

export const setAuth = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_AUTH_STATE,
		payload,
	});
};

export const setTransactions = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_TRANSACTIONS_STATE,
		payload,
	});
};

export const setIdentity = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_IDENTITY_STATE,
		payload,
	});
};

export const setAssets = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_ASSETS_STATE,
		payload,
	});
};

export const setBalance = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_BALANCE_STATE,
		payload,
	});
};

export const setHoldings = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_HOLDING_STATE,
		payload,
	});
};

export const setInvestTransactions = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_INVEST_TRANSACTIONS_STATE,
		payload,
	});
};

export const setLiabilities = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_LIABILITIES_STATE,
		payload,
	});
};

export const setTransfer = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_TRANSFER_STATE,
		payload,
	});
};

export const setAccounts = (payload) => (dispatch) => {
	dispatch({
		type: SET_PLAID_ACCOUNTS_STATE,
		payload,
	});
};

export const getAllCategories = () => async (dispatch) => {
	try {
		const res = await apiCall.get("/api/v1/plaid/categories");
		dispatch({ type: SET_PLAID_CATEGORY_STATE, payload: res.data });
	} catch (error) {
		handleError(error);
	}
};
