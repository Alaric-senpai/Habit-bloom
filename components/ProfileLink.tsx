import { View, Text, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MotiView } from 'moti'
import { ChevronRight } from 'lucide-react-native';

type props = {
    label: string;
    description?: string;
    onPress: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    variant?: 'default' | 'danger' | 'warning';
}

export default function ProfileLink({ 
    label, 
    description, 
    onPress, 
    icon,
    disabled = false,
    variant = 'default'
}: props) {
    const [pressedIn, setPressedIn] = useState<boolean>(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Trigger mount animation
        const timer = setTimeout(() => setMounted(true), 50)
        return () => clearTimeout(timer)
    }, [])

    const handleOnPress = () => {
        if (disabled) return;
        if (onPress) {
            onPress()
        }
    }

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    textColor: '#DC2626',
                    iconColor: '#DC2626',
                    bgColor: '#FEF2F2',
                    darkBgColor: '#7F1D1D',
                    borderColor: '#FECACA',
                    darkBorderColor: '#991B1B'
                };
            case 'warning':
                return {
                    textColor: '#D97706',
                    iconColor: '#D97706',
                    bgColor: '#FFFBEB',
                    darkBgColor: '#92400E',
                    borderColor: '#FED7AA',
                    darkBorderColor: '#B45309'
                };
            default:
                return {
                    textColor: '#1F2937',
                    iconColor: '#6B7280',
                    bgColor: '#FFFFFF',
                    darkBgColor: '#1F2937',
                    borderColor: '#E5E7EB',
                    darkBorderColor: '#374151'
                };
        }
    }

    const variantStyles = getVariantStyles();

    return (
        <MotiView
            from={{
                opacity: 0,
                scale: 0.95,
                translateY: 20,
            }}
            animate={{
                opacity: mounted ? 1 : 0,
                scale: mounted ? (pressedIn ? 0.88 : 1) : 0.95,
                translateY: mounted ? 0 : 20,
            }}
            transition={{
                type: 'spring',
                damping: 20,
                stiffness: 300,
            }}
            style={{
                marginBottom: 12,
            }}
        >
            <Pressable 
                onPressIn={() => !disabled && setPressedIn(true)} 
                onPressOut={() => setPressedIn(false)} 
                onPress={handleOnPress}
                disabled={disabled}
                style={{
                    backgroundColor: variantStyles.bgColor,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: variantStyles.borderColor,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                    opacity: disabled ? 0.6 : 1,
                }}
                className="dark:bg-gray-800 dark:border-gray-700"
            >
                <View className='w-full flex-row items-center justify-between'>
                    <View className='flex-row items-center flex-1'>
                        {icon && (
                            <MotiView
                                from={{ scale: 0, rotate: '-45deg' }}
                                animate={{ 
                                    scale: mounted ? 1 : 0,
                                    rotate: mounted ? '0deg' : '-45deg'
                                }}
                                transition={{
                                    type: 'spring',
                                    damping: 15,
                                    stiffness: 200,
                                    delay: 200,
                                }}
                                style={{
                                    marginRight: 12,
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: variant === 'default' ? '#F3F4F6' : `${variantStyles.bgColor}50`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                className="dark:bg-gray-700"
                            >
                                {icon}
                            </MotiView>
                        )}
                        <View className='flex-1'>
                            <MotiView
                                from={{ opacity: 0, translateX: -20 }}
                                animate={{ 
                                    opacity: mounted ? 1 : 0,
                                    translateX: mounted ? 0 : -20
                                }}
                                transition={{
                                    type: 'timing',
                                    duration: 300,
                                    delay: 300,
                                }}
                            >
                                <Text 
                                    style={{ 
                                        fontSize: 16,
                                        fontWeight: '600',
                                        color: variantStyles.textColor,
                                        marginBottom: description ? 4 : 0
                                    }}
                                    className="dark:text-white"
                                >
                                    {label}
                                </Text>
                                {description && (
                                    <Text 
                                        style={{
                                            fontSize: 14,
                                            color: '#6B7280',
                                            lineHeight: 20
                                        }}
                                        className="dark:text-gray-400"
                                    >
                                        {description}
                                    </Text>
                                )}
                            </MotiView>
                        </View>
                    </View>
                    
                    {!disabled && (
                        <MotiView
                            from={{ 
                                opacity: 0, 
                                translateX: 20,
                                rotate: '-90deg'
                            }}
                            animate={{ 
                                opacity: mounted ? 1 : 0,
                                translateX: mounted ? 0 : 20,
                                rotate: mounted ? '0deg' : '-90deg'
                            }}
                            transition={{
                                type: 'spring',
                                damping: 15,
                                stiffness: 200,
                                delay: 400,
                            }}
                            style={{
                                marginLeft: 8,
                            }}
                        >
                            <ChevronRight 
                                size={20} 
                                color={variantStyles.iconColor}
                            />
                        </MotiView>
                    )}
                </View>
            </Pressable>
        </MotiView>
    )
}