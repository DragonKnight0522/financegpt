"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card, Text } from "@tremor/react";

export default function Tax() {
	return (
		<main className="min-h-screen p-4 m-auto max-w-7xl">
			<Text className="mt-6">
				{"A bird's eye view of your financial positions."}
			</Text>
			<Card className="mt-6">
				<Text>
					Lorem ipsum dolor sit amet, consetetur sadipscing elitr.
				</Text>
			</Card>
		</main>
	);
}
