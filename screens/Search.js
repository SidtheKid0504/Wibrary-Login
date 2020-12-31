import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { ScrollView} from 'react-native-gesture-handler';
import db from '../config';

export default class Search extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            allTransactions: [],
            lastTransaction: null,
            search: ""
        }
    }

    componentDidMount = async() => {
        const query = await db.collection("transactions").get();
        query.docs.map((doc) => {
            this.setState({
                allTransactions: [...this.state.allTransactions, doc.data()]
            })
        });
    }

    render() {
        return(
            <View style={styles.container}>
                <View style={styles.searches}>
                    <TextInput 
                        placeholder= {"Enter Book or Student ID"} 
                        onChangeText= {(text) => {
                            this.setState({
                                search: text
                            });
                        }}
                        style={styles.searchBar}
                    />

                    <TouchableOpacity 
                        style={styles.searchButton} 
                        onPress= {() => {
                            this.searchTransaction(this.state.search);
                        }}
                    >
                        <Text style={styles.searchText}>Search</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data= {this.state.allTransactions}
                    renderItem= {({item}) => (
                        <View style={styles.container}>
                            <Text>{"Book ID: " + item.bookID}</Text>
                            <Text>{"Date: " + item.date.toDate()}</Text>
                            <Text>{"Student ID: " + item.studentID}</Text>
                            <Text>{"Transaction Type: " + item.transactionType}</Text>
                        </View>
                        )}
                        keyExtractor= {(item, index) => {
                            index.toString();
                        }}
                        onEndReached= {this.fetchMoreTransactions}
                        oneEndReachedThreshold= {0.7}
                    />
            </View>
        )
    }

    fetchMoreTransactions = async() => {
        var searchText = this.state.search.toLowerCase();
        var enterText = searchText.split('');
        console.log(enterText);
        if (enterText[0].toUpperCase() === "B") {
            const query = await db.collection("transactions").where("bookID", "==", searchText)
            .startAfter(this.state.lastTransaction).limit(10).get();

            query.docs.map((doc) => {
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastTransaction: doc
                })
            });
        } else if (enterText[0].toUpperCase() === "S") {
            const query = await db.collection("transactions").where("studentID", "==", searchText)
            .startAfter(this.state.lastTransaction).limit(10).get();

            query.docs.map((doc) => {
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastTransaction: doc
                })
            });
        }
    } 

    searchTransaction = async(searchText) => {
        var enterText = searchText.split('');
        var searchText = searchText.toLowerCase();

        if (enterText[0].toUpperCase() === "B") {
            const query = await db.collection("transactions").where("bookID", "==", searchText).get();
            query.docs.map((doc) => {
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastTransaction: doc
                })
            });
        } else if (enterText[0].toUpperCase() === "S") {
            const query = await db.collection("transactions").where("studentID", "==", searchText).get();
            query.docs.map((doc) => {
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    lastTransaction: doc
                })
            });
        }
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
    },
    searchBar: {
        borderWidth: 0.5,
        alignItems: 'center',
        backgroundColor: 'lightgreen',
        width: 'auto',
        height: 40, 
        flexDirection: 'row',
        fontSize: 18,
        textAlign: "center",

    },
    searchText: {
        fontSize: 18,
        alignSelf: "center"
    },
    searchButton: {
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