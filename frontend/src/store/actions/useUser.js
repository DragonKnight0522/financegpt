import apiCall from "@/utils/apiCall";
import {
    SET_USER_INFO,
    DELETE_ITEM_BY_ID,
    UPDATE_USER_INFO,
    SET_DASHBOARD_DATA
} from "../constants/userConstants";
import { handleError, isEmpty } from "@/utils/util";
import { toast } from "react-hot-toast";
import { setPlaidState } from "./usePlaid";
import { allTransactionSync } from "@/store/actions/useTransaction";

export const getUserInfo = data => async dispatch => {
    const res = await apiCall.get("/api/v1/user", data);

    if (!isEmpty(res.data.items) && res.data.isPro)
        dispatch(allTransactionSync());

    dispatch(setUserInfoState(res.data));
};

export const setUserInfoState = payload => {
    return {
        type: SET_USER_INFO,
        payload
    };
};

export const deleteItemInfoById = item_id => async dispatch => {
    try {
        await apiCall.delete(`/api/v1/user/item/${item_id}`);
        dispatch({
            type: DELETE_ITEM_BY_ID,
            payload: item_id
        });
        toast.success("Account deleted successfully");
    } catch (err) {
        handleError(err);
    }
};

export const updateUserInfo = userInfo => async dispatch => {
    try {
        await apiCall.post("/api/v1/user", { userInfo });
        dispatch({
            type: UPDATE_USER_INFO,
            payload: userInfo
        });
        toast.success("success!");
    } catch (err) {
        handleError(err);
    }
};

export const getDashboardData = () => async dispatch => {
    try {
        const res = await apiCall.get("/api/v1/user/dashboard");
        dispatch({
            type: SET_DASHBOARD_DATA,
            payload: res.data
        });
    } catch (err) {
        handleError(err);
    }
};

export const getChartsData = data => async dispatch => {
    try {
        const res = await apiCall.post("/api/v1/user/charts", data);
        dispatch({
            type: SET_DASHBOARD_DATA,
            payload: res.data
        });
    } catch (err) {
        handleError(err);
    }
};
