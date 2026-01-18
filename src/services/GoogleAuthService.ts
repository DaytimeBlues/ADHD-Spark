import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';

const GOOGLE_CLIENT_ID = '474078142013-dftko9eohdbbmoeg407sr99qesm3ptlq.apps.googleusercontent.com';

const GoogleAuthService = {
  async configure() {
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID,
      scopes: [
        'https://www.googleapis.com/auth/tasks',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'openid',
      ],
    });
  },

  async signIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      return {success: true, user: userInfo};
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return {success: false, error: 'Sign in cancelled'};
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return {success: false, error: 'Sign in in progress'};
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {success: false, error: 'Play services not available'};
      } else {
        return {success: false, error: error.message};
      }
    }
  },

  async signOut() {
    try {
      await GoogleSignin.signOut();
      return {success: true};
    } catch (error: any) {
      return {success: false, error: error.message};
    }
  },

  async getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo;
    } catch (error) {
      return null;
    }
  },

  async getTokens() {
    try {
      const tokens = await GoogleSignin.getTokens();
      return tokens;
    } catch (error) {
      return null;
    }
  },
};

export default GoogleAuthService;
