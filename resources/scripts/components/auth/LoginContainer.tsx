import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';
import Label from '@/components/elements/Label';

interface Values {
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [ token, setToken ] = useState('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState(state => state.settings.data!.recaptcha);
    const userRegistration = useStoreState(state => state.settings.data!.userRegistration);

    useEffect(() => {
        clearFlashes();
    }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        // If there is no token in the state yet, request the token and then abort this submit request
        // since it will be re-submitted when the recaptcha data is returned by the component.
        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch(error => {
                console.error(error);

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
            return;
        }

        login({ ...values, recaptchaData: token })
            .then(response => {
                console.log('wow!');
                console.log(response);
                if (response.complete) {
                    console.log(`Redirecting to: ${response.intended || '/'}`);
                    // @ts-ignore
                    window.location = response.intended || '/';
                    return;
                }

                if (response.methods?.includes('webauthn')) {
                    console.log('Redirecting to: /auth/login/key');
                    history.replace('/auth/login/key', {
                        token: response.confirmationToken,
                        publicKey: response.publicKey,
                        hasTotp: response.methods.includes('totp'),
                    });
                    return;
                }

                if (response.methods?.includes('totp')) {
                    console.log('/auth/login/checkpoint');
                    history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
                    return;
                }

                console.log('huh?');
            })
            .catch(error => {
                console.error(error);

                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required('A username or email must be provided.'),
                password: string().required('Please enter your account password.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={'Login to Continue'} css={tw`w-full flex`}>
                    <Label css={'text-white'}>Username or Email</Label>
                    <Field
                        type={'text'}
                        name={'username'}
                        disabled={isSubmitting}
                    />
                    <div css={tw`mt-6`}>
                        <Label css={'text-white'}>Password</Label>
                        <Field
                            type={'password'}
                            name={'password'}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div css={tw`mt-6`}>
                        <Button type={'submit'} size={'xlarge'} isLoading={isSubmitting} disabled={isSubmitting}>
                            Login
                        </Button>
                    </div>
                    {recaptchaEnabled &&
                    <Reaptcha
                        ref={ref}
                        size={'invisible'}
                        sitekey={siteKey || '_invalid_key'}
                        onVerify={response => {
                            setToken(response);
                            submitForm();
                        }}
                        onExpire={() => {
                            setSubmitting(false);
                            setToken('');
                        }}
                    />
                    }
                    {userRegistration === '1' &&
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/register'}
                            css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                        >
                            Register Account
                        </Link>
                    </div>
                    }
                    <div css={tw`mt-6 text-center`}>
                        <Link
                            to={'/auth/password'}
                            css={tw`text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600`}
                        >
                            Reset Password
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
