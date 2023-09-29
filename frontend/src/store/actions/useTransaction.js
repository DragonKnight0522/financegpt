import apiCall from "@/utils/apiCall";
import { SET_TRANSACTION } from "../constants/transactionConstants";
import { handleError } from "@/utils/util";

export const getPaymentTransaction = (data) => async (dispatch) => {
	try {
		const res = await apiCall.post("/api/v1/transaction/getData", data);
		dispatch({
			type: SET_TRANSACTION,
			payload: res.data,
		});
	} catch (err) {
		handleError(err);
	}
};
