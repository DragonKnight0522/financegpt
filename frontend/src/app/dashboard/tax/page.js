"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
} from "@tremor/react";

export default function Tax() {
	const dispatch = useDispatch();
	const { accessToken, itemId, linkSuccess } = useSelector(
		(state) => state.plaid
	);

	return (
		<main className="min-h-screen">
			<Text className="mt-6">A bird's eye view of your financial positions.</Text>
			<Card className="mt-6">
				<Text>
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
				</Text>
			</Card>
		</main>
	);
}
