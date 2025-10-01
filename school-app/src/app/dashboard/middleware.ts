// // app/dashboard/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("jwt")?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET!);
//     // Assuming payload has role field
//     if (typeof payload === "object" && payload.role !== "SuperAdmin") {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }
//     return NextResponse.next();
//   } catch (err) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }
// }

// // Only run middleware on dashboard routes
// export const config = {
//   matcher: ["/dashboard/:path*"],
// };
