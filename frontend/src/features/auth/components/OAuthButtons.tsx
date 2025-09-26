"use client";

import GoogleLogin from "@/app/components/button/GoogleLogin";
import GithubLogin from "@/app/components/button/GithubLogin";
import useAuth from "../hooks/useAuth";

export default function OAuthButtons() {
  const { oauthLogin } = useAuth();

  return (
    <div className="flex flex-col gap-4 mt-4">
      <GoogleLogin onClick={() => oauthLogin("google")} />
      <GithubLogin onClick={() => oauthLogin("github")} />
    </div>
  );
}
