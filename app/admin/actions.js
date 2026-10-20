"use server";

import { redirect } from "next/navigation";
import { buatKoneksiAdmin } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  const fd = formData instanceof FormData ? formData : prevState;
  const email = fd?.get?.("email");
  const password = fd?.get?.("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatKoneksiAdmin();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    let pesan = error.message;
    if (pesan.toLowerCase().includes("invalid login credentials")) {
      pesan = "Email atau password salah. Periksa kembali email dan password yang kamu masukkan.";
    }
    return { error: pesan };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatKoneksiAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

