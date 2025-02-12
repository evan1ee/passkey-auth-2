// app/dashboard/page.tsx

import LogoutButton from "@/components/LogoutButton";
import { getSession } from "@/lib/session";  // Adjust based on your actual session management function


export default async function ProfilePage() {
    // Get session on the server side
    const session = await getSession();


    return (
        <div className="p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Profile</h1>
                <LogoutButton />
            </div>
            <hr className="my-4" />
        </div>
    );
}
