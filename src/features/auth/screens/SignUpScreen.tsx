import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthFormScreen } from '../components/AuthFormScreen';
import { AuthHeader } from '../components/AuthHeader';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { AppText, Button, Checkbox, TextField } from '../../../components/ui';
import { spacing } from '../../../theme';
import { useForm } from '../../../hooks/useForm';
import {
  compose,
  email as validateEmail,
  minLength,
  phoneNumber,
  required,
} from '../../../utils/validation';
import { useAppDispatch } from '../../../store/hooks';
import type { AuthStackParamList } from '../../../navigation/types';
import { useSignUpMutation } from '../api/authApi';
import { sessionStarted } from '../authSlice';

type Navigation = NativeStackNavigationProp<AuthStackParamList>;

type SignUpValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

const DIALLING_CODE = '+356';

const schema = {
  firstName: required('First name'),
  lastName: required('Last name'),
  email: validateEmail,
  phone: phoneNumber,
  password: compose(required('Password'), minLength(8, 'Password')),
};

export function SignUpScreen() {
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();
  const [signUp, { isLoading, error, reset }] = useSignUpMutation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const submit = useCallback(
    async (values: SignUpValues) => {
      const session = await signUp({
        ...values,
        phone: `${DIALLING_CODE}${values.phone.replace(/\D/g, '')}`,
      }).unwrap();
      dispatch(sessionStarted(session));
    },
    [signUp, dispatch],
  );

  const form = useForm<SignUpValues>({
    initialValues: { firstName: '', lastName: '', email: '', phone: '', password: '' },
    schema,
    onSubmit: submit,
  });

  const handleChange = useCallback(
    (field: keyof SignUpValues) => {
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
          <Checkbox
            checked={acceptedTerms}
            onChange={setAcceptedTerms}
            accessibilityLabel="I have read the Terms and Privacy agreement">
            <AppText variant="body" color="textMuted">
              I have read the <AppText variant="bodyStrong">Terms &amp; Privacy</AppText> agreement
            </AppText>
          </Checkbox>

          <Button
            label="Create account"
            loading={isLoading}
            // Terms are a legal gate, so they block submission outright rather
            // than surfacing as a field error after the fact.
            disabled={!acceptedTerms || form.isSubmitting}
            style={styles.submit}
            onPress={form.handleSubmit}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.replace('SignIn')}
            style={styles.switchLink}>
            <AppText variant="body" color="textMuted">
              Already have an account? <AppText variant="bodyStrong">Sign in</AppText>
            </AppText>
          </Pressable>
        </>
      }>
      <AuthHeader eyebrow="Let's get started" title="Create your account" />

      <View style={styles.fields}>
        <View style={styles.row}>
          <TextField
            label="First name"
            placeholder="Sara"
            autoComplete="given-name"
            textContentType="givenName"
            containerStyle={styles.rowItem}
            {...handleChange('firstName')}
          />
          <TextField
            label="Last name"
            placeholder="Borg"
            autoComplete="family-name"
            textContentType="familyName"
            containerStyle={styles.rowItem}
            {...handleChange('lastName')}
          />
        </View>

        <TextField
          label="Email"
          icon="mail"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          {...handleChange('email')}
        />

        <TextField
          label="Phone number"
          prefix={DIALLING_CODE}
          placeholder="9931 8386"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          {...handleChange('phone')}
        />

        <View style={styles.passwordBlock}>
          <TextField
            label="Password"
            icon="lock"
            placeholder="At least 8 characters"
            secure
            autoComplete="new-password"
            textContentType="newPassword"
            {...handleChange('password')}
          />
          <PasswordStrengthMeter password={form.values.password} />
        </View>

        {error ? (
          <AppText variant="caption" color="danger">
            {'message' in error ? String(error.message) : 'Could not create your account.'}
          </AppText>
        ) : null}
      </View>
    </AuthFormScreen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.lg, paddingTop: spacing.xl },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },
  passwordBlock: { gap: spacing.sm },
  submit: { marginTop: spacing.xs },
  switchLink: { alignItems: 'center', paddingVertical: spacing.sm },
});
