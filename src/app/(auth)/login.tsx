import { Link, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';

import { InputField } from '@/components/InputField';
import { clearAuthError, clearAuthMessage, loginUser } from '@/slice/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const LOGO_UNJ = require('../../../assets/images/logo_unj.svg');

type LoginForm = {
    identityNumber: string;
    password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginForm, string>> & {
    form?: string;
};

const initialForm: LoginForm = {
    identityNumber: '',
    password: '',
};

export default function LoginScreen() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { error: authError, isAuthenticated, isLoading, currentAction } = useAppSelector(
        (state) => state.auth
    );
    const [form, setForm] = useState<LoginForm>(initialForm);
    const [errors, setErrors] = useState<LoginFormErrors>({});

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, router]);

    function updateForm<K extends keyof LoginForm>(field: K, value: LoginForm[K]) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (authError) {
            dispatch(clearAuthError());
        }

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
        const normalizedIdentityNumber = values.identityNumber.trim();
        let hasMissingRequiredField = false;

        if (!normalizedIdentityNumber) {
            nextErrors.identityNumber = 'NIP / NIM wajib diisi.';
            hasMissingRequiredField = true;
        }

        if (!values.password.trim()) {
            nextErrors.password = 'Password wajib diisi.';
            hasMissingRequiredField = true;
        }

        if (Object.keys(nextErrors).length > 0) {
            nextErrors.form = hasMissingRequiredField
                ? 'Lengkapi NIP / NIM dan password sebelum login.'
                : 'Periksa kembali data login Anda.';
        }

        return nextErrors;
    }

    async function handleLoginPress() {
        const validationErrors = validateLoginForm(form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        dispatch(clearAuthError());
        dispatch(clearAuthMessage());

        await dispatch(
            loginUser({
                nim_nip: form.identityNumber.trim(),
                password: form.password,
                device_name: 'Expo App',
            })
        );
    }

    const formError = errors.form ?? authError;

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
                    {formError ? (
                        <View className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                            <Text className="text-[12px] font-medium text-red-500">{formError}</Text>
                        </View>
                    ) : null}

                    <InputField
                        label="NIP / NIM"
                        placeholder="Masukkan NIP atau NIM"
                        value={form.identityNumber}
                        onChangeText={(value) => updateForm('identityNumber', value)}
                        icon={<FontAwesome5 name="school" size={20} color="rgba(0,0,0,.5)" />}
                        autoCapitalize="none"
                        error={errors.identityNumber}
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
                    disabled={isLoading && currentAction === 'login'}
                    className="mt-5 h-12 items-center justify-center rounded-xl bg-primary active:opacity-90 disabled:opacity-60"
                >
                    <View className="flex-row items-center gap-2">
                        <Text className="text-[15px] font-semibold text-primary-foreground">
                            {isLoading && currentAction === 'login' ? 'Memproses...' : 'Login'}
                        </Text>
                        {!(isLoading && currentAction === 'login') ? (
                            <Text className="text-[16px] font-semibold text-primary-foreground">→</Text>
                        ) : null}
                    </View>
                </Pressable>

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
