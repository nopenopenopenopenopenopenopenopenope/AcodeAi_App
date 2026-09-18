import { Text, View, StyleSheet, Image,TouchableOpacity } from 'react-native';
import { FontAwesome,FontAwesome5  } from '@expo/vector-icons';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from "./navigationRef";


export default function BottomMenu({prototypeHeight, prototypeWidth}) {
  const navigation = useNavigation();
  const [route, setRoute] = useState('');

useEffect(() => {
  const updateRoute = () => {
    if (navigationRef.isReady()) {
      setRoute(navigationRef.getCurrentRoute()?.name);
    }
  };

  updateRoute();

  const unsubscribe = navigationRef.addListener('state', updateRoute);

  return unsubscribe;
}, []);
  return (
    <View style={[styles.container,{height:prototypeHeight / 12}]}>
    <TouchableOpacity disabled={route === "home"} onPress={() => navigation.navigate('home')}>
    <FontAwesome5 name={"home"} size={prototypeWidth / 11} color='#fff' style={{opacity: route === "home"? 0.6:1}}/>
    </TouchableOpacity>
    <TouchableOpacity disabled={route === "medicine"} onPress={() => navigation.navigate('medicine')}>
    <FontAwesome5 name={"pills"} size={prototypeWidth / 11} color='#fff' style={{opacity: route === "medicine"? 0.6:1}}/>
    </TouchableOpacity>
    <TouchableOpacity disabled={route === "info"} onPress={() => navigation.navigate('info')}>
    <FontAwesome5 name={"info-circle"} size={prototypeWidth / 11} color='#fff' style={{opacity: route === "info"? 0.6:1}}/>
    </TouchableOpacity>
    <TouchableOpacity disabled={route === "calendar"} onPress={() => navigation.navigate('calendar')} >
    <FontAwesome5 name={"calendar-alt"} size={prototypeWidth / 11} color='#fff' style={{opacity: route === "calendar"? 0.6:1}}/>
    </TouchableOpacity>
    <TouchableOpacity disabled={route === "stock"} onPress={() => navigation.navigate('stock')}>
    <FontAwesome5 name={"pallet"} size={prototypeWidth / 11} color='#fff' style={{opacity: route === "stock"? 0.6:1}}/>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection:'row',
    padding: 24,
    position:'absolute',
    bottom:0,
    width:"100%",
    backgroundColor:'#36A06F'    
  },
});
