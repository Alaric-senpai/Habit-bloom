import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { ChevronRight } from 'lucide-react-native'

type ProfileLinkProps = {
  label: string
  description?: string
  onPress: () => void
  icon?: React.ReactNode
  disabled?: boolean
  variant?: 'default' | 'danger' | 'warning'
}

export default function ProfileLink({ 
  label, 
  description, 
  onPress, 
  icon,
  disabled = false,
  variant = 'default'
}: ProfileLinkProps) {
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-destructive/10 border-destructive/20'
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/20'
      default:
        return 'bg-card border-border'
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-destructive'
      case 'warning':
        return 'text-orange-500'
      default:
        return 'text-foreground'
    }
  }

  return (
    <Pressable 
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-between p-4 rounded-lg mb-3 active:opacity-70 ${getVariantClasses()} ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <View className='flex-row items-center flex-1 gap-3'>
        {icon && (
          <View className='w-8 h-8 items-center justify-center'>
            {icon}
          </View>
        )}
        <View className='flex-1'>
          <Text className={`font-medium ${getTextColor()}`}>
            {label}
          </Text>
          {description && (
            <Text className='text-xs text-muted-foreground mt-0.5'>
              {description}
            </Text>
          )}
        </View>
      </View>
      
      {!disabled && (
        <ChevronRight size={18} className='text-muted-foreground' />
      )}
    </Pressable>
  )
}
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