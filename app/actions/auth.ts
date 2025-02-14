// app/actions/auth.ts
"use server"

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { generateChallenge } from "@/lib/auth";
// Generate random UUID
import { v4 as uuidv4 } from 'uuid';
const randomUUID = uuidv4();


interface LoginState {
    error?: string;
    email?: string;
    password?: string;
}

export async function login(prevState: LoginState, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const session = await getSession();

    // Check if the user is already logged in
    if (session.isLoggedIn) {
        // Redirect to dashboard if already logged in
        return redirect("/dashboard");
    }

    // Here you would validate credentials against your database
    if (email === session.email && password === session.password) {
        session.isLoggedIn = true;
        
        await session.save();

        return redirect("/dashboard");
    }

    return { error: "Invalid credentials", email, password };
}

export async function register(prevState: LoginState, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const session = await getSession();
    session.destroy();

    // Assuming user is successfully registered:
    if (email && password) {
        session.userId = randomUUID; // You should retrieve this from your DB
        session.username = email; // Store username in session
        session.email = email; // Store email in session
        session.password = password;
        await session.save();
        
        return redirect("/login");
    }

    return { error: "Registration failed", email, password };
}

export async function logout() {
    const session = await getSession();
    session.destroy();
    return redirect("/");
}


export async function getChallenge() {
    const challenge = generateChallenge();
    return challenge;
}

export async function getUserSession() {
    const session = await getSession();
    return session;
}

