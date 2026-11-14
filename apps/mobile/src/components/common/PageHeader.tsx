import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import { COLORS } from '../../utils/theme';

interface Props {

  title: string;

  subtitle?: string;

  onBack?: () => void;

  action?: string;

  onActionPress?: () => void;

}

export default function PageHeader({

  title,

  subtitle,

  onBack,

  action,

  onActionPress,

}: Props) {

  return (

    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}
    >

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}
      >

        <TouchableOpacity
          onPress={onBack}
          disabled={!onBack}
          style={{
            padding: 6,
            opacity: onBack ? 1 : 0,
          }}
        >

          <MaterialIcons
            name="arrow-back-ios"
            size={24}
            color={COLORS.primary}
          />

        </TouchableOpacity>

        <View
          style={{
            marginLeft: 8,
            flex: 1,
          }}
        >

          <Text
            style={{
              fontSize: 26,
              fontWeight: '700',
              color: COLORS.text,
            }}
          >
            {title}
          </Text>

          {subtitle && (

            <Text
              style={{
                marginTop: 4,
                color: COLORS.subtitle,
                fontSize: 14,
              }}
            >
              {subtitle}
            </Text>

          )}

        </View>

      </View>

      {action && (

        <TouchableOpacity
          onPress={onActionPress}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: '#ECFDF5',
          }}
        >

          <Text
            style={{
              color: COLORS.primary,
              fontWeight: '700',
              fontSize: 14,
            }}
          >
            {action}
          </Text>

        </TouchableOpacity>

      )}

    </View>

  );

}