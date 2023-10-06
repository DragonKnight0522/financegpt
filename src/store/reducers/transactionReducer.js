"use client";
import {
	SET_TRANSACTION
} from "../constants/transactionConstants";

const initialState = {
	data: [],
};

export const transactionReducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case SET_TRANSACTION:
			return { ...state, ...payload };
		default:
			return { ...state };
	}
};
