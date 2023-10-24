"use client";

import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentTransaction } from "@/store/actions/useTransaction";
import { InformationCircleIcon } from "@heroicons/react/solid";
import Datepicker from "react-tailwindcss-datepicker";
import {
    Card,
    Title,
    Text,
    Flex,
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
    Badge,
    NumberInput,
    Divider
} from "@tremor/react";
import { Metric, AreaChart, BadgeDelta, DeltaType, Grid } from "@tremor/react";
import { dateFormat, handleError, isEmpty } from "@/utils/util";
import { getAllCategories } from "@/store/actions/usePlaid";
import Pagination from "@/components/Basic/Pagination";

export default function Transactions() {
    const dispatch = useDispatch();
    const { isItemAccess, isTransactionsLoaded, transactionsInfo, categories } =
        useSelector(state => state.plaid);
    const { data: transactions, size: total } = useSelector(
        state => state.transactions
    );
    const { user, items } = useSelector(state => state.user);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [selectedPaymentChannel, setSelectedPaymentChannel] = useState("all");
    const [filterDate, setFilterDate] = useState({
        startDate: dateFormat(
            new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        ),
        endDate: dateFormat(new Date())
    });

    const [priceRange, setPriceRange] = useState({
        minPrice: "",
        maxPrice: ""
    });
    const [pageSize, setPageSize] = useState(total);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = useCallback(
        newCurPage => {
            try {
                setCurrentPage(newCurPage);
                dispatch(
                    getPaymentTransaction({
                        filter: {
                            selectedCategories,
                            selectedAccounts,
                            selectedPaymentChannel,
                            filterDate,
                            pageSize,
                            currentPage: newCurPage,
                            priceRange
                        }
                    })
                );
            } catch (err) {
                handleError(err);
            }
        },
        [
            dispatch,
            selectedCategories,
            selectedAccounts,
            selectedPaymentChannel,
            filterDate,
            pageSize,
            priceRange
        ]
    );

    useEffect(() => {
        fetchData(1);
    }, [
        dispatch,
        selectedCategories,
        selectedAccounts,
        selectedPaymentChannel,
        filterDate,
        pageSize
    ]);

    useEffect(() => {
        if (isEmpty(categories)) dispatch(getAllCategories());
        if (isTransactionsLoaded) fetchData(1);
    }, [isItemAccess, items, isTransactionsLoaded, dispatch, getAllCategories]);

    const moneyIn = transactions.reduce((acc, item) => {
        if (
            item.amount < 0 &&
            !item.category?.includes("payment") &&
            !item.category?.includes("credit card")
        ) {
            return acc + -1 * item.amount;
        }
        return acc;
    }, 0);

    const moneyOut = transactions.reduce((acc, item) => {
        if (
            item.amount > 0 &&
            !item.category?.includes("payment") &&
            !item.category?.includes("credit card")
        ) {
            return acc + item.amount;
        }
        return acc;
    }, 0);

    const valueFormatter = number =>
        `$${Intl.NumberFormat("us").format(number).toString()}`;

    const dropdwon = [
        { key: "10", name: "10" },
        { key: "25", name: "25" },
        { key: "50", name: "50" },
        { key: "100", name: "100" },
        { key: total, name: "All" }
    ];

    const categories2 = [
        {
            title: "Transactions",
            metric: pageSize,
            metricPrev: total
        },
        {
            title: "Money In",
            metric: valueFormatter(moneyIn),
            metricPrev: 0
        },
        {
            title: "Money Out",
            metric: valueFormatter(moneyOut)
        }
    ];

    return (
        <main className="min-h-screen p-4 m-auto max-w-7xl">
            <Grid numItemsSm={2}>
                <Datepicker
                    containerClassName="relative flex-2 text-gray-700 min-w-[15rem]"
                    inputClassName="w-full text-sm outline-none text-left whitespace-nowrap truncate rounded-tremor-default focus:ring-2 transition duration-100 shadow-tremor-input focus:border-tremor-brand-subtle focus:ring-tremor-brand-muted dark:shadow-dark-tremor-input dark:focus:border-dark-tremor-brand-subtle dark:focus:ring-dark-tremor-brand-muted pl-3 pr-8 py-2 border bg-tremor-background dark:bg-dark-tremor-background hover:bg-tremor-background-muted dark:hover:bg-dark-tremor-background-muted text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis border-tremor-border dark:border-dark-tremor-border"
                    useRange={false}
                    showShortcuts={true}
                    value={filterDate}
                    onChange={setFilterDate}
                    configs={{
                        shortcuts: {
                            // today: "Today",
                            // yesterday: "Yesterday",
                            past: period => `Last ${period} days`,
                            currentMonth: "This month",
                            pastMonth: "Last month",
                            yearFromToday: {
                                text: "Year from today",
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
                                text: "Year to date",
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
                <Select
                    onValueChange={setPageSize}
                    placeholder="Set page size"
                    className="max-w-xs"
                >
                    {dropdwon.map((category, index) => (
                        <SelectItem
                            key={"category" + index}
                            value={category.key}
                        >
                            {category.name}
                        </SelectItem>
                    ))}
                </Select>
            </Grid>
            <br />
            <Grid numItemsSm={3} className="gap-6">
                {categories2.map((item, index) => (
                    <Card
                        key={"categories2" + index}
                        className="max-w-md mx-auto"
                    >
                        <Flex className="space-x-8">
                            <Text>{item.title}</Text>
                        </Flex>
                        <Flex
                            className="space-x-3"
                            justifyContent="start"
                            alignItems="baseline"
                        >
                            <Metric>{item.metric}</Metric>
                            {item.title === "Transactions" ? (
                                <Text> / {total}</Text>
                            ) : null}
                        </Flex>
                    </Card>
                ))}
            </Grid>
            <br />
            <Card>
                <div>
                    <Flex
                        className="space-x-0.5"
                        justifyContent="start"
                        alignItems="center"
                    >
                        <Title>Filters</Title>
                        <Icon
                            icon={InformationCircleIcon}
                            variant="simple"
                            color="gray"
                            tooltip="Browse all your transactions. Data fetched from Plaid up to 2 years back."
                        />
                    </Flex>
                </div>
                <div className="md:flex md:space-x-2">
                    <div className="flex w-full space-x-2">
                        <MultiSelect
                            className="w-full"
                            onValueChange={setSelectedCategories}
                            placeholder="Select Category..."
                        >
                            {categories?.map((item, index) => (
                                <MultiSelectItem
                                    key={"item.category_id" + index}
                                    value={
                                        item.hierarchy[
                                            item.hierarchy.length - 1
                                        ]
                                    }
                                >
                                    {item.hierarchy[item.hierarchy.length - 1]}
                                </MultiSelectItem>
                            ))}
                        </MultiSelect>
                    </div>
                    <div className="flex w-full mt-2 space-x-2 md:mt-0">
                        <Select
                            className="flex-1"
                            defaultValue="all"
                            onValueChange={setSelectedPaymentChannel}
                        >
                            <SelectItem value="all">All Channels</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="in store">In Store</SelectItem>
                            <SelectItem value="other">Other Channel</SelectItem>
                            <SelectItem value="invest">Investment</SelectItem>
                        </Select>

                        {/* Date Picker here */}
                    </div>
                </div>
                <div className="items-center mt-2 md:flex">
                    <div className="flex w-full mt-2 md:mt-0">
                        <MultiSelect
                            className="max-w-full mr-2 sm:max-w-xs"
                            onValueChange={setSelectedAccounts}
                            placeholder="Select Accounts..."
                        >
                            {items?.map(item => {
                                return item?.accounts?.map(account => (
                                    <MultiSelectItem
                                        key={account.account_id}
                                        value={account.account_id}
                                    >
                                        {account.name}
                                    </MultiSelectItem>
                                ));
                            })}
                        </MultiSelect>
                        <NumberInput
                            className="mr-2 w-[4rem]"
                            enableStepper={false}
                            placeholder="Min Price"
                            value={priceRange?.minPrice}
                            onChange={e =>
                                setPriceRange({
                                    ...priceRange,
                                    minPrice: e.target.value
                                })
                            }
                            onSubmit={() => fetchData(1)}
                        />
                        <NumberInput
                            className="w-[4rem]"
                            enableStepper={false}
                            placeholder="Max Price"
                            value={priceRange?.maxPrice}
                            onChange={e =>
                                setPriceRange({
                                    ...priceRange,
                                    maxPrice: e.target.value
                                })
                            }
                            onSubmit={() => fetchData(1)}
                        />
                    </div>
                </div>
                <Divider>
                    <button>Hide filters</button>
                </Divider>
                <Table className="mt-6 overflow-auto">
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Date</TableHeaderCell>
                            <TableHeaderCell className="text-left">
                                Account
                            </TableHeaderCell>
                            <TableHeaderCell className="text-left">
                                Name
                            </TableHeaderCell>
                            <TableHeaderCell className="text-left">
                                Amount
                            </TableHeaderCell>
                            <TableHeaderCell className="text-left">
                                Category
                            </TableHeaderCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {transactions.map((item, index) => (
                            <TableRow key={"transaction_" + index}>
                                <TableCell>{dateFormat(item.date)}</TableCell>
                                <TableCell className="text-left overflow-hidden text-ellipsis">
                                    {items?.map(item => {
                                    return item?.accounts?.map(account => (
                                      account.account_id === item.account_id ?  
                                      <Badge   
                                      key={account.account_id}
                                      value={account.name}>
                                            {account.name}
                                        </Badge> : null 
                                    ));
                                })}
                                </TableCell>
                                <TableCell className="max-w-sm text-left overflow-hidden text-ellipsis">
                                    {item.name}
                                </TableCell>
                                <TableCell className="text-left">
                                    {valueFormatter(item.amount)}
                                    {/* ({item.iso_currency_code}) */}
                                </TableCell>
                                <TableCell className="flex flex-wrap justify-start text-left truncate">
                                    {item.category?.map(categoryItem => (
                                        <Badge
                                            color="slate"
                                            size="sm"
                                            key={"categoryItem_" + categoryItem}
                                        >
                                            {categoryItem}
                                        </Badge>
                                    ))}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <br />
                <Pagination
                    total={total}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    currentPage={currentPage}
                    setCurrentPage={fetchData}
                />
            </Card>
            <br />
        </main>
    );
}
