import { Image, StyleSheet, Text, View } from 'react-native';
import { typography } from '../globalstyles/fonts';
import Logo1 from '../images/LogoCircle.png';


export default function HomeScreen() {
  return (
      <View style={styles.container}>
  <View style={styles.boxtop}>
    <Image source={Logo1} style={styles.logocircle} />

    <Text style={typography.title}>
      Se prepare para uma nova <Text style={{ color: '#F05221' }}>experiência</Text>
    </Text>

    <View style={styles.boxmid}>
      <Text style={[typography.title, { color: '#8D8D8D' }]}>
        Você está a poucos passos de criar o seu perfil e apresentar ao mundo!
      </Text>
    </View>

  </View>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  boxtop: {
    alignItems: 'center'
  },
  boxmid: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logocircle: {
    height: 175,
    width: 175,
  },
});
