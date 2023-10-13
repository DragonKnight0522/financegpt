import React from "react";
// import { Checkbox } from "@heroicons/react/solid";

const Checkbox = ({
	label,
	name,
	checked,
	handleChange,
	disabled,
	className,
}) => {
	return (
		<label
			onChange={handleChange}
			onClick={handleChange}
			id={name}
			name={name}
			className={`${
				className === undefined ? "" : className
			} flex cursor-pointer items-center`}
		>
			<input
				type="checkbox"
				className="h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
			/>
			<span className="ml-2 text-lg font-bold">{label}</span>
		</label>
	);
};

export default Checkbox;
