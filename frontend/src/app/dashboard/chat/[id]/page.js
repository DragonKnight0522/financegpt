import { notFound, redirect } from "next/navigation";

// import { auth } from "@/auth";
import { getChat } from "@/hooks/actions";
import { Chat } from "@/components/Chat/chat";
import { getSession } from "next-auth/react";

export const runtime = "edge";
export const preferredRegion = "home";

export async function generateMetadata({ params }) {
	const session = await getSession();

	if (!session?.user) {
		return {};
	}

	const chat = await getChat(params.id, session.user.id);
	return {
		title: chat?.title.toString().slice(0, 50) ?? "Chat",
	};
}

export default async function ChatPage({ params }) {
	const session = await getSession();

	if (!session?.user) {
		redirect(`/sign-in?next=/chat/${params.id}`);
	}

	const chat = await getChat(params.id, session.user.id);

	if (!chat) {
		notFound();
	}

	if (chat?.userId !== session?.user?.id) {
		notFound();
	}
	return <Chat id={chat.id} initialMessages={chat.messages} />;
}
