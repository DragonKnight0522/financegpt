import apiCall from "@/utils/apiCall";
import { SET_TRANSACTION } from "../constants/transactionConstants";

export const getPaymentTransaction = (data) => async (dispatch) => {
	const res = await apiCall.post("/api/v1/transaction/getData", data);
	dispatch({
		type: SET_TRANSACTION,
		payload: res.data,
	});
};
