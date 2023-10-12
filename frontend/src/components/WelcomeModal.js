"use client";

import React, { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "@/store/actions/useUser";
import { Flex, Metric, TextInput, Text, Button } from "@tremor/react";
import { isEmpty } from "@/utils/util";
import toast from "react-hot-toast";

const WelcomeModal = () => {
	const dispatch = useDispatch();
	const [currentStep, setCurrentStep] = useState(0);
	const [moving, setMoving] = useState("right");
	const { data: session, update: sessionUpdate } = useSession();
	const [userInfo, setUserInfo] = useState({});

	const [steps, setSteps] = useState([
		{ name: "Step 1", status: "current" },
		{ name: "Step 2", status: "upcoming" },
		{ name: "Step 3", status: "upcoming" },
	]);

	const handleCloseModal = async () => {
		if (isEmpty(userInfo.openAiKey) || isEmpty(userInfo.mongoDBURL)) {
			toast.error("Please Input keys");
			return;
		}
		dispatch(updateUserInfo(userInfo));
		sessionUpdate({ isNewUser: false });
	};

	const prevStep = () => {
		setMoving("left");
		setSteps((old) =>
			old.map((v, i) => {
				if (i === currentStep) {
					v.status = "upcoming";
				} else if (i === currentStep - 1) {
					v.status = "current";
				}
				return v;
			})
		);
		setCurrentStep(currentStep - 1);
		return false;
	};

	const nextStep = async () => {
		setMoving("right");

		if (true) {
			setSteps((old) =>
				old.map((v, i) => {
					if (i === currentStep) {
						v.status = "complete";
					} else if (i === currentStep + 1) {
						v.status = "current";
					}
					return v;
				})
			);
			setCurrentStep(currentStep + 1);
		}
		return false;
	};

	return (
		<>
			{session?.user?.isNewUser && (
				<div className="fixed inset-0 z-50 overflow-hidden">
					<div
						className="fixed inset-0 w-full h-full bg-gray-200"
						// onClick={() => setShowModal(false)}
					/>
					<div className="flex items-center w-screen h-screen px-4 py-8 overflow-hidden">
						<div className="relative overflow-hidden min-w-[40vw] max-w-lg p-10 mx-auto bg-white rounded-md shadow-lg">
							<Metric className="truncate">
								Welcome To Finance GPT
							</Metric>
							<div className="flex py-4 mt-2 text-gray-500 flex-nowrap h-[50vh] relative">
								<Transition
									appear={false}
									unmount={false}
									show={currentStep === 0}
									enter="transform transition ease-in-out duration-500"
									enterFrom={`${
										moving === "right"
											? "translate-x-96"
											: "-translate-x-96"
									} opacity-0`}
									enterTo="translate-x-0 opacity-100"
									leave="transform transition ease-in-out duration-500 "
									leaveFrom="translate-x-0 opacity-100"
									leaveTo={`${
										moving === "right"
											? "-translate-x-96"
											: "translate-x-96"
									} opacity-0`}
									className="w-0"
									as="div"
								>
									<div className="w-[36vw] pr-4">
										<h2>Welcome to First Page</h2>
										<p>This is content of First Page</p>
									</div>
								</Transition>

								<Transition
									appear={false}
									unmount={false}
									show={currentStep === 1}
									enter="transform transition ease-in-out duration-500"
									enterFrom={`${
										moving === "right"
											? "translate-x-96"
											: "-translate-x-96"
									} opacity-0`}
									enterTo="translate-x-0 opacity-100"
									leave="transform transition ease-in-out duration-500 "
									leaveFrom="translate-x-0 opacity-100"
									leaveTo={`${
										moving === "right"
											? "-translate-x-96"
											: "translate-x-96"
									} opacity-0`}
									className="w-0"
									as="div"
								>
									<div className="w-[36vw] pr-4">
										<h2>Welcome to Second Page</h2>
										<p>This is content of Second Page</p>
									</div>
								</Transition>

								<Transition
									appear={false}
									unmount={false}
									show={currentStep === 2}
									enter="transform transition ease-in-out duration-500"
									enterFrom={`${
										moving === "right"
											? "translate-x-96"
											: "-translate-x-96"
									} opacity-0`}
									enterTo="translate-x-0 opacity-100"
									leave="transform transition ease-in-out duration-500 "
									leaveFrom="translate-x-0 opacity-100"
									leaveTo={`${
										moving === "right"
											? "-translate-x-96"
											: "translate-x-96"
									} opacity-0`}
									className="w-0"
									as="div"
								>
									<div className="w-[36vw] pr-4">
										<Text className="my-2 truncate">
											OpenAI Key
										</Text>
										<TextInput
											className="my-2"
											value={userInfo?.openAiKey ?? ""}
											onChange={(e) =>
												setUserInfo({
													...userInfo,
													openAiKey: e.target.value,
												})
											}
										/>
										<Text className="my-2 truncate">
											Database Key
										</Text>
										<TextInput
											className="my-2"
											value={userInfo?.mongoDBURL ?? ""}
											onChange={(e) =>
												setUserInfo({
													...userInfo,
													mongoDBURL: e.target.value,
												})
											}
										/>
										<Flex justifyContent="end">
											<Button onClick={handleCloseModal}>
												Submit
											</Button>
										</Flex>
									</div>
								</Transition>
							</div>
							<div className="w-full gap-2 mt-3">
								<nav
									className="flex items-center justify-between"
									aria-label="Progress"
								>
									<button
										type="button"
										disabled={currentStep === 0}
										onClick={() => prevStep()}
									>
										Prev
									</button>
									<ol className="flex items-center mx-8 space-x-5">
										{steps.map((step, i) => (
											<li key={`step_${i}`}>
												{step.status === "complete" ? (
													<div className="block w-2.5 h-2.5 bg-indigo-600 rounded-full hover:bg-indigo-900 cursor-pointer">
														<span className="sr-only"></span>
													</div>
												) : step.status ===
												  "current" ? (
													<div
														className="relative flex items-center justify-center cursor-pointer"
														aria-current="step"
													>
														<span
															className="absolute flex w-5 h-5 p-px"
															aria-hidden="true"
														>
															<span className="w-full h-full bg-indigo-200 rounded-full" />
														</span>
														<span
															className="relative block w-2.5 h-2.5 bg-indigo-600 rounded-full"
															aria-hidden="true"
														/>
														<span className="sr-only"></span>
													</div>
												) : (
													<div className="block w-2.5 h-2.5 bg-gray-200 rounded-full hover:bg-gray-400 cursor-pointer">
														<span className="sr-only"></span>
													</div>
												)}
											</li>
										))}
									</ol>
									<button
										type="button"
										disabled={currentStep === 2}
										onClick={() => nextStep()}
									>
										Next
									</button>
								</nav>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default WelcomeModal;
