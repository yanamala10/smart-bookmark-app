NOTE: While logging in, if you sign in with google check your spam folders as well fot the confirmation link.
Challenges & Solutions Log
1. Build Failure: Accessing Dynamic APIs (Severity 8)
Problem: The Vercel build crashed with an error stating that cookies() or headers() were used outside of a Suspense boundary. Next.js 15 requires these to be "wrapped" to allow for streaming.

Solution: I restructured the Dashboard by moving the user session check into a Server Component and using <Suspense> to handle the loading state, ensuring a non-blocking build process.

2. The "Catch-22" Environment Variable Crash
Problem: During the Vercel build phase, the createClient() function would run to "pre-render" the login page. Since Vercel doesn't inject your real environment variables until the app is live, the build crashed because the Supabase URL was missing.

Solution: I updated lib/supabase/client.ts to use a "Placeholder Pattern." If the variables are missing during the build, it returns a dummy client instead of throwing an error, allowing the build to finish safely.

3. Syntax Errors in the Auth Flow
Problem: The build worker reported a fatal error at signInWithOAuth({ {. This was a double-bracket syntax error that prevented the JavaScript from compiling.

Solution: Cleaned up the LoginPage.tsx code, ensuring the object structure was correct and that window.location.origin was used to make redirects work on both local and live environments.

4. Hydration & Rendering Strategy
Problem: I initially used export const dynamic = 'force-dynamic' to force the login page to skip the build-time check. However, this caused inconsistencies and slower performance.

Solution: After making the Supabase client "build-safe" (see Problem #2), I removed the force-dynamic tag. This allowed Next.js to properly pre-render the static parts of the login page, leading to better "Hydration" (the handshake between server and browser) and faster load times.

5. UI Latency (The "Refresh Required" Issue)
Problem: Bookmarks only appeared or disappeared after a manual page refresh. This happened because the database was updated, but the React State (the local memory) wasn't.

Solution: I implemented Optimistic Updates. I modified addBookmark and deleteBookmark to update the local bookmarks array using setBookmarks() immediately upon a successful response, giving the app an "instant" feel.

6. Real-time Syncing across Devices (Requirement #4)
Problem: Changes made in one tab wouldn't show up in another without a refresh, failing the "Real-time" requirement.

Solution: I enabled Supabase Realtime Replication on the database and added a useEffect hook in the frontend to listen for INSERT and DELETE events. I also set the REPLICA IDENTITY to FULL in SQL to ensure the deleted ID was broadcasted to all users.

SUMMARY: "The project was optimized for Next.js 15 by balancing static pre-rendering with dynamic client-side state. I overcame several build-time environment constraints by implementing a robust client-initialization pattern and utilized Optimistic UI updates to ensure the application met all real-time requirements."
