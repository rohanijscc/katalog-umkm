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

export async function gantiPassword(prevState, formData) {
  const fd = formData instanceof FormData ? formData : prevState;
  const passwordBaru = fd?.get?.("password_baru");
  const konfirmasiPassword = fd?.get?.("konfirmasi_password");

  if (!passwordBaru || String(passwordBaru).length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak sama dengan password baru." };
  }

  const supabase = await buatKoneksiAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi admin tidak ditemukan. Silakan login kembali." };
  }

  const { error } = await supabase.auth.updateUser({
    password: String(passwordBaru),
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: true, message: "Password berhasil diganti." };
}
