import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

import Constants from 'expo-constants';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  useNavigation,
} from '@react-navigation/native';

import Toast from 'react-native-toast-message';

import {
  useAuth,
} from '../../context/AuthContext';

import type {
  User,
} from '../../types/auth';

import ProfileInfoCard from '../../components/profile/ProfileInfoCard';
import ProfileActionCard from '../../components/profile/ProfileActionCard';
import LoadingScreen from '../../components/common/LoadingScreen';
import PageHeader from '../../components/common/PageHeader';

import {
  userService,
} from '../../services/userService';

import {
  COLORS,
} from '../../utils/theme';

export default function ProfileScreen() {

  const navigation =
    useNavigation<any>();

  const {
    logout,
  } = useAuth();

  const [
    profile,
    setProfile,
  ] = useState<User>();

  const [
    loading,
    setLoading,
  ] = useState(true);

  async function loadProfile() {

    try {

      const data =
        await userService.getProfile();

      setProfile(data);

    }

    catch {

      Toast.show({

        type: 'error',

        text1: 'Unable to load profile',

      });

    }

    finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadProfile();

  }, []);

  const handleLogout =
    useCallback(() => {

      Alert.alert(

        'Logout',

        'Are you sure you want to logout?',

        [

          {

            text: 'Cancel',

            style: 'cancel',

          },

          {

            text: 'Logout',

            style: 'destructive',

            onPress: logout,

          },

        ],

      );

    }, [logout]);

  const openChangePassword =
    useCallback(() => {

      navigation.navigate(
        'ChangePassword',
      );

    }, [navigation]);

  if (loading) {

    return (

      <LoadingScreen
        title="Loading Profile"
        subtitle="Retrieving your account information."
      />

    );

  }

  if (!profile) {

    return null;

  }

  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        contentContainerStyle={styles.content}
      >

        <PageHeader
          title="My Profile"
          subtitle="Manage your account information"
          onBack={() => navigation.goBack()}
        />

        <View
          style={styles.profileCard}
        >

          <View
            style={styles.avatar}
          >

            <Text
              style={styles.avatarText}
            >
              👤
            </Text>

          </View>

          <Text
            style={styles.name}
          >
            {profile.fullName}
          </Text>

          <Text
            style={styles.role}
          >
            {profile.role}
          </Text>

        </View>

        <View
          style={styles.infoCard}
        >

          <ProfileInfoCard
            label="Email"
            value={profile.email}
          />

          <ProfileInfoCard
            label="Organization"
            value={
              profile.organizationName ?? '-'
            }
          />

          <ProfileInfoCard
            label="Phone"
            value={
              profile.phone ?? '-'
            }
          />

          <ProfileInfoCard
            label="Status"
            value={
              profile.status ?? '-'
            }
          />

        </View>

        <View
          style={styles.actionsCard}
        >

          <ProfileActionCard
            title="Change Password"
            icon="lock"
            onPress={openChangePassword}
          />

          <ProfileActionCard
            title="Logout"
            icon="logout"
            onPress={handleLogout}
          />

        </View>

        <View
        style={styles.footer}
        >

        <Text
            style={styles.footerTitle}
        >
            PharmaGuard AI
        </Text>

        <Text
            style={styles.footerSubtitle}
        >
            Enterprise Pharmaceutical Safety Platform
        </Text>

        <Text
            style={styles.versionText}
        >
            Version {Constants.expoConfig?.version}
        </Text>

        <Text
            style={styles.copyrightText}
        >
            © 2026 PharmaGuard AI
        </Text>

    </View>

      </ScrollView>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor:
      COLORS.background,

  },

  content: {

    padding: 20,

  },

  profileCard: {

    backgroundColor: 'white',

    borderRadius: 20,

    padding: 24,

    alignItems: 'center',

    marginBottom: 24,

    elevation: 3,

  },

  avatar: {

    width: 90,

    height: 90,

    borderRadius: 45,

    backgroundColor: '#ECFDF5',

    justifyContent: 'center',

    alignItems: 'center',

  },

  avatarText: {

    fontSize: 48,

  },

  name: {

    fontSize: 22,

    fontWeight: '700',

    marginTop: 16,

  },

  role: {

    color: COLORS.subtitle,

    marginTop: 6,

  },

  infoCard: {

    backgroundColor: 'white',

    borderRadius: 20,

    padding: 20,

    marginBottom: 20,

    elevation: 3,

  },

  actionsCard: {

    backgroundColor: 'white',

    borderRadius: 20,

    padding: 10,

    marginBottom: 20,

    elevation: 3,

  },

  footer: {

    marginTop: 20,

    paddingVertical: 20,

    alignItems: 'center',

  },

  footerTitle: {

  fontSize: 20,

  fontWeight: '700',

  color: COLORS.text,

},

footerSubtitle: {

  marginTop: 6,

  color: COLORS.subtitle,

  textAlign: 'center',

},

versionText: {

  marginTop: 16,

  color: COLORS.subtitle,

  fontWeight: '600',

},

copyrightText: {

  marginTop: 8,

  color: COLORS.subtitle,

  fontSize: 12,

},

});