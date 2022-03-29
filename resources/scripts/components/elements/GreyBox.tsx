import React, { memo } from 'react';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    className?: string;
    children: React.ReactNode;
}

const GreyBox = ({ children, className }: Props) => (
    <div css={tw`rounded bg-neutral-700 p-2`} className={className}>
        {children}
    </div>
);

export default memo(GreyBox, isEqual);
