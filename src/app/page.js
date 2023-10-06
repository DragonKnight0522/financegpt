"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import Button from "@/components/Basic/Button";

const LoginForm = () => {
	const { data } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formValues, setFormValues] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");

	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

	const onSubmit = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			setFormValues({ email: "", password: "" });

			const res = await signIn("credentials", {
				redirect: false,
				email: formValues.email,
				password: formValues.password,
				callbackUrl,
			});
			setLoading(false);

			if (!res?.error) {
				router.push(callbackUrl);
			} else {
				setError("invalid email or password");
			}
		} catch (error) {
			setLoading(false);
			setError(error);
		}
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormValues({ ...formValues, [name]: value });
	};

	return (
		<section className="bg-gray-50 dark:bg-gray-900">
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
				<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
						<h1 className="text-xl font-bold leading-tight tracking-tight text-center text-gray-900 md:text-2xl dark:text-white">
							Finance GPT
						</h1>
						<div className="min-h-[30vh] flex items-center">
							<Button
								onClick={() =>
									signIn("google", { callbackUrl })
								}
								className="flex items-center justify-center w-full gap-2 px-4 py-2 transition duration-150 border rounded-lg border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow"
							>
								<img
									className={`${
										data?.user && "mr-2"
									} w-8 h-8 rounded-full`}
									src={
										data?.user?.image ||
										"https://www.svgrepo.com/show/475656/google-color.svg"
									}
									loading="lazy"
									alt="google logo"
								/>
								<div
									className={
										data?.user ? "text-sm" : "text-md"
									}
								>
									{data?.user && (
										<p className="text-xs">
											{data?.user?.name}
										</p>
									)}
									Continue with Google
								</div>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default LoginForm;
