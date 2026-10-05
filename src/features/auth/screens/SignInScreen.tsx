import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthFormScreen } from '../components/AuthFormScreen';
import { AuthHeader } from '../components/AuthHeader';
import { AppText, Button, TextField } from '../../../components/ui';
import { spacing } from '../../../theme';
import { useForm } from '../../../hooks/useForm';
import { email as validateEmail, required } from '../../../utils/validation';
import { useAppDispatch } from '../../../store/hooks';
import type { AuthStackParamList } from '../../../navigation/types';
import { useSignInMutation } from '../api/authApi';
import { sessionStarted } from '../authSlice';

type Navigation = NativeStackNavigationProp<AuthStackParamList>;

type SignInValues = {
  email: string;
  password: string;
};

const schema = {
  email: validateEmail,
  password: required('Password'),
};

export function SignInScreen() {
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();
  const [signIn, { isLoading, error, reset }] = useSignInMutation();

  const submit = useCallback(
    async (values: SignInValues) => {
      const session = await signIn(values).unwrap();
      dispatch(sessionStarted(session));
    },
    [signIn, dispatch],
  );

  const form = useForm<SignInValues>({
    initialValues: { email: '', password: '' },
    schema,
    onSubmit: submit,
  });

  // A server error refers to the values as they were sent; clear it as soon as
  // the user edits anything, so a stale message never sits under a fixed form.
  const handleChange = useCallback(
    (field: keyof SignInValues) => {
      const props = form.fieldProps(field);
      return {
        ...props,
        onChangeText: (text: string) => {
          if (error) {
            reset();
          }
          props.onChangeText(text);
        },
      };
    },
    [form, error, reset],
  );

  return (
    <AuthFormScreen
      footer={
        <>
          <Button
            label="Sign in"
            loading={isLoading}
            disabled={form.isSubmitting}
            onPress={form.handleSubmit}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.replace('SignUp')}
            style={styles.switchLink}>
            <AppText variant="body" color="textMuted">
              Don't have an account?{' '}
              <AppText variant="bodyStrong">Sign up</AppText>
            </AppText>
          </Pressable>
        </>
      }>
      <AuthHeader
        showLogo
        title="Sign in"
        subtitle="Welcome back. Your basket and orders are waiting."
      />

      <View style={styles.fields}>
        <TextField
          label="Email address"
          icon="mail"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          {...handleChange('email')}
        />

        <TextField
          label="Password"
          icon="lock"
          placeholder="Your password"
          secure
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={form.handleSubmit}
          {...handleChange('password')}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgot}>
          <AppText variant="captionStrong" color="textAccent">
            Forgot password?
          </AppText>
        </Pressable>

        {error ? (
          <AppText variant="caption" color="danger">
            {'message' in error ? String(error.message) : 'Could not sign you in.'}
          </AppText>
        ) : null}
      </View>
    </AuthFormScreen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.lg, paddingTop: spacing.xxl },
  forgot: { alignSelf: 'flex-end' },
  switchLink: { alignItems: 'center', paddingVertical: spacing.sm },
});
