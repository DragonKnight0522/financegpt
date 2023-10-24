import { UseChatHelpers } from "ai/react";

import { Button } from "@/components/Chat/ui/button";
import { ExternalLink } from "@/components/Chat/external-link";
import { IconArrowRight } from "@/components/Chat/ui/icons";

const exampleMessages = [
	{
		heading: "Budget",
		message: `How much do I spend a month?`,
	},
	{
		heading: "Plan & Strategize",
		message: "Can I afford to buy a car? If so: \n What is a reasonable monthly payment? \n How much should I put down?",
	},
	{
		heading: "Learn",
		message: `Am I ready to buy a house in Seattle, Wa: 700k?`,
	},
];

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, "setInput">) {
	return (
		<div className="mx-auto max-w-2xl px-4">
			<div className="rounded-lg border bg-background p-8">
				<h1 className="mb-2 text-lg font-semibold">
					Your Personal Finance AI Chatbot
				</h1>
				<p className="mb-2 leading-normal text-muted-foreground">
					Ask Q&A to discover insights related to your current finances. Visit the {" "}
					<ExternalLink href="https://qashboard.com/prompts">
						Prompt Library
					</ExternalLink>{" "}
					{/* and{" "}
					<ExternalLink href="https://vercel.com/storage/kv">
						Vercel KV
					</ExternalLink> */}
					to learn more.
				</p>
				<p className="leading-normal text-muted-foreground">
					Start a conversation by typing below or try the following
					examples:
				</p>
				<div className="mt-4 flex flex-col items-start space-y-2">
					{exampleMessages.map((message, index) => (
						<Button
							key={index}
							variant="link"
							className="h-auto p-0 text-base"
							onClick={() => setInput(message.message)}
						>
							<IconArrowRight className="mr-2 text-muted-foreground" />
							{message.heading}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
