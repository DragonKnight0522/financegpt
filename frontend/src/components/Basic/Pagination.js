import { Metric, Select, SelectItem } from "@tremor/react";
import { useState } from "react";

const Pagination = ({
	total = 100,
	pageSize = 10,
	setPageSize = () => console.log("setPageSize"),
	currentPage = 1,
	setCurrentPage = () => console.log("setCurrentPage"),
}) => {
	const totalPages = Math.ceil(total / pageSize);
	let startPage = Math.max(currentPage - 2, 1);
	let endPage = Math.min(startPage + 4, totalPages);
	if (endPage - startPage < 4) {
		startPage = Math.max(endPage - 4, 1);
	}
	const pages = [...Array(endPage + 1 - startPage).keys()].map(
		(i) => startPage + i
	);

	return (
		<div className="ml-0 mt-2 flex items-center justify-between md:ml-2 md:mt-0">
			<div>
				<Select
					className="min-w-[5rem] text-center"
					value={pageSize}
					onValueChange={setPageSize}
				>
					<SelectItem value={10}>10</SelectItem>
					<SelectItem value={20}>20</SelectItem>
					<SelectItem value={50}>50</SelectItem>
					<SelectItem value={100}>100</SelectItem>
				</Select>
			</div>
			<div className="ml-2 flex">
				<button
					className="cursor-pointer whitespace-nowrap rounded-l bg-blue-600 px-3 py-1 font-bold text-white hover:bg-blue-600 focus:outline-none"
					disabled={currentPage === 1}
					onClick={() => setCurrentPage(currentPage - 1)}
				>
					&larr;
				</button>
				{startPage > 2 && (
					<>
						<button
							className="mx-1 cursor-pointer rounded-sm border border-blue-600 px-3 py-1 font-bold text-blue-600 hover:bg-blue-600 hover:text-white focus:outline-none"
							onClick={() => setCurrentPage(1)}
						>
							1
						</button>
						<div className="px-3 py-1">...</div>
					</>
				)}
				{pages.map((number) => (
					<button
						key={number}
						className={`mx-1 px-3 py-1 font-bold ${
							number === currentPage
								? "bg-blue-600 text-white"
								: "text-blue-600"
						}  cursor-pointer rounded-sm border border-blue-600 hover:bg-blue-600 hover:text-white focus:outline-none`}
						onClick={() => setCurrentPage(number)}
					>
						{number}
					</button>
				))}
				{endPage < totalPages - 2 && (
					<>
						<div className="px-3 py-1">...</div>
						<button
							className="mx-1 cursor-pointer rounded-sm border border-blue-600 px-3 py-1 font-bold text-blue-600 hover:bg-blue-600 hover:text-white focus:outline-none"
							onClick={() => setCurrentPage(totalPages)}
						>
							{totalPages}
						</button>
					</>
				)}
				<button
					className="cursor-pointer whitespace-nowrap rounded-r bg-blue-600 px-3 py-1 font-bold text-white hover:bg-blue-600 focus:outline-none"
					disabled={currentPage === totalPages}
					onClick={() => setCurrentPage(currentPage + 1)}
				>
					&rarr;
				</button>
			</div>
		</div>
	);
};

export default Pagination;
