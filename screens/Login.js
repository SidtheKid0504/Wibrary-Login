import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Image, Alert } from 'react-native';
import db from '../config';

export default class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            emailID: "",
            password: ""
        }
    }

    loginCheck = async(email, password) => {
        if (email && password) {
            try {
                const response = await firebase.auth().signInWithEmailAndPassword(email, password);
                // console.log(response);
                if (response) {
                    console.log("Login Was Correct");
                    this.props.navigation.navigate("Transaction");
                }
            } catch(err) {
                switch (err.code) {
                    case 'auth/user-not-found':
                        Alert.alert("User Not Found");
                        console.log("User Not Found");
                        break
                    case 'auth/invalid-email':
                        Alert.alert("Invalid Email or Password");
                        console.log("Invalid Email or Password");
                        break
                }
            }
        } else {
            Alert.alert("Input an Email and Password");
            console.log("Input an Email and Password")
        }
    }

    render() {
        return(
            <KeyboardAvoidingView style={styles.container}>
                <View>
                    <Image 
                        source=  {require("../assets/booklogo.jpg")}
                        style={{width: 200, height: 200, justifyContent: "center", alignItems: "center"}}
                    />
                    <Text style={styles.headerText}>Wibrary</Text>
                </View>
                <View>
                    <TextInput
                        style={styles.loginBar}
                        placeholder="abc@example.com"
                        keyboardType="email-address"
                        onChangeText={(text) => {
                            this.setState({
                                emailID: text
                            });
                        }}
                    />
                    <TextInput
                        style= {styles.loginBar}
                        placeholder= "Enter Password"
                        secureTextEntry= {true}
                        onChangeText= {(text) => {
                            this.setState({
                                password: text
                            });
                        }}
                    />
                </View>
                <View>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress= {() => {
                            this.loginCheck(this.state.emailID, this.state.password);
                        }}
                    >
                        <Text style={{textAlign:"center"}}>Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        marginTop: 20
    },
    loginBar: {
        borderWidth: 2,
        justifyContent: "center",
        alignItems: 'center',
        backgroundColor: 'lightgreen',
        width: 300,
        height: 40, 
        paddingLeft: 10,
        margin: 10,
        fontSize: 18,
        textAlign: "center",
    },
    headerText: {
        fontSize: 18,
        alignSelf: "center"
    },
    loginButton: {
        backgroundColor: "lightblue",
        borderWidth: 2,
        justifyContent: "center",
        textAlign: "center",
        marginTop: 20,
        width: 150,
        height: 50,
        alignSelf: "center"
    }
});