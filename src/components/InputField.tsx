import { Text, TextInput, View } from "react-native";
import {ReactNode} from "react";

type InputFieldProps = {
    label: string;
    placeholder: string;
    value?: string;
    onChangeText?: (value: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    icon: ReactNode;
    error?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function InputField({
                               label,
                               placeholder,
                               value,
                               onChangeText,
                               secureTextEntry = false,
                               keyboardType = 'default',
                               icon,
                               error,
                               autoCapitalize = 'sentences',
                           }: InputFieldProps) {
    return (
        <View>
            <Text className="mb-1.5 text-[12px] font-semibold text-text/60">{label}</Text>
            <View
                className={`h-12 flex-row items-center rounded-[10px] border bg-surface-muted px-3 ${
                    error ? 'border-red-400' : 'border-input'
                }`}
            >
                <Text
                    className={`w-4 text-center text-[13px] ${
                        error ? 'text-red-400' : 'text-placeholder'
                    }`}
                >
                    {icon}
                </Text>
                <TextInput
                    className="ml-2 flex-1 p-0 text-[14px] text-text"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    placeholderTextColor={error ? '#f87171' : '#AAB4AD'}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize={autoCapitalize}
                />
                {error && (
                    <Text className="text-[16px] text-red-400">⚠</Text>
                )}
            </View>
            {error && (
                <Text className="mt-1.5 text-[11px] text-red-400">{error}</Text>
            )}
        </View>
    );
}
