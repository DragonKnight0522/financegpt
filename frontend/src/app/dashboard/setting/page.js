"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	getUserInfo,
	deleteItemInfoById,
	updateUserInfo,
} from "@/store/actions/useUser";
import {
	CurrencyDollarIcon,
	InformationCircleIcon,
	TrashIcon,
	CalendarIcon,
} from "@heroicons/react/solid";
import { countries } from "countries-list";

import {
	Card,
	Grid,
	Title,
	Text,
	Flex,
	Metric,
	Icon,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
	Button,
	TextInput,
	SearchSelect,
	SearchSelectItem,
	NumberInput,
} from "@tremor/react";
import { handleError, isEmpty } from "@/utils/util";
import Modal from "@/components/Basic/Modal";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import apiCall from "@/utils/apiCall";
import useGetAccounts from "@/hooks/useGetAccounts";

export default function Setting() {
	const dispatch = useDispatch();
	const { user, items } = useSelector((state) => state.user);
	const [userInfo, setUserInfo] = useState({});
	const [showModal, setShowModal] = useState(false);
	const router = useRouter();

	useGetAccounts();

	const fetchData = useCallback(() => {
		dispatch(getUserInfo());
	}, [dispatch]);

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		setUserInfo(user);
	}, [user]);

	const handleDelete = (item_id) => {
		dispatch(deleteItemInfoById(item_id));
	};

	const setSalary = (salary) => {
		if (!isEmpty(salary) && parseInt(salary) > 0)
			setUserInfo({ ...userInfo, salary: String(salary) });
	};

	const setSalaryDate = (payday) => {
		const temp = parseInt(payday);
		if (!isEmpty(payday) && temp > 0 && temp < 32)
			setUserInfo({ ...userInfo, date: String(temp) });
	};

	const handleDeleteAccount = () => {
		apiCall.delete("/api/v1/user").then((res) => {
			signOut();
		});
	};

	const handleUpdatePro = () => {
		toast.success("coming soon!");
	};

	const handleUpdateUserInfo = () => {
		dispatch(updateUserInfo(userInfo));
	};

	return (
		<main className="m-auto min-h-screen max-w-7xl p-4">
			<Text className="mt-6">
				{"A bird's eye view of your financial positions."}
			</Text>
			<Grid numItemsLg={2} className="mt-6 gap-6">
				<Card>
					<Metric className="truncate">User Info</Metric>
					<Flex className="mt-4 space-x-2">
						<Text className="w-1/3 truncate">Display Name</Text>
						<TextInput
							placeholder="User Name"
							value={userInfo?.name ?? ""}
							onChange={(e) =>
								setUserInfo({
									...userInfo,
									name: e.target.value,
								})
							}
						/>
					</Flex>
					<Flex className="mt-4 space-x-2">
						<Text className="w-1/3 truncate">Set Location</Text>
						<SearchSelect
							placeholder="Country"
							value={userInfo?.country ?? ""}
							onValueChange={(country) =>
								setUserInfo({ ...userInfo, country })
							}
							defaultValue={user?.country}
						>
							{Object.keys(countries)?.map((key) => (
								<SearchSelectItem
									key={countries[key].name}
									value={countries[key].name}
								>
									{countries[key].name}
								</SearchSelectItem>
							))}
						</SearchSelect>
					</Flex>
					<Flex className="mt-4 space-x-2">
						<div className="w-1/3 truncate" />
						<div className="flex w-full min-w-[10rem]">
							<TextInput
								className="mr-4 min-w-[5rem]"
								placeholder="State"
								onChange={(e) =>
									setUserInfo({
										...userInfo,
										state: e.target.value,
									})
								}
								value={userInfo?.state ?? ""}
							/>
							<TextInput
								className="min-w-[5rem]"
								placeholder="City"
								onChange={(e) =>
									setUserInfo({
										...userInfo,
										city: e.target.value,
									})
								}
								value={userInfo?.city ?? ""}
							/>
						</div>
					</Flex>
					<Flex className="mt-4 space-x-2">
						<Text className="w-1/3 truncate">Set Salary</Text>
						<div className="flex w-full min-w-[10rem]">
							<NumberInput
								className="mr-4 min-w-[5rem]"
								icon={CurrencyDollarIcon}
								placeholder="type amount"
								enableStepper={false}
								min={0}
								onValueChange={setSalary}
								value={userInfo?.salary ?? ""}
							/>
							<NumberInput
								className="min-w-[5rem]"
								icon={CalendarIcon}
								placeholder="pay day"
								max={31}
								min={1}
								enableStepper={false}
								onValueChange={setSalaryDate}
								value={userInfo?.date ?? ""}
							/>
						</div>
					</Flex>
					<Flex className="mt-4 space-x-2">
						<div className="w-1/3 truncate" />
						<Flex>
							<Button
								color="red"
								onClick={() => setShowModal(true)}
							>
								Delete Account
							</Button>
							<Button onClick={handleUpdateUserInfo}>
								Update
							</Button>
						</Flex>
					</Flex>
				</Card>
				<Card>
					<Metric className="truncate">Upgrade</Metric>
					<Flex className="mt-4 space-x-2">
						<Text className="w-1/3 truncate">OpenAI Key</Text>
						<TextInput
							value={userInfo?.openAiKey ?? ""}
							onChange={(e) =>
								setUserInfo({
									...userInfo,
									openAiKey: e.target.value,
								})
							}
						/>
					</Flex>
					<Flex className="mt-4 space-x-2">
						<Text className="w-1/3 truncate">Database Key</Text>
						<TextInput
							value={userInfo?.mongoDBURL ?? ""}
							onChange={(e) =>
								setUserInfo({
									...userInfo,
									mongoDBURL: e.target.value,
								})
							}
						/>
					</Flex>
					<Flex className="mt-4 space-x-2">
						<div className="w-1/3 truncate" />
						<Flex>
							<Button onClick={handleUpdateUserInfo}>Save</Button>
							<Button onClick={handleUpdatePro}>
								Update to Pro
							</Button>
						</Flex>
					</Flex>
				</Card>
			</Grid>
			<Card className="mt-6">
				<div>
					<Flex
						className="space-x-0.5"
						justifyContent="start"
						alignItems="center"
					>
						<Title>Institutions and Accounts</Title>
						<Icon
							icon={InformationCircleIcon}
							variant="simple"
							tooltip="Shows all the institutions and accounts available"
						/>
					</Flex>
				</div>
				<Table className="mt-6">
					<TableHead>
						<TableRow>
							<TableHeaderCell>Institution</TableHeaderCell>
							<TableHeaderCell className="text-right">
								Account Name
							</TableHeaderCell>
							<TableHeaderCell className="text-right">
								Account Type
							</TableHeaderCell>
							<TableHeaderCell className="text-right">
								Account SubType
							</TableHeaderCell>
							<TableHeaderCell />
						</TableRow>
					</TableHead>

					<TableBody>
						{items?.map((item) => {
							return item?.accounts?.map((account, index) => (
								<TableRow key={account.account_id}>
									<TableCell>
										{index == 0 && item.institution.name}
									</TableCell>
									<TableCell className="text-right">
										{account.name}
									</TableCell>
									<TableCell className="text-right">
										{account.type}
									</TableCell>
									<TableCell className="text-right">
										{account.subtype}
									</TableCell>
									<TableCell className="text-right">
										{index == 0 && (
											<Icon
												onClick={() =>
													handleDelete(item._id)
												}
												className="cursor-pointer"
												icon={TrashIcon}
												color="red"
												variant="simple"
												tooltip="Remove this Access Account"
											/>
										)}
									</TableCell>
								</TableRow>
							));
						})}
					</TableBody>
				</Table>
			</Card>
			<Modal
				showModal={showModal}
				setShowModal={setShowModal}
				type="delete"
				title="Delete Account?"
				content="Your Account and information will be deleted forever."
				onOk={handleDeleteAccount}
			/>
		</main>
	);
}
