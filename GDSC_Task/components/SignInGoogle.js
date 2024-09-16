import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import React, { useEffect } from 'react'
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"

const webClientId = '598544226113-kjt5pslsnf368kk6ut9tajd65qt232jv.apps.googleusercontent.com'
const androidClientId = '598544226113-9dcou2c06r27h1leorokbfv9q217fo16.apps.googleusercontent.com' 

WebBrowser.maybeCompleteAuthSession();

const SignInGoogle = () => {

    const config = {
        webClientId,
        androidClientId
    }

    const [request, response, promptAsync] = Google.useAuthRequest(config);

    const handleToken = () => {
        if(response?.type === "success"){
            const {authentication} = response;
            const token = authentication?.accessToken;
            console.log("access token", token)
        }
    }

    useEffect(()=>{
        handleToken();
    }, [response])

    return (
        <View style={styles.container}>
        <TouchableOpacity
            onPress={() => promptAsync()}
            style={styles.googleButton}
            disabled={!request}
        >
            <Image
            source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
            }}
            style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
        </View>
    )
}

export default SignInGoogle

const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      marginTop: 40,
    },
    googleButton: {
      flexDirection: 'row',
      backgroundColor: 'white',
      borderRadius: 5,
      paddingVertical: 10,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    googleIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
    },
    googleButtonText: {
      fontSize: 16,
      color: '#555',
      fontWeight: '500',
    },
  });