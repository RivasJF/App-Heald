import { StyleSheet, Text, View } from 'react-native'

export default function login(){
  return (
    <View style={styles.container}>
      <Text>Login Page</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  }
})