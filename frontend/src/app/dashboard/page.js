"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	ArrowNarrowRightIcon,
	InformationCircleIcon,
	TrendingDownIcon,
	TrendingUpIcon,
} from "@heroicons/react/solid";

import {
	Card,
	Grid,
	Title,
	Text,
	Tab,
	TabList,
	TabGroup,
	Flex,
	Metric,
	AreaChart,
	Icon,
	Callout,
} from "@tremor/react";
import usePlaidInit from "@/hooks/usePlaidInit";
import Datepicker from "react-tailwindcss-datepicker";
import { dateFormat, isEmpty } from "@/utils/util";
import { getDashboardData } from "@/store/actions/useUser";

const usNumberformatter = (number, decimals = 0) =>
	Intl.NumberFormat("us", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	})
		.format(Number(number))
		.toString();

const formatters = {
	Spend: (number) => `$ ${usNumberformatter(number)}`,
	Debt: (number) => `$ ${usNumberformatter(number)}`,
	Transactions: (number) => `${usNumberformatter(number)}`,
	Category: (number) => `${usNumberformatter(number, 2)}%`,
};

const Kpis = {
	Spend: "spend",
	Transactions: "count",
};

const kpiList = [Kpis.Spend, Kpis.Transactions];

export default function Dashboard() {
	const dispatch = useDispatch();
	const { kpis, data: chartData, items } = useSelector((state) => state.user);
	const { isTransactionsLoaded } = useSelector((state) => state.plaid);

	const [selectedIndex, setSelectedIndex] = useState(0);
	const selectedKpi = kpiList[selectedIndex];
	const [filterDate, setFilterDate] = useState({
		startDate: dateFormat(
			new Date(new Date().getFullYear(), new Date().getMonth(), 1)
		),
		endDate: dateFormat(new Date()),
	});
	usePlaidInit();

	const fetchData = useCallback(() => {
		if (isTransactionsLoaded) dispatch(getDashboardData({ filterDate }));
	}, [dispatch, filterDate, items, isTransactionsLoaded]);

	useEffect(() => {
		fetchData();
	}, [filterDate, items, isTransactionsLoaded]);

	const areaChartArgs = {
		className: "mt-5 h-72",
		data: chartData,
		index: "date",
		categories: [selectedKpi],
		colors: ["blue"],
		showLegend: false,
		valueFormatter: formatters[selectedKpi],
		yAxisWidth: 56,
	};

	const getStatusInfo = (val) => {
		if (val > 2) return "Overperforming";
		else if (val < -2) return "Underperforming";
		else return "Average";
	};

	const getKpiColor = (val) => {
		if (val > 2) return "emerald";
		else if (val < -2) return "amber";
		else return "blue";
	};

	const getKpiIcon = (val) => {
		if (val > 2) return TrendingUpIcon;
		else if (val < -2) return TrendingDownIcon;
		else if (isEmpty(val)) return null;
		else return ArrowNarrowRightIcon;
	};

	return (
		<main className="min-h-screen p-4 m-auto max-w-7xl">
			<Text className="mt-6 mb-2">
				{"A bird's eye view of your financial positions."}
			</Text>
			<Grid numItemsSm={2} numItemsLg={4} className="gap-6">
				{kpis?.map((item, index) => (
					<Card key={index}>
						<Text>{item.title}</Text>
						<Flex
							justifyContent="start"
							alignItems="baseline"
							className="space-x-3 truncate"
						>
							<Metric>
								{item.type + usNumberformatter(item.metric)}
							</Metric>
							{item.metricPrev && (
								<Text>
									from&nbsp;
									{item.type +
										usNumberformatter(item.metricPrev)}
								</Text>
							)}
						</Flex>
						<Callout
							className="mt-6"
							title={
								item.delta
									? `${getStatusInfo(item.delta)} (${
											item.delta
									  }%)`
									: "Total Information"
							}
							icon={getKpiIcon(item.delta)}
							color={getKpiColor(item.delta)}
						>
							{item.text}
						</Callout>
					</Card>
				))}
			</Grid>
			<div className="mt-6">
				<Card>
					<>
						<div className="justify-between md:flex">
							<div>
								<Flex
									className="space-x-0.5"
									justifyContent="start"
									alignItems="center"
								>
									<Title> History </Title>
									<Icon
										icon={InformationCircleIcon}
										variant="simple"
										tooltip="Shows daily increase or decrease of particular domain"
									/>
								</Flex>
								<Text> Daily change per domain </Text>
							</div>
							<div className="flex items-center">
								<TabGroup
									index={selectedIndex}
									onIndexChange={setSelectedIndex}
								>
									<TabList color="gray" variant="solid">
										<Tab>Spend</Tab>
										<Tab>Transactions</Tab>
									</TabList>
								</TabGroup>

								<Datepicker
									containerClassName="relative text-gray-700 min-w-[15rem] ml-2"
									inputClassName="w-full text-sm outline-none text-left whitespace-nowrap truncate rounded-tremor-default focus:ring-2 transition duration-100 shadow-tremor-input focus:border-tremor-brand-subtle focus:ring-tremor-brand-muted dark:shadow-dark-tremor-input dark:focus:border-dark-tremor-brand-subtle dark:focus:ring-dark-tremor-brand-muted pl-3 pr-8 py-2 border bg-tremor-background dark:bg-dark-tremor-background hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis border-tremor-border dark:border-dark-tremor-border"
									useRange={false}
									showShortcuts={true}
									value={filterDate}
									onChange={setFilterDate}
								/>
							</div>
						</div>
						<div className="mt-8">
							<AreaChart {...areaChartArgs} />
						</div>
					</>
				</Card>
			</div>
		</main>
	);
}
