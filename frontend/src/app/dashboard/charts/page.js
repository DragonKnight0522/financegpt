"use client";

import {
    Button,
    Card,
    CategoryBar,
    Text,
    TextInput,
    BarChart,
    BarList,
    Divider,
    Grid,
    Title,
    Tab,
    TabList,
    TabGroup,
    TabPanels,
    TabPanel,
    Flex,
    Metric,
    Legend,
    AreaChart,
    Icon,
    Callout,
    Bold,
    DonutChart
} from "@tremor/react";
import { useCallback, useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowNarrowRightIcon,
    InformationCircleIcon,
    SearchIcon,
    TrendingDownIcon,
    TrendingUpIcon
} from "@heroicons/react/solid";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowsExpandIcon } from "@heroicons/react/outline";
import Datepicker from "react-tailwindcss-datepicker";
import { dateFormat, isEmpty } from "@/utils/util";
import { getChartsData } from "@/store/actions/useUser";
import { getDashboardData } from "@/store/actions/useUser";

const categories = [
    {
        title: "Cashflow",
        metric: "10,345",
        subCategoryValues: [17130, 9380],
        subCategroyColors: ["emerald", "red"],
        subCategoryTitles: ["Money In", "Money Out"]
    },
    {
        title: "Spend Preference",
        metric: "70",
        subCategoryValues: [40, 50],
        subCategroyColors: ["violet", "purple"],
        subCategoryTitles: ["Bank Account", "Credit Card"]
    },
    {
        title: "Available Credit",
        metric: "22",
        subCategoryValues: [30, 40, 12300],
        subCategroyColors: ["emerald", "yellow", "rose"],
        subCategoryTitles: [
            "Total Min Monthly Payment",
            "Ideal",
            "Max Credit Limit"
        ]
    }
];

const usNumberformatter = (number, decimals = 0) =>
    Intl.NumberFormat("us", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })
        .format(Number(number))
        .toString();

const formatters = {
    Spend: number => `$ ${usNumberformatter(number)}`,
    Debt: number => `$ ${usNumberformatter(number)}`,
    Transactions: number => `${usNumberformatter(number)}`,
    Category: number => `${usNumberformatter(number, 2)}%`
};

const Kpis = {
    Spend: "spend",
    Transactions: "count"
};

const kpiList = [Kpis.Spend, Kpis.Transactions];

const numberFormatter = value =>
    Intl.NumberFormat("us").format(value).toString();
const dollarFormatter = value =>
    Intl.NumberFormat("us", { style: "currency", currency: "USD" })
        .format(value)
        .toString();

const percentageFormatter = value =>
    `${Intl.NumberFormat("us")
        .format(value * 100)
        .toString()}%`;

function sumArray(array, metric) {
    return array.reduce(
        (accumulator, currentValue) => accumulator + currentValue[metric],
        0
    );
}

export default function Charts() {
    const dispatch = useDispatch();
    const {
        chartData,
        chartDataByMonth,
        barListData,
        donutChartData,
        donutAsBarData,
        items,
        kpis
    } = useSelector(state => state.user);
    const { isTransactionsLoaded } = useSelector(state => state.plaid);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const filteredpages = barListData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const closeModal = () => setIsOpen(false);
    const openModal = () => setIsOpen(true);

    const closeModal2 = () => setIsOpen2(false);
    const openModal2 = () => setIsOpen2(true);

    const [insightsVisible, setInsightsVisible] = useState(false);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedKpi = kpiList[selectedIndex];
    const [filterDate, setFilterDate] = useState({
        startDate: dateFormat(
            new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1)
        ),
        endDate: dateFormat(new Date())
    });

    const fetchData = useCallback(() => {
        if (isTransactionsLoaded) {
            dispatch(getDashboardData());
            dispatch(getChartsData({ filterDate }));
        }
    }, [dispatch, filterDate, isTransactionsLoaded]);

    useEffect(() => {
        fetchData();
    }, [filterDate, items, isTransactionsLoaded]);

    const areaChartArgs = {
        className: "mt-5 h-72",
        data: chartData,
        index: "date",
        categories: [selectedKpi],
        showLegend: true,
        showAnimation: true,
        valueFormatter: formatters[selectedKpi],
        yAxisWidth: 45
    };

    const barChartArgs = {
        className: "mt-5 h-72",
        data: chartDataByMonth,
        index: "date",
        showAnimation: true,
        categories: [selectedKpi],
        showLegend: true,
        valueFormatter: formatters[selectedKpi],
        yAxisWidth: 45
    };

    const finalSum =
        chartData.length > 0 ? chartData[chartData.length - 1].spend : 0;
    const finalTransactions =
        chartData.length > 0 ? chartData[chartData.length - 1].count : 0;
    const avgSpend = numberFormatter(
        sumArray(chartDataByMonth, "spend") /
            sumArray(chartDataByMonth, "count")
    );
    console.log(avgSpend);
    const avgTransaction = numberFormatter(
        sumArray(chartDataByMonth, "count") / chartData.length
    );

    function getKPI(desiredValue) {
        for (let i = 0; i < kpis.length; i++) {
            if (kpis[i].title === desiredValue) {
                return kpis[i].metric;
            }
        }
        return null;
    }
    console.log(getKPI("Available Credit"));

    return (
        <main className="min-h-screen p-4 m-auto max-w-7xl">
            <div className="flex items-center">
                <Datepicker
                    containerClassName="relative min-w-[15rem] ml-2"
                    inputClassName="w-full text-sm outline-none text-left whitespace-nowrap truncate rounded-tremor-default focus:ring-2 transition duration-100 shadow-tremor-input focus:border-tremor-brand-subtle focus:ring-tremor-brand-muted dark:shadow-dark-tremor-input dark:focus:border-dark-tremor-brand-subtle dark:focus:ring-dark-tremor-brand-muted pl-3 pr-8 py-2 border bg-tremor-background dark:bg-dark-tremor-background hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis border-tremor-border dark:border-dark-tremor-border"
                    useRange={true}
                    showShortcuts={true}
                    value={filterDate}
                    onChange={setFilterDate}
                    configs={{
                        shortcuts: {
                            past: period => `Last ${period} days`,
                            currentMonth: "This month",
                            pastMonth: "Last month",
                            yearFromToday: {
                                text: "1 year back",
                                period: {
                                    start: new Date(
                                        new Date().setFullYear(
                                            new Date().getFullYear() - 1
                                        )
                                    ).toISOString(),
                                    end: new Date().toISOString()
                                }
                            },
                            yearToDate: {
                                text: "Year-to-date",
                                period: {
                                    start: new Date(
                                        new Date().getFullYear(),
                                        0,
                                        1
                                    ).toISOString(),
                                    end: new Date().toISOString()
                                }
                            }
                        }
                    }}
                />
                {/* <Card>
                    {categories.map((item) => (
                                <Card key={item.title}>
                                    <Text>{item.title}</Text>
                                    <Metric>{item.metric}</Metric>
                                    <CategoryBar
                                        values={item.subCategoryValues}
                                        colors={item.subCategroyColors}
                                        className="mt-4"
                                    />
                                    <Legend
                                        categories={item.subCategoryTitles}
                                        colors={item.subCategroyColors}
                                        className="mt-3"
                                    />
                                </Card>
                            ))
                        }
                     </Card>   */}
            </div>

            <div className="mt-6">
                <Grid numItems={2} className="gap-6">
                    <>
                        <Card>
                            <Title>Recurring Transactions</Title>
                            <Flex className="mt-4">
                                <Text>
                                    <Bold>Merchant</Bold>
                                </Text>
                                <Text>
                                    <Bold>Count</Bold>
                                </Text>
                            </Flex>
                            <BarList
                                data={barListData.slice(0, 5)}
                                className="mt-2 overflow-visible whitespace-normal text-overflow"
                                showTooltip={true}
                                showAnimation={true}
                            />
                            <Button
                                icon={ArrowsExpandIcon}
                                className="w-full mt-4 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                onClick={openModal}
                            >
                                Show more
                            </Button>
                        </Card>
                        <Transition appear show={isOpen} as={Fragment}>
                            <Dialog
                                as="div"
                                className="relative z-50"
                                onClose={closeModal}
                            >
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="fixed inset-0 bg-opacity-25" />
                                </Transition.Child>
                                <div className="fixed inset-0 overflow-y-auto">
                                    <div className="flex items-center justify-center min-h-full p-4 text-center">
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >
                                            <Dialog.Panel className="w-full max-w-xl p-6 overflow-hidden text-left align-middle transition-all transform ring-tremor shadow-tremor rounded-xl">
                                                <Flex
                                                    alignItems="center"
                                                    justifyContent="between"
                                                >
                                                    <Text className="text-base font-medium text-gray-700">
                                                        Recurring Transactions
                                                    </Text>
                                                    <Text>Count</Text>
                                                </Flex>
                                                <TextInput
                                                    icon={SearchIcon}
                                                    placeholder="Search..."
                                                    className="mt-6"
                                                    onChange={event =>
                                                        setSearchQuery(
                                                            event.target.value
                                                        )
                                                    }
                                                />
                                                <div className="relative mt-4 h-[450px] overflow-y-scroll">
                                                    <BarList
                                                        data={filteredpages}
                                                        className="mr-4" // to give room for scrollbar
                                                        showAnimation={true}
                                                    />
                                                    <div className="sticky inset-x-0 bottom-0 h-20 p-6 bg-gradient-to-t from-white to-transparent" />
                                                </div>
                                                <Button
                                                    className="w-full mt-2 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                                    onClick={closeModal}
                                                >
                                                    Go back
                                                </Button>
                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    </>
                    <>
                        <Card>
                            <Title>Top Spend Categories</Title>
                            <DonutChart
                                className="mt-2 overflow-visible whitespace-normal text-overflow"
                                data={donutChartData}
                                category="percent"
                                index="name"
                                showTooltip={true}
                                showAnimation={true}
                                showLegend={true}
                                valueFormatter={formatters.Category}
                            />
                            <Legend
                                categories={donutChartData.map(
                                    item => item.name
                                )}
                                className="mt-6"
                            />
                            <br />
                            <Button
                                icon={ArrowsExpandIcon}
                                className="w-full mt-4 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                onClick={openModal2}
                            >
                                Show more
                            </Button>
                        </Card>
                        <Transition appear show={isOpen2} as={Fragment}>
                            <Dialog
                                as="div"
                                className="relative z-50"
                                onClose={closeModal2}
                            >
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="fixed inset-0 bg-opacity-25" />
                                </Transition.Child>
                                <div className="fixed inset-0 overflow-y-auto">
                                    <div className="flex items-center justify-center min-h-full p-4 text-center">
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-300"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="ease-in duration-200"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >
                                            <Dialog.Panel className="w-full max-w-xl p-6 overflow-hidden text-left align-middle transition-all transform ring-tremor shadow-tremor rounded-xl">
                                                <Flex
                                                    alignItems="center"
                                                    justifyContent="between"
                                                >
                                                    <Text className="text-base font-medium">
                                                        Spend Categories
                                                    </Text>
                                                    <Text>%</Text>
                                                </Flex>
                                                <TextInput
                                                    icon={SearchIcon}
                                                    placeholder="Search..."
                                                    className="mt-6"
                                                    onChange={event =>
                                                        setSearchQuery(
                                                            event.target.value
                                                        )
                                                    }
                                                />
                                                <div className="relative mt-4 h-[450px] overflow-y-scroll">
                                                    <BarList
                                                        data={donutAsBarData}
                                                        className="mr-4"
                                                        showAnimation={true}
                                                        showTooltip={true}
                                                    />
                                                    <div className="sticky inset-x-0 bottom-0 h-20 p-6 bg-gradient-to-t from-white to-transparent" />
                                                </div>
                                                <Button
                                                    className="w-full mt-2 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                                    onClick={closeModal2}
                                                >
                                                    Go back
                                                </Button>
                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    </>
                </Grid>
            </div>
            <br />
            <Card>
                <div className="justify-between md:flex">
                    <div>
                        <Flex
                            className="space-x-0.5"
                            justifyContent="start"
                            alignItems="center"
                        >
                            <Title>Total Spend</Title>
                            <Icon
                                icon={InformationCircleIcon}
                                variant="simple"
                                tooltip="Shows daily increase of spend from debit accounts or credit cards"
                                color="gray"
                            />
                        </Flex>
                        <Text> Cumulative sum of spend over time</Text>
                        <Metric className="mt-2">
                            {selectedKpi === "spend"
                                ? dollarFormatter(finalSum)
                                : numberFormatter(finalTransactions)}
                        </Metric>
                    </div>
                    <div className="flex items-center">
                        <TabGroup
                            index={selectedIndex}
                            onIndexChange={setSelectedIndex}
                        >
                            <TabList variant="solid">
                                <Tab>Dollars</Tab>
                                <Tab>Transactions</Tab>
                            </TabList>
                        </TabGroup>
                    </div>
                </div>
                <div className="mt-8">
                    <AreaChart {...areaChartArgs} />
                </div>
            </Card>
            {/* <br /> */}
            <>
                <Divider>
                    <button
                        icon={ArrowsExpandIcon}
                        className="px-4 py-2 mt-4 border rounded"
                        onClick={() => setInsightsVisible(!insightsVisible)}
                    >
                        {insightsVisible ? "Show Less" : "Show More"}
                    </button>
                </Divider>
                {/* <br /> */}
                {insightsVisible && (
                    <>
                        <Card>
                            <div className="justify-between md:flex">
                                <div>
                                    <Flex
                                        className="space-x-0.5"
                                        justifyContent="start"
                                        alignItems="center"
                                    >
                                        <Title>Monthly Spend</Title>
                                        <Icon
                                            icon={InformationCircleIcon}
                                            variant="simple"
                                            tooltip="Shows total spend for each month"
                                            color="gray"
                                        />
                                    </Flex>
                                    <Text>Spend calculated for each month</Text>
                                    <Metric className="mt-2">
                                        {selectedKpi === "spend"
                                            ? dollarFormatter(avgSpend)
                                            : numberFormatter(avgTransaction)}
                                    </Metric>
                                </div>
                                <div className="flex">
                                    <TabGroup
                                        index={selectedIndex}
                                        onIndexChange={setSelectedIndex}
                                    >
                                        <TabList variant="solid">
                                            <Tab>Dollars</Tab>
                                            <Tab>Transactions</Tab>
                                        </TabList>
                                    </TabGroup>
                                </div>
                            </div>
                            <div className="mt-8">
                                <BarChart {...barChartArgs} />
                            </div>
                        </Card>
                        <br />
                        <Card>
                            <TabGroup>
                                <TabList>
                                    <Tab className="p-4 sm:p-6">
                                        <p className="text-sm sm:text-base">
                                            Spend Breakdown
                                        </p>
                                        <Metric className="mt-2 text-inherit">
                                            {percentageFormatter(0.6976)}
                                        </Metric>
                                    </Tab>
                                    <Tab className="p-4 sm:p-6">
                                        <p className="text-sm sm:text-base">
                                            Credit Card Usage
                                        </p>
                                        <Metric className="mt-2 text-inherit">
                                            {percentageFormatter(0.6976)}
                                        </Metric>
                                    </Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel className="p-6">
                                        <BarChart
                                            className="mt-10 h-80"
                                            data={chartDataByMonth}
                                            index="date"
                                            categories={["spend"]}
                                            showAnimation={true}
                                            valueFormatter={numberFormatter}
                                            showLegend={true}
                                            yAxisWidth={50}
                                        />
                                    </TabPanel>
                                    <TabPanel className="p-6">
                                        <BarChart
                                            className="mt-10 h-80"
                                            data={chartDataByMonth}
                                            index="date"
                                            showAnimation={true}
                                            categories={["count"]}
                                            valueFormatter={numberFormatter}
                                            showLegend={true}
                                            yAxisWidth={50}
                                        />
                                    </TabPanel>
                                    <TabPanel className="p-6">
                                        <Grid
                                            numItemsSm={2}
                                            numItemsLg={3}
                                            className="gap-6"
                                        >
                                            <BarChart />
                                        </Grid>
                                    </TabPanel>
                                </TabPanels>
                            </TabGroup>
                        </Card>
                    </>
                )}
            </>
            <br />
        </main>
    );
}
