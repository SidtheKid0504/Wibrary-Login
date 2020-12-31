import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import BookTransaction from './screens/BookTrans';
import Search from './screens/Search';
import Login from './screens/Login';

export default class App extends React.Component {
  render() {
    return (
      <AppContainer />
    );
  }
}

const TabNavigator = createBottomTabNavigator({
  Search: {screen: Search},
  Transaction: {screen: BookTransaction}
},
{
defaultNavigationOptions: ({navigation}) => ({
    tabBarIcon: () => {
      const routeName = navigation.state.routeName;

      if (routeName === "Search") {
        return (
          <Image 
          source=  {require("./assets/searchingbook.png")}
          style={{width: 40, height: 40}}
          >
          </Image>
        )
      } else if (routeName === "Transaction") {
        return (
          <Image 
          source=  {require("./assets/book.png")}
          style={{width: 40, height: 40}}
          >
          </Image>
        )
      }
  }
})
});

const AppNavigator = createSwitchNavigator({
  LoginScreen: {screen:Login},
  TabNavigator: {screen: TabNavigator}
})
const AppContainer = createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
