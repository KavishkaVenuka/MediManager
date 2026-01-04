"use client";

import React, { useState, useTransition } from 'react';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Keep for client-side validatiion if needed, but server handles redirect
import { login } from './actions';

export default function LoginPage() {
    const router = useRouter(); // Ideally not needed for redirect if server action handles it, but kept to avoid breaking changes
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <div className="min-h-screen bg-dark-teal flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-teal rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-dark-teal rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-sm z-10">

                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-teal-900/20 transform rotate-3">
                        <CheckCircle2 className="w-10 h-10 text-dark-teal" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">MediManager</h1>
                    <p className="text-light-teal font-medium">Welcome back, Dr. Niwuth Maheepala.</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl shadow-teal-900/20">
                    <form action={handleSubmit} className="space-y-6">

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-teal transition-colors" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    className="block w-full pl-11 pr-4 py-4 bg-light-teal/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-teal focus:bg-white transition-all font-medium"
                                    placeholder="doctor@medimanager.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-teal transition-colors" />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    className="block w-full pl-11 pr-12 py-4 bg-light-teal/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-teal focus:bg-white transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2 animate-shake">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-dark-teal text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-500/30 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isPending ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400 font-medium">
                            Don't have an account? <span className="text-dark-teal font-bold cursor-pointer hover:underline">Contact Admin</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
