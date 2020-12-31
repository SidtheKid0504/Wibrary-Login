// Imports
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, TinyToast} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import { askAsync } from 'expo-permissions';
import firebase from 'firebase'
import db from '../config';

// Default Book Trans Class
export default class BookTransaction extends React.Component {
    // Custom Constructor with States
    constructor() {
        super();
        this.state = {
            hasCameraPermission: null,
            scanned: false,
            buttonState: "normal",
            scanBookID: '',
            scanStudentID: '',
            transactionMessage: '',
        }
    }

    getCam = async (id) => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermission: status === "granted",
            buttonState: id,
            scanned: false
        });
    }

    handleBarCodeScanned = async ({ type, data }) => {
        const {buttonState} = this.state;
        if (buttonState === "BookID") {
            this.setState({
                scanned: true,
                scanBookID: data,
                buttonState: "normal"
            });
        } else if (buttonState === "StudentID") {
            this.setState({
                scanned: true,
                scanStudentID: data,
                buttonState: "normal"
            });
        }
    };

    handleTransaction = async() => {
        var transactionType = await this.checkBookEligibility();
        console.log(transactionType);

        if (!transactionType) {
            Alert.alert("Book Doesn't Exist in the Library");
            this.setState({
                scanBookID: '',
                scanStudentID: ''
            });

        } else if (transactionType === "issue") {
            var ifStudentEligible = await this.checkStudentEligibilityForBookIssue();
            if (ifStudentEligible) {
                this.initateBookIssue();
                Alert.alert("Book Issued");
            } 
        } else {
            var ifStudentEligible = await this.checkStudentEligibilityForBookReturn();
            if (ifStudentEligible) {
                this.initateBookReturn();
                Alert.alert("Book Return");
            } 
        }
    }

    initateBookIssue = async() => {
        Alert.alert(this.state.scanBookID + ":" + this.state.scanStudentID)
        await db.collection("transactions").add({
            studentID: this.state.scanStudentID,
            bookID: this.state.scanBookID,
            date: firebase.firestore.Timestamp.now().toDate(),
            transactionType: "issue"
        });

        await db.collection("books").doc(this.state.scanBookID).update({
           bookAvailable: false 
        });

        await db.collection("students").doc(this.state.scanStudentID).update({
            numOfBooksIssued: firebase.firestore.FieldValue.increment(1)
        });
        // Alert.alert("Book Issued");
        // TinyToast.show(this.state.transactionMessage, TinyToast.SHORT);
    }

    checkBookEligibility = async() => {
        const BOOK_REF = await db.collection("books").where("bookID", "==", this.state.scanBookID).get();
        var transactionType = '';

        if (BOOK_REF.docs.length === 0) {
            // If Book Doesn't Exist in the Library
            transactionType = false;
            console.log("Book Doesn't Exits in Library");
            Alert.alert("Book Doesn't Exits in Library");
        } else {
            BOOK_REF.docs.map((doc) => {
                var bookInfo = doc.data();
                if (bookInfo.bookAvailable) {
                    transactionType = "issue"
                } else {
                    transactionType = "return";
                }
            });
        }
        return transactionType;
    }

    checkStudentEligibilityForBookIssue = async() => {
        const STUDENT_REF = await db.collection("students").where("studentID", "==", this.state.scanStudentID).get();
        var isStudentEligible = '';
        
        if (STUDENT_REF.docs.length === 0) {
            // If Student Does Not Exist in DB
            this.setState({
                scanBookID: '',
                scanStudentID: ''
            });
            Alert.alert("Student Does Not Exist")
            isStudentEligible = false;
        } else {
            // If Student Exists in DB
            STUDENT_REF.docs.map((doc) => {
                var student = doc.data();
                if (student.numOfBooksIssued < 2) {
                    isStudentEligible = true;
                } else {
                    isStudentEligible = false;
                    Alert.alert("Too Many Books Issued");
                    this.setState({
                        scanBookID: '',
                        scanStudentID: ''
                    });
                }
            });
        }
        return isStudentEligible;
    }

    checkStudentEligibilityForBookReturn = async() => {
        const TRANSACTION_REF = await db.collection("transactions").where("bookID", "==", this.state.scanBookID).limit(1).get();
        var isStudentEligible = '';

        TRANSACTION_REF.docs.map((doc) => {
            var lastTransactionInfo = doc.data();
            if (lastTransactionInfo.studentID === this.state.scanStudentID) {
                isStudentEligible = true;
            } else {
                isStudentEligible = false;
                Alert.alert("Book Wasn't Issued to Student");
                this.setState({
                    scanBookID: '',
                    scanStudentID: ''
                });
            }
        });
        return isStudentEligible; 
    }

    initateBookReturn = async() => {
        await db.collection("transactions").add({
            studentID: this.state.scanStudentID,
            bookID: this.state.scanBookID,
            date: firebase.firestore.Timestamp.now().toDate(),
            transactionType: "return"
        });

        await db.collection("books").doc(this.state.scanBookID).update({
           bookAvailable: true
        });

        await db.collection("students").doc(this.state.scanStudentID).update({
            numOfBooksIssued: firebase.firestore.FieldValue.increment(-1)
        });
        Alert.alert("Book Returned");
        // TinyToast.show(this.state.transactionMessage, TinyToast.SHORT);

    }

    render() {
        const hasCameraPermissions = this.state.hasCameraPermission;
        const scan = this.state.scanned;
        const buttonState = this.state.buttonState;

        if (buttonState != "normal" && hasCameraPermissions) {
            return(
                <BarCodeScanner 
                onBarCodeScanned = {scan ? undefined : this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
                >
                </BarCodeScanner>
            ) 
        } else if (buttonState === "normal"){
            return (
                <KeyboardAvoidingView style={styles.container} behavior= "padding" enabled>
                    <View>
                        <Image 
                        source=  {require("../assets/booklogo.jpg")}
                        style={{width: 200, height: 200}}
                        />
                        <Text style={styles.displayText}>Wibrary</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput 
                        placeholder= "Book ID" 
                        style={styles.inputBox}
                        value={this.state.scanBookID}
                        onChangeText = {text => {
                            this.setState({
                                scanBookID: text
                            })
                        }}
                        />
                        <TouchableOpacity style={styles.scanButton} onPress = {
                            ()=> {
                                this.getCam("BookID");
                            }}
                            >
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput 
                        placeholder= "Student ID" 
                        style={styles.inputBox}
                        value={this.state.scanStudentID}
                        onChangeText = {text => {
                            this.setState({
                                scanStudentID: text
                            })
                        }}
                        />
                        <TouchableOpacity style={styles.scanButton} onPress = {
                            ()=> {
                                this.getCam("StudentID");
                            }}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity style={styles.submitButton} onPress={async () => {
                        this.handleTransaction();
                        // this.setState({
                        //     scanBookID: '',
                        //     scanStudentID: ''
                        // });
                    }}> 
                    <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    
                </KeyboardAvoidingView>
            );   
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    displayText: {
        textDecorationLine:'underline',
        fontSize: 30,
        textAlign: 'center'
    },
    buttonText: {
        marginTop: 15,
        textDecorationLine: 'underline',
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center'
    },
    scanButton: {
        width: 100,
        borderRadius: 20,
        backgroundColor: '#0000FF',
        borderWidth: 2
    },
    inputView : {
        flexDirection: 'row',
        margin: 20
    },
    inputBox: {
        width: 200,
        height: 50,
        borderWidth: 2,
        borderRadius: 10,
        fontSize: 20,
    },
    submitButton: {
        backgroundColor: 'red',
        width: 100,
        height: 50
    }
});