import { Button } from "@/components/Chat/ui/button";
import { PromptForm } from "@/components/Chat/prompt-form";
import { ButtonScrollToBottom } from "@/components/Chat/button-scroll-to-bottom";
import { IconRefresh, IconShare, IconStop } from "@/components/Chat/ui/icons";
import { FooterText } from "@/components/Chat/footer";
import { shareChat } from "@/hooks/actions";
import { usePathname, useRouter } from "next/navigation";

export function ChatPanel({
	id,
	isLoading,
	stop,
	append,
	reload,
	input,
	setInput,
	messages,
}) {
	const pathname = usePathname();
	const router = useRouter();

	return (
		<div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% animate-in duration-300 ease-in-out dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
			<ButtonScrollToBottom />
			<div className="mx-auto sm:max-w-2xl sm:px-4">
				<div className="flex items-center justify-center h-10">
					{isLoading ? (
						<Button
							variant="outline"
							onClick={() => stop()}
							className="bg-background"
						>
							<IconStop className="mr-2" />
							Stop generating
						</Button>
					) : (
						messages?.length > 0 && (
							<>
								<Button
									variant="outline"
									onClick={() => reload()}
									className="mr-2 bg-background"
								>
									<IconRefresh className="mr-2" />
									Regenerate response
								</Button>
							</>
						)
					)}
				</div>
				<div className="px-4 py-2 space-y-4 border-t shadow-lg bg-background sm:rounded-t-xl sm:border md:py-4">
					<PromptForm
						onSubmit={async (value) => {
							await append({
								id,
								content: value,
								role: "user",
							});
							if (pathname !== `/dashboard/chat/${id}`) {
								router.push(`/dashboard/chat/${id}`, {
									shallow: true,
								});
							}
						}}
						input={input}
						setInput={setInput}
						isLoading={isLoading}
					/>
					<FooterText className="hidden sm:block" />
				</div>
			</div>
		</div>
	);
}
