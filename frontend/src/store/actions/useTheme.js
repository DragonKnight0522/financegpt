import { SET_THEME_MODE } from "../constants/themeConstants";

export const toggleTheme = (dispatch) => {
	dispatch({
		type: SET_THEME_MODE,
	});
};
