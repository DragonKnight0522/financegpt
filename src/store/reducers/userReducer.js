"use client";
import {
	DELETE_ITEM_BY_ID,
	SET_USER_INFO,
	UPDATE_USER_INFO,
	SET_DASHBOARD_DATA,
} from "../constants/userConstants";

const initialState = {
	user: {},
	items: [],
	kpis: [],
	chartData: [],
};

export const userReducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case SET_USER_INFO:
			return { ...state, ...payload };
		case DELETE_ITEM_BY_ID:
			const newItems = state.items.filter(
				(item) => payload !== item._id
			);
			return { ...state, items: newItems };
		case UPDATE_USER_INFO:
			return { ...state, user: { ...state.user, ...payload } };
		case SET_DASHBOARD_DATA:
			return { ...state, ...payload };
		default:
			return { ...state };
	}
};
