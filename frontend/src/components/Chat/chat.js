"use client";

import { useChat } from "ai/react";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/Chat/chat-list";
import { ChatPanel } from "@/components/Chat/chat-panel";
import { EmptyScreen } from "@/components/Chat/empty-screen";
import { ChatScrollAnchor } from "@/components/Chat/chat-scroll-anchor";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/Chat/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export function Chat({ id, initialMessages, className }) {
	const [previewToken, setPreviewToken] = useLocalStorage("ai-token", null);
	const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW);
	const [previewTokenInput, setPreviewTokenInput] = useState(
		previewToken ?? ""
	);
	const { data } = useSession();
	const { messages, append, reload, stop, isLoading, input, setInput } =
		useChat({
			api: "/api/v1/chat",
			initialMessages,
			id,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: `Bearer ${data?.accessToken}`,
			},
			body: {
				id,
				previewToken,
			},
			onResponse(response) {
				if (response.status === 401) {
					toast.error(response.statusText);
				}
			},
		});

	return (
		<div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
			<div className={`pb-[200px] pt-4 md:pt-10 ${className}`}>
				{messages.length ? (
					<>
						<ChatList messages={messages} />
						<ChatScrollAnchor trackVisibility={isLoading} />
					</>
				) : (
					<EmptyScreen setInput={setInput} />
				)}
			</div>
			<ChatPanel
				id={id}
				isLoading={isLoading}
				stop={stop}
				append={append}
				reload={reload}
				messages={messages}
				input={input}
				setInput={setInput}
			/>

			<Dialog
				open={previewTokenDialog}
				onOpenChange={setPreviewTokenDialog}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Enter your OpenAI Key</DialogTitle>
						<DialogDescription>
							If you have not obtained your OpenAI API key, you
							can do so by{" "}
							<a
								href="https://platform.openai.com/signup/"
								className="underline"
							>
								signing up
							</a>{" "}
							on the OpenAI website. This is only necessary for
							preview environments so that the open source
							community can test the app. The token will be saved
							to your browser&apos;s local storage under the name{" "}
							<code className="font-mono">ai-token</code>.
						</DialogDescription>
					</DialogHeader>
					<Input
						value={previewTokenInput}
						placeholder="OpenAI API key"
						onChange={(e) => setPreviewTokenInput(e.target.value)}
					/>
					<DialogFooter className="items-center">
						<Button
							onClick={() => {
								setPreviewToken(previewTokenInput);
								setPreviewTokenDialog(false);
							}}
						>
							Save Token
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
