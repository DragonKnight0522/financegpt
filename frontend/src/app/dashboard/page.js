"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowNarrowRightIcon,
    TrendingDownIcon,
    TrendingUpIcon
} from "@heroicons/react/solid";
import {
    ShoppingBagIcon,
    CashIcon,
    UsersIcon,
    ShoppingCartIcon
  } from "@heroicons/react/solid";

import { Card, Grid, Text, Flex, Metric, Callout, Button, Icon, Title } from "@tremor/react";
import { isEmpty } from "@/utils/util";
import { getDashboardData } from "@/store/actions/useUser";

const categories = [
    {
      title: "Sales",
      text: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
          tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.`,
      icon: ShoppingBagIcon,
    },
    {
      title: "Profit",
      text: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
          tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.`,
      icon: CashIcon,
    },
    {
      title: "Customers",
      text: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
          tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.`,
      icon: UsersIcon,
    },
    {
      title: "Orders",
      text: `Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
          tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.`,
      icon: ShoppingCartIcon,
    },
  ];

const usNumberformatter = (number, decimals = 0) =>
    Intl.NumberFormat("us", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })
        .format(Number(number))
        .toString();

export default function Dashboard() {
    const dispatch = useDispatch();
    const { kpis, items } = useSelector(state => state.user);
    const { isTransactionsLoaded } = useSelector(state => state.plaid);

    const fetchData = useCallback(() => {
        if (isTransactionsLoaded) dispatch(getDashboardData());
    }, [dispatch, items, isTransactionsLoaded]);

    useEffect(() => {
        fetchData();
    }, [items, isTransactionsLoaded]);

    const getKpiColor = val => {
        if (val > 2) return "emerald";
        else if (val < -2) return "amber";
        else return "blue";
    };

    const getKpiIcon = val => {
        if (val > 2) return TrendingUpIcon;
        else if (val < -2) return TrendingDownIcon;
        else if (isEmpty(val) || typeof val === "string") return null;
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
                                    ? !isNaN(item.delta)
                                        ? `${parseInt(item.delta)}/M`
                                        : item.delta
                                    : "Summary"
                            }
                            icon={getKpiIcon(item.delta)}
                            color={getKpiColor(item.delta)}
                        >
                            {item.text}
                        </Callout>
                    </Card>
                ))}
            </Grid>
            <br />
            <Grid numItemsSm={2} className="gap-6">
            {categories.map((item) => (
                <Card key={item.title}>
                <Icon variant="light" icon={item.icon} size="lg" color="blue" />
                <Title className="mt-6">{item.title}</Title>
                <Text className="mt-2">{item.text}</Text>
                <Flex className="mt-6 pt-4 border-t">
                    <Button size="xs" variant="light" icon={ArrowNarrowRightIcon} iconPosition="right">
                    View more
                    </Button>
                </Flex>
                </Card>
            ))}
            </Grid> 
        </main>
    );
}
