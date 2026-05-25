import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';

import { InputField } from '@/components/InputField';

const LOGO_UNJ = require('../../../assets/images/logo_unj.svg');

type LoginForm = {
    email: string;
    password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginForm, string>> & {
    form?: string;
};

const initialForm: LoginForm = {
    email: '',
    password: '',
};

export default function LoginScreen() {
    const [form, setForm] = useState<LoginForm>(initialForm);
    const [errors, setErrors] = useState<LoginFormErrors>({});
    const [submitPreview, setSubmitPreview] = useState<LoginForm | null>(null);

    function updateForm<K extends keyof LoginForm>(field: K, value: LoginForm[K]) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => {
            if (!current[field] && !current.form) return current;

            return {
                ...current,
                [field]: undefined,
                form: undefined,
            };
        });
    }

    function validateLoginForm(values: LoginForm): LoginFormErrors {
        const nextErrors: LoginFormErrors = {};
        const normalizedEmail = values.email.trim().toLowerCase();
        let hasMissingRequiredField = false;

        if (!normalizedEmail) {
            nextErrors.email = 'Email universitas wajib diisi.';
            hasMissingRequiredField = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            nextErrors.email = 'Format email tidak valid.';
        }

        if (!values.password.trim()) {
            nextErrors.password = 'Password wajib diisi.';
            hasMissingRequiredField = true;
        }

        if (Object.keys(nextErrors).length > 0) {
            nextErrors.form = hasMissingRequiredField
                ? 'Lengkapi email dan password sebelum login.'
                : 'Periksa kembali data login Anda.';
        }

        return nextErrors;
    }

    function handleLoginPress() {
        const validationErrors = validateLoginForm(form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setSubmitPreview(null);
            return;
        }

        const payload: LoginForm = {
            email: form.email.trim().toLowerCase(),
            password: form.password,
        };

        setErrors({});
        setSubmitPreview(payload);
        console.log('Login payload ready:', payload);
    }

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 32,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center">
                    <View className="mb-4 h-[72px] w-[72px] items-center justify-center rounded-full bg-accent/15">
                        <Image source={LOGO_UNJ} style={{ width: 56, height: 56 }} contentFit="contain" />
                    </View>

                    <Text className="text-center text-[28px] font-bold leading-[34px] text-text">
                        Masuk ke Akun
                    </Text>
                    <Text className="mt-2 max-w-[260px] text-center text-[14px] leading-5 text-text-muted">
                        Login untuk melihat status peminjaman dan mengakses layanan laboratorium.
                    </Text>
                </View>

                <View className="mt-6 gap-3.5">
                    {errors.form ? (
                        <View className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                            <Text className="text-[12px] font-medium text-red-500">{errors.form}</Text>
                        </View>
                    ) : null}

                    <InputField
                        label="Email Universitas"
                        placeholder="nama@mhs.unj.ac.id"
                        value={form.email}
                        onChangeText={(value) => updateForm('email', value)}
                        icon={<FontAwesome5 name="school" size={20} color="rgba(0,0,0,.5)" />}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <InputField
                        label="Password"
                        placeholder="Masukkan password"
                        value={form.password}
                        onChangeText={(value) => updateForm('password', value)}
                        icon={<AntDesign name="lock" size={20} color="rgba(0,0,0,.5)" />}
                        secureTextEntry
                        error={errors.password}
                    />
                </View>

                <Pressable
                    onPress={handleLoginPress}
                    className="mt-5 h-12 items-center justify-center rounded-xl bg-primary active:opacity-90"
                >
                    <View className="flex-row items-center gap-2">
                        <Text className="text-[15px] font-semibold text-primary-foreground">Login</Text>
                        <Text className="text-[16px] font-semibold text-primary-foreground">→</Text>
                    </View>
                </Pressable>

                {submitPreview ? (
                    <View className="mt-3 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                        <Text className="text-[12px] font-medium text-emerald-700">
                            Data login siap dikirim ke API.
                        </Text>
                    </View>
                ) : null}

                <View className="mt-5 flex-row items-center justify-center">
                    <Text className="text-[13px] text-text-muted">Belum punya akun? </Text>
                    <Link href="/register" asChild>
                        <Pressable hitSlop={6}>
                            <Text className="text-[13px] font-semibold text-primary">Daftar</Text>
                        </Pressable>
                    </Link>
                </View>
            </ScrollView>
        </View>
    );
}
