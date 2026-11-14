import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Props {

  label: string;

  active: boolean;

  onPress(): void;

}

export default function FilterChip({

  label,

  active,

  onPress,

}: Props) {

  return (

    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active && styles.activeChip,
      ]}
    >

      <Text
        style={[
          styles.text,
          active && styles.activeText,
        ]}
      >
        {label}
      </Text>

    </TouchableOpacity>

  );

}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,

    minWidth: 100,      // <-- Add this
    height: 42,         // <-- Add this

    borderRadius: 25,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,

    marginRight: 10,

    justifyContent: 'center',
    alignItems: 'center',
  },

  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  text: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },

  activeText: {
    color: 'white',
  },
});