import { Text, View, StyleSheet, Image, Animated, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { FontAwesome,FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from "./navigationRef";




export default function topMenu({prototypeHeight = 956,prototypeWidth = 440, userImg, onLogout}) {
  const pos = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();
  const [route, setRoute] = useState('');

useEffect(() => {
  const updateRoute = () => {
    if (navigationRef.isReady()) {
      setRoute(navigationRef.getCurrentRoute()?.name);
      setOpen(false);
    Animated.spring(pos,{
      toValue:0,
      speed:40,
      bounciness:10
    }).start();
    }
  };

  updateRoute();

  const unsubscribe = navigationRef.addListener('state', updateRoute);

  return unsubscribe;
}, []);
  const toggleMenuOn = () => {
    Animated.spring(pos, {
      toValue: open? 0:1,
      speed:40,
      bounciness:10
    }).start();
    setOpen(!open);
  };
  const ammount = 0.1
  return (
    <View style={[styles.container,{width:prototypeWidth / 1.08,alignSelf:'center',marginTop:prototypeHeight / 80,}]}>
    <View style={[styles.topPart,{height : prototypeHeight / 10,width:"100%" }]}>
    <TouchableOpacity onPress={toggleMenuOn}>
    <FontAwesome name={"navicon"} size={prototypeWidth / 11} color='#000' style={{marginLeft:prototypeWidth / 20}}/>
    </TouchableOpacity>
    <TouchableOpacity disabled={route === "home"} onPress={() => navigation.navigate('home')}>
    <Image source={require('../assets/Logo.png')} resizeMode={'contain'} style={{minWidth:prototypeWidth / 4,height: prototypeHeight / 14, marginLeft:prototypeWidth / 20}}/>
    </TouchableOpacity>
    <View style={{flexDirection:'row',flex:1,justifyContent:'flex-end',paddingRight:prototypeWidth / 20}}>
    <TouchableOpacity disabled={route === "profile"} onPress={() => navigation.navigate('profile')}>
    <Image source={{ uri: userImg || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJoAAACUCAMAAABcK8BVAAAAP1BMVEX///+ZmZmVlZXa2tqSkpLT09P7+/uvr6+Pj4+cnJypqan4+Pijo6Ps7Ozo6Ojf39/ExMS2tra9vb3Nzc3y8vJNRIxZAAAFOElEQVR4nO1c6XLzKgyNMV4w3s37P+tnJ2kTL/hIgN17Zzg/OtNOQw+SQCt9PCIiIiIiIiIiIiIi/lfQpsv6oaieKIY+64zO/5rU49GmfaFkKaUQyRNCyPnbpOrT9k95jZUSP5zWmH+qqvFv2OVdn5SHrL74VmVKMlUZk1CTh8CtVzDBmYFhKCcQSpQmZ+ozM3RgAAAAAAAABMBWMU0AjRrKIuySG62aBkyYlPaz43CKKhJwEGB88AKzOAMzqfeOT5cl1peYmVVDLPSdGQqpVrJQ4zUUYKb2C2ucms5nmLSCPV88BMFNvWFzNPQVEp6rgvWEL26HOiX4ud8FeAkCg9p8Fna+tEFJwU3UElGO7Ze3ydsRtZfXH+eVAVnUltZYMbWvO6CdCsUr/V5LbYYsS/nzlQcuNRmqg0GgdqWtCbkBuRTuQI18K4lS1kM/ZStM/VBL+lHg3WsdjVeixtQyo6PTsSa2nHnUSD5UFumpZzYpqU3DdFSEfENUePAlbwkpBjfdQxUBoYhHPoPl5oqZHIAC1oFzssEgwXELWefumZc8nq/FbqWlZ3EgN6095YardBvo0n5G+W25s3y0ZHc27MxcynXjyU75i9mM160FbA3gHHouqVUHTq0lbdUBvwjeWC5dpjP+hS1gsLXfznCcJLs3bywqdZleOD5VqMxhx3EuL12a8IdlLJ+O16HY2CWsJ47qAj59wqMmpOM0ykEzVOCitx1HNWeHSu6Cg34EauWd46DR5zpelO2X8prO2E+MOB2CBfueIbskvF5v76yc19rdH54jVNur0llo+wKgQ41/hW1w5DNOsfEuzk3fn+XW1Fx93gvr4JldR99gU/H3m0xct0tKz1npZkXN3ee9sKqvS19q3wr1H6/7Vqk/tc/1EWDQtLmKWoBB+i+fID3Hy82HGrOoZsFnGktMqRc+TtR/sO4J/WVuwg8fQws0NUyozfAgqmAPDxoZdprZ12ZX3IJWdplNKYCW1Qk4h+8VtOOGR21pEGFltgBPjNKYqQue3pgQ8/OMkiEH+Ujsvdoh+6ueUqV+ShXqwkePjY9SL34al2euL+OEyK5+UGhGVgPql9l4xxvRrmIfh7K66EXcnlzBkZwQxV3EHssb6YLakpVlcfdLadNX+ESIpOpve4f8Bd31qrSHS0Iuj3FCP9Cjw0xDrbYPqJZ4VtXDfe+2bdBNmo1Dpd5d7oXUmKXN34lrizzX2hijtc7/A//5ISIiIiIiIiIiIiKCi3/HUDjyBUAomQAAAABJRU5ErkJggg=='}} style={{width:prototypeHeight / 14,height: prototypeHeight / 14}}/>
    </TouchableOpacity>
    </View>
    </View>
    <Animated.View style={[styles.bottomPart,{transform: [
      {
        translateY: pos.interpolate({
          inputRange: [0, 1],
          outputRange: [10, prototypeHeight / 9]
        })
      }
    ],},{height : prototypeHeight / 14, maxWidth:prototypeWidth / 1.08, padding:prototypeWidth / 20, gap:prototypeWidth / 20 }]}>
    <TouchableOpacity >
    <FontAwesome name={"file-text"} size={prototypeHeight / 35} color='#000' style={{}}/>
    </TouchableOpacity>
    <TouchableOpacity >
    <FontAwesome name={"bluetooth-b"} size={prototypeHeight / 35} color='#000' style={{}}/>
    </TouchableOpacity>
    <TouchableOpacity >
    <FontAwesome name={"cutlery"} size={prototypeHeight / 35} color='#000' style={{}}/>
    </TouchableOpacity>
    <TouchableOpacity disabled={route === "reports"} onPress={() => navigation.navigate('reports')}>
    <FontAwesome5 name={"clipboard-list"} size={prototypeHeight / 35} color={route === "reports"? '#999':'#000'} style={{}}/>
    </TouchableOpacity>
    <TouchableOpacity onPress={onLogout}>
    <FontAwesome name={"sign-out"} size={prototypeHeight / 35} color='#000' style={{}}/>
    </TouchableOpacity>    
    </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    position:'absolute',
    top:0,
    
  },
  topPart:{
    borderRadius:9,
    backgroundColor:"#ffffff",
    boxShadow:'0 2px 5px rgba(0, 0, 0, 0.1)',
    zIndex:2,
    alignItems:'center',
    flexDirection:'row',
    
  },
  bottomPart:{
    borderRadius:9,
    backgroundColor:"#ffffff",
    boxShadow:'0 2px 5px rgba(0, 0, 0, 0.1)',
    position:'fixed',
    flexDirection:'row',
    alignItems:'center',
  },
  paragraph: {
    margin: 24,
    marginTop: 0,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
    height: 128,
    width: 128,
  }
});