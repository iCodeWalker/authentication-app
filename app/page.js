import AuthForm from "@/components/auth-form";

export default async function Home({ searchParams }) {
  // #### searchParams is a special prop automatically added to all the page components in next js.
  // #### It is an object that have one key for any query parameter that is available in the current active URL.
  const formMode = searchParams.mode || "login";
  return <AuthForm mode={formMode} />;
}
