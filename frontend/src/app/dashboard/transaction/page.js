"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentTransaction } from "@/store/actions/useTransaction";
import {
	CurrencyDollarIcon,
	InformationCircleIcon,
	SearchIcon,
} from "@heroicons/react/solid";
import Datepicker from "react-tailwindcss-datepicker";
import {
	Card,
	Grid,
	Col,
	Title,
	Text,
	Tab,
	TabList,
	TabGroup,
	TabPanel,
	TabPanels,
	BadgeDelta,
	DeltaType,
	Flex,
	Metric,
	ProgressBar,
	AreaChart,
	Color,
	Icon,
	MultiSelect,
	MultiSelectItem,
	Select,
	SelectItem,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
	Button,
	Badge,
	DateRangePicker,
	DateRangePickerItem,
	DatePicker,
	TextInput,
	NumberInput,
} from "@tremor/react";
import { dateFormat, handleError, isEmpty } from "@/utils/util";
import { es } from "date-fns/locale";
import { getAllCategories } from "@/store/actions/usePlaid";
import SearchInput from "@/components/Basic/SearchInput";
import Pagination from "@/components/Basic/Pagination";

export default function Dashboard() {
	const dispatch = useDispatch();
	const {
		isItemAccess,
		isTransactionsLoaded,
		transactionsInfo,
		categories,
		accounts,
	} = useSelector((state) => state.plaid);
	const { data: transactions, size: total } = useSelector(
		(state) => state.transactions
	);
	const { user, items } = useSelector((state) => state.user);
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [selectedAccounts, setSelectedAccounts] = useState([]);
	const [selectedPaymentChannel, setSelectedPaymentChannel] = useState("all");
	const [merchantName, setMerchantName] = useState("");
	const [filterDate, setFilterDate] = useState({
		startDate: dateFormat(
			new Date(new Date().getFullYear(), new Date().getMonth(), 1)
		),
		endDate: dateFormat(new Date()),
	});
	
	const [priceRange, setPriceRange] = useState({
		minPrice: "",
		maxPrice: "",
	});
	const [pageSize, setPageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);

	const fetchData = useCallback(() => {
		try {
			dispatch(
				getPaymentTransaction({
					filter: {
						selectedCategories,
						selectedAccounts,
						selectedPaymentChannel,
						filterDate,
						pageSize,
						currentPage,
						priceRange,
						merchantName,
					},
				})
			);
		} catch (err) {
			handleError(err);
		}
	}, [
		dispatch,
		selectedCategories,
		selectedAccounts,
		selectedPaymentChannel,
		filterDate,
		pageSize,
		currentPage,
		priceRange,
		merchantName,
	]);

	useEffect(() => {
		fetchData();
		console.log("fetched transaction");
	}, [
		dispatch,
		selectedCategories,
		selectedAccounts,
		selectedPaymentChannel,
		filterDate,
		pageSize,
		currentPage,
	]);

	useEffect(() => {
		if (isEmpty(categories)) dispatch(getAllCategories());
		if (isItemAccess && isTransactionsLoaded && !isEmpty(transactionsInfo))
			fetchData();
	}, [isItemAccess, isTransactionsLoaded, dispatch, getAllCategories]);

	return (
		<main className="min-h-screen">
			<Text className="mt-6">
				A bird's eye view of your financial positions.
			</Text>
			<Card className="mt-6">
				<>
					<div>
						<Flex
							className="space-x-0.5"
							justifyContent="start"
							alignItems="center"
						>
							<Title> Transaction History ({total}) </Title>
							<Icon
								icon={InformationCircleIcon}
								variant="simple"
								tooltip="Shows Transactions"
							/>
						</Flex>
					</div>
					<div className="flex space-x-2">
						<MultiSelect
							className="max-w-full sm:max-w-xs"
							onValueChange={setSelectedCategories}
							placeholder="Select Category..."
						>
							{categories?.map((item) => (
								<MultiSelectItem
									key={item.category_id}
									value={item.hierarchy[item.hierarchy.length - 1]}
								>
									{item.hierarchy[item.hierarchy.length - 1]}
								</MultiSelectItem>
							))}
						</MultiSelect>
						<SearchInput
							className="flex-1"
							placeholder="Merchant Name..."
							value={merchantName}
							onChange={(e) => setMerchantName(e.target.value)}
							onSearch={fetchData}
						/>
						<Select
							className="flex-1"
							defaultValue="all"
							onValueChange={setSelectedPaymentChannel}
						>
							<SelectItem value="all">
								All Payment Channel
							</SelectItem>
							<SelectItem value="online">
								Online Channel
							</SelectItem>
							<SelectItem value="in store">
								In Store Channel
							</SelectItem>
							<SelectItem value="other">Other Channel</SelectItem>
						</Select>

						<Datepicker
							containerClassName="relative flex-2 text-gray-700 min-w-[15rem]"
							inputClassName="w-full text-sm outline-none text-left whitespace-nowrap truncate rounded-tremor-default focus:ring-2 transition duration-100 shadow-tremor-input focus:border-tremor-brand-subtle focus:ring-tremor-brand-muted dark:shadow-dark-tremor-input dark:focus:border-dark-tremor-brand-subtle dark:focus:ring-dark-tremor-brand-muted pl-3 pr-8 py-2 border bg-tremor-background dark:bg-dark-tremor-background hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis border-tremor-border dark:border-dark-tremor-border"
							useRange={false}
							showShortcuts={true}
							value={filterDate}
							onChange={setFilterDate}
						/>
					</div>
					<div className="flex items-center mt-2">
						<MultiSelect
							className="max-w-full mr-2 sm:max-w-xs"
							onValueChange={setSelectedAccounts}
							placeholder="Select Accounts..."
						>
							{items?.map((item) => {
								return item?.accounts?.map((account) => (
									<MultiSelectItem
										key={account.account_id}
										value={account.account_id}
									>
										{account.name}
									</MultiSelectItem>
								));
							})}
						</MultiSelect>
						<div className="flex w-full">
							<NumberInput
								className="w-[5rem] mr-2"
								enableStepper={false}
								placeholder="Min Price"
								value={priceRange?.minPrice}
								onChange={(e) =>
									setPriceRange({
										...priceRange,
										minPrice: e.target.value,
									})
								}
								onSubmit={fetchData}
							/>
							<NumberInput
								className="w-[5rem]"
								enableStepper={false}
								placeholder="Max Price"
								value={priceRange?.maxPrice}
								onChange={(e) =>
									setPriceRange({
										...priceRange,
										maxPrice: e.target.value,
									})
								}
								onSubmit={fetchData}
							/>
						</div>
						<Pagination
							total={total}
							pageSize={pageSize}
							setPageSize={setPageSize}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					</div>
					<Table className="mt-6">
						<TableHead>
							<TableRow>
								<TableHeaderCell>Name</TableHeaderCell>
								<TableHeaderCell className="text-right">
									Amount
								</TableHeaderCell>
								<TableHeaderCell className="text-right">
									Merchant Name
								</TableHeaderCell>
								<TableHeaderCell className="text-right">
									Type
								</TableHeaderCell>
								<TableHeaderCell className="text-right">
									Payment Channel
								</TableHeaderCell>
								<TableHeaderCell className="text-right">
									Date
								</TableHeaderCell>
								<TableHeaderCell className="text-right">
									Category
								</TableHeaderCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{transactions.map((item) => (
								<TableRow key={item.transaction_id}>
									<TableCell>{item.name}</TableCell>
									<TableCell className="text-right">
										{item.amount} ({item.iso_currency_code})
									</TableCell>
									<TableCell className="text-right">
										{item.merchant_name}
									</TableCell>
									<TableCell className="text-right">
										<Badge size="sm">
											{item.transaction_type}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										{item.payment_channel}
									</TableCell>
									<TableCell className="text-right">
										{dateFormat(item.date)}
									</TableCell>
									<TableCell className="flex flex-wrap max-w-[12rem] justify-end">
										{item.category?.map((categoryItem) => (
											<span
												className="text-xs"
												key={categoryItem}
											>
												{`${categoryItem}, `}
											</span>
										))}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</>
			</Card>
		</main>
	);
}
