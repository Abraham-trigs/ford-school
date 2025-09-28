// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSessionStore } from "@/lib/store/sessionStore";
// import NavigateToLoginButton from "@/components/NavigateToLoginButton";

// export default function Home() {
//   const router = useRouter();
//   const { fullUserData: user } = useSessionStore();

//   useEffect(() => {
//     if (user?.role?.name) {
//       // Redirect to dashboard based on role
//       router.replace(`/dashboard/${user.role.name.toLowerCase()}`);
//     }
//   }, [user, router]);

//   return (
//     <div className="p-8">
//       <h1 className="text-wine font-display text-4xl">Welcome</h1>
//       <p className="text-light font-sans mt-2">This is the homepage</p>

//       <button className="bg-wine text-switch px-4 py-2 rounded mt-4">
//         Get Started
//       </button>

//       {!user && <NavigateToLoginButton />}
//     </div>
//   );
// }
