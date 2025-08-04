import { createContext, useContext, useState, useCallback } from 'react'
import { YStack, Text } from 'tamagui'
import { Dimensions } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'

type ToastVariant = 'default' | 'warn'

const ToastContext = createContext({
  showToast: (msg: string, variant?: ToastVariant) => {},
})

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const [variant, setVariant] = useState<ToastVariant>('default')

  const translateY = useSharedValue(-100)

  const showToast = useCallback((msg: string, variant: ToastVariant = 'default') => {
    setMessage(msg)
    setVariant(variant)
    setVisible(true)
    translateY.value = withTiming(0, { duration: 300 })

    setTimeout(() => {
      translateY.value = withTiming(-100, { duration: 300 })
      setTimeout(() => setVisible(false), 300)
    }, 2500)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const backgroundColor = variant === 'warn' ? '#fee2e2' : '#d1fae5'
  const textColor = variant === 'warn' ? '#991b1b' : '#065f46'

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {visible && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 30,
              alignSelf: 'center',
              width: Dimensions.get('window').width * 0.9,
              zIndex: 99999,
            },
            animatedStyle,
          ]}
        >
          <YStack
            bg={backgroundColor}
            px="$4"
            py="$3"
            br="$4"
            ai="center"
            shadowColor="black"
            shadowOpacity={0.2}
            shadowRadius={8}
          >
            <Text fontSize="$5" fontWeight="600" style={{ color: textColor }}>
              {message}
            </Text>
          </YStack>
        </Animated.View>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
