import { signOut } from "next-auth/react";

export const isEmpty = (value) =>
	value === undefined ||
	value === null ||
	(typeof value === "object" && Object.keys(value).length === 0) ||
	(typeof value === "string" && value.trim().length === 0);

export const handleError = (err) => {
	signOut();
	console.error(err);
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
