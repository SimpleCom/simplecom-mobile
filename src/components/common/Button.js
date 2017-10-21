import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

// This component is a button. It looks like an iOS style button with a blue border. Displays 
// Text passed as a child from <Button> tag above it.

const Button = ({ onPress, children, style, textStyle }) => {
  const { buttonStyle, buttonTextStyle } = styles;

  return (
    <TouchableOpacity onPress={onPress} style={[buttonStyle, style]}>
      <Text style={[buttonTextStyle, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = {
  buttonTextStyle: {
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    fontWeight: '400',
    paddingLeft: 15,
    paddingRight: 15,
  },
  buttonStyle: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderRadius: 7,
    borderWidth: 1,
    height: 35
  }
};

export { Button };
