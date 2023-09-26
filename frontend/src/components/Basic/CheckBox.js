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
			} flex items-center cursor-pointer`}
		>
			<input
				type="checkbox"
				className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
			/>
			<span className="ml-2 text-lg font-bold">{label}</span>
		</label>
	);
};

export default Checkbox;
