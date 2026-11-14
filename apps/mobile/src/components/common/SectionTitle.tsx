import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Props {

  title: string;

  action?: string;

  onPress?(): void;

}

export default function SectionTitle({

  title,

  action,

  onPress,

}: Props) {

  return (

    <View

      style={{

        flexDirection: 'row',

        justifyContent: 'space-between',

        alignItems: 'center',

        marginTop: 30,

        marginBottom: 16,

      }}

    >

      <Text

        style={{

          fontSize: 22,

            fontWeight: '700',

            color: COLORS.text,

        }}

      >

        {title}

      </Text>

      {

        action && (

          <TouchableOpacity

            onPress={onPress}

            style={{
                paddingVertical: 4,
                paddingHorizontal: 4,
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

        )

      }

    </View>

  );

}