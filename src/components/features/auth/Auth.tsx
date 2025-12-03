import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../../utils/supabase';

export const AuthComponent = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="glass-card w-full max-w-sm lg:mx-[15%]">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <a href="#" className="flex flex-col items-center gap-3 font-medium">
            <div className="flex size-12 items-center justify-center rounded-xl" style={{ backgroundColor: '#4F39F6' }}>
              <span className="text-2xl">🐔</span>
            </div>
            <span className="sr-only">ChickenCare</span>
          </a>
          <h1 className="text-2xl font-bold font-serif" style={{ color: '#111827' }}>
            Welcome to ChickenCare
          </h1>
        </div>

        {/* Auth Form - Email/Password Only */}
        <div className="flex flex-col gap-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4F39F6',
                    brandAccent: '#2A2580',
                    brandButtonText: '#FFFFFF',
                    defaultButtonBackground: '#FFFFFF',
                    defaultButtonBackgroundHover: '#F9FAFB',
                    defaultButtonBorder: '#E5E7EB',
                    defaultButtonText: '#111827',
                    dividerBackground: '#E5E7EB',
                    inputBackground: '#FFFFFF',
                    inputBorder: '#E5E7EB',
                    inputBorderHover: '#6B5CE6',
                    inputBorderFocus: '#4F39F6',
                    inputText: '#111827',
                    inputLabelText: '#111827',
                    inputPlaceholder: '#6B7280',
                    messageText: '#EF4444',
                    messageTextDanger: '#EF4444',
                    anchorTextColor: '#4F39F6',
                    anchorTextHoverColor: '#2A2580',
                  },
                  space: {
                    spaceSmall: '8px',
                    spaceMedium: '16px',
                    spaceLarge: '24px',
                    labelBottomMargin: '8px',
                    anchorBottomMargin: '16px',
                    emailInputSpacing: '16px',
                    socialAuthSpacing: '24px',
                    buttonPadding: '12px 16px',
                    inputPadding: '12px 16px',
                  },
                  fontSizes: {
                    baseBodySize: '16px',
                    baseInputSize: '16px',
                    baseLabelSize: '14px',
                    baseButtonSize: '16px',
                  },
                  fonts: {
                    bodyFontFamily: `Fraunces, serif`,
                    buttonFontFamily: `Fraunces, serif`,
                    inputFontFamily: `Fraunces, serif`,
                    labelFontFamily: `Fraunces, serif`,
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                anchor: 'text-sm transition-colors font-serif',
                button: 'shiny-cta w-full h-12 font-medium transition-all rounded-lg hover:scale-[1.02]',
                container: 'flex flex-col gap-6',
                divider: 'relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t',
                input: 'h-12 w-full rounded-lg border transition-all px-4 py-3 font-serif focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50',
                label: 'text-sm font-medium font-serif',
                loader: 'h-4 w-4 animate-spin',
                message: 'text-sm font-serif',
              },
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/`}
            showLinks={true}
            magicLink={true}
            theme="light"
            view="sign_in"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'm@example.com',
                  password_input_placeholder: 'Enter your password',
                  button_label: 'Login',
                  loading_button_label: 'Logging in...',
                  link_text: "Don't have an account? Sign up",
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  email_input_placeholder: 'm@example.com',
                  password_input_placeholder: 'Create a password',
                  button_label: 'Create account',
                  loading_button_label: 'Creating account...',
                  link_text: 'Already have an account? Sign in',
                  confirmation_text: 'Check your email to confirm your account',
                },
              },
            }}
          />

          {/* Divider */}
          <div className="relative text-center text-sm font-serif" style={{ color: '#6B7280' }}>
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" style={{ borderColor: '#E5E7EB' }}></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-medium">
              <span className="px-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4F39F6',
                    brandAccent: '#2A2580',
                    brandButtonText: '#FFFFFF',
                    defaultButtonBackground: '#FFFFFF',
                    defaultButtonBackgroundHover: '#F9FAFB',
                    defaultButtonBorder: '#E5E7EB',
                    defaultButtonText: '#111827',
                  },
                  space: {
                    buttonPadding: '12px 16px',
                    socialAuthSpacing: '8px',
                  },
                  fontSizes: {
                    baseButtonSize: '16px',
                  },
                  fonts: {
                    buttonFontFamily: `Fraunces, serif`,
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                  },
                },
              },
              className: {
                button: 'neu-button-secondary w-full h-12 font-medium transition-all rounded-lg hover:scale-[1.02] border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-100 hover:text-purple-700 !flex !items-center !justify-center !gap-2',
                container: 'flex flex-col gap-6',
              },
            }}
            providers={['google']}
            onlyThirdPartyProviders={true}
            redirectTo={`${window.location.origin}/`}
            theme="light"
            view="sign_in"
            localization={{
              variables: {
                sign_in: {
                  social_provider_text: 'Google',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};