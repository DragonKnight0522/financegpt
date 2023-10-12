import { SET_THEME_MODE } from "../constants/themeConstants";

const initialState = {
	theme: "light",
};

export const themeReducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case SET_THEME_MODE:
			return {
				...state,
				theme: state.theme === "light" ? "dark" : "light",
			};
		default:
			return state;
	}
};
