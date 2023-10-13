"use client";

import { useEffect, useState } from "react";
import { getChat } from "@/hooks/actions";
import { Chat } from "@/components/Chat/chat";

export default function ChatPage({ params }) {
	const [chat, setChat] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const data = await getChat(params.id);
			setChat(data.data);
		};

		fetchData();
	}, []);

	return <Chat id={chat.id} initialMessages={chat.messages} />;
}
