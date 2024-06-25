"use client";

import { Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import LoginForm from "./LoginForm";

function LoginButton() {
  const openModal = () =>
    modals.open({
      title: "Please confirm your action",
      children: <LoginForm />
    });

  return <Button onClick={openModal}>Open confirm modal</Button>;
}

export default LoginButton;
