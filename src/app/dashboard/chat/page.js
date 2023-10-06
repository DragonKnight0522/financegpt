"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Col, Grid, Icon, Text } from "@tremor/react";
import {
	ChatIcon,
	CheckIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/solid";
import { isEmpty } from "@/utils/util";
import toast from "react-hot-toast";
import apiCall from "@/utils/apiCall";
import TypeWriter from "./TypeWriter";

export default function Chat() {
	const chatBoardRef = useRef(null);
	const chatTextAreaRef = useRef(null);
	const chatHistoryBoardRef = useRef(null);

	const [scrollbarHeight, setScrollbarHeight] = useState(1);
	const [currentMessage, setCurrentMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [chatHistory, setChatHistory] = useState([]);
	const [curChatIndex, setChatIndex] = useState(0);
	const [isTitleEdit, setIsTitleEdit] = useState(false);
	const [isTyping, setIsTyping] = useState(false);

	const fetchData = useCallback(async () => {
		const res = await apiCall.get("/api/v1/chat");
		setChatHistory(res.data.chatHistory);
		if (!isEmpty(res.data.chatHistory))
			setMessages(res.data.chatHistory[0].chat);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleEnter = async (e) => {
		var keycode = e.keyCode ? e.keyCode : e.which;
		if (e.shiftKey && keycode == 13 && scrollbarHeight < 5) {
			setScrollbarHeight(scrollbarHeight + 1);
		} else if (!e.shiftKey && keycode == 13) {
			e.preventDefault();
			if (isEmpty(currentMessage)) {
				toast.error("Message is empty");
				return;
			}
			setLoading(true);
			setMessages([...messages, { role: 1, message: currentMessage }]);
			setCurrentMessage("");
			setScrollbarHeight(1);
			const res = await apiCall.post("/api/v1/chat", {
				message: currentMessage,
				_id: chatHistory[curChatIndex]?._id,
				title: chatHistory[curChatIndex]?.title,
			});
			if (isEmpty(chatHistory)) {
				setChatHistory([{ title: "", _id: res.data?._id }]);
				setChatIndex(0);
			} else {
				let newChatHistory = [...chatHistory];
				newChatHistory[curChatIndex] = {
					...newChatHistory[curChatIndex],
					_id: res.data?._id,
				};
				setChatHistory(newChatHistory);
			}
			setMessages((message) => [...message, { role: 0, ...res.data }]);
			setLoading(false);
			setIsTyping(true);
		}
	};

	useEffect(() => {
		if (chatBoardRef.current) {
			const { scrollHeight, clientHeight } = chatBoardRef.current;
			chatBoardRef.current.scrollTop = scrollHeight - clientHeight;
			chatTextAreaRef.current.focus();
		}
	}, [messages]);

	useEffect(() => {
		if (chatHistoryBoardRef.current) {
			const { scrollHeight, clientHeight } = chatHistoryBoardRef.current;
			chatHistoryBoardRef.current.scrollTop = scrollHeight - clientHeight;
		}
	}, [chatHistory]);

	const handleNewChat = async () => {
		if (loading) return;
		if (chatHistory.length > 0) {
			if (
				isEmpty(chatHistory[curChatIndex].title) &&
				!isEmpty(messages)
			) {
				setTitleChange(messages[0].message);
			}
			chatHistory.splice(curChatIndex, 1, {
				chat: messages,
				title: isEmpty(chatHistory[curChatIndex].title)
					? isEmpty(messages)
						? ""
						: messages[0].message
					: chatHistory[curChatIndex].title,
				_id: isEmpty(chatHistory[curChatIndex]._id)
					? ""
					: chatHistory[curChatIndex]._id,
			});
		}
		setChatHistory([...chatHistory, { title: "" }]);
		setMessages([]);
		setCurrentMessage("");
		setChatIndex(chatHistory.length);
		chatTextAreaRef.current.focus();
		if (isTitleEdit) setIsTitleEdit(false);
	};

	const handleSetCurChat = (index) => {
		if (loading) return;
		if (index === curChatIndex) return;
		setIsTyping(false);
		chatHistory.splice(curChatIndex, 1, {
			chat: messages,
			title: chatHistory[curChatIndex]?.title,
			_id: chatHistory[curChatIndex]?._id,
		});
		setChatHistory(chatHistory);
		setChatIndex(index);
		setMessages(chatHistory[index].chat);
		if (!isTitleEdit) chatTextAreaRef.current.focus();
		else setIsTitleEdit(false);
	};

	const handleTitleChange = (e) => {
		let newChatHistory = [...chatHistory];
		newChatHistory[curChatIndex] = {
			...newChatHistory[curChatIndex],
			title: e.target.value,
		};
		setChatHistory(newChatHistory);
	};

	const handleDeleteChat = async (e, index) => {
		e.stopPropagation();
		let newChatHistory = [...chatHistory];
		let deletedItem;
		if (newChatHistory.length === 0)
			deletedItem = newChatHistory.splice(index, 1, { title: "" });
		else {
			deletedItem = newChatHistory.splice(index, 1);
		}
		const id = deletedItem[0]._id;
		if (!isEmpty(id)) await apiCall.delete(`/api/v1/chat/${id}`);
		setChatHistory(newChatHistory);
		setChatIndex(newChatHistory.length - 1);
		setMessages(newChatHistory[newChatHistory.length - 1]?.chat);
	};

	const handleDeleteChatHistory = async (e) => {
		e.stopPropagation();
		await apiCall.delete("/api/v1/chat/all");
		setMessages([]);
		setChatHistory([]);
		setChatIndex(0);
	};

	const setTitleChange = async (title) => {
		const item = chatHistory[curChatIndex];
		if (!isEmpty(item._id))
			await apiCall.post("/api/v1/chat/title", {
				_id: item._id,
				title:
					!isEmpty(title) && typeof title == "string"
						? title
						: item.title,
			});
		setIsTitleEdit(false);
	};

	const typingFinished = () => {
		if (chatBoardRef.current) {
			const { scrollHeight, clientHeight } = chatBoardRef.current;
			chatBoardRef.current.scrollTop = scrollHeight - clientHeight;
			chatTextAreaRef.current.focus();
		}
	};

	return (
		<main className="h-[85vh]">
			<Grid numItems={4} className="h-full gap-8">
				<Col numColSpan={3} className="relative">
					<div
						className="overflow-y-auto h-[80vh] px-1 pb-1 no-scrollbar"
						ref={chatBoardRef}
					>
						{messages?.map((item, index) => (
							<Card className="mt-6" key={index}>
								<Text className="font-bold dark:text-white">
									{item.role === 0 ? "AI : " : "You :"}
								</Text>
								<Text className=" dark:text-white">
									{item.role == 0 &&
									index == messages.length - 1 &&
									isTyping ? (
										<TypeWriter
											typingFinished={typingFinished}
										>
											{item.message}
										</TypeWriter>
									) : (
										<>
											{item.message
												.split("\n")
												.map((item, key) => {
													return (
														<span key={key}>
															{item}
															<br />
														</span>
													);
												})}
										</>
									)}
								</Text>
							</Card>
						))}
					</div>
					<div className="absolute bottom-0 left-0 flex justify-center w-full">
						<div className="flex flex-col w-full py-2 flex-grow  md:pl-4 relative dark:bg-slate-800 bg-white shadow-blue-900/5 ring-2 dark:ring-blue-900 ring-blue-500 rounded-[32px]">
							<textarea
								ref={chatTextAreaRef}
								className="w-full p-0 pl-2 m-0 overflow-auto text-black bg-transparent border-0 outline-none resize-none dark:text-white pr-7 focus:ring-0 focus-visible:ring-0 md:pl-0 no-scrollbar"
								placeholder="Type a message..."
								disabled={loading}
								rows={scrollbarHeight}
								onKeyDown={handleEnter}
								onChange={(e) =>
									setCurrentMessage(e.target.value)
								}
								value={currentMessage}
							/>
							<button className="absolute bottom-1 right-4 focus:outline-none ">
								<Icon icon={ChatIcon} />
							</button>
						</div>
					</div>
				</Col>
				<Card className="relative h-full mt-6">
					<div className="absolute right-0 flex justify-end w-full top-3">
						{!isEmpty(chatHistory) && (
							<Button
								className="mr-6"
								type="button"
								size="sm"
								color="red"
								icon={TrashIcon}
								onClick={handleDeleteChatHistory}
							>
								Clear History
							</Button>
						)}
					</div>
					<div
						ref={chatHistoryBoardRef}
						className="mt-8 overflow-y-auto h-[70vh] no-scrollbar"
					>
						{chatHistory.map((item, index) => (
							<button
								key={index}
								onClick={() => handleSetCurChat(index)}
								className={`${
									curChatIndex === index ? "bg-slate-100" : ""
								} flex items-center justify-start min-h-[40px] text-sm rounded-lg dark:hover:bg-slate-800 w-full hover:bg-slate-100 cursor-pointer  dark:bg-slate-800 dark:text-white p-2 my-2`}
							>
								<Icon icon={ChatIcon} />
								{isTitleEdit && curChatIndex === index ? (
									<input
										placeholder="Chat Title"
										className="flex-1 w-1/2 pr-1 bg-transparent outline-none"
										value={item.title}
										onChange={handleTitleChange}
									/>
								) : (
									<div className="flex-1 pr-1 overflow-hidden text-left whitespace-nowrap overflow-ellipsis">
										{isEmpty(item.title)
											? "New Chat"
											: item.title}
									</div>
								)}
								{curChatIndex === index && (
									<div className="flex">
										{isTitleEdit ? (
											<Icon
												icon={CheckIcon}
												onClick={setTitleChange}
											/>
										) : (
											<Icon
												icon={PencilIcon}
												onClick={() =>
													setIsTitleEdit(true)
												}
											/>
										)}
										<Icon
											icon={TrashIcon}
											onClick={(e) =>
												handleDeleteChat(e, index)
											}
										/>
									</div>
								)}
							</button>
						))}
					</div>
					<div className="absolute left-0 flex justify-center w-full bottom-10">
						<Button
							type="button"
							size="lg"
							icon={PlusIcon}
							onClick={handleNewChat}
						>
							New Chat
						</Button>
					</div>
				</Card>
			</Grid>
		</main>
	);
}
