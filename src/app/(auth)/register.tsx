import {Image} from 'expo-image';
import { Link } from 'expo-router';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {InputField} from "@/components/InputField";
import {AntDesign, Feather, FontAwesome5} from "@expo/vector-icons";
import {useMemo, useState} from "react";
import {fakultasData} from "@/types/FakultasItem";
import {Dropdown} from "react-native-element-dropdown";

const LOGO_UNJ = require('../../../assets/images/logo_unj.svg');

type RegisterForm = {
    fullName: string;
    email: string;
    identityNumber: string;
    fakultas: string | null;
    prodi: string | null;
    password: string;
};

type RegisterFormErrors = Partial<Record<keyof RegisterForm, string>> & {
    form?: string;
};

const duplicateRegisterErrorSchema = {
    email: 'Email universitas sudah terdaftar.',
    identityNumber: 'NIP / NIM sudah terdaftar.',
} as const;

const registerRequiredFieldErrorSchema = {
    form: 'Lengkapi semua field yang wajib diisi sebelum mendaftar.',
    fullName: 'Nama lengkap wajib diisi.',
    email: 'Email universitas wajib diisi.',
    identityNumber: 'NIP / NIM wajib diisi.',
    fakultas: 'Fakultas wajib dipilih.',
    prodi: 'Program studi wajib dipilih.',
    password: 'Password wajib diisi.',
} as const;

const mockedDuplicateValues = {
    emails: ['admin@unj.ac.id', 'budi@mhs.unj.ac.id'],
    identityNumbers: ['1234567890', '9876543210'],
} as const;

const initialForm: RegisterForm = {
    fullName: '',
    email: '',
    identityNumber: '',
    fakultas: null,
    prodi: null,
    password: '',
};

export default function RegisterScreen() {
    const [form, setForm] = useState<RegisterForm>(initialForm);
    const [errors, setErrors] = useState<RegisterFormErrors>({});
    const [submitPreview, setSubmitPreview] = useState<RegisterForm | null>(null);

    const prodiData = useMemo(() => {
        const selectedFakultas = fakultasData.find(
            (item) => item.value === form.fakultas
        );

        if (!selectedFakultas) return [];

        return selectedFakultas.prodi.map((item) => ({
            label: item,
            value: item,
        }));
    }, [form.fakultas]);

    function updateForm<K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) {
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

    function validateRegisterForm(values: RegisterForm): RegisterFormErrors {
        const nextErrors: RegisterFormErrors = {};
        const normalizedEmail = values.email.trim().toLowerCase();
        const normalizedIdentityNumber = values.identityNumber.trim();
        let hasMissingRequiredField = false;

        if (!values.fullName.trim()) {
            nextErrors.fullName = registerRequiredFieldErrorSchema.fullName;
            hasMissingRequiredField = true;
        }
        if (!normalizedEmail) {
            nextErrors.email = registerRequiredFieldErrorSchema.email;
            hasMissingRequiredField = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            nextErrors.email = 'Format email tidak valid.';
        } else if (mockedDuplicateValues.emails.includes(normalizedEmail)) {
            nextErrors.email = duplicateRegisterErrorSchema.email;
        }

        if (!normalizedIdentityNumber) {
            nextErrors.identityNumber = registerRequiredFieldErrorSchema.identityNumber;
            hasMissingRequiredField = true;
        } else if (mockedDuplicateValues.identityNumbers.includes(normalizedIdentityNumber)) {
            nextErrors.identityNumber = duplicateRegisterErrorSchema.identityNumber;
        }

        if (!values.fakultas) {
            nextErrors.fakultas = registerRequiredFieldErrorSchema.fakultas;
            hasMissingRequiredField = true;
        }
        if (!values.prodi) {
            nextErrors.prodi = registerRequiredFieldErrorSchema.prodi;
            hasMissingRequiredField = true;
        }
        if (!values.password.trim()) {
            nextErrors.password = registerRequiredFieldErrorSchema.password;
            hasMissingRequiredField = true;
        }

        if (Object.keys(nextErrors).length > 0) {
            nextErrors.form = hasMissingRequiredField
                ? registerRequiredFieldErrorSchema.form
                : 'Periksa kembali data registrasi Anda.';
        }

        return nextErrors;
    }

    function handleRegisterPress() {
        const validationErrors = validateRegisterForm(form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setSubmitPreview(null);
            return;
        }

        const payload: RegisterForm = {
            fullName: form.fullName.trim(),
            email: form.email.trim().toLowerCase(),
            identityNumber: form.identityNumber.trim(),
            fakultas: form.fakultas,
            prodi: form.prodi,
            password: form.password,
        };

        setErrors({});
        setSubmitPreview(payload);
        console.log('Register payload ready:', payload);
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
                        <Image source={LOGO_UNJ} style={{width: 56, height: 56}} contentFit="contain"/>
                    </View>

                    <Text className="text-center text-[28px] font-bold leading-[34px] text-text">
                        Buat Akun Baru
                    </Text>
                    <Text className="mt-2 max-w-[260px] text-center text-[14px] leading-5 text-text-muted">
                        Daftarkan akun Anda untuk mengajukan peminjaman barang laboratorium.
                    </Text>
                </View>

                <View className="mt-6 gap-3.5">
                    {errors.form ? (
                        <View className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                            <Text className="text-[12px] font-medium text-red-500">{errors.form}</Text>
                        </View>
                    ) : null}

                    <InputField
                        label="Nama Lengkap"
                        placeholder="Cth: Budi Santoso"
                        value={form.fullName}
                        onChangeText={(value) => updateForm('fullName', value)}
                        icon={<Feather name="user" size={20} color="rgba(0,0,0,.5)"/>}
                        error={errors.fullName}
                    />
                    <InputField
                        label="Email Universitas"
                        placeholder="nama@mhs.unj.ac.id"
                        value={form.email}
                        onChangeText={(value) => updateForm('email', value)}
                        icon={<FontAwesome5 name="school" size={20} color="rgba(0,0,0,.5)"/>}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <InputField
                        label="NIP / NIM"
                        placeholder="Masukkan NIP atau NIM"
                        value={form.identityNumber}
                        onChangeText={(value) => updateForm('identityNumber', value)}
                        icon={<AntDesign name="idcard" size={15} color="rgba(0,0,0,.5)"/>}
                        autoCapitalize="none"
                        error={errors.identityNumber}
                    />
                    <View>
                        <Text className={`mb-1.5 text-[12px] font-semibold ${errors.fakultas ? 'text-red-400' : 'text-text/60'}`}>
                            Fakultas
                        </Text>

                        <Dropdown
                            style={[styles.dropdown, errors.fakultas && styles.dropdownError]}
                            containerStyle={styles.dropdownContainer}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            inputSearchStyle={styles.dropdownSearchInput}
                            itemTextStyle={styles.dropdownItemText}
                            data={fakultasData}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Pilih fakultas"
                            searchPlaceholder="Cari fakultas..."
                            value={form.fakultas}
                            onChange={(item) => {
                                updateForm('fakultas', item.value);
                                updateForm('prodi', null);
                            }}
                        />
                        {errors.fakultas ? (
                            <Text className="mt-1.5 text-[11px] text-red-400">{errors.fakultas}</Text>
                        ) : null}
                    </View>

                    <View>
                        <Text className={`mb-1.5 text-[12px] font-semibold ${errors.prodi ? 'text-red-400' : 'text-text/60'}`}>
                            Program Studi
                        </Text>

                        <Dropdown
                            style={[
                                styles.dropdown,
                                !form.fakultas && styles.dropdownDisabled,
                                errors.prodi && styles.dropdownError,
                            ]}
                            containerStyle={styles.dropdownContainer}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            inputSearchStyle={styles.dropdownSearchInput}
                            itemTextStyle={styles.dropdownItemText}
                            data={prodiData}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={form.fakultas ? "Pilih program studi" : "Pilih fakultas dulu"}
                            searchPlaceholder="Cari prodi..."
                            value={form.prodi}
                            disable={!form.fakultas}
                            onChange={(item) => {
                                updateForm('prodi', item.value);
                            }}
                        />
                        {errors.prodi ? (
                            <Text className="mt-1.5 text-[11px] text-red-400">{errors.prodi}</Text>
                        ) : null}
                    </View>

                    <InputField
                        label="Password"
                        placeholder="Buat password yang kuat"
                        value={form.password}
                        onChangeText={(value: string) => updateForm('password', value)}
                        icon={<AntDesign name="lock" size={20} color="rgba(0,0,0,.5)"/>}
                        secureTextEntry
                        error={errors.password}
                    />
                </View>

                <Pressable
                    onPress={handleRegisterPress}
                    className="mt-5 h-12 items-center justify-center rounded-xl bg-primary active:opacity-90"
                >
                    <View className="flex-row items-center gap-2">
                        <Text className="text-[15px] font-semibold text-primary-foreground">Daftar</Text>
                        <Text className="text-[16px] font-semibold text-primary-foreground">→</Text>
                    </View>
                </Pressable>

                {submitPreview ? (
                    <View className="mt-3 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                        <Text className="text-[12px] font-medium text-emerald-700">
                            Data registrasi siap dikirim ke API.
                        </Text>
                    </View>
                ) : null}

                <View className="mt-5 flex-row items-center justify-center">
                    <Text className="text-[13px] text-text-muted">Sudah punya akun? </Text>
                    <Link href="/login" asChild>
                        <Pressable hitSlop={6}>
                            <Text className="text-[13px] font-semibold text-primary">Login</Text>
                        </Pressable>
                    </Link>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    dropdown: {
        height: 48,
        borderWidth: 1,
        borderColor: '#D3D9D4',
        borderRadius: 10,
        paddingHorizontal: 12,
        backgroundColor: '#F5F7F6',
    },
    dropdownDisabled: {
        backgroundColor: '#F1F5F9',
    },
    dropdownError: {
        borderColor: '#f87171',
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#D3D9D4',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: '#AAB4AD',
    },
    dropdownSelectedText: {
        fontSize: 14,
        color: '#1F2937',
    },
    dropdownSearchInput: {
        height: 40,
        fontSize: 14,
        borderRadius: 8,
        borderColor: '#D3D9D4',
        color: '#1F2937',
        backgroundColor: '#F8FAFC',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#1F2937',
    },
});
