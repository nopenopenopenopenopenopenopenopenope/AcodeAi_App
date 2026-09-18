import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import { getStoredUser } from '../components/storageFuncs';

export default function Splash({
  navigation,
  state,
  handler,
  onAuthenticated,
}) {
  const opaque = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = await getStoredUser();
      if (storedUser) {
        onAuthenticated?.(storedUser);
      }
    };
    fetchData();
    Animated.sequence([
      Animated.delay(700),
      Animated.timing(opaque, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      handler(false);
    });
  }, []);

  const prototypeWidth = Dimensions.get('window').width;
  return (
    <Animated.View
      style={{
        opacity: opaque,
        position:"absolute",
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        zIndex: 999,
        backgroundColor: '#F5F5F5',
      }}
      pointerEvents="none">
      <Image
        resizeMode={'contain'}
        style={{
          width: prototypeWidth / 1.1,
          height: '100%',
          alignSelf: 'center',
          justifyContent: 'center',
        }}
        source={require('../assets/Logo.png')}
      />
    </Animated.View>
  );
}