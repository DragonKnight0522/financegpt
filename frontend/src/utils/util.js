import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export const isEmpty = (value) =>
	value === undefined ||
	value === null ||
	(typeof value === "object" && Object.keys(value).length === 0) ||
	(typeof value === "string" && value.trim().length === 0);

export const handleError = (err) => {
	if (err.response) {
		if (err.response.status === 401) {
			signOut();
		} else if (err.response.status == 403) {
			toast.error(err.response.data.message || err.response.data);
		}
	} else {
		toast.error(err.message);
	}
};

export const dateFormat = (value) => {
	const date = new Date(value);
	const formattedDate =
		date.getFullYear() +
		"-" +
		("0" + (date.getMonth() + 1)).slice(-2) +
		"-" +
		("0" + date.getDate()).slice(-2);
	return formattedDate;
};
