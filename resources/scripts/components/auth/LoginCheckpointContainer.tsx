import React, { useEffect, useState } from 'react';
import { StaticContext, useLocation } from 'react-router';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import loginCheckpoint from '@/api/auth/loginCheckpoint';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { ActionCreator } from 'easy-peasy';
import { useFormikContext, withFormik } from 'formik';
import useFlash from '@/plugins/useFlash';
import { FlashStore } from '@/state/flashes';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';

interface Values {
    code: string;
    recoveryCode: '',
}

type OwnProps = RouteComponentProps<Record<string, string | undefined>, StaticContext, { token?: string }>

type Props = OwnProps & {
    clearAndAddHttpError: ActionCreator<FlashStore['clearAndAddHttpError']['payload']>;
}

const LoginCheckpointContainer = () => {
    const history = useHistory();
    const location = useLocation();

    const { isSubmitting, setFieldValue } = useFormikContext<Values>();
    const [ isMissingDevice, setIsMissingDevice ] = useState(false);

    const switchToSecurityKey = () => {
        history.replace('/auth/login/key', { ...location.state });
    };

    useEffect(() => {
        setFieldValue('code', '');
        setFieldValue('recoveryCode', '');
        setIsMissingDevice(location.state?.recovery || false);
    }, [ location.state ]);

    return (
        <LoginFormContainer title={'Device Checkpoint'} css={tw`w-full flex`}>
            <div css={tw`flex flex-col items-center justify-center w-full md:h-full md:pt-4`}>
                <div>
                    <Field
                        name={isMissingDevice ? 'recoveryCode' : 'code'}
                        title={isMissingDevice ? 'Recovery Code' : 'Authentication Code'}
                        description={
                            isMissingDevice
                                ? 'Enter one of the recovery codes generated when you setup 2-Factor authentication on this account in order to continue.'
                                : 'Enter the two-factor token generated by your device.'
                        }
                        type={'text'}
                        autoFocus
                    />
                </div>
                <div css={tw`mt-6 md:mt-auto`}>
                    <Button
                        size={'large'}
                        type={'submit'}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        Continue
                    </Button>
                </div>

                <div css={tw`flex flex-row text-center mt-6 md:mt-auto`}>
                    <div css={tw`mr-4`}>
                        <a
                            css={tw`text-xs text-neutral-500 tracking-wide uppercase no-underline hover:text-neutral-700 text-center cursor-pointer`}
                            onClick={() => switchToSecurityKey()}
                        >
                            Use security key
                        </a>
                    </div>
                    <div css={tw`ml-4`}>
                        <span
                            onClick={() => {
                                setFieldValue('code', '');
                                setFieldValue('recoveryCode', '');
                                setIsMissingDevice(s => !s);
                            }}
                            css={tw`cursor-pointer text-xs text-neutral-500 tracking-wide uppercase no-underline hover:text-neutral-700`}
                        >
                            {!isMissingDevice ? 'I\'ve Lost My Device' : 'I Have My Device'}
                        </span>
                    </div>
                </div>
                <div css={tw`mt-6 text-center`}>
                    <Link
                        to={'/auth/login'}
                        css={tw`text-xs text-neutral-500 tracking-wide uppercase no-underline hover:text-neutral-700`}
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        </LoginFormContainer>
    );
};

const EnhancedForm = withFormik<Props, Values>({
    handleSubmit: ({ code, recoveryCode }, { setSubmitting, props: { clearAndAddHttpError, location } }) => {
        loginCheckpoint(location.state?.token || '', code, recoveryCode)
            .then(response => {
                if (response.complete) {
                    // @ts-ignore
                    window.location = response.intended || '/';
                    return;
                }

                setSubmitting(false);
            })
            .catch(error => {
                console.error(error);
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    },

    mapPropsToValues: () => ({
        code: '',
        recoveryCode: '',
    }),
})(LoginCheckpointContainer);

export default ({ history, location, ...props }: OwnProps) => {
    const { clearAndAddHttpError } = useFlash();

    if (!location.state?.token) {
        history.replace('/auth/login');

        return null;
    }

    return <EnhancedForm
        clearAndAddHttpError={clearAndAddHttpError}
        history={history}
        location={location}
        {...props}
    />;
};
