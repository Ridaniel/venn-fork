import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {fonts} from '../themes/fonts.themes';

const ErrorComponent = ({text, size = 14, style}: any) => {
  return (
    <View style={{...styles.errorContainer, ...style}}>
      <Text style={{...styles.error, fontSize: size}}>{text}</Text>
    </View>
  );
};

export default ErrorComponent;

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: 'white',
  },
  error: {
    fontFamily: fonts.ArialRoundedMT,
    textAlign: 'left',
    color: '#FF2424',
  },
});
