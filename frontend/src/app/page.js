'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChangeEvent, useState } from 'react'
import Button from '@/components/Basic/Button'

const LoginForm = () => {
    const { data } = useSession()

    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
                <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
                    <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
                        <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
                            Finance GPT
                        </h1>
                        <div className="flex min-h-[30vh] items-center">
                            <Button
                                onClick={() =>
                                    signIn('google', { callbackUrl })
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition duration-150 hover:border-slate-400 hover:text-slate-900 hover:shadow dark:text-white"
                            >
                                <img
                                    className={`${
                                        data?.user && 'mr-2'
                                    } h-8 w-8 rounded-full`}
                                    src={
                                        data?.user?.image ||
                                        'https://www.svgrepo.com/show/475656/google-color.svg'
                                    }
                                    loading="lazy"
                                    alt="google logo"
                                />
                                <div
                                    className={
                                        data?.user ? 'text-sm' : 'text-md'
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
    )
}

export default LoginForm
